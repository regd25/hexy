"""
E2E tests for dashboard functionality
"""

import pytest
from playwright.sync_api import Page, expect


class TestDashboardFunctionality:
    """Test dashboard core functionality"""

    def test_dashboard_loads_correctly(self, page: Page, base_url: str):
        """Test that dashboard loads with all components"""
        page.goto(base_url)

        # Check main components are present
        expect(page.locator("#graph-container")).to_be_visible()
        expect(page.locator("#graph")).to_be_visible()
        expect(page.locator("#editor")).to_be_visible()

        # Check action buttons are present
        expect(page.locator("#config-btn")).to_be_visible()
        expect(page.locator("#edit-btn")).to_be_visible()
        expect(page.locator("#visualize-btn")).to_be_visible()

        # Check tooltip and menu elements
        expect(page.locator("#tooltip")).to_be_visible()
        expect(page.locator("#menu")).to_be_visible()

    def test_editor_functionality(self, page: Page, base_url: str):
        """Test editor functionality"""
        page.goto(base_url)

        # Click edit button to show editor
        page.click("#edit-btn")

        # Editor should be visible
        expect(page.locator("#editor")).to_be_visible()

        # Add some content to editor
        page.fill("#editor", "Purpose Test Purpose: A test purpose for validation")

        # Click visualize button to show graph
        page.click("#visualize-btn")

        # Graph should be visible and editor hidden
        expect(page.locator("#graph")).to_be_visible()
        expect(page.locator("#editor")).to_have_class(contains="hidden")

    def test_graph_interaction(self, page: Page, base_url: str):
        """Test graph interaction functionality"""
        page.goto(base_url)

        # Add content to editor first
        page.click("#edit-btn")
        page.fill("#editor", "Purpose Test Purpose: A test purpose for validation")
        page.click("#visualize-btn")

        # Test zoom functionality
        page.locator("#graph-container").wheel(delta_y=-100)  # Zoom in
        page.locator("#graph-container").wheel(delta_y=100)  # Zoom out

        # Test pan functionality
        page.locator("#graph-container").drag_to(page.locator("#graph-container"))

        # Test node selection (if nodes exist)
        nodes = page.locator(".node")
        if nodes.count() > 0:
            page.click(".node")
            # Should show tooltip or context menu
            expect(page.locator("#tooltip")).to_be_visible()

    def test_configuration_panel(self, page: Page, base_url: str):
        """Test configuration panel"""
        page.goto(base_url)

        # Click config button
        page.click("#config-btn")

        # Configuration panel should appear
        # Note: This depends on the actual implementation
        # For now, just verify the button is clickable
        expect(page.locator("#config-btn")).to_be_clickable()

    def test_responsive_design(self, page: Page, base_url: str):
        """Test responsive design on different screen sizes"""
        page.goto(base_url)

        # Test mobile view
        page.set_viewport_size({"width": 375, "height": 667})
        expect(page.locator("#graph-container")).to_be_visible()
        expect(page.locator("#config-btn")).to_be_visible()

        # Test tablet view
        page.set_viewport_size({"width": 768, "height": 1024})
        expect(page.locator("#graph-container")).to_be_visible()
        expect(page.locator("#config-btn")).to_be_visible()

        # Test desktop view
        page.set_viewport_size({"width": 1920, "height": 1080})
        expect(page.locator("#graph-container")).to_be_visible()
        expect(page.locator("#config-btn")).to_be_visible()

    def test_artifact_creation_workflow(self, page: Page, base_url: str):
        """Test complete artifact creation workflow"""
        page.goto(base_url)

        # Open editor
        page.click("#edit-btn")

        # Create multiple artifacts
        content = """
Purpose Main Purpose: The main organizational purpose
Context Main Context: The main organizational context
Actor Main Actor: The main organizational actor
"""
        page.fill("#editor", content)

        # Visualize
        page.click("#visualize-btn")

        # Verify graph is visible
        expect(page.locator("#graph")).to_be_visible()

        # Check for nodes (artifacts)
        nodes = page.locator(".node")
        expect(nodes).to_have_count(3)

    def test_editor_syntax_highlighting(self, page: Page, base_url: str):
        """Test editor syntax highlighting"""
        page.goto(base_url)

        # Open editor
        page.click("#edit-btn")

        # Add content with different artifact types
        content = """
Purpose Test Purpose: A test purpose
Context Test Context: A test context
Actor Test Actor: A test actor
Process Test Process: A test process
"""
        page.fill("#editor", content)

        # Editor should handle the content without errors
        expect(page.locator("#editor")).to_contain_text("Purpose Test Purpose")
        expect(page.locator("#editor")).to_contain_text("Context Test Context")

    def test_graph_visualization(self, page: Page, base_url: str):
        """Test graph visualization with different artifact types"""
        page.goto(base_url)

        # Open editor and add diverse content
        page.click("#edit-btn")
        content = """
Purpose Main Purpose: Transform the organization
Context Global Context: Worldwide operations
Actor CEO: Chief Executive Officer
Process Digital Transformation: Implement digital solutions
Policy Data Policy: Data protection guidelines
"""
        page.fill("#editor", content)

        # Visualize
        page.click("#visualize-btn")

        # Graph should be visible
        expect(page.locator("#graph")).to_be_visible()

        # Should have nodes for each artifact
        nodes = page.locator(".node")
        expect(nodes).to_have_count(5)

    def test_tooltip_functionality(self, page: Page, base_url: str):
        """Test tooltip functionality"""
        page.goto(base_url)

        # Create content and visualize
        page.click("#edit-btn")
        page.fill("#editor", "Purpose Test Purpose: A test purpose for tooltip")
        page.click("#visualize-btn")

        # Hover over a node to trigger tooltip
        nodes = page.locator(".node")
        if nodes.count() > 0:
            nodes.first.hover()
            # Tooltip should appear
            expect(page.locator("#tooltip")).to_be_visible()

    def test_menu_functionality(self, page: Page, base_url: str):
        """Test context menu functionality"""
        page.goto(base_url)

        # Create content and visualize
        page.click("#edit-btn")
        page.fill("#editor", "Purpose Test Purpose: A test purpose for menu")
        page.click("#visualize-btn")

        # Right-click on a node to open context menu
        nodes = page.locator(".node")
        if nodes.count() > 0:
            nodes.first.click(button="right")
            # Menu should appear
            expect(page.locator("#menu")).to_be_visible()

    def test_performance_with_large_content(self, page: Page, base_url: str):
        """Test performance with large content"""
        page.goto(base_url)

        # Open editor
        page.click("#edit-btn")

        # Create large content
        content = ""
        for i in range(20):
            content += f"Purpose Purpose {i}: Description for purpose {i}\n"
            content += f"Context Context {i}: Description for context {i}\n"
            content += f"Actor Actor {i}: Description for actor {i}\n"

        page.fill("#editor", content)

        # Visualize (should handle large content)
        page.click("#visualize-btn")

        # Graph should still be responsive
        expect(page.locator("#graph")).to_be_visible()

        # Should have many nodes
        nodes = page.locator(".node")
        expect(nodes).to_have_count(60)  # 20 * 3 types
