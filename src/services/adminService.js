// Admin Service - Manages template CRUD operations
// This will be easy to migrate to Supabase later

const STORAGE_KEY = 'wedding-templates';

export const adminService = {
    // Get all templates
    getTemplates: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading templates:', error);
            return [];
        }
    },

    // Get single template by ID
    getTemplateById: (id) => {
        const templates = adminService.getTemplates();
        return templates.find(t => t.id === id);
    },

    // Add new template
    addTemplate: (template) => {
        try {
            const templates = adminService.getTemplates();

            // Check for duplicate ID
            if (templates.some(t => t.id === template.id)) {
                throw new Error('Template with this ID already exists');
            }

            templates.push({
                ...template,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
            return { success: true, template };
        } catch (error) {
            console.error('Error adding template:', error);
            return { success: false, error: error.message };
        }
    },

    // Update existing template
    updateTemplate: (id, updates) => {
        try {
            const templates = adminService.getTemplates();
            const index = templates.findIndex(t => t.id === id);

            if (index === -1) {
                throw new Error('Template not found');
            }

            templates[index] = {
                ...templates[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
            return { success: true, template: templates[index] };
        } catch (error) {
            console.error('Error updating template:', error);
            return { success: false, error: error.message };
        }
    },

    // Delete template
    deleteTemplate: (id) => {
        try {
            const templates = adminService.getTemplates();
            const filtered = templates.filter(t => t.id !== id);

            if (filtered.length === templates.length) {
                throw new Error('Template not found');
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            return { success: true };
        } catch (error) {
            console.error('Error deleting template:', error);
            return { success: false, error: error.message };
        }
    },

    // Validate template structure
    validateTemplate: (template) => {
        const required = ['id', 'name', 'width', 'height', 'layers'];
        const missing = required.filter(field => !template.hasOwnProperty(field));

        if (missing.length > 0) {
            return {
                valid: false,
                error: `Missing required fields: ${missing.join(', ')}`
            };
        }

        if (!Array.isArray(template.layers)) {
            return {
                valid: false,
                error: 'Layers must be an array'
            };
        }

        return { valid: true };
    },

    // Generate slug from name
    generateSlug: (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    // Get templates by category
    getTemplatesByCategory: (category) => {
        const templates = adminService.getTemplates();
        return templates.filter(t => t.category === category);
    },

    // Get all categories
    getCategories: () => {
        const templates = adminService.getTemplates();
        const categories = new Set(templates.map(t => t.category).filter(Boolean));
        return Array.from(categories);
    },

    // Initialize with default templates (run once)
    initializeDefaultTemplates: (defaultTemplates) => {
        const existing = adminService.getTemplates();
        if (existing.length === 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTemplates));
        }
    },

    // Export all templates as JSON
    exportTemplates: () => {
        const templates = adminService.getTemplates();
        return JSON.stringify(templates, null, 2);
    },

    // Import templates from JSON
    importTemplates: (jsonString) => {
        try {
            const templates = JSON.parse(jsonString);
            if (!Array.isArray(templates)) {
                throw new Error('Invalid format: expected array of templates');
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};
