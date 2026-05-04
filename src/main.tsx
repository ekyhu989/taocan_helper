import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { handleWechatCompatibility } from './utils/wechatDetector';
import ToastProvider from './components/common/Toast/ToastProvider';
import './index.css';

// 微信浏览器检测与兼容处理
handleWechatCompatibility();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HashRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </HashRouter>
  </React.StrictMode>
);
