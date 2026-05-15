import {
  ArrowLeft,
  DatabaseBackup,
  Download,
  FileArchive,
  FolderOpen,
  LucideIcon,
  Play,
  RefreshCw,
} from 'lucide-preact';

const icons: Record<string, LucideIcon> = {
  'arrow-left': ArrowLeft,
  'download-cloud': Download,
  'folder-zip': FileArchive,
  folders: FolderOpen,
  play: Play,
  refresh: RefreshCw,
  stack: DatabaseBackup,
};

export default (props: {
  name: keyof typeof icons;
  className?: string;
  loading?: boolean;
}) => {
  const { className = '', loading = false } = props;
  const classes = `ricon ${loading ? 'ricon-loading' : ''} ${className}`;
  const Icon = icons[props.name];

  return <Icon className={classes} size="1em" aria-hidden="true" />;
};
