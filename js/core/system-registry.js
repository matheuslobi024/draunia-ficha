// ========== SYSTEM REGISTRY ==========
// Central hub for registering and accessing RPG systems

const SystemRegistry = {
    // All registered systems
    systems: {},
    
    // Built-in system IDs
    BUILT_IN_SYSTEMS: ['realsscripts', 'dnd5e', 'ordemparanormal'],
    
    // Current active system
    currentSystemId: 'realsscripts',
    
    /**
     * Register a new system
     * @param {string} id - Unique system identifier
     * @param {object} system - System definition object
     */
    register(id, system) {
        if (!id || !system) {
            console.error('[SystemRegistry] Invalid system registration:', id);
            return false;
        }
        
        // Validate required properties
        const required = ['name', 'config', 'calculations'];
        for (const prop of required) {
            if (!system[prop]) {
                console.error(`[SystemRegistry] System ${id} missing required property: ${prop}`);
                return false;
            }
        }
        
        this.systems[id] = {
            id,
            ...system,
            isBuiltIn: this.BUILT_IN_SYSTEMS.includes(id)
        };
        
        console.log(`[SystemRegistry] Registered system: ${id}`);
        return true;
    },
    
    /**
     * Get a system by ID
     * @param {string} id - System identifier
     * @returns {object|null} System object or null
     */
    get(id) {
        return this.systems[id] || null;
    },
    
    /**
     * Get current active system
     * @returns {object|null}
     */
    getCurrent() {
        return this.get(this.currentSystemId);
    },
    
    /**
     * Set current active system
     * @param {string} id - System identifier
     */
    setCurrent(id) {
        if (this.systems[id]) {
            this.currentSystemId = id;
            console.log(`[SystemRegistry] Active system: ${id}`);
            return true;
        }
        console.warn(`[SystemRegistry] System not found: ${id}`);
        return false;
    },
    
    /**
     * Get all registered systems
     * @returns {object}
     */
    getAll() {
        return { ...this.systems };
    },
    
    /**
     * Get only built-in systems
     * @returns {object}
     */
    getBuiltIn() {
        const result = {};
        for (const id of this.BUILT_IN_SYSTEMS) {
            if (this.systems[id]) {
                result[id] = this.systems[id];
            }
        }
        return result;
    },
    
    /**
     * Get only custom (user-created) systems
     * @returns {object}
     */
    getCustom() {
        const result = {};
        for (const [id, system] of Object.entries(this.systems)) {
            if (!system.isBuiltIn) {
                result[id] = system;
            }
        }
        return result;
    },
    
    /**
     * Check if a system is registered
     * @param {string} id 
     * @returns {boolean}
     */
    has(id) {
        return id in this.systems;
    },
    
    /**
     * Remove a custom system
     * @param {string} id 
     * @returns {boolean}
     */
    remove(id) {
        if (this.systems[id] && !this.systems[id].isBuiltIn) {
            delete this.systems[id];
            console.log(`[SystemRegistry] Removed system: ${id}`);
            return true;
        }
        return false;
    },
    
    /**
     * Get system configuration
     * @param {string} id 
     * @returns {object}
     */
    getConfig(id) {
        return this.systems[id]?.config || {};
    },
    
    /**
     * Get system calculations module
     * @param {string} id 
     * @returns {object}
     */
    getCalculations(id) {
        return this.systems[id]?.calculations || {};
    },
    
    /**
     * Calculate value using current system
     * @param {string} method - Calculation method name
     * @param {object} charData - Character data
     * @param  {...any} args - Additional arguments
     * @returns {any}
     */
    calculate(method, charData, ...args) {
        const system = this.getCurrent();
        if (!system || !system.calculations[method]) {
            console.warn(`[SystemRegistry] Calculation method not found: ${method}`);
            return 0;
        }
        return system.calculations[method](charData, ...args);
    }
};

// Export for ES modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SystemRegistry;
}
