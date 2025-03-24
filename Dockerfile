FROM python:3.9-slim

# Install required compilers and runtimes
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    default-jdk \
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set up work directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY app.py .

# Security configurations
# Create a non-root user with specific UID/GID
RUN groupadd -g 10001 coderunner && \
    useradd -u 10001 -g coderunner -m -s /bin/bash coderunner

# Set up directories with appropriate permissions
RUN mkdir -p /tmp/code_exec && \
    chown coderunner:coderunner /tmp/code_exec && \
    chmod 700 /tmp/code_exec

# Switch to non-root user
USER coderunner

# Expose the port
EXPOSE 5000

# Run with gunicorn for better performance
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]