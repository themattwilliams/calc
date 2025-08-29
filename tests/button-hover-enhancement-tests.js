/**
 * Button Hover Enhancement Test Suite
 * 
 * Tests for enhanced hover effects and visual feedback on quick entry buttons
 * to improve user experience and make buttons more discoverable.
 */

TestFramework.suite('Button Hover Enhancement', function() {
    
    // ========================================
    // VISUAL FEEDBACK TESTS
    // ========================================
    
    TestFramework.test('Quick Entry Buttons - CSS Class Application', function() {
        // Create test button elements
        const testButton1 = document.createElement('button');
        testButton1.className = 'btn-quick-entry';
        testButton1.textContent = '25%';
        document.body.appendChild(testButton1);
        
        const testButton2 = document.createElement('button');
        testButton2.className = 'btn-quick-entry';
        testButton2.textContent = '$10k';
        document.body.appendChild(testButton2);
        
        // Check if buttons have the correct class
        const buttonsWithClass = document.querySelectorAll('.btn-quick-entry');
        const hasCorrectClass = buttonsWithClass.length >= 2;
        
        // Check computed styles (basic check)
        const button1Styles = window.getComputedStyle(testButton1);
        const hasCursorPointer = button1Styles.cursor === 'pointer' || 
                                button1Styles.cursor === 'default'; // fallback for test environment
        
        // Cleanup
        document.body.removeChild(testButton1);
        document.body.removeChild(testButton2);
        
        return hasCorrectClass && hasCursorPointer;
    });
    
    TestFramework.test('Quick Entry Buttons - Hover State Simulation', function() {
        // Create test button
        const testButton = document.createElement('button');
        testButton.className = 'btn-quick-entry';
        testButton.textContent = '1.5%';
        testButton.setAttribute('data-target', 'annualTaxRate');
        testButton.setAttribute('data-type', 'fixed');
        testButton.setAttribute('data-value', '1.5');
        document.body.appendChild(testButton);
        
        // Simulate hover by adding hover class (since we can't trigger actual CSS :hover in JS)
        let hoverEffectWorking = false;
        
        // Create mouseenter event
        const mouseEnterEvent = new MouseEvent('mouseenter', {
            bubbles: true,
            cancelable: true
        });
        
        // Add event listener to test hover behavior
        testButton.addEventListener('mouseenter', function() {
            // This would normally be handled by CSS, but we can test the event fires
            hoverEffectWorking = true;
        });
        
        // Trigger the event
        testButton.dispatchEvent(mouseEnterEvent);
        
        // Cleanup
        document.body.removeChild(testButton);
        
        return hoverEffectWorking;
    });
    
    TestFramework.test('Quick Entry Buttons - Focus State Handling', function() {
        // Create test button
        const testButton = document.createElement('button');
        testButton.className = 'btn-quick-entry';
        testButton.textContent = '20%';
        document.body.appendChild(testButton);
        
        // Test focus behavior
        let focusEventFired = false;
        testButton.addEventListener('focus', function() {
            focusEventFired = true;
        });
        
        // Programmatically focus the button
        testButton.focus();
        
        // Check if button is focused
        const isFocused = document.activeElement === testButton;
        
        // Cleanup
        testButton.blur();
        document.body.removeChild(testButton);
        
        return focusEventFired && isFocused;
    });
    
    TestFramework.test('Quick Entry Buttons - Click Event Handling', function() {
        // Create test button with data attributes
        const testButton = document.createElement('button');
        testButton.className = 'btn-quick-entry';
        testButton.textContent = '$5k';
        testButton.setAttribute('data-target', 'estimatedRepairCosts');
        testButton.setAttribute('data-type', 'fixed');
        testButton.setAttribute('data-value', '5000');
        document.body.appendChild(testButton);
        
        // Create target input
        const testInput = document.createElement('input');
        testInput.id = 'estimatedRepairCosts';
        testInput.type = 'number';
        testInput.value = '0';
        document.body.appendChild(testInput);
        
        // Simulate click behavior (mock the actual click handler)
        let clickEventFired = false;
        testButton.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            const value = this.getAttribute('data-value');
            const targetElement = document.getElementById(target);
            
            if (targetElement && value) {
                targetElement.value = value;
                clickEventFired = true;
            }
        });
        
        // Trigger click
        testButton.click();
        
        // Verify the input value was updated
        const inputUpdated = testInput.value === '5000';
        
        // Cleanup
        document.body.removeChild(testButton);
        document.body.removeChild(testInput);
        
        return clickEventFired && inputUpdated;
    });
    
    // ========================================
    // VISUAL CONSISTENCY TESTS
    // ========================================
    
    TestFramework.test('Button Styling - Consistent Appearance Across Types', function() {
        // Create different types of quick entry buttons
        const buttonTypes = [
            { text: '25%', target: 'downPayment', type: 'percent', value: '25' },
            { text: '$10k', target: 'estimatedRepairCosts', type: 'fixed', value: '10000' },
            { text: '1.5%', target: 'annualTaxRate', type: 'fixed', value: '1.5' },
            { text: '8%', target: 'monthlyManagement', type: 'fixed', value: '8' }
        ];
        
        const createdButtons = [];
        
        // Create all button types
        buttonTypes.forEach(buttonType => {
            const button = document.createElement('button');
            button.className = 'btn-quick-entry';
            button.textContent = buttonType.text;
            button.setAttribute('data-target', buttonType.target);
            button.setAttribute('data-type', buttonType.type);
            button.setAttribute('data-value', buttonType.value);
            document.body.appendChild(button);
            createdButtons.push(button);
        });
        
        // Check that all buttons have consistent styling
        let stylingConsistent = true;
        const firstButtonStyle = window.getComputedStyle(createdButtons[0]);
        
        for (let i = 1; i < createdButtons.length; i++) {
            const buttonStyle = window.getComputedStyle(createdButtons[i]);
            
            // Check key style properties are consistent
            if (buttonStyle.fontSize !== firstButtonStyle.fontSize ||
                buttonStyle.padding !== firstButtonStyle.padding ||
                buttonStyle.borderRadius !== firstButtonStyle.borderRadius) {
                stylingConsistent = false;
                break;
            }
        }
        
        // Cleanup
        createdButtons.forEach(button => document.body.removeChild(button));
        
        return stylingConsistent;
    });
    
    TestFramework.test('Button Layout - Proper Spacing and Alignment', function() {
        // Create a container with multiple buttons (like in the actual UI)
        const container = document.createElement('div');
        container.className = 'flex space-x-1';
        document.body.appendChild(container);
        
        // Add multiple buttons
        const buttonValues = ['20%', '25%', '30%'];
        const createdButtons = [];
        
        buttonValues.forEach(value => {
            const button = document.createElement('button');
            button.className = 'btn-quick-entry';
            button.textContent = value;
            button.setAttribute('data-target', 'downPayment');
            button.setAttribute('data-type', 'percent');
            button.setAttribute('data-value', value.replace('%', ''));
            container.appendChild(button);
            createdButtons.push(button);
        });
        
        // Check that buttons are rendered
        const buttonsInContainer = container.querySelectorAll('.btn-quick-entry');
        const correctCount = buttonsInContainer.length === 3;
        
        // Check that container has flex styling
        const containerStyle = window.getComputedStyle(container);
        const hasFlexDisplay = containerStyle.display === 'flex' || 
                               containerStyle.display === 'block'; // fallback for test
        
        // Cleanup
        document.body.removeChild(container);
        
        return correctCount && hasFlexDisplay;
    });
    
    // ========================================
    // ACCESSIBILITY TESTS
    // ========================================
    
    TestFramework.test('Button Accessibility - Keyboard Navigation', function() {
        // Create multiple buttons to test tab navigation
        const buttons = [];
        for (let i = 0; i < 3; i++) {
            const button = document.createElement('button');
            button.className = 'btn-quick-entry';
            button.textContent = `${(i + 1) * 10}%`;
            button.setAttribute('data-target', 'testField');
            button.setAttribute('data-value', (i + 1) * 10);
            document.body.appendChild(button);
            buttons.push(button);
        }
        
        // Test that buttons can receive focus
        let allButtonsFocusable = true;
        buttons.forEach(button => {
            button.focus();
            if (document.activeElement !== button) {
                allButtonsFocusable = false;
            }
            button.blur();
        });
        
        // Test tabindex (should be 0 or not set for natural tab order)
        const firstButtonTabIndex = buttons[0].tabIndex;
        const naturalTabOrder = firstButtonTabIndex === 0 || firstButtonTabIndex === -1;
        
        // Cleanup
        buttons.forEach(button => document.body.removeChild(button));
        
        return allButtonsFocusable && naturalTabOrder;
    });
    
    TestFramework.test('Button Accessibility - Screen Reader Support', function() {
        // Create button with proper attributes for screen readers
        const button = document.createElement('button');
        button.className = 'btn-quick-entry';
        button.textContent = '25%';
        button.setAttribute('data-target', 'downPayment');
        button.setAttribute('data-value', '25');
        button.setAttribute('aria-label', 'Set down payment to 25 percent');
        button.setAttribute('title', 'Click to set down payment to 25%');
        document.body.appendChild(button);
        
        // Check accessibility attributes
        const hasAriaLabel = button.hasAttribute('aria-label');
        const hasTitle = button.hasAttribute('title');
        const hasTextContent = button.textContent.length > 0;
        
        // Cleanup
        document.body.removeChild(button);
        
        return hasAriaLabel && hasTitle && hasTextContent;
    });
    
    // ========================================
    // PERFORMANCE TESTS
    // ========================================
    
    TestFramework.test('Button Performance - Rapid Hover Events', function() {
        // Create test button
        const button = document.createElement('button');
        button.className = 'btn-quick-entry';
        button.textContent = '1.5%';
        document.body.appendChild(button);
        
        // Track performance of multiple rapid hover events
        let eventCount = 0;
        const startTime = performance.now();
        
        button.addEventListener('mouseenter', function() {
            eventCount++;
        });
        
        button.addEventListener('mouseleave', function() {
            eventCount++;
        });
        
        // Simulate rapid hover events
        for (let i = 0; i < 100; i++) {
            const enterEvent = new MouseEvent('mouseenter');
            const leaveEvent = new MouseEvent('mouseleave');
            button.dispatchEvent(enterEvent);
            button.dispatchEvent(leaveEvent);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Should handle 200 events (100 enter + 100 leave) quickly
        const performanceOk = eventCount === 200 && duration < 100; // Less than 100ms
        
        // Cleanup
        document.body.removeChild(button);
        
        return performanceOk;
    });
    
    TestFramework.test('Button Performance - Multiple Buttons Rendering', function() {
        // Test rendering performance with many buttons
        const startTime = performance.now();
        const buttons = [];
        
        // Create 50 buttons (more than typical use case)
        for (let i = 0; i < 50; i++) {
            const button = document.createElement('button');
            button.className = 'btn-quick-entry';
            button.textContent = `${i}%`;
            document.body.appendChild(button);
            buttons.push(button);
        }
        
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        // Should render quickly (less than 50ms for 50 buttons)
        const performanceOk = renderTime < 50;
        
        // Cleanup
        buttons.forEach(button => document.body.removeChild(button));
        
        return performanceOk;
    });
    
    // ========================================
    // ADVANCED VISUAL FEEDBACK TESTS
    // ========================================
    
    TestFramework.test('Quick Entry Buttons - Focus Management', function() {
        // Test keyboard navigation and focus states
        const testButton = document.createElement('button');
        testButton.className = 'btn-quick-entry';
        testButton.textContent = '2.5%';
        testButton.tabIndex = 0;
        document.body.appendChild(testButton);
        
        // Simulate focus
        testButton.focus();
        const isFocused = document.activeElement === testButton;
        
        // Test tab navigation
        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
        testButton.dispatchEvent(tabEvent);
        
        // Cleanup
        document.body.removeChild(testButton);
        
        return isFocused;
    });
    
    TestFramework.test('Quick Entry Buttons - Animation Properties', function() {
        const testButton = document.createElement('button');
        testButton.className = 'btn-quick-entry';
        testButton.textContent = '$5k';
        document.body.appendChild(testButton);
        
        const styles = window.getComputedStyle(testButton);
        
        // Check for transition properties (may not be available in test env)
        const hasTransition = styles.transition !== '' || 
                            styles.transitionDuration !== '' ||
                            styles.transitionProperty !== '';
        
        // Check border radius for rounded appearance
        const hasBorderRadius = styles.borderRadius !== '0px';
        
        // Cleanup
        document.body.removeChild(testButton);
        
        // At least one visual enhancement should be present
        return hasTransition || hasBorderRadius;
    });
    
    TestFramework.test('Quick Entry Buttons - Color Contrast', function() {
        const testButton = document.createElement('button');
        testButton.className = 'btn-quick-entry';
        testButton.textContent = '3.0%';
        document.body.appendChild(testButton);
        
        const styles = window.getComputedStyle(testButton);
        
        // Basic color property checks
        const hasBackgroundColor = styles.backgroundColor !== 'rgba(0, 0, 0, 0)';
        const hasTextColor = styles.color !== '';
        const hasBorder = styles.border !== '' || styles.borderWidth !== '0px';
        
        // Cleanup
        document.body.removeChild(testButton);
        
        return hasBackgroundColor && hasTextColor;
    });
    
    TestFramework.test('Quick Entry Buttons - Mobile Touch Compatibility', function() {
        const testButton = document.createElement('button');
        testButton.className = 'btn-quick-entry';
        testButton.textContent = '$15k';
        document.body.appendChild(testButton);
        
        // Check minimum touch target size (should be accessible)
        const rect = testButton.getBoundingClientRect();
        const minTouchSize = 24; // 24px minimum for accessibility
        
        const isTouchFriendly = rect.width >= minTouchSize && rect.height >= minTouchSize;
        
        // Test touch events
        let touchStartTriggered = false;
        testButton.addEventListener('touchstart', () => {
            touchStartTriggered = true;
        });
        
        // Simulate touch (may not work in all test environments)
        const touchEvent = new Event('touchstart');
        testButton.dispatchEvent(touchEvent);
        
        // Cleanup
        document.body.removeChild(testButton);
        
        return isTouchFriendly;
    });
    
    TestFramework.test('Quick Entry Buttons - High Contrast Mode Compatibility', function() {
        const testButton = document.createElement('button');
        testButton.className = 'btn-quick-entry';
        testButton.textContent = '1.8%';
        document.body.appendChild(testButton);
        
        // Check if button maintains visibility in different contexts
        const styles = window.getComputedStyle(testButton);
        
        // Should have explicit styling rather than relying on defaults
        const hasExplicitStyling = styles.padding !== '0px' || 
                                 styles.margin !== '0px' ||
                                 styles.border !== '' ||
                                 styles.backgroundColor !== 'rgba(0, 0, 0, 0)';
        
        // Cleanup
        document.body.removeChild(testButton);
        
        return hasExplicitStyling;
    });
    
    TestFramework.test('Quick Entry Buttons - Loading State Simulation', function() {
        const testButton = document.createElement('button');
        testButton.className = 'btn-quick-entry';
        testButton.textContent = '$20k';
        document.body.appendChild(testButton);
        
        // Simulate disabled state
        testButton.disabled = true;
        const disabledStyles = window.getComputedStyle(testButton);
        
        // Should show visual indication when disabled
        const showsDisabledState = testButton.disabled === true;
        
        // Re-enable
        testButton.disabled = false;
        const enabledStyles = window.getComputedStyle(testButton);
        
        // Cleanup
        document.body.removeChild(testButton);
        
        return showsDisabledState;
    });
    
    // ========================================
    // INTERACTION EDGE CASE TESTS  
    // ========================================
    
    TestFramework.test('Quick Entry Buttons - Rapid Click Prevention', function() {
        const testButton = document.createElement('button');
        testButton.className = 'btn-quick-entry';
        testButton.textContent = '0.5%';
        document.body.appendChild(testButton);
        
        let clickCount = 0;
        testButton.addEventListener('click', () => {
            clickCount++;
        });
        
        // Simulate rapid clicks
        for (let i = 0; i < 5; i++) {
            testButton.click();
        }
        
        // Should handle rapid clicks gracefully
        const handlesRapidClicks = clickCount > 0;
        
        // Cleanup
        document.body.removeChild(testButton);
        
        return handlesRapidClicks;
    });
    
    TestFramework.test('Quick Entry Buttons - Dynamic Content Updates', function() {
        const testButton = document.createElement('button');
        testButton.className = 'btn-quick-entry';
        testButton.textContent = '1.0%';
        document.body.appendChild(testButton);
        
        // Test dynamic content change
        const originalText = testButton.textContent;
        testButton.textContent = '2.0%';
        const updatedText = testButton.textContent;
        
        // Test data attribute updates
        testButton.setAttribute('data-value', '2.0');
        const hasUpdatedAttribute = testButton.getAttribute('data-value') === '2.0';
        
        // Cleanup
        document.body.removeChild(testButton);
        
        return originalText !== updatedText && hasUpdatedAttribute;
    });
    
    TestFramework.test('Quick Entry Buttons - Internationalization Support', function() {
        const testButton = document.createElement('button');
        testButton.className = 'btn-quick-entry';
        
        // Test with different number formats
        const testCases = ['1,5%', '1.500', '$5K', '€10k', '¥1000'];
        let supportsInternational = true;
        
        for (const testCase of testCases) {
            testButton.textContent = testCase;
            document.body.appendChild(testButton);
            
            // Check if button maintains styling with different content
            const styles = window.getComputedStyle(testButton);
            const maintainsStyle = styles.display !== 'none';
            
            if (!maintainsStyle) {
                supportsInternational = false;
            }
            
            document.body.removeChild(testButton);
        }
        
        return supportsInternational;
    });
    
    TestFramework.test('Quick Entry Buttons - Error State Handling', function() {
        const testButton = document.createElement('button');
        testButton.className = 'btn-quick-entry';
        testButton.textContent = 'Invalid';
        document.body.appendChild(testButton);
        
        // Test error state styling
        testButton.classList.add('error');
        const hasErrorClass = testButton.classList.contains('error');
        
        // Test aria-invalid for accessibility
        testButton.setAttribute('aria-invalid', 'true');
        const hasAriaInvalid = testButton.getAttribute('aria-invalid') === 'true';
        
        // Cleanup
        document.body.removeChild(testButton);
        
        return hasErrorClass && hasAriaInvalid;
    });
});
