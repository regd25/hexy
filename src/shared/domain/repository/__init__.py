"""
Repository module for handling data persistence and retrieval.

This module provides abstract base classes for repositories and connection managers,
enabling the implementation of different storage backends.
"""

from .repository import Repository
from .repository_connection import RepositoryConnection

__all__ = [
    "Repository",
    "RepositoryConnection",
]
