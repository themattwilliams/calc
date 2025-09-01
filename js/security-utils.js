/**
 * Security Utilities for Rental Property Analysis Calculator
 * 
 * Contains sanitization and validation functions to prevent XSS and other security issues
 */

// ========================================
// SECURITY FUNCTIONS
// ========================================

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} - The sanitized string
 */
window.sanitizeHTML = function(input) {
    if (!input || typeof input !== 'string') {
        return '';
    }
    
    // Create a temporary div to use browser's HTML parsing
    const temp = document.createElement('div');
    
    // Remove dangerous tags completely
    const dangerousTags = [
        'script', 'iframe', 'object', 'embed', 'link', 'style',
        'meta', 'title', 'head', 'html', 'body', 'base', 'form'
    ];
    
    let sanitized = input;
    
    // Remove dangerous tags and their content
    dangerousTags.forEach(tag => {
        const regex = new RegExp(`<${tag}[^>]*>.*?<\/${tag}>`, 'gis');
        sanitized = sanitized.replace(regex, '');
        // Also remove self-closing tags
        const selfClosingRegex = new RegExp(`<${tag}[^>]*\/?>`, 'gis');
        sanitized = sanitized.replace(selfClosingRegex, '');
    });
    
    // Remove javascript: URLs
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    // Remove event handlers
    const eventHandlers = [
        'onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout',
        'onfocus', 'onblur', 'onchange', 'onsubmit', 'onkeydown',
        'onkeyup', 'onkeypress', 'onresize', 'onscroll'
    ];
    
    eventHandlers.forEach(handler => {
        const regex = new RegExp(`${handler}\\s*=\\s*["'][^"']*["']`, 'gis');
        sanitized = sanitized.replace(regex, '');
    });
    
    // Handle encoded entities that could be dangerous
    sanitized = sanitized.replace(/&lt;script.*?&gt;.*?&lt;\/script&gt;/gi, '');
    sanitized = sanitized.replace(/&lt;iframe.*?&gt;.*?&lt;\/iframe&gt;/gi, '');
    
    // Remove any remaining script-like content
    sanitized = sanitized.replace(/alert\s*\(\s*[^)]*\s*\)/gi, '');
    
    // Set the sanitized content and get the text content
    temp.innerHTML = sanitized;
    
    // For non-HTML content, just return the text
    if (!sanitized.includes('<')) {
        return sanitized;
    }
    
    // Allow only safe HTML tags
    const allowedTags = ['strong', 'em', 'b', 'i', 'u', 'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const walker = document.createTreeWalker(
        temp,
        NodeFilter.SHOW_ELEMENT,
        null,
        false
    );
    
    const elementsToRemove = [];
    let node;
    
    while (node = walker.nextNode()) {
        if (!allowedTags.includes(node.tagName.toLowerCase())) {
            elementsToRemove.push(node);
        }
    }
    
    // Remove disallowed elements but keep their text content
    elementsToRemove.forEach(element => {
        const parent = element.parentNode;
        while (element.firstChild) {
            parent.insertBefore(element.firstChild, element);
        }
        parent.removeChild(element);
    });
    
    return temp.innerHTML;
};

/**
 * Validates markdown structure and content
 * @param {string} markdown - The markdown content to validate
 * @returns {object} - Validation result with isValid and errors
 */
window.validateMarkdownStructure = function(markdown) {
    const result = {
        isValid: true,
        errors: []
    };
    
    if (!markdown || typeof markdown !== 'string') {
        result.isValid = false;
        result.errors.push('Invalid or empty markdown content');
        return result;
    }
    
    // Check file size (max 1MB)
    if (markdown.length > 1048576) {
        result.isValid = false;
        result.errors.push('File size too large. Maximum size is 1MB.');
        return result;
    }
    
    // Check for binary or control characters
    const binaryRegex = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
    if (binaryRegex.test(markdown)) {
        result.isValid = false;
        result.errors.push('File contains invalid characters. Please ensure it is a valid text file.');
        return result;
    }
    
    // Check if it looks like HTML instead of markdown
    const htmlRegex = /<html|<body|<head|<!DOCTYPE/i;
    if (htmlRegex.test(markdown)) {
        result.isValid = false;
        result.errors.push('File appears to be HTML, not markdown format.');
        return result;
    }
    
    // Check for basic markdown structure
    const hasMarkdownHeaders = /^#+\s/m.test(markdown);
    const hasMarkdownBold = /\*\*[^*]+\*\*/.test(markdown);
    
    if (!hasMarkdownHeaders && !hasMarkdownBold) {
        result.isValid = false;
        result.errors.push('File does not appear to be in proper markdown format.');
        return result;
    }
    
    // Robust per-line scanning for fields and values
    const lines = markdown.split(/\r?\n/);
    lines.forEach((line) => {
        const fieldMatch = line.match(/\*\*([^*]+)\*\*:\s*(.+)$/);
        if (!fieldMatch) return;
        const fieldName = (fieldMatch[1] || '').trim().toLowerCase();
        const valueRaw = (fieldMatch[2] || '').trim();

        // Length validation for any field
        if (valueRaw.length > 1000) {
            result.errors.push('One or more fields exceed maximum length limit of 1000 characters.');
        }

        // Numeric validation for specific fields
        if (fieldName === 'purchase price' || fieldName === 'monthly rent') {
            const cleaned = valueRaw.replace(/[$,\s]/g, '').trim();
            const isNumeric = /^\d+(?:\.\d+)?$/.test(cleaned);
            const hasLetters = /[a-zA-Z]/.test(cleaned);
            if (!cleaned || !isNumeric || hasLetters) {
                result.errors.push(`${fieldName === 'purchase price' ? 'Purchase price' : 'Monthly rent'} contains invalid numeric format.`);
            }
        }
    });
    
    // Final guard: if any errors were collected, mark as invalid
    if (result.errors.length > 0) {
        result.isValid = false;
    }
    
    return result;
};

/**
 * Sanitizes property address input
 * @param {string} address - The address to sanitize
 * @returns {string} - The sanitized address
 */
window.sanitizePropertyAddress = function(address) {
    if (!address || typeof address !== 'string') {
        return '';
    }
    
    // Remove HTML tags but preserve the text content
    let sanitized = window.sanitizeHTML(address);
    
    // Trim and limit length
    sanitized = sanitized.trim();
    if (sanitized.length > 500) {
        sanitized = sanitized.substring(0, 500) + '...';
    }
    
    return sanitized;
};

/**
 * Sanitizes custom field names
 * @param {string} fieldName - The field name to sanitize
 * @returns {string} - The sanitized field name
 */
window.sanitizeCustomFieldName = function(fieldName) {
    if (!fieldName || typeof fieldName !== 'string') {
        return '';
    }
    
    // Remove HTML tags and get text content only
    let sanitized = window.sanitizeHTML(fieldName);
    
    // Remove CSV injection attempts
    sanitized = sanitized.replace(/^[=@+\-]/, '');
    
    // Trim and limit length
    sanitized = sanitized.trim();
    if (sanitized.length > 100) {
        sanitized = sanitized.substring(0, 100) + '...';
    }
    
    return sanitized;
};
