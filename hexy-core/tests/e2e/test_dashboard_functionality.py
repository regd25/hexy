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
        expect(page.locator("text=Hexy Framework")).to_be_visible()
        expect(page.locator("text=Dashboard")).to_be_visible()

        # Check graph container
        expect(page.locator("#graph-container")).to_be_visible()

        # Check editor container
        expect(page.locator("#editor-container")).to_be_visible()

        # Check controls are present
        expect(page.locator("button")).to_be_visible()

    def test_artifact_creation(self, page: Page, base_url: str):
        """Test creating a new artifact"""
        page.goto(base_url)

        # Click add artifact button
        page.click("button:has-text('Add Artifact')")

        # Fill artifact form
        page.fill("input[name='name']", "Test Purpose")
        page.fill("textarea[name='description']", "A test purpose for validation")
        page.select_option("select[name='type']", "purpose")

        # Submit form
        page.click("button:has-text('Create')")

        # Verify artifact appears in graph
        expect(page.locator("text=Test Purpose")).to_be_visible()

        # Verify artifact appears in editor
        expect(page.locator("#editor")).to_contain_text("Test Purpose")

    def test_artifact_editing(self, page: Page, base_url: str):
        """Test editing an existing artifact"""
        page.goto(base_url)

        # Create an artifact first
        page.click("button:has-text('Add Artifact')")
        page.fill("input[name='name']", "Editable Purpose")
        page.fill("textarea[name='description']", "Original description")
        page.select_option("select[name='type']", "purpose")
        page.click("button:has-text('Create')")

        # Click on the artifact to edit
        page.click("text=Editable Purpose")

        # Edit the artifact
        page.fill("input[name='name']", "Updated Purpose")
        page.fill("textarea[name='description']", "Updated description")

        # Save changes
        page.click("button:has-text('Save')")

        # Verify changes are reflected
        expect(page.locator("text=Updated Purpose")).to_be_visible()
        expect(page.locator("#editor")).to_contain_text("Updated description")

    def test_artifact_type_changing(self, page: Page, base_url: str):
        """Test changing artifact type without reload"""
        page.goto(base_url)

        # Create an artifact
        page.click("button:has-text('Add Artifact')")
        page.fill("input[name='name']", "Type Change Test")
        page.fill("textarea[name='description']", "Testing type changes")
        page.select_option("select[name='type']", "purpose")
        page.click("button:has-text('Create')")

        # Right-click to open context menu
        page.click("text=Type Change Test", button="right")

        # Change type to context
        page.click("text=Change Type")
        page.click("text=Context")

        # Verify type changed without full reload
        expect(page.locator("text=Type Change Test")).to_be_visible()

        # Verify no duplicate artifacts were created
        artifacts = page.locator(".artifact-node")
        expect(artifacts).to_have_count(1)

    def test_artifact_deletion(self, page: Page, base_url: str):
        """Test deleting an artifact"""
        page.goto(base_url)

        # Create an artifact
        page.click("button:has-text('Add Artifact')")
        page.fill("input[name='name']", "Delete Test")
        page.fill("textarea[name='description']", "Will be deleted")
        page.select_option("select[name='type']", "purpose")
        page.click("button:has-text('Create')")

        # Verify artifact exists
        expect(page.locator("text=Delete Test")).to_be_visible()

        # Right-click to delete
        page.click("text=Delete Test", button="right")
        page.click("text=Delete")

        # Confirm deletion
        page.click("button:has-text('Confirm')")

        # Verify artifact is removed
        expect(page.locator("text=Delete Test")).not_to_be_visible()

    def test_relationship_creation(self, page: Page, base_url: str):
        """Test creating relationships between artifacts"""
        page.goto(base_url)

        # Create two artifacts
        page.click("button:has-text('Add Artifact')")
        page.fill("input[name='name']", "Source Artifact")
        page.fill("textarea[name='description']", "Source description")
        page.select_option("select[name='type']", "purpose")
        page.click("button:has-text('Create')")

        page.click("button:has-text('Add Artifact')")
        page.fill("input[name='name']", "Target Artifact")
        page.fill("textarea[name='description']", "Target description")
        page.select_option("select[name='type']", "context")
        page.click("button:has-text('Create')")

        # Drag to create relationship
        page.drag_and_drop("text=Source Artifact", "text=Target Artifact")

        # Verify relationship line appears
        expect(page.locator(".relationship-line")).to_be_visible()

    def test_search_functionality(self, page: Page, base_url: str):
        """Test search functionality"""
        page.goto(base_url)

        # Create some artifacts
        page.click("button:has-text('Add Artifact')")
        page.fill("input[name='name']", "Searchable Purpose")
        page.fill("textarea[name='description']", "This is searchable content")
        page.select_option("select[name='type']", "purpose")
        page.click("button:has-text('Create')")

        # Use search
        page.fill("input[placeholder='Search artifacts...']", "Searchable")

        # Verify search results
        expect(page.locator("text=Searchable Purpose")).to_be_visible()

        # Clear search
        page.fill("input[placeholder='Search artifacts...']", "")

        # Verify all artifacts are visible again
        expect(page.locator("text=Searchable Purpose")).to_be_visible()

    def test_export_functionality(self, page: Page, base_url: str):
        """Test export functionality"""
        page.goto(base_url)

        # Create an artifact
        page.click("button:has-text('Add Artifact')")
        page.fill("input[name='name']", "Export Test")
        page.fill("textarea[name='description']", "Will be exported")
        page.select_option("select[name='type']", "purpose")
        page.click("button:has-text('Create')")

        # Click export button
        page.click("button:has-text('Export')")

        # Verify download dialog or export success
        expect(page.locator("text=Export successful")).to_be_visible()

    def test_import_functionality(self, page: Page, base_url: str):
        """Test import functionality"""
        page.goto(base_url)

        # Click import button
        page.click("button:has-text('Import')")

        # Upload file (simulate file upload)
        with page.expect_file_chooser() as fc_info:
            page.click("input[type='file']")
        file_chooser = fc_info.value
        file_chooser.set_files("tests/fixtures/sample_artifacts.json")

        # Verify import success
        expect(page.locator("text=Import successful")).to_be_visible()

    def test_responsive_design(self, page: Page, base_url: str):
        """Test responsive design on different screen sizes"""
        page.goto(base_url)

        # Test mobile view
        page.set_viewport_size({"width": 375, "height": 667})
        expect(page.locator("#graph-container")).to_be_visible()
        expect(page.locator("#editor-container")).to_be_visible()

        # Test tablet view
        page.set_viewport_size({"width": 768, "height": 1024})
        expect(page.locator("#graph-container")).to_be_visible()
        expect(page.locator("#editor-container")).to_be_visible()

        # Test desktop view
        page.set_viewport_size({"width": 1920, "height": 1080})
        expect(page.locator("#graph-container")).to_be_visible()
        expect(page.locator("#editor-container")).to_be_visible()

    def test_performance_with_many_artifacts(self, page: Page, base_url: str):
        """Test performance with many artifacts"""
        page.goto(base_url)

        # Create multiple artifacts
        for i in range(10):
            page.click("button:has-text('Add Artifact')")
            page.fill("input[name='name']", f"Performance Test {i}")
            page.fill("textarea[name='description']", f"Description {i}")
            page.select_option("select[name='type']", "purpose")
            page.click("button:has-text('Create')")

        # Verify all artifacts are visible
        for i in range(10):
            expect(page.locator(f"text=Performance Test {i}")).to_be_visible()

        # Verify smooth interactions
        page.click("text=Performance Test 0")
        expect(page.locator("#editor")).to_contain_text("Performance Test 0")
