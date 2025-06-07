# Online Code Execution Platform with Kubernetes

A containerized application for executing code in multiple programming languages (Python, JavaScript, C, and C++) with security measures to prevent resource abuse.

## Features

- Support for multiple programming languages: Python, JavaScript, C, and C++
- Web-based code editor
- Real-time code execution
- Security measures:
  - Execution timeout (10 seconds) to prevent infinite loops
  - Output size limitation (1MB) to prevent memory exhaustion

## Architecture

This application consists of two main components:

1. **Frontend**: A React application that provides the user interface
2. **Backend**: A Flask API that handles code execution in various languages

Both components are containerized using Docker and deployed on Kubernetes.

## Prerequisites

- Docker
- Kubernetes cluster (Minikube, Docker Desktop with Kubernetes, or a cloud provider)
- kubectl command-line tool

## Deployment Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Anshuman-git-code/Execution-Containerized-k8s.git
cd Execution-Containerized-k8s
```

### 2. Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace k8s-app

# Apply Kubernetes configurations
kubectl apply -f k8s/
```

### 3. Access the application

```bash
# Port forward the frontend service
kubectl port-forward service/frontend -n k8s-app 3000:80

# Port forward the backend service (optional)
kubectl port-forward service/backend -n k8s-app 5000:5000
```

Now you can access the application at http://localhost:3000

## Usage

1. Select a programming language from the dropdown menu (Python, JavaScript, C, or C++)
2. Write your code in the editor
3. Click "Run Code" to execute
4. View the output, errors, and execution status below

## Security Considerations

This application implements the following security measures:

- **Execution Timeout**: Code execution is limited to 10 seconds to prevent infinite loops
- **Output Size Limitation**: Output is truncated to 1MB to prevent memory exhaustion

## Docker Images

- Frontend: `anshuman04/k8s-frontend:latest`
- Backend: `anshuman04/k8s-backend:latest`

## Development

### Building the Docker images

```bash
# Build frontend
cd frontend
docker build -t anshuman04/k8s-frontend:latest .

# Build backend
cd ../backend
docker build -t anshuman04/k8s-backend:latest .
```

### Local development

```bash
# Frontend
cd frontend
npm install
npm start

# Backend
cd backend
pip install -r requirements.txt
python app.py
```

## Testing Security Measures

You can test the security measures with these code examples:

### Testing Execution Timeout (Python)
```python
# Infinite loop to test timeout mechanism
print("Starting infinite loop in Python...")
counter = 0
while True:
    counter += 1
    if counter % 10000 == 0:
        print(f"Still running... Count: {counter}")
```

### Testing Output Size Limitation (Python)
```python
# Generate excessive output to test output truncation
print("Testing output size limitation in Python...")
large_string = "A" * 1000  # 1000 character string
for i in range(2000):  # Should generate over 1MB of output
    print(f"Line {i}: {large_string}")
```

Similar test cases are available for JavaScript, C, and C++.
