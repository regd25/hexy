"""
Abstract base class for repository connections.

This module defines the interface for managing database connections
and transactions across different storage implementations.
"""

from abc import ABC, abstractmethod
from typing import Any
from dataclasses import dataclass


@dataclass
class RepositoryConnection(ABC):
    """Abstract base class for managing repository connections and transactions."""

    @abstractmethod
    async def connect(self) -> None:
        """Establish connection to the storage."""
        pass

    @abstractmethod
    async def disconnect(self) -> None:
        """Close the storage connection."""
        pass

    @abstractmethod
    async def begin_transaction(self) -> None:
        """Start a new transaction."""
        pass

    @abstractmethod
    async def commit_transaction(self) -> None:
        """Commit the current transaction."""
        pass

    @abstractmethod
    async def rollback_transaction(self) -> None:
        """Rollback the current transaction."""
        pass

    @abstractmethod
    def get_client(self) -> Any:
        """
        Get the underlying database client.

        Returns:
            Any: The database client instance
        """
        pass

    @property
    @abstractmethod
    def is_connected(self) -> bool:
        """
        Check if connection is active.

        Returns:
            bool: True if connected, False otherwise
        """
        pass

    @property
    @abstractmethod
    def in_transaction(self) -> bool:
        """
        Check if there's an active transaction.

        Returns:
            bool: True if in transaction, False otherwise
        """
        pass
