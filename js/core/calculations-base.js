// ========== BASE CALCULATIONS ==========
// Core calculation framework - routes to system-specific calculations

const BaseCalculations = {
    
    /**
     * Get attribute value by system type
     * This is a universal method that works across systems
     */
    getAttrValue(charData, attrName, systemId) {
        const system = SystemRegistry.get(systemId || SystemRegistry.currentSystemId);
        if (!system) return 0;
        
        // Use system-specific attribute getter if available
        if (system.calculations.getAttrValue) {
            return system.calculations.getAttrValue(charData, attrName);
        }
        
        // Fallback generic lookup
        const attrNameLower = attrName.toLowerCase();
        return parseInt(charData[attrNameLower] || charData[`attr${attrName}`]) || 0;
    },
    
    /**
     * Calculate Max HP using current system
     */
    calculateMaxHP(charData) {
        const system = SystemRegistry.getCurrent();
        if (!system || !system.calculations.calculateMaxHP) {
            return 10; // Fallback
        }
        return system.calculations.calculateMaxHP(charData);
    },
    
    /**
     * Calculate Max PE/Mana using current system
     */
    calculateMaxPE(charData) {
        const system = SystemRegistry.getCurrent();
        if (!system || !system.calculations.calculateMaxPE) {
            return 0;
        }
        return system.calculations.calculateMaxPE(charData);
    },
    
    /**
     * Calculate Max Sanity using current system
     */
    calculateMaxSanity(charData) {
        const system = SystemRegistry.getCurrent();
        if (!system || !system.calculations.calculateMaxSanity) {
            return charData.sanity || 0;
        }
        return system.calculations.calculateMaxSanity(charData);
    },
    
    /**
     * Calculate CA/AC using current system
     */
    calculateCA(charData) {
        const system = SystemRegistry.getCurrent();
        if (!system || !system.calculations.calculateCA) {
            return 10;
        }
        return system.calculations.calculateCA(charData);
    },
    
    /**
     * Calculate PA (if system supports it)
     */
    calculatePA(charData) {
        const system = SystemRegistry.getCurrent();
        if (!system || !system.calculations.calculatePA) {
            return 0;
        }
        return system.calculations.calculatePA(charData);
    },
    
    /**
     * Calculate Initiative
     */
    calculateInitiative(charData) {
        const system = SystemRegistry.getCurrent();
        if (!system || !system.calculations.calculateInitiative) {
            return 0;
        }
        return system.calculations.calculateInitiative(charData);
    },
    
    /**
     * Calculate Skill Total
     */
    calculateSkillTotal(charData, skillId) {
        const system = SystemRegistry.getCurrent();
        if (!system || !system.calculations.calculateSkillTotal) {
            return 0;
        }
        return system.calculations.calculateSkillTotal(charData, skillId);
    },
    
    /**
     * Get all skills for current system
     */
    getSkills() {
        const system = SystemRegistry.getCurrent();
        return system?.skills || [];
    },
    
    /**
     * Get all attributes for current system
     */
    getAttributes() {
        const system = SystemRegistry.getCurrent();
        return system?.attributes || [];
    },
    
    /**
     * Update all calculations for current system
     */
    updateAllCalculations(charData) {
        const system = SystemRegistry.getCurrent();
        if (!system || !system.calculations.updateAll) {
            return {};
        }
        return system.calculations.updateAll(charData);
    },
    
    /**
     * Evaluate custom formula (shared utility)
     */
    evaluateFormula(formula, charData) {
        if (!formula) return 0;
        
        try {
            // Replace variables with actual values
            let expr = formula.toLowerCase()
                .replace(/\blevel\b/g, parseInt(charData.charLevel) || 1)
                .replace(/\bfor\b/g, this.getAttrValue(charData, 'for'))
                .replace(/\bcon\b/g, this.getAttrValue(charData, 'con'))
                .replace(/\bvon\b/g, this.getAttrValue(charData, 'von'))
                .replace(/\bcar\b/g, this.getAttrValue(charData, 'car'))
                .replace(/\bint\b/g, this.getAttrValue(charData, 'int'))
                .replace(/\bagi\b/g, this.getAttrValue(charData, 'agi'))
                .replace(/\bdex\b/g, this.getAttrValue(charData, 'dex'))
                .replace(/\bwis\b/g, this.getAttrValue(charData, 'wis'))
                .replace(/\bcha\b/g, this.getAttrValue(charData, 'cha'))
                .replace(/\bstr\b/g, this.getAttrValue(charData, 'str'));
            
            // Use Function constructor for safe evaluation
            const fn = new Function('return ' + expr);
            const result = fn();
            return Math.floor(result) || 0;
        } catch (e) {
            console.error('Error evaluating formula:', formula, e);
            return 0;
        }
    }
};

// Export for ES modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseCalculations;
}
