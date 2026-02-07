/**
 * Component Loader
 * Loads HTML components from separate files for better code organization.
 */

const ComponentLoader = {
    cache: {},
    
    /**
     * Load an HTML component from file
     * @param {string} path - Path to the component file
     * @param {string} targetId - ID of the element to inject the component into
     * @returns {Promise<boolean>} - Success status
     */
    async load(path, targetId) {
        try {
            // Check cache first
            if (this.cache[path]) {
                document.getElementById(targetId).innerHTML = this.cache[path];
                return true;
            }
            
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${path}`);
            }
            
            const html = await response.text();
            this.cache[path] = html;
            
            const target = document.getElementById(targetId);
            if (target) {
                target.innerHTML = html;
                return true;
            } else {
                console.error(`[ComponentLoader] Target element not found: ${targetId}`);
                return false;
            }
        } catch (error) {
            console.error('[ComponentLoader] Error:', error);
            return false;
        }
    },
    
    /**
     * Preload a component into cache without injecting
     * @param {string} path - Path to the component file
     * @returns {Promise<boolean>}
     */
    async preload(path) {
        try {
            if (this.cache[path]) return true;
            
            const response = await fetch(path);
            if (!response.ok) return false;
            
            this.cache[path] = await response.text();
            return true;
        } catch (error) {
            console.error('[ComponentLoader] Preload error:', error);
            return false;
        }
    },
    
    /**
     * Clear the component cache
     */
    clearCache() {
        this.cache = {};
    }
};
