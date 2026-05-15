import { render } from 'preact';
import { Route, Switch } from 'wouter-preact';
import App from './App';
import FileList from './FileList';

import Icon from './icon';
import './style.scss';

render(
  <>
    <div className="p-0">
      <div className="p-4">
        <Switch>
          <Route path="/" component={App} />
          <Route path="/browser/:model">
            {(params) => <FileList model={params.model} />}
          </Route>
        </Switch>
      </div>
      <div className="footer">
        <div className="copyright flex items-center space-x-1">
          <img
            src="https://user-images.githubusercontent.com/5518/205909959-12b92929-4ac5-4bb5-9111-6f9a3ed76cf6.png"
            className="h-6 mx-auto"
          />
          <div>
            <a
              href="https://gobackup.github.io"
              className="hover:text-blue"
              target="_blank"
            >
              GoBackup
            </a>
            <span> powered.</span>
          </div>
        </div>
        <div className="links">
          <a
            href="https://github.com/gobackup/gobackup"
            title="GitHub"
            target="_blank"
          >
            <Icon name="github" />
          </a>
        </div>
      </div>
    </div>
  </>,
  document.getElementById('root') as HTMLElement
);
