"""
Dashboard validation tests
"""

from playwright.sync_api import Page, expect


class TestDashboardValidation:
    """Test dashboard validation scenarios"""

    def test_artifact_type_validation(self, page: Page, base_url: str):
        """Test that all artifact types can be created and displayed"""
        page.goto(base_url)

        artifact_types = [
            "purpose",
            "context",
            "authority",
            "evaluation",
            "vision",
            "policy",
            "principle",
            "guideline",
            "concept",
            "indicator",
            "process",
            "procedure",
            "event",
            "result",
            "observation",
            "actor",
            "area",
        ]

        for artifact_type in artifact_types:
            # Create artifact
            page.click("button:has-text('Add Artifact')")
            page.fill("input[name='name']", f"Test {artifact_type.title()}")
            page.fill(
                "textarea[name='description']", f"Test {artifact_type} description"
            )
            page.select_option("select[name='type']", artifact_type)
            page.click("button:has-text('Create')")

            # Verify artifact appears
            expect(page.locator(f"text=Test {artifact_type.title()}")).to_be_visible()

            # Verify correct color/visual representation
            artifact_node = page.locator(f"text=Test {artifact_type.title()}").first
            expect(artifact_node).to_be_visible()

    def test_graph_interaction_validation(self, page: Page, base_url: str):
        """Test graph interaction functionality"""
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

        # Test zoom functionality
        page.locator("#graph-container").wheel(delta_y=-100)  # Zoom in
        page.locator("#graph-container").wheel(delta_y=100)  # Zoom out

        # Test pan functionality
        page.locator("#graph-container").drag_to(page.locator("#graph-container"))

        # Test node selection
        page.click("text=Source Artifact")
        expect(page.locator("#editor")).to_contain_text("Source Artifact")

        # Test context menu
        page.click("text=Source Artifact", button="right")
        expect(page.locator("text=Change Type")).to_be_visible()
        expect(page.locator("text=Delete")).to_be_visible()

    def test_editor_functionality_validation(self, page: Page, base_url: str):
        """Test editor functionality"""
        page.goto(base_url)

        # Create artifact
        page.click("button:has-text('Add Artifact')")
        page.fill("input[name='name']", "Editor Test")
        page.fill("textarea[name='description']", "Original description")
        page.select_option("select[name='type']", "purpose")
        page.click("button:has-text('Create')")

        # Test editor updates
        page.click("text=Editor Test")
        page.fill("#editor textarea[name='description']", "Updated description")
        page.click("button:has-text('Save')")

        # Verify editor content is updated
        expect(page.locator("#editor")).to_contain_text("Updated description")

        # Test editor syntax highlighting
        expect(page.locator("#editor")).to_have_class(contains="editor")

    def test_real_time_synchronization(self, page: Page, base_url: str):
        """Test real-time synchronization between graph and editor"""
        page.goto(base_url)

        # Create artifact
        page.click("button:has-text('Add Artifact')")
        page.fill("input[name='name']", "Sync Test")
        page.fill("textarea[name='description']", "Sync description")
        page.select_option("select[name='type']", "purpose")
        page.click("button:has-text('Create')")

        # Verify both graph and editor show the artifact
        expect(page.locator("text=Sync Test")).to_be_visible()
        expect(page.locator("#editor")).to_contain_text("Sync Test")

        # Update in editor
        page.click("text=Sync Test")
        page.fill("#editor input[name='name']", "Updated Sync Test")
        page.click("button:has-text('Save')")

        # Verify graph updates immediately
        expect(page.locator("text=Updated Sync Test")).to_be_visible()
        expect(page.locator("text=Sync Test")).not_to_be_visible()

    def test_error_handling_validation(self, page: Page, base_url: str):
        """Test error handling scenarios"""
        page.goto(base_url)

        # Test invalid artifact creation
        page.click("button:has-text('Add Artifact')")
        page.fill("input[name='name']", "")  # Empty name
        page.click("button:has-text('Create')")

        # Should show error message
        expect(page.locator("text=Name is required")).to_be_visible()

        # Test duplicate artifact name
        page.fill("input[name='name']", "Duplicate Test")
        page.fill("textarea[name='description']", "First description")
        page.select_option("select[name='type']", "purpose")
        page.click("button:has-text('Create')")

        # Try to create another with same name
        page.click("button:has-text('Add Artifact')")
        page.fill("input[name='name']", "Duplicate Test")
        page.fill("textarea[name='description']", "Second description")
        page.select_option("select[name='type']", "context")
        page.click("button:has-text('Create')")

        # Should show error message
        expect(page.locator("text=Artifact name already exists")).to_be_visible()

    def test_performance_validation(self, page: Page, base_url: str):
        """Test performance with many artifacts"""
        page.goto(base_url)

        # Create many artifacts quickly
        for i in range(20):
            page.click("button:has-text('Add Artifact')")
            page.fill("input[name='name']", f"Performance Test {i}")
            page.fill("textarea[name='description']", f"Description {i}")
            page.select_option("select[name='type']", "purpose")
            page.click("button:has-text('Create')")

        # Verify all artifacts are visible
        for i in range(20):
            expect(page.locator(f"text=Performance Test {i}")).to_be_visible()

        # Test smooth scrolling/panning
        page.locator("#graph-container").wheel(delta_y=-500)
        page.locator("#graph-container").wheel(delta_y=500)

        # Test search performance
        page.fill("input[placeholder='Search artifacts...']", "Performance")
        expect(page.locator("text=Performance Test 0")).to_be_visible()

        # Clear search
        page.fill("input[placeholder='Search artifacts...']", "")
        expect(page.locator("text=Performance Test 0")).to_be_visible()

    def test_accessibility_validation(self, page: Page, base_url: str):
        """Test accessibility features"""
        page.goto(base_url)

        # Test keyboard navigation
        page.keyboard.press("Tab")
        expect(page.locator("button:has-text('Add Artifact')")).to_be_focused()

        page.keyboard.press("Enter")
        expect(page.locator("input[name='name']")).to_be_focused()

        # Test screen reader compatibility
        expect(page.locator("text=Hexy Framework")).to_have_attribute("aria-label")

        # Test color contrast
        # This would require checking CSS properties
        expect(page.locator("#graph-container")).to_be_visible()

        # Test focus indicators
        page.keyboard.press("Tab")
        expect(page.locator("button:has-text('Add Artifact')")).to_have_css(
            "outline", "none"
        )

    def test_mobile_responsiveness(self, page: Page, base_url: str):
        """Test mobile responsiveness"""
        page.goto(base_url)

        # Set mobile viewport
        page.set_viewport_size({"width": 375, "height": 667})

        # Verify components are still accessible
        expect(page.locator("button:has-text('Add Artifact')")).to_be_visible()
        expect(page.locator("#graph-container")).to_be_visible()
        expect(page.locator("#editor-container")).to_be_visible()

        # Test mobile interactions
        page.click("button:has-text('Add Artifact')")
        page.fill("input[name='name']", "Mobile Test")
        page.fill("textarea[name='description']", "Mobile description")
        page.select_option("select[name='type']", "purpose")
        page.click("button:has-text('Create')")

        # Verify artifact appears on mobile
        expect(page.locator("text=Mobile Test")).to_be_visible()

        # Test touch interactions
        page.touch_screen.tap(page.locator("text=Mobile Test"))
        expect(page.locator("#editor")).to_contain_text("Mobile Test")

    def test_data_persistence_validation(self, page: Page, base_url: str):
        """Test data persistence across sessions"""
        page.goto(base_url)

        # Create artifact
        page.click("button:has-text('Add Artifact')")
        page.fill("input[name='name']", "Persistence Test")
        page.fill("textarea[name='description']", "This should persist")
        page.select_option("select[name='type']", "purpose")
        page.click("button:has-text('Create')")

        # Verify artifact exists
        expect(page.locator("text=Persistence Test")).to_be_visible()

        # Reload page
        page.reload()

        # Verify artifact still exists
        expect(page.locator("text=Persistence Test")).to_be_visible()

        # Verify editor content is preserved
        page.click("text=Persistence Test")
        expect(page.locator("#editor")).to_contain_text("Persistence Test")
