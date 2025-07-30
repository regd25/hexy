#!/usr/bin/env python3
"""
Script to run the Hexy Framework API server
"""
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Get configuration from environment variables
    host = os.getenv("HEXY_HOST", "0.0.0.0")
    port = int(os.getenv("HEXY_PORT", "8000"))
    reload = os.getenv("HEXY_RELOAD", "true").lower() == "true"

    print(f"Starting Hexy Framework API server...")
    print(f"Host: {host}")
    print(f"Port: {port}")
    print(f"Reload: {reload}")
    print(f"API Documentation: http://{host}:{port}/docs")
    print(f"Health Check: http://{host}:{port}/health")

    uvicorn.run(
        "src.api.app:app", host=host, port=port, reload=reload, log_level="info"
    )
