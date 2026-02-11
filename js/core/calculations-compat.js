// ========== CALCULATIONS COMPATIBILITY LAYER ==========
// This file maintains backward compatibility with the old Calculations object
// while delegating to the new modular system structure

const Calculations = {
    
    // Current system ID for dynamic calculations
    currentSystem: 'realsscripts',
    
    // ========== BACKWARD COMPATIBILITY PROPERTIES ==========
    
    // These properties delegate to the new system modules
    get DND_SKILLS() {
        return DnD5eSystem?.skills || [];
    },
    
    get DND_CLASSES() {
        return DnD5eSystem?.classes || {};
    },
    
    get DND_RACES() {
        return DnD5eSystem?.races || {};
    },
    
    get DND_ATTRIBUTES() {
        return DnD5eSystem?.attributes || [];
    },
    
    get DND_MODIFIER_TABLE() {
        return {
            1: -5, 2: -4, 3: -4, 4: -3, 5: -3, 6: -2, 7: -2, 8: -1, 9: -1,
            10: 0, 11: 0, 12: 1, 13: 1, 14: 2, 15: 2, 16: 3, 17: 3, 18: 4, 19: 4,
            20: 5, 21: 5, 22: 6, 23: 6, 24: 7, 25: 7, 26: 8, 27: 8, 28: 9, 29: 9, 30: 10
        };
    },
    
    get DND_PROFICIENCY_BONUS() {
        return DnD5eSystem?.data?.proficiencyBonus || {};
    },
    
    get DND_HIT_DICE() {
        return DnD5eSystem?.data?.hitDice || {};
    },
    
    get DND_ARMOR() {
        return DnD5eSystem?.data?.armor || {};
    },
    
    get DND_SPELL_SLOTS_FULL() {
        return DnD5eSystem?.data?.spellSlots || {};
    },
    
    get DND_SPELLCASTING_ABILITY() {
        return DnD5eSystem?.data?.spellcastingAbility || {};
    },
    
    get SKILLS() {
        return RealmsScriptsSystem?.skills || [];
    },
    
    get TRAINING_LEVELS() {
        return RealmsScriptsSystem?.data?.trainingLevels || {};
    },
    
    get ARMOR_BONUS() {
        return RealmsScriptsSystem?.data?.armorBonus || {};
    },
    
    get RACE_BONUSES() {
        return RealmsScriptsSystem?.races || {};
    },
    
    get OP_ATTRIBUTES() {
        return OrdemParanormalSystem?.attributes || [];
    },
    
    get OP_SKILLS() {
        return OrdemParanormalSystem?.skills || [];
    },
    
    get OP_TRILHAS() {
        return OrdemParanormalSystem?.trilhas || {};
    },
    
    get OP_TRAINING_LEVELS() {
        return OrdemParanormalSystem?.data?.trainingLevels || {};
    },
    
    get OP_NEX_TABLE() {
        return OrdemParanormalSystem?.data?.nexTable || {};
    },
    
    // ========== SYSTEM CONFIG ==========
    
    getSystemConfig() {
        const system = SystemRegistry.get(this.currentSystem);
        return system?.config || {};
    },
    
    // ========== DYNAMIC CALCULATIONS (route to appropriate system) ==========
    
    calculateDynamicMaxHP(charData) {
        const system = SystemRegistry.get(this.currentSystem);
        return system?.calculations?.calculateMaxHP?.(charData) || 10;
    },
    
    calculateDynamicMaxPE(charData) {
        const system = SystemRegistry.get(this.currentSystem);
        return system?.calculations?.calculateMaxPE?.(charData) || 0;
    },
    
    calculateDynamicPA(charData) {
        const system = SystemRegistry.get(this.currentSystem);
        return system?.calculations?.calculatePA?.(charData) || 0;
    },
    
    calculateDynamicCA(charData) {
        const system = SystemRegistry.get(this.currentSystem);
        return system?.calculations?.calculateCA?.(charData) || 10;
    },
    
    // ========== D&D 5E METHODS (delegate to DnD5eSystem) ==========
    
    calculateDndModifier(score) {
        return DnD5eSystem?.calculations?.calculateModifier?.(score) || Math.floor((parseInt(score) - 10) / 2);
    },
    
    getDndAttrValue(charData, attrName) {
        return DnD5eSystem?.calculations?.getAttrValue?.(charData, attrName) || 10;
    },
    
    calculateDndMaxHP(charData) {
        return DnD5eSystem?.calculations?.calculateMaxHP?.(charData) || 10;
    },
    
    calculateDndProficiencyBonus(charData) {
        return DnD5eSystem?.calculations?.calculateProficiencyBonus?.(charData) || 2;
    },
    
    calculateDndAC(charData) {
        return DnD5eSystem?.calculations?.calculateCA?.(charData) || 10;
    },
    
    calculateDndInitiative(charData) {
        return DnD5eSystem?.calculations?.calculateInitiative?.(charData) || 0;
    },
    
    calculateDndSkillTotal(charData, skillId) {
        return DnD5eSystem?.calculations?.calculateSkillTotal?.(charData, skillId) || 0;
    },
    
    calculateDndPassivePerception(charData) {
        return DnD5eSystem?.calculations?.calculatePassivePerception?.(charData) || 10;
    },
    
    calculateDndSavingThrow(charData, attr) {
        return DnD5eSystem?.calculations?.calculateSavingThrow?.(charData, attr) || 0;
    },
    
    calculateDndSpellDC(charData) {
        return DnD5eSystem?.calculations?.calculateSpellDC?.(charData) || 0;
    },
    
    calculateDndSpellAttack(charData) {
        return DnD5eSystem?.calculations?.calculateSpellAttack?.(charData) || 0;
    },
    
    getDndSpellSlots(charData) {
        return DnD5eSystem?.calculations?.getSpellSlots?.(charData) || [0,0,0,0,0,0,0,0,0];
    },
    
    calculateDndCarryingCapacity(charData) {
        return DnD5eSystem?.calculations?.calculateCarryingCapacity?.(charData) || 150;
    },
    
    updateDndCalculations(charData) {
        return DnD5eSystem?.calculations?.updateAll?.(charData) || {};
    },
    
    getDndProficientSkills(charData) {
        const proficient = [];
        const proficiencies = charData.dndSkillProficiencies || {};
        
        this.DND_SKILLS.forEach(skill => {
            const level = proficiencies[skill.id] || 0; // 0 = none, 1 = proficient, 2 = expertise
            if (level > 0) {
                proficient.push({
                    ...skill,
                    proficiency: level,
                    total: this.calculateDndSkillTotal(charData, skill.id)
                });
            }
        });
        
        return proficient.sort((a, b) => b.total - a.total);
    },
    
    // ========== ORDEM PARANORMAL METHODS (delegate to OrdemParanormalSystem) ==========
    
    calculateOPMaxHP(charData) {
        return OrdemParanormalSystem?.calculations?.calculateMaxHP?.(charData) || 10;
    },
    
    calculateOPMaxPE(charData) {
        return OrdemParanormalSystem?.calculations?.calculateMaxPE?.(charData) || 0;
    },
    
    calculateOPDefenses(charData) {
        return OrdemParanormalSystem?.calculations?.calculateDefenses?.(charData) || { reflexos: 10, fortitude: 10, vontade: 10 };
    },
    
    getOPAttrValue(charData, attrName) {
        return OrdemParanormalSystem?.calculations?.getAttrValue?.(charData, attrName) || 0;
    },
    
    calculateOPSkillTotal(charData, skillId) {
        return OrdemParanormalSystem?.calculations?.calculateSkillTotal?.(charData, skillId) || 0;
    },
    
    // ========== REALMS&SCRIPTS METHODS (delegate to RealmsScriptsSystem) ==========
    
    getAttrValue(charData, attrName) {
        return RealmsScriptsSystem?.calculations?.getAttrValue?.(charData, attrName) || 0;
    },
    
    calculateMaxHP(charData) {
        return RealmsScriptsSystem?.calculations?.calculateMaxHP?.(charData) || 10;
    },
    
    calculateMaxPE(charData) {
        return RealmsScriptsSystem?.calculations?.calculateMaxPE?.(charData) || 0;
    },
    
    calculatePA(charData) {
        return RealmsScriptsSystem?.calculations?.calculatePA?.(charData) || 1;
    },
    
    calculateCA(charData) {
        return RealmsScriptsSystem?.calculations?.calculateCA?.(charData) || 10;
    },
    
    calculateDodge(charData) {
        return RealmsScriptsSystem?.calculations?.calculateDodge?.(charData) || 10;
    },
    
    calculateInitiative(charData) {
        return RealmsScriptsSystem?.calculations?.calculateInitiative?.(charData) || 0;
    },
    
    calculateMaxWeight(charData) {
        return RealmsScriptsSystem?.calculations?.calculateMaxWeight?.(charData) || 12;
    },
    
    calculateHeavyWeight(charData) {
        return RealmsScriptsSystem?.calculations?.calculateHeavyWeight?.(charData) || 18;
    },
    
    calculateCurrentWeight(charData) {
        return RealmsScriptsSystem?.calculations?.calculateCurrentWeight?.(charData) || 0;
    },
    
    getWeightStatus(charData) {
        return RealmsScriptsSystem?.calculations?.getWeightStatus?.(charData) || 'normal';
    },
    
    calculateSkillTotal(charData, skillId) {
        return RealmsScriptsSystem?.calculations?.calculateSkillTotal?.(charData, skillId) || 0;
    },
    
    calculateDefendReduction(charData) {
        return RealmsScriptsSystem?.calculations?.calculateDefendReduction?.(charData) || 0;
    },
    
    calculateDamageReduction(charData) {
        return RealmsScriptsSystem?.calculations?.calculateDamageReduction?.(charData) || 0;
    },
    
    calculateFallReduction(charData) {
        return RealmsScriptsSystem?.calculations?.calculateFallReduction?.(charData) || 0;
    },
    
    calculatePNPerLevel(charData) {
        return RealmsScriptsSystem?.calculations?.calculatePNPerLevel?.(charData) || 4;
    },
    
    calculateUsedAttrPoints(charData) {
        return RealmsScriptsSystem?.calculations?.calculateUsedAttrPoints?.(charData) || 0;
    },
    
    getTrainingLevel(level) {
        if (this.currentSystem === 'ordemparanormal') {
            return OrdemParanormalSystem?.calculations?.getTrainingLevel?.(level) || { name: 'Destreinado', bonus: 0 };
        }
        return RealmsScriptsSystem?.calculations?.getTrainingLevel?.(level) || { name: 'Sem Treino', bonus: 0 };
    },
    
    // ========== UNIVERSAL METHODS ==========
    
    getAttrValueBySystem(charData, attrName) {
        const system = SystemRegistry.get(this.currentSystem);
        return system?.calculations?.getAttrValue?.(charData, attrName) || 0;
    },
    
    evaluateCustomFormula(formula, charData) {
        return BaseCalculations.evaluateFormula(formula, charData);
    },
    
    getHitDie(charData) {
        const className = (charData.dndClass || 'fighter').toLowerCase();
        return this.DND_HIT_DICE[className] || 10;
    },
    
    // Generic skill calculation for any system
    calculateGenericSkillTotal(charData, skillId, skillInfo) {
        const system = SystemRegistry.get(this.currentSystem);
        return system?.calculations?.calculateSkillTotal?.(charData, skillId) || 0;
    },
    
    // Update all calculations for current system
    updateAllCalculations(charData) {
        const system = SystemRegistry.get(this.currentSystem);
        return system?.calculations?.updateAll?.(charData) || {};
    },
    
    // Get trained skills
    getTrainedSkills(charData) {
        const system = SystemRegistry.get(this.currentSystem);
        const skills = system?.skills || [];
        
        const trained = [];
        skills.forEach(skill => {
            const level = charData.skills?.[skill.id] || 0;
            if (level > 0) {
                trained.push({
                    ...skill,
                    level,
                    total: this.calculateGenericSkillTotal(charData, skill.id, skill)
                });
            }
        });
        
        return trained.sort((a, b) => b.total - a.total);
    }
};

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Calculations;
}
