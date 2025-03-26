# Use official Python runtime as base image
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    default-jdk \
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py .

# Expose the port the app runs on
EXPOSE 5000

# Use gunicorn as the production server
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]