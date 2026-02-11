// ========== D&D 5E SYSTEM ==========
// Complete D&D 5th Edition implementation

const DnD5eSystem = {
    id: 'dnd5e',
    name: 'D&D 5e Clássico',
    description: 'Sistema completo baseado em D&D 5e: 6 atributos, modificadores, bônus de proficiência, 18 perícias, classes, raças, spell slots e regras oficiais.',
    icon: 'fa-dragon',
    
    // ========== CONFIGURATION ==========
    config: {
        attrType: 'dnd',
        attrMin: 1,
        attrMax: 30,
        attrPointLimit: 0,
        modifierCalc: 'dnd',
        hpFormula: 'dnd',
        hasEnergyPoints: false,
        hasSanity: false,
        hasActionPoints: false,
        hasFusions: false,
        caFormula: 'dnd',
        hasDodge: false,
        hasClasses: true,
        classAffectsHp: true,
        fieldClass: true,
        hasRaces: true,
        hasMagic: true,
        hasSpellSlots: true,
        hasSavingThrows: true,
        hasProficiencyBonus: true,
        hasPassivePerception: true,
        hasAdvantageDisadvantage: true,
        skillSystem: 'dnd',
        skillList: 'dnd'
    },
    
    // ========== ATTRIBUTES ==========
    attributes: [
        { id: 'dndStr', name: 'FOR', fullName: 'Força', description: 'Força física, capacidade atlética' },
        { id: 'dndDex', name: 'DES', fullName: 'Destreza', description: 'Agilidade, reflexos, equilíbrio' },
        { id: 'dndCon', name: 'CON', fullName: 'Constituição', description: 'Saúde, vigor, resistência' },
        { id: 'dndInt', name: 'INT', fullName: 'Inteligência', description: 'Raciocínio, memória, conhecimento' },
        { id: 'dndWis', name: 'SAB', fullName: 'Sabedoria', description: 'Percepção, intuição, perspicácia' },
        { id: 'dndCha', name: 'CAR', fullName: 'Carisma', description: 'Força de personalidade, liderança' }
    ],
    
    // ========== SKILLS ==========
    skills: [
        // Strength
        { id: 'athletics', name: 'Atletismo', attr: 'STR', description: 'Escalar, nadar, saltar' },
        // Dexterity
        { id: 'acrobatics', name: 'Acrobacia', attr: 'DEX', description: 'Equilíbrio, manobras acrobáticas' },
        { id: 'sleightOfHand', name: 'Prestidigitação', attr: 'DEX', description: 'Furtar, esconder objetos' },
        { id: 'stealth', name: 'Furtividade', attr: 'DEX', description: 'Esconder-se, mover-se silenciosamente' },
        // Intelligence
        { id: 'arcana', name: 'Arcanismo', attr: 'INT', description: 'Conhecimento de magia e planos' },
        { id: 'history', name: 'História', attr: 'INT', description: 'Eventos históricos, civilizações' },
        { id: 'investigation', name: 'Investigação', attr: 'INT', description: 'Procurar pistas, deduzir' },
        { id: 'nature', name: 'Natureza', attr: 'INT', description: 'Plantas, animais, clima' },
        { id: 'religion', name: 'Religião', attr: 'INT', description: 'Deuses, rituais, símbolos' },
        // Wisdom
        { id: 'animalHandling', name: 'Lidar com Animais', attr: 'WIS', description: 'Acalmar, controlar montarias' },
        { id: 'insight', name: 'Intuição', attr: 'WIS', description: 'Detectar mentiras, ler intenções' },
        { id: 'medicine', name: 'Medicina', attr: 'WIS', description: 'Estabilizar, diagnosticar' },
        { id: 'perception', name: 'Percepção', attr: 'WIS', description: 'Notar detalhes, detectar' },
        { id: 'survival', name: 'Sobrevivência', attr: 'WIS', description: 'Rastrear, caçar, prever clima' },
        // Charisma
        { id: 'deception', name: 'Enganação', attr: 'CHA', description: 'Mentir, disfarçar-se' },
        { id: 'intimidation', name: 'Intimidação', attr: 'CHA', description: 'Ameaçar, coagir' },
        { id: 'performance', name: 'Atuação', attr: 'CHA', description: 'Dançar, cantar, atuar' },
        { id: 'persuasion', name: 'Persuasão', attr: 'CHA', description: 'Convencer, negociar' }
    ],
    
    // ========== CLASSES ==========
    classes: {
        'barbarian': { name: 'Bárbaro', hitDie: 12, primaryAttr: 'STR', savingThrows: ['STR', 'CON'], spellcaster: false },
        'bard': { name: 'Bardo', hitDie: 8, primaryAttr: 'CHA', savingThrows: ['DEX', 'CHA'], spellcaster: true, spellAttr: 'CHA' },
        'cleric': { name: 'Clérigo', hitDie: 8, primaryAttr: 'WIS', savingThrows: ['WIS', 'CHA'], spellcaster: true, spellAttr: 'WIS' },
        'druid': { name: 'Druida', hitDie: 8, primaryAttr: 'WIS', savingThrows: ['INT', 'WIS'], spellcaster: true, spellAttr: 'WIS' },
        'fighter': { name: 'Guerreiro', hitDie: 10, primaryAttr: 'STR', savingThrows: ['STR', 'CON'], spellcaster: false },
        'monk': { name: 'Monge', hitDie: 8, primaryAttr: 'DEX', savingThrows: ['STR', 'DEX'], spellcaster: false },
        'paladin': { name: 'Paladino', hitDie: 10, primaryAttr: 'STR', savingThrows: ['WIS', 'CHA'], spellcaster: true, spellAttr: 'CHA' },
        'ranger': { name: 'Patrulheiro', hitDie: 10, primaryAttr: 'DEX', savingThrows: ['STR', 'DEX'], spellcaster: true, spellAttr: 'WIS' },
        'rogue': { name: 'Ladino', hitDie: 8, primaryAttr: 'DEX', savingThrows: ['DEX', 'INT'], spellcaster: false },
        'sorcerer': { name: 'Feiticeiro', hitDie: 6, primaryAttr: 'CHA', savingThrows: ['CON', 'CHA'], spellcaster: true, spellAttr: 'CHA' },
        'warlock': { name: 'Bruxo', hitDie: 8, primaryAttr: 'CHA', savingThrows: ['WIS', 'CHA'], spellcaster: true, spellAttr: 'CHA' },
        'wizard': { name: 'Mago', hitDie: 6, primaryAttr: 'INT', savingThrows: ['INT', 'WIS'], spellcaster: true, spellAttr: 'INT' },
        'artificer': { name: 'Artífice', hitDie: 8, primaryAttr: 'INT', savingThrows: ['CON', 'INT'], spellcaster: true, spellAttr: 'INT' },
        'blood-hunter': { name: 'Caçador de Sangue', hitDie: 10, primaryAttr: 'STR', savingThrows: ['DEX', 'INT'], spellcaster: false }
    },
    
    // ========== RACES ==========
    races: {
        'human': { name: 'Humano', bonuses: { all: 1 }, traits: ['Versátil', '+1 em todos os atributos'] },
        'humanVariant': { name: 'Humano (Variante)', bonuses: { choice1: 1, choice2: 1 }, traits: ['Talento extra'] },
        'elf-high': { name: 'Elfo (Alto)', bonuses: { DEX: 2, INT: 1 }, traits: ['Visão no Escuro', 'Transe'] },
        'elf-wood': { name: 'Elfo (da Floresta)', bonuses: { DEX: 2, WIS: 1 }, traits: ['Visão no Escuro', 'Pés Ligeiros'] },
        'elf-dark': { name: 'Elfo (Drow)', bonuses: { DEX: 2, CHA: 1 }, traits: ['Visão no Escuro Superior'] },
        'dwarf-hill': { name: 'Anão (Colina)', bonuses: { CON: 2, WIS: 1 }, traits: ['Visão no Escuro', 'HP Extra'] },
        'dwarf-mountain': { name: 'Anão (Montanha)', bonuses: { CON: 2, STR: 2 }, traits: ['Visão no Escuro'] },
        'halfling-lightfoot': { name: 'Halfling (Pés-Leves)', bonuses: { DEX: 2, CHA: 1 }, traits: ['Sorte', 'Corajoso'] },
        'halfling-stout': { name: 'Halfling (Robusto)', bonuses: { DEX: 2, CON: 1 }, traits: ['Sorte', 'Resiliência'] },
        'dragonborn': { name: 'Draconato', bonuses: { STR: 2, CHA: 1 }, traits: ['Sopro de Dragão'] },
        'gnome-forest': { name: 'Gnomo (Floresta)', bonuses: { INT: 2, DEX: 1 }, traits: ['Visão no Escuro'] },
        'gnome-rock': { name: 'Gnomo (Rocha)', bonuses: { INT: 2, CON: 1 }, traits: ['Visão no Escuro'] },
        'half-elf': { name: 'Meio-Elfo', bonuses: { CHA: 2, choice1: 1, choice2: 1 }, traits: ['Visão no Escuro'] },
        'half-orc': { name: 'Meio-Orc', bonuses: { STR: 2, CON: 1 }, traits: ['Visão no Escuro', 'Fúria Selvagem'] },
        'tiefling': { name: 'Tiefling', bonuses: { CHA: 2, INT: 1 }, traits: ['Visão no Escuro', 'Resistência Infernal'] },
        'aasimar': { name: 'Aasimar', bonuses: { CHA: 2, WIS: 1 }, traits: ['Visão no Escuro', 'Cura Mágica'] },
        'goliath': { name: 'Golias', bonuses: { STR: 2, CON: 1 }, traits: ['Resistência Natural'] },
        'tabaxi': { name: 'Tabaxi', bonuses: { DEX: 2, CHA: 1 }, traits: ['Visão no Escuro', 'Garras de Gato'] }
    },
    
    // ========== DATA TABLES ==========
    data: {
        // Hit Dice by Class
        hitDice: {
            'barbarian': 12, 'bard': 8, 'cleric': 8, 'druid': 8, 'fighter': 10,
            'monk': 8, 'paladin': 10, 'ranger': 10, 'rogue': 8, 'sorcerer': 6,
            'warlock': 8, 'wizard': 6, 'artificer': 8, 'blood-hunter': 10
        },
        
        // Proficiency Bonus by Level
        proficiencyBonus: {
            1: 2, 2: 2, 3: 2, 4: 2, 5: 3, 6: 3, 7: 3, 8: 3,
            9: 4, 10: 4, 11: 4, 12: 4, 13: 5, 14: 5, 15: 5, 16: 5,
            17: 6, 18: 6, 19: 6, 20: 6
        },
        
        // Armor Types
        armor: {
            'padded': { type: 'light', baseAC: 11, maxDex: null, stealthDisadvantage: true },
            'leather': { type: 'light', baseAC: 11, maxDex: null, stealthDisadvantage: false },
            'studdedLeather': { type: 'light', baseAC: 12, maxDex: null, stealthDisadvantage: false },
            'hide': { type: 'medium', baseAC: 12, maxDex: 2, stealthDisadvantage: false },
            'chainShirt': { type: 'medium', baseAC: 13, maxDex: 2, stealthDisadvantage: false },
            'scaleMail': { type: 'medium', baseAC: 14, maxDex: 2, stealthDisadvantage: true },
            'breastplate': { type: 'medium', baseAC: 14, maxDex: 2, stealthDisadvantage: false },
            'halfPlate': { type: 'medium', baseAC: 15, maxDex: 2, stealthDisadvantage: true },
            'ringMail': { type: 'heavy', baseAC: 14, maxDex: 0, stealthDisadvantage: true },
            'chainMail': { type: 'heavy', baseAC: 16, maxDex: 0, stealthDisadvantage: true },
            'splint': { type: 'heavy', baseAC: 17, maxDex: 0, stealthDisadvantage: true },
            'plate': { type: 'heavy', baseAC: 18, maxDex: 0, stealthDisadvantage: true }
        },
        
        // Spell Slots (Full Caster)
        spellSlots: {
            1:  [2,0,0,0,0,0,0,0,0],
            2:  [3,0,0,0,0,0,0,0,0],
            3:  [4,2,0,0,0,0,0,0,0],
            4:  [4,3,0,0,0,0,0,0,0],
            5:  [4,3,2,0,0,0,0,0,0],
            6:  [4,3,3,0,0,0,0,0,0],
            7:  [4,3,3,1,0,0,0,0,0],
            8:  [4,3,3,2,0,0,0,0,0],
            9:  [4,3,3,3,1,0,0,0,0],
            10: [4,3,3,3,2,0,0,0,0],
            11: [4,3,3,3,2,1,0,0,0],
            12: [4,3,3,3,2,1,0,0,0],
            13: [4,3,3,3,2,1,1,0,0],
            14: [4,3,3,3,2,1,1,0,0],
            15: [4,3,3,3,2,1,1,1,0],
            16: [4,3,3,3,2,1,1,1,0],
            17: [4,3,3,3,2,1,1,1,1],
            18: [4,3,3,3,3,1,1,1,1],
            19: [4,3,3,3,3,2,1,1,1],
            20: [4,3,3,3,3,2,2,1,1]
        },
        
        // Spellcasting Ability by Class
        spellcastingAbility: {
            'bard': 'CHA', 'cleric': 'WIS', 'druid': 'WIS', 'paladin': 'CHA',
            'ranger': 'WIS', 'sorcerer': 'CHA', 'warlock': 'CHA', 'wizard': 'INT',
            'artificer': 'INT'
        }
    },
    
    // ========== CALCULATIONS ==========
    calculations: {
        /**
         * Calculate modifier from ability score
         */
        calculateModifier(score) {
            score = parseInt(score) || 10;
            return Math.floor((score - 10) / 2);
        },
        
        /**
         * Get attribute value
         */
        getAttrValue(charData, attrName) {
            const attrMap = {
                'STR': 'dndStr', 'FOR': 'dndStr', 'str': 'dndStr',
                'DEX': 'dndDex', 'DES': 'dndDex', 'dex': 'dndDex',
                'CON': 'dndCon', 'con': 'dndCon',
                'INT': 'dndInt', 'int': 'dndInt',
                'WIS': 'dndWis', 'SAB': 'dndWis', 'wis': 'dndWis',
                'CHA': 'dndCha', 'CAR': 'dndCha', 'cha': 'dndCha'
            };
            const field = attrMap[attrName] || 'dndStr';
            return parseInt(charData[field]) || 10;
        },
        
        /**
         * Calculate Max HP
         */
        calculateMaxHP(charData) {
            const className = (charData.dndClass || 'fighter').toLowerCase();
            const hitDie = DnD5eSystem.data.hitDice[className] || 10;
            const level = parseInt(charData.charLevel) || 1;
            const conMod = this.calculateModifier(charData.dndCon);
            
            // Level 1: max hit die + CON mod
            // Levels 2+: average of hit die (rounded up) + CON mod per level
            const avgHitDie = Math.ceil(hitDie / 2) + 1;
            const firstLevelHP = hitDie + conMod;
            const additionalHP = (level - 1) * (avgHitDie + conMod);
            
            return Math.max(1, firstLevelHP + additionalHP);
        },
        
        /**
         * Calculate Proficiency Bonus
         */
        calculateProficiencyBonus(charData) {
            const level = Math.min(20, Math.max(1, parseInt(charData.charLevel) || 1));
            return DnD5eSystem.data.proficiencyBonus[level] || 2;
        },
        
        /**
         * Calculate Armor Class
         */
        calculateCA(charData) {
            const dexMod = this.calculateModifier(charData.dndDex);
            const armorType = charData.dndArmorType || 'none';
            const shieldBonus = charData.dndHasShield ? 2 : 0;
            
            if (armorType === 'none') {
                return 10 + dexMod + shieldBonus;
            }
            
            const armor = DnD5eSystem.data.armor[armorType];
            if (!armor) return 10 + dexMod + shieldBonus;
            
            let ac = armor.baseAC;
            
            if (armor.maxDex === null) {
                ac += dexMod;
            } else if (armor.maxDex === 0) {
                // Heavy armor: no DEX
            } else {
                ac += Math.min(dexMod, armor.maxDex);
            }
            
            return ac + shieldBonus;
        },
        
        /**
         * Calculate Initiative
         */
        calculateInitiative(charData) {
            return this.calculateModifier(charData.dndDex);
        },
        
        /**
         * Calculate Skill Total
         */
        calculateSkillTotal(charData, skillId) {
            const skill = DnD5eSystem.skills.find(s => s.id === skillId);
            if (!skill) return 0;
            
            const attrScore = this.getAttrValue(charData, skill.attr);
            const attrMod = this.calculateModifier(attrScore);
            const profBonus = this.calculateProficiencyBonus(charData);
            
            const proficient = charData.dndSkillProficiencies?.[skillId];
            const expertise = charData.dndSkillExpertise?.[skillId];
            
            if (expertise) {
                return attrMod + (profBonus * 2);
            } else if (proficient) {
                return attrMod + profBonus;
            }
            return attrMod;
        },
        
        /**
         * Calculate Passive Perception
         */
        calculatePassivePerception(charData) {
            return 10 + this.calculateSkillTotal(charData, 'perception');
        },
        
        /**
         * Calculate Saving Throw
         */
        calculateSavingThrow(charData, attr) {
            const attrScore = this.getAttrValue(charData, attr);
            const attrMod = this.calculateModifier(attrScore);
            const profBonus = this.calculateProficiencyBonus(charData);
            
            const proficient = charData.dndSaveProficiencies?.[attr];
            
            return proficient ? attrMod + profBonus : attrMod;
        },
        
        /**
         * Calculate Spell Save DC
         */
        calculateSpellDC(charData) {
            const className = (charData.dndClass || '').toLowerCase();
            const spellAttr = DnD5eSystem.data.spellcastingAbility[className];
            if (!spellAttr) return 0;
            
            const attrScore = this.getAttrValue(charData, spellAttr);
            const attrMod = this.calculateModifier(attrScore);
            const profBonus = this.calculateProficiencyBonus(charData);
            
            return 8 + attrMod + profBonus;
        },
        
        /**
         * Calculate Spell Attack Bonus
         */
        calculateSpellAttack(charData) {
            const className = (charData.dndClass || '').toLowerCase();
            const spellAttr = DnD5eSystem.data.spellcastingAbility[className];
            if (!spellAttr) return 0;
            
            const attrScore = this.getAttrValue(charData, spellAttr);
            const attrMod = this.calculateModifier(attrScore);
            const profBonus = this.calculateProficiencyBonus(charData);
            
            return attrMod + profBonus;
        },
        
        /**
         * Get Spell Slots for level
         */
        getSpellSlots(charData) {
            const level = Math.min(20, Math.max(1, parseInt(charData.charLevel) || 1));
            return DnD5eSystem.data.spellSlots[level] || [0,0,0,0,0,0,0,0,0];
        },
        
        /**
         * Calculate Carrying Capacity
         */
        calculateCarryingCapacity(charData) {
            const str = parseInt(charData.dndStr) || 10;
            return str * 15;
        },
        
        /**
         * Update all calculations
         */
        updateAll(charData) {
            return {
                maxHp: this.calculateMaxHP(charData),
                proficiencyBonus: this.calculateProficiencyBonus(charData),
                armorClass: this.calculateCA(charData),
                initiative: this.calculateInitiative(charData),
                passivePerception: this.calculatePassivePerception(charData),
                spellDC: this.calculateSpellDC(charData),
                spellAttack: this.calculateSpellAttack(charData),
                spellSlots: this.getSpellSlots(charData),
                carryingCapacity: this.calculateCarryingCapacity(charData),
                strMod: this.calculateModifier(charData.dndStr),
                dexMod: this.calculateModifier(charData.dndDex),
                conMod: this.calculateModifier(charData.dndCon),
                intMod: this.calculateModifier(charData.dndInt),
                wisMod: this.calculateModifier(charData.dndWis),
                chaMod: this.calculateModifier(charData.dndCha)
            };
        }
    }
};

// Register with SystemRegistry
if (typeof SystemRegistry !== 'undefined') {
    SystemRegistry.register('dnd5e', DnD5eSystem);
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DnD5eSystem;
}
