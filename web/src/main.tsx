import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider } from 'antd';
import { render } from 'preact';
import { Route, Switch } from 'wouter-preact';
import App from './App';
import FileList from './FileList';

import 'remixicon/fonts/remixicon.css';
import Icon from './icon';
import './style.scss';

render(
  <>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#EB5424',
          colorText: '#313638',
          colorSuccess: '#4BAB4E',
          colorError: '#EB5424',
          colorInfo: '#2454BB',
          borderRadius: 4,
        },
      }}
    >
      <StyleProvider hashPriority="high">
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
                <Icon name="github" mode="fill" />
              </a>
            </div>
          </div>
        </div>
      </StyleProvider>
    </ConfigProvider>
  </>,
  document.getElementById('root') as HTMLElement
);
