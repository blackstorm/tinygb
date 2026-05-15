import {
  ArrowLeft,
  DownloadCloud,
  FolderArchive,
  Folders,
  GitFork,
  LucideIcon,
  Play,
  RefreshCw,
  Server,
} from 'lucide-preact';

const icons: Record<string, LucideIcon> = {
  'arrow-left': ArrowLeft,
  'download-cloud': DownloadCloud,
  'folder-zip': FolderArchive,
  folders: Folders,
  github: GitFork,
  play: Play,
  refresh: RefreshCw,
  stack: Server,
};

export default (props: {
  name: keyof typeof icons;
  className?: string;
  loading?: boolean;
}) => {
  const { className = '', loading = false } = props;
  const Icon = icons[props.name];

  return (
    <Icon
      className={`ricon ${loading ? 'ricon-loading' : ''} ${className}`}
      size="1em"
      aria-hidden="true"
    />
  );
};
