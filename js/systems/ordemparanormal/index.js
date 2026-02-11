// ========== ORDEM PARANORMAL SYSTEM ==========
// Complete Ordem Paranormal RPG implementation

const OrdemParanormalSystem = {
    id: 'ordemparanormal',
    name: 'Ordem Paranormal',
    description: 'Sistema brasileiro de horror e investigação. 5 atributos (AGI, FOR, INT, PRE, VIG), NEX, PE, Sanidade, Trilhas (Combatente, Especialista, Ocultista) e Rituais.',
    icon: 'fa-eye',
    
    // ========== CONFIGURATION ==========
    config: {
        attrType: 'ordemparanormal',
        attrMin: 0,
        attrMax: 5,
        attrPointLimit: 0,
        modifierCalc: 'direct',
        hpFormula: 'ordemparanormal',
        hasEnergyPoints: true,
        energyName: 'PE',
        peFormula: 'ordemparanormal',
        hasSanity: true,
        sanityName: 'Sanidade',
        sanityHasMax: true,
        sanityMax: 100,
        hasActionPoints: false,
        hasFusions: false,
        caFormula: 'ordemparanormal',
        hasDodge: false,
        hasClasses: true,
        classAffectsHp: false,
        fieldClass: true,
        hasRaces: false,
        hasMagic: false,
        hasRituals: true,
        ritualSystem: 'ordemparanormal',
        ritualsCostPE: true,
        ritualsAffectSanity: true,
        hasSavingThrows: true,
        saveType: 'ordemparanormal',
        hasResistances: true,
        skillSystem: 'ordemparanormal',
        skillList: 'ordemparanormal'
    },
    
    // ========== ATTRIBUTES ==========
    attributes: [
        { id: 'opAgi', name: 'AGI', fullName: 'Agilidade', description: 'Velocidade, reflexos, coordenação' },
        { id: 'opFor', name: 'FOR', fullName: 'Força', description: 'Poder físico, resistência muscular' },
        { id: 'opInt', name: 'INT', fullName: 'Intelecto', description: 'Raciocínio, memória, conhecimento' },
        { id: 'opPre', name: 'PRE', fullName: 'Presença', description: 'Carisma, força de vontade, liderança' },
        { id: 'opVig', name: 'VIG', fullName: 'Vigor', description: 'Resistência física, saúde' }
    ],
    
    // ========== SKILLS ==========
    skills: [
        { id: 'acrobacia', name: 'Acrobacia', attr: 'AGI', armorPenalty: true },
        { id: 'adestramento', name: 'Adestramento', attr: 'PRE', armorPenalty: false },
        { id: 'artes', name: 'Artes', attr: 'PRE', armorPenalty: false },
        { id: 'atletismo', name: 'Atletismo', attr: 'FOR', armorPenalty: false },
        { id: 'atualidades', name: 'Atualidades', attr: 'INT', armorPenalty: false },
        { id: 'ciencias', name: 'Ciências', attr: 'INT', armorPenalty: false },
        { id: 'crime', name: 'Crime', attr: 'AGI', armorPenalty: true },
        { id: 'diplomacia', name: 'Diplomacia', attr: 'PRE', armorPenalty: false },
        { id: 'enganacao', name: 'Enganação', attr: 'PRE', armorPenalty: false },
        { id: 'fortitude', name: 'Fortitude', attr: 'VIG', armorPenalty: false },
        { id: 'furtividade', name: 'Furtividade', attr: 'AGI', armorPenalty: true },
        { id: 'iniciativa', name: 'Iniciativa', attr: 'AGI', armorPenalty: false },
        { id: 'intimidacao', name: 'Intimidação', attr: 'PRE', armorPenalty: false },
        { id: 'intuicao', name: 'Intuição', attr: 'PRE', armorPenalty: false },
        { id: 'investigacao', name: 'Investigação', attr: 'INT', armorPenalty: false },
        { id: 'luta', name: 'Luta', attr: 'FOR', armorPenalty: false },
        { id: 'medicina', name: 'Medicina', attr: 'INT', armorPenalty: false },
        { id: 'ocultismo', name: 'Ocultismo', attr: 'INT', armorPenalty: false },
        { id: 'percepcao', name: 'Percepção', attr: 'PRE', armorPenalty: false },
        { id: 'pilotagem', name: 'Pilotagem', attr: 'AGI', armorPenalty: false },
        { id: 'pontaria', name: 'Pontaria', attr: 'AGI', armorPenalty: false },
        { id: 'profissao', name: 'Profissão', attr: 'INT', armorPenalty: false },
        { id: 'reflexos', name: 'Reflexos', attr: 'AGI', armorPenalty: false },
        { id: 'religiao', name: 'Religião', attr: 'PRE', armorPenalty: false },
        { id: 'sobrevivencia', name: 'Sobrevivência', attr: 'INT', armorPenalty: false },
        { id: 'tatica', name: 'Tática', attr: 'INT', armorPenalty: false },
        { id: 'tecnologia', name: 'Tecnologia', attr: 'INT', armorPenalty: false },
        { id: 'vontade', name: 'Vontade', attr: 'PRE', armorPenalty: false }
    ],
    
    // ========== TRILHAS (Classes) ==========
    trilhas: {
        'combatente': {
            id: 'combatente',
            name: 'Combatente',
            description: 'Especialista em combate físico. Maior PV, menor PE.',
            baseHp: 20,
            hpPerNex: 4,
            basePe: 2,
            pePerNex: 2,
            skillsPerNex: 2
        },
        'especialista': {
            id: 'especialista',
            name: 'Especialista',
            description: 'Mestre em perícias e conhecimento. PV/PE equilibrado, mais perícias.',
            baseHp: 16,
            hpPerNex: 3,
            basePe: 3,
            pePerNex: 3,
            skillsPerNex: 4
        },
        'ocultista': {
            id: 'ocultista',
            name: 'Ocultista',
            description: 'Manipulador de rituais e paranormal. Menor PV, maior PE.',
            baseHp: 12,
            hpPerNex: 2,
            basePe: 4,
            pePerNex: 4,
            skillsPerNex: 3
        }
    },
    
    // ========== DATA TABLES ==========
    data: {
        // NEX to Level mapping
        nexTable: {
            5: 1, 10: 2, 15: 3, 20: 4, 25: 5, 30: 6, 35: 7, 40: 8, 45: 9, 50: 10,
            55: 11, 60: 12, 65: 13, 70: 14, 75: 15, 80: 16, 85: 17, 90: 18, 95: 19, 99: 20
        },
        
        // Training levels (unique to OP - higher bonuses)
        trainingLevels: {
            0: { name: 'Destreinado', bonus: 0, cost: 0 },
            1: { name: 'Treinado', bonus: 5, cost: 1 },
            2: { name: 'Veterano', bonus: 10, cost: 2 },
            3: { name: 'Expert', bonus: 15, cost: 3 }
        },
        
        // Ritual circles (níveis de rituais)
        ritualCircles: {
            1: { name: '1º Círculo', cost: 1, sanityDamage: 0 },
            2: { name: '2º Círculo', cost: 3, sanityDamage: 1 },
            3: { name: '3º Círculo', cost: 6, sanityDamage: 2 },
            4: { name: '4º Círculo', cost: 10, sanityDamage: 3 }
        },
        
        // Elementos de rituais
        ritualElements: [
            'Conhecimento', 'Energia', 'Morte', 'Sangue', 'Medo'
        ]
    },
    
    // ========== CALCULATIONS ==========
    calculations: {
        /**
         * Get attribute value
         */
        getAttrValue(charData, attrName) {
            const attrMap = {
                'AGI': 'opAgi', 'agi': 'opAgi', 'agilidade': 'opAgi',
                'FOR': 'opFor', 'for': 'opFor', 'forca': 'opFor', 'força': 'opFor',
                'INT': 'opInt', 'int': 'opInt', 'intelecto': 'opInt', 'inteligencia': 'opInt',
                'PRE': 'opPre', 'pre': 'opPre', 'presenca': 'opPre', 'presença': 'opPre',
                'VIG': 'opVig', 'vig': 'opVig', 'vigor': 'opVig'
            };
            const field = attrMap[attrName] || attrMap[attrName?.toUpperCase()];
            return parseInt(charData[field]) || 0;
        },
        
        /**
         * Calculate Max HP based on Trilha
         * Formula: Base HP + VIG + (NEX levels after 1st × HP per NEX)
         */
        calculateMaxHP(charData) {
            const vigor = parseInt(charData.opVig) || 0;
            const nex = parseInt(charData.charLevel) || 5;
            const trilha = charData.opTrilha || 'combatente';
            const trilhaInfo = OrdemParanormalSystem.trilhas[trilha] || OrdemParanormalSystem.trilhas['combatente'];
            
            // NEX comes in as percentage (5, 10, 15...), convert to level
            const nexLevel = Math.floor(nex / 5);
            const additionalLevels = Math.max(0, nexLevel - 1);
            
            const baseHP = trilhaInfo.baseHp + vigor;
            return baseHP + (additionalLevels * trilhaInfo.hpPerNex);
        },
        
        /**
         * Calculate Max PE based on Trilha
         * Formula: Base PE + PRE + (NEX levels after 1st × PE per NEX)
         */
        calculateMaxPE(charData) {
            const presenca = parseInt(charData.opPre) || 0;
            const nex = parseInt(charData.charLevel) || 5;
            const trilha = charData.opTrilha || 'combatente';
            const trilhaInfo = OrdemParanormalSystem.trilhas[trilha] || OrdemParanormalSystem.trilhas['combatente'];
            
            const nexLevel = Math.floor(nex / 5);
            const additionalLevels = Math.max(0, nexLevel - 1);
            
            const basePE = trilhaInfo.basePe + presenca;
            return basePE + (additionalLevels * trilhaInfo.pePerNex);
        },
        
        /**
         * Calculate Max Sanity
         */
        calculateMaxSanity(charData) {
            return 100; // Fixed max sanity in OP
        },
        
        /**
         * Calculate Defenses (Reflexos, Fortitude, Vontade)
         */
        calculateDefenses(charData) {
            const agi = parseInt(charData.opAgi) || 0;
            const vig = parseInt(charData.opVig) || 0;
            const pre = parseInt(charData.opPre) || 0;
            
            return {
                reflexos: 10 + agi,
                fortitude: 10 + vig,
                vontade: 10 + pre
            };
        },
        
        /**
         * Calculate CA (same as Reflexos for OP)
         */
        calculateCA(charData) {
            const agi = parseInt(charData.opAgi) || 0;
            return 10 + agi;
        },
        
        /**
         * Calculate Initiative
         */
        calculateInitiative(charData) {
            return parseInt(charData.opAgi) || 0;
        },
        
        /**
         * Calculate Skill Total
         */
        calculateSkillTotal(charData, skillId) {
            const skill = OrdemParanormalSystem.skills.find(s => s.id === skillId);
            if (!skill) return 0;
            
            // Get attribute value
            const attrValue = this.getAttrValue(charData, skill.attr);
            
            // Get training level
            const trainingKey = `skill_${skillId}_training`;
            const trainingLevel = parseInt(charData[trainingKey]) || 0;
            const trainingInfo = OrdemParanormalSystem.data.trainingLevels[trainingLevel];
            const trainingBonus = trainingInfo?.bonus || 0;
            
            // Get misc bonus
            const miscKey = `skill_${skillId}_misc`;
            const miscBonus = parseInt(charData[miscKey]) || 0;
            
            return attrValue + trainingBonus + miscBonus;
        },
        
        /**
         * Get training level info
         */
        getTrainingLevel(level) {
            return OrdemParanormalSystem.data.trainingLevels[level] || OrdemParanormalSystem.data.trainingLevels[0];
        },
        
        /**
         * Calculate full results
         */
        updateAll(charData) {
            const defenses = this.calculateDefenses(charData);
            
            return {
                maxHp: this.calculateMaxHP(charData),
                maxPE: this.calculateMaxPE(charData),
                maxSanity: this.calculateMaxSanity(charData),
                reflexos: defenses.reflexos,
                fortitude: defenses.fortitude,
                vontade: defenses.vontade,
                ca: this.calculateCA(charData),
                initiative: this.calculateInitiative(charData)
            };
        }
    }
};

// Register with SystemRegistry
if (typeof SystemRegistry !== 'undefined') {
    SystemRegistry.register('ordemparanormal', OrdemParanormalSystem);
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OrdemParanormalSystem;
}
