import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/theme.css';

document.body.classList.add('sidepanel-body');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App isSidePanel={true} />
  </React.StrictMode>
);
