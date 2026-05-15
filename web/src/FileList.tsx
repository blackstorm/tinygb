import { filesize } from 'filesize';
import type { FunctionComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { PageTitle } from './components';

import Icon from './icon';

type FileListProps = {
  model: string;
};

const FileSkeleton = () => (
  <div className="animate-pulse space-y-3 p-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div className="flex justify-between" key={i}>
        <div className="h-4 w-1/3 rounded bg-gray-200" />
        <div className="h-4 w-1/5 rounded bg-gray-100" />
      </div>
    ))}
  </div>
);

const FileList: FunctionComponent<FileListProps> = ({ model }) => {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<any[]>([]);
  const [parent] = useState('/');

  const Time = ({ value }: { value: string }) => {
    if (!value) return <></>;
    return <span title={value}>{new Date(value).toLocaleString()}</span>;
  };

  const reloadList = () => {
    setLoading(true);
    let query = new URLSearchParams({
      model,
      parent,
    });

    fetch(`/api/list?` + query.toString())
      .then((res) => res.json())
      .then((data) => {
        setFiles(data.files || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    reloadList();
  }, [model]);

  const FileItem = ({ file }: { file: any }) => {
    const downloadURL =
      `/api/download?` +
      new URLSearchParams({
        model,
        path: file.filename,
      }).toString();

    const fsize = filesize(file.size || 0, { base: 2 }).toString();

    return (
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 py-2 px-2 hover:bg-gray-50">
        <a
          className="flex items-center space-x-2 hover:text-blue"
          href={downloadURL}
        >
          <Icon name="folder-zip" />
          <div className="max-w-xl truncate">{file.filename}</div>
        </a>
        <div className="flex items-center justify-between text-sm space-x-4 text-gray-400">
          <div>{fsize}</div>
          <div>
            <Time value={file.last_modified} />
          </div>
          <div>
            <a className="btn btn-sm" title="Download backup file." href={downloadURL}>
              <Icon name="download-cloud" />
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageTitle
        title={
          <div className="flex lg:items-center flex-col lg:flex-row-reverse lg:gap-x-2">
            <div className="text-xs text-gray-600">Browser</div>
            <div className="uppercase text-base">{model}</div>
          </div>
        }
        backTo={`/`}
        extra={
          <button className="btn btn-sm" onClick={reloadList} title="Refresh">
            <Icon name="refresh" loading={loading} />
          </button>
        }
      />
      <div className="file-browser-container">
        {loading && <FileSkeleton />}
        {!loading && (
          <>
            {files.length === 0 && (
              <div className="pt-10 text-center text-gray-400">No files.</div>
            )}
            {files.map((file, i) => (
              <FileItem key={i} file={file} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default FileList;
