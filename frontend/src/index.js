import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // You'll need to create this CSS file
import CodeExecutionApp from './App'; // Importing the main App component

// Import Tailwind CSS
import './tailwind.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CodeExecutionApp />
  </React.StrictMode>
);