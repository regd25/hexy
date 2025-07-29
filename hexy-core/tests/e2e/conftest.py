"""
E2E test configuration for Playwright
"""
import pytest
from playwright.sync_api import sync_playwright


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    """Configure browser context for E2E tests"""
    return {
        **browser_context_args,
        "viewport": {"width": 1920, "height": 1080},
        "ignore_https_errors": True,
    }


@pytest.fixture(scope="session")
def base_url():
    """Base URL for E2E tests"""
    return "http://localhost:3000"


@pytest.fixture(scope="session")
def playwright():
    """Playwright instance"""
    with sync_playwright() as p:
        yield p
