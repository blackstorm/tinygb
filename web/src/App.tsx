import { useEffect, useRef, useState } from 'preact/hooks';
import { Link } from 'wouter-preact';
import Icon from './icon';

const API_URL = '/api';

type Toast = {
  type: 'success' | 'error';
  message: string;
};

const ListSkeleton = ({ rows = 4 }: { rows?: number }) => (
  <div className="animate-pulse divide-y divide-gray-100">
    {Array.from({ length: rows }).map((_, i) => (
      <div className="p-4" key={i}>
        <div className="h-4 w-1/3 rounded bg-gray-200" />
        <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
      </div>
    ))}
  </div>
);

const ansiRegex = /\x1b\[[0-9;]*m/g;

const LogLine = ({ line }: { line: string }) => {
  const cleanLine = line.replace(ansiRegex, '');
  const match = cleanLine.match(/^(\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}:\d{2})\s+(\[[^\]]+\])\s?(.*)$/);
  const level = /\b(error|failed|fail|fatal)\b/i.test(cleanLine)
    ? 'error'
    : /\b(warn|warning)\b/i.test(cleanLine)
      ? 'warn'
      : 'info';

  if (!match) {
    return <div className={`log-line log-line-${level}`}>{cleanLine}</div>;
  }

  const [, time, tag, message] = match;
  return (
    <div className={`log-line log-line-${level}`}>
      <span className="log-time">{time}</span>
      <span className="log-tag">{tag}</span>
      <span>{message}</span>
    </div>
  );
};

const LogView = () => {
  const [lines, setLines] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const decoder = new TextDecoder();
    let buffer = '';

    const readLog = async () => {
      const res = await fetch(`${API_URL}/log`, {
        credentials: 'include',
        signal: controller.signal,
      });
      const reader = res.body?.getReader();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n');
        buffer = parts.pop() || '';
        if (parts.length > 0) {
          setLines((prev) => [...prev, ...parts].slice(-1000));
        }
      }
    };

    readLog().catch((err) => {
      if (err.name !== 'AbortError') {
        setLines((prev) => [...prev, `Failed to stream log: ${err.message}`]);
      }
    });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div ref={logRef} className="log-wrapper" role="log" aria-live="polite">
      {lines.map((line, index) => (
        <LogLine line={line} key={index} />
      ))}
    </div>
  );
};

const ModelList = ({}) => {
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<Record<string, any>>({});
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (toast: Toast) => {
    setToast(toast);
    window.setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    reloadModels();
  }, []);

  const performBackup = (model: string) => {
    fetch(`${API_URL}/perform`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(() => {
        showToast({
          type: 'success',
          message: `Backup for ${model} started.`,
        });
      })
      .catch((err) => {
        showToast({
          type: 'error',
          message: err.message || 'Backup failed.',
        });
      });
  };

  const reloadModels = () => {
    setLoading(true);
    fetch(`${API_URL}/config`)
      .then((res) => res.json())
      .then((data) => {
        setModels(data.models);
        setLoading(false);
      });
  };

  const ModelItem = ({ modelKey }: { modelKey: string }) => {
    const model = models[modelKey];
    const scheduleEnable = model.schedule?.enabled;

    return (
      <div className="model-list-item">
        <div className="text-base">
          <div className="text-base font-medium uppercase">{modelKey}</div>
          {scheduleEnable && (
            <div className="text-green text-sm">{model.schedule_info}</div>
          )}
          {model.description && (
            <div className="text-gray-400 truncate text-xs my-1">
              {model.description}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <Link href={`/browser/${modelKey}`}>
            <button className="btn btn-sm" title="Browse backup files">
              <Icon name="folders" />
            </button>
          </Link>

          <button
            className="btn btn-sm"
            title="Perform backup now!"
            onClick={() => {
              if (window.confirm('Are you sure to perform backup now?')) {
                performBackup(modelKey);
              }
            }}
          >
            <Icon name="play" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="model-list-wrapper">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
      <div className="model-list-header">
        <div className="flex items-center space-x-2">
          <Icon name="stack" />
          <div className="text-text text-base">Models</div>
        </div>
      </div>
      <div className="model-list-scrollview">
        {loading && <ListSkeleton />}
        {!loading && (
          <>
            {Object.keys(models).map((key: string, idx: number) => (
              <ModelItem modelKey={key} key={idx} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div className="flex flex-col relative md:flex-row gap-4">
      <ModelList />
      <LogView />
    </div>
  );
};

export default App;
