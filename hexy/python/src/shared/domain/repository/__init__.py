"""
Repository module for handling data persistence and retrieval.

This module provides abstract base classes for repositories and connection managers,
enabling the implementation of different storage backends.
"""

from .repository import Repository
from .repository_connection import RepositoryConnection
from .repository_criteria_converter import RepositoryCriteriaConverter
from .repository_mapper import RepositoryMapper

__all__ = [
    "Repository",
    "RepositoryConnection",
    "RepositoryCriteriaConverter",
    "RepositoryMapper",
]
