import React from 'react';
import ReactDOM from 'react-dom/client';
import { TestApp } from './components/test/TestApp';
import './index.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);