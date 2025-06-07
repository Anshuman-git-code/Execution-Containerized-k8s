#!/bin/bash

# This script directly modifies the frontend application in the running container

# Get the frontend pod name
POD_NAME=$(kubectl get pods -n k8s-app -l app=frontend -o jsonpath='{.items[0].metadata.name}')

# Create a simple HTML file with the changes we want
cat > /tmp/modified-app.html << 'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="#000000">
    <meta name="description" content="Web site created using create-react-app">
    <link rel="apple-touch-icon" href="/logo192.png">
    <link rel="manifest" href="/manifest.json">
    <title>React App</title>
    <script defer="defer" src="/static/js/main.5cc24cf4.js"></script>
    <link href="/static/css/main.7fdedbc6.css" rel="stylesheet">
</head>
<body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
</body>
</html>
HTML

# Copy the modified HTML file to the pod
kubectl cp /tmp/modified-app.html k8s-app/$POD_NAME:/usr/share/nginx/html/index.html

# Create a JavaScript file that removes Java and the input field
cat > /tmp/modified-app.js << 'JS'
// This is a simplified version of the app with Java removed and no input field
document.addEventListener('DOMContentLoaded', function() {
  const container = document.createElement('div');
  container.className = 'container';
  
  // Title
  const h1 = document.createElement('h1');
  h1.textContent = 'Online Code Executor';
  container.appendChild(h1);
  
  // Language selector
  const label = document.createElement('label');
  label.textContent = 'Language:';
  container.appendChild(label);
  
  const select = document.createElement('select');
  const languages = ["python", "javascript", "c", "cpp"]; // No Java
  languages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang;
    option.textContent = lang.toUpperCase();
    select.appendChild(option);
  });
  container.appendChild(select);
  
  // Code textarea
  const textarea = document.createElement('textarea');
  textarea.placeholder = 'Write your code here...';
  container.appendChild(textarea);
  
  // No input field
  
  // Run button
  const button = document.createElement('button');
  button.textContent = 'Run Code';
  button.onclick = async function() {
    button.disabled = true;
    button.textContent = 'Running...';
    
    const code = textarea.value;
    const language = select.value;
    
    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          language,
          stdin: '' // Empty string for stdin
        })
      });
      
      const data = await response.json();
      
      // Create or update output div
      let outputDiv = document.querySelector('.output');
      if (!outputDiv) {
        outputDiv = document.createElement('div');
        outputDiv.className = 'output';
        container.appendChild(outputDiv);
      }
      
      outputDiv.innerHTML = `
        <h3>Output:</h3>
        <pre>${data.stdout || "No output"}</pre>
        <h3>Errors:</h3>
        <pre>${data.stderr || "No errors"}</pre>
        <h3>Status:</h3>
        <pre>${data.status}</pre>
      `;
    } catch (error) {
      let outputDiv = document.querySelector('.output');
      if (!outputDiv) {
        outputDiv = document.createElement('div');
        outputDiv.className = 'output';
        container.appendChild(outputDiv);
      }
      
      outputDiv.innerHTML = `
        <h3>Output:</h3>
        <pre>No output</pre>
        <h3>Errors:</h3>
        <pre>${error.toString()}</pre>
        <h3>Status:</h3>
        <pre>Error</pre>
      `;
    }
    
    button.disabled = false;
    button.textContent = 'Run Code';
  };
  container.appendChild(button);
  
  // Replace the root div content
  document.getElementById('root').appendChild(container);
});
JS

# Copy the modified JavaScript file to the pod
kubectl cp /tmp/modified-app.js k8s-app/$POD_NAME:/usr/share/nginx/html/app.js

# Update the index.html to include our custom script
kubectl exec -n k8s-app $POD_NAME -- sed -i 's|</body>|<script src="/app.js"></script></body>|' /usr/share/nginx/html/index.html

echo "Frontend has been directly modified. Please clear your browser cache and refresh the page."
