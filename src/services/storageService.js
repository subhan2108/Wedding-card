/**
 * storageService.js
 * Handles persistence of editor designs to localStorage (simulating a backend API).
 */

const STORAGE_KEY_PREFIX = 'wedding-invite-design-';

export const storageService = {
    /**
     * Save the current design state
     */
    saveDesign: (id, data) => {
        try {
            const payload = {
                id,
                lastModified: new Date().toISOString(),
                ...data
            };
            localStorage.setItem(`${STORAGE_KEY_PREFIX}${id}`, JSON.stringify(payload));
            return { success: true, timestamp: payload.lastModified };
        } catch (error) {
            console.error('Error saving design:', error);
            return { success: false, error: 'Storage full or unavailable' };
        }
    },

    /**
     * Load a design state by ID
     */
    loadDesign: (id) => {
        try {
            const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.error('Error loading design:', error);
            return null;
        }
    },

    /**
     * List all saved designs
     */
    listSavedDesigns: () => {
        const designs = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(STORAGE_KEY_PREFIX)) {
                try {
                    designs.push(JSON.parse(localStorage.getItem(key)));
                } catch (e) {
                    // Ignore corrupted entries
                }
            }
        }
        return designs.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    }
};
