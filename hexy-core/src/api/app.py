"""
Main FastAPI application for Hexy Framework
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .rest.routes import router as api_router

app = FastAPI(
    title="Hexy Framework API",
    description="Semantic framework for modeling and executing organizational operations",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)

@app.get("/")
async def root():
    """
    Root endpoint
    """
    return {
        "message": "Welcome to Hexy Framework API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/api/health"
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "service": "hexy-framework"} 