import {
  ArrowLeft,
  DatabaseBackup,
  Download,
  FileArchive,
  FolderOpen,
  LucideIcon,
  PlayCircle,
  RefreshCw,
} from 'lucide-preact';

const icons: Record<string, LucideIcon> = {
  'arrow-left': ArrowLeft,
  'download-cloud': Download,
  'folder-zip': FileArchive,
  folders: FolderOpen,
  play: PlayCircle,
  refresh: RefreshCw,
  stack: DatabaseBackup,
};

export default (props: {
  name: keyof typeof icons | 'github';
  className?: string;
  loading?: boolean;
}) => {
  const { className = '', loading = false } = props;
  const classes = `ricon ${loading ? 'ricon-loading' : ''} ${className}`;

  if (props.name === 'github') {
    return (
      <svg
        className={classes}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.41 7.86 10.94.58.1.79-.25.79-.56v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.16 1.18A10.98 10.98 0 0 1 12 6.05c.98 0 1.96.13 2.88.39 2.19-1.49 3.15-1.18 3.15-1.18.63 1.58.24 2.75.12 3.04.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.79.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
      </svg>
    );
  }

  const Icon = icons[props.name];
  return <Icon className={classes} size="1em" aria-hidden="true" />;
};
