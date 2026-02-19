
import { supabase } from '../lib/supabaseClient';

const STORAGE_KEY = 'wedding-templates';

// Helper: Slugify function
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

export const adminService = {
    // Initialize default templates if storage is empty
    initializeDefaultTemplates: (defaultTemplates) => {
        const existing = localStorage.getItem(STORAGE_KEY);
        if (!existing && defaultTemplates && defaultTemplates.length > 0) {

            // Validate defaults
            const validDefaults = defaultTemplates.map(t => ({
                ...t,
                id: t.id || slugify(t.name),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }));

            localStorage.setItem(STORAGE_KEY, JSON.stringify(validDefaults));
            console.log('Initialized default templates into localStorage');
        }
    },

    // Get all templates
    getTemplates: () => {
        try {
            const templates = localStorage.getItem(STORAGE_KEY);
            return templates ? JSON.parse(templates) : [];
        } catch (error) {
            console.error('Error parsing templates from localStorage', error);
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

            // Generate slug ID if not present
            const newId = template.id || slugify(template.name);

            // Check for duplicate ID
            if (templates.some(t => t.id === newId)) {
                return { success: false, error: 'Template with this name/ID already exists' };
            }

            const newTemplate = {
                ...template,
                id: newId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const updatedTemplates = [newTemplate, ...templates];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
            return { success: true, template: newTemplate };
        } catch (error) {
            console.error('Error adding template', error);
            return { success: false, error: error.message };
        }
    },

    // Update existing template
    updateTemplate: (id, updates) => {
        try {
            const templates = adminService.getTemplates();
            const index = templates.findIndex(t => t.id === id);

            if (index === -1) {
                return { success: false, error: 'Template not found' };
            }

            const updatedTemplate = {
                ...templates[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            templates[index] = updatedTemplate;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
            return { success: true, template: updatedTemplate };
        } catch (error) {
            console.error('Error updating template', error);
            return { success: false, error: error.message };
        }
    },

    // Delete template
    deleteTemplate: (id) => {
        try {
            const templates = adminService.getTemplates();
            const filteredTemplates = templates.filter(t => t.id !== id);

            if (templates.length === filteredTemplates.length) {
                return { success: false, error: 'Template not found' };
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTemplates));
            return { success: true };
        } catch (error) {
            console.error('Error deleting template', error);
            return { success: false, error: error.message };
        }
    },

    // Generate slug helper
    generateSlug: (name) => slugify(name),

    // Fetch all orders from Supabase
    getOrders: async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    },

    // Fetch single order by ID
    getOrderById: async (id) => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching order:', error);
            return null;
        }
    }
};
