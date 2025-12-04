FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements_minimal.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy only the simplified main file
COPY main_simple.py main.py

# Run the worker
CMD ["python", "main.py"]
