// ========== CALCULATIONS MODULE ==========

const Calculations = {
    
    // ========== D&D 5E RULES ==========
    
    // D&D 5e Ability Score Modifier Table
    // Score 1 = -5, Score 10-11 = 0, Score 20-21 = +5, Score 30 = +10
    DND_MODIFIER_TABLE: {
        1: -5, 2: -4, 3: -4, 4: -3, 5: -3, 6: -2, 7: -2, 8: -1, 9: -1,
        10: 0, 11: 0, 12: 1, 13: 1, 14: 2, 15: 2, 16: 3, 17: 3, 18: 4, 19: 4,
        20: 5, 21: 5, 22: 6, 23: 6, 24: 7, 25: 7, 26: 8, 27: 8, 28: 9, 29: 9, 30: 10
    },
    
    // Proficiency Bonus by Level
    DND_PROFICIENCY_BONUS: {
        1: 2, 2: 2, 3: 2, 4: 2, 5: 3, 6: 3, 7: 3, 8: 3,
        9: 4, 10: 4, 11: 4, 12: 4, 13: 5, 14: 5, 15: 5, 16: 5,
        17: 6, 18: 6, 19: 6, 20: 6
    },
    
    // Hit Dice by Class
    DND_HIT_DICE: {
        'barbarian': 12,
        'bard': 8,
        'cleric': 8,
        'druid': 8,
        'fighter': 10,
        'monk': 8,
        'paladin': 10,
        'ranger': 10,
        'rogue': 8,
        'sorcerer': 6,
        'warlock': 8,
        'wizard': 6
    },
    
    // D&D 5e Skills with associated attributes
    DND_SKILLS: [
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
    
    // D&D 5e Standard Array for Point Buy reference
    DND_STANDARD_ARRAY: [15, 14, 13, 12, 10, 8],
    
    // D&D 5e Difficulty Classes
    DND_DIFFICULTY_CLASS: {
        'veryEasy': 5,
        'easy': 10,
        'medium': 15,
        'hard': 20,
        'veryHard': 25,
        'nearlyImpossible': 30
    },
    
    // D&D 5e Armor Types
    DND_ARMOR: {
        // Light Armor
        'padded': { type: 'light', baseAC: 11, maxDex: null, stealthDisadvantage: true },
        'leather': { type: 'light', baseAC: 11, maxDex: null, stealthDisadvantage: false },
        'studdedLeather': { type: 'light', baseAC: 12, maxDex: null, stealthDisadvantage: false },
        // Medium Armor
        'hide': { type: 'medium', baseAC: 12, maxDex: 2, stealthDisadvantage: false },
        'chainShirt': { type: 'medium', baseAC: 13, maxDex: 2, stealthDisadvantage: false },
        'scaleMail': { type: 'medium', baseAC: 14, maxDex: 2, stealthDisadvantage: true },
        'breastplate': { type: 'medium', baseAC: 14, maxDex: 2, stealthDisadvantage: false },
        'halfPlate': { type: 'medium', baseAC: 15, maxDex: 2, stealthDisadvantage: true },
        // Heavy Armor
        'ringMail': { type: 'heavy', baseAC: 14, maxDex: 0, stealthDisadvantage: true },
        'chainMail': { type: 'heavy', baseAC: 16, maxDex: 0, stealthDisadvantage: true },
        'splint': { type: 'heavy', baseAC: 17, maxDex: 0, stealthDisadvantage: true },
        'plate': { type: 'heavy', baseAC: 18, maxDex: 0, stealthDisadvantage: true }
    },
    
    // D&D 5e Races with ability score bonuses
    DND_RACES: {
        'human': { name: 'Humano', bonuses: { all: 1 }, traits: ['Versátil', '+1 em todos os atributos'] },
        'humanVariant': { name: 'Humano (Variante)', bonuses: { choice1: 1, choice2: 1 }, traits: ['Talento extra', '+1 em dois atributos à escolha'] },
        'elf-high': { name: 'Elfo (Alto)', bonuses: { DEX: 2, INT: 1 }, traits: ['Visão no Escuro', 'Transe', 'Sentidos Aguçados', 'Cantrip'] },
        'elf-wood': { name: 'Elfo (da Floresta)', bonuses: { DEX: 2, WIS: 1 }, traits: ['Visão no Escuro', 'Transe', 'Pés Ligeiros', 'Máscara da Natureza'] },
        'elf-dark': { name: 'Elfo (Drow)', bonuses: { DEX: 2, CHA: 1 }, traits: ['Visão no Escuro Superior', 'Sensibilidade à Luz', 'Magia Drow'] },
        'dwarf-hill': { name: 'Anão (Colina)', bonuses: { CON: 2, WIS: 1 }, traits: ['Visão no Escuro', 'Resistência Anã', 'HP Extra'] },
        'dwarf-mountain': { name: 'Anão (Montanha)', bonuses: { CON: 2, STR: 2 }, traits: ['Visão no Escuro', 'Resistência Anã', 'Armadura Anã'] },
        'halfling-lightfoot': { name: 'Halfling (Pés-Leves)', bonuses: { DEX: 2, CHA: 1 }, traits: ['Sorte', 'Corajoso', 'Furtividade Natural'] },
        'halfling-stout': { name: 'Halfling (Robusto)', bonuses: { DEX: 2, CON: 1 }, traits: ['Sorte', 'Corajoso', 'Resiliência'] },
        'dragonborn': { name: 'Draconato', bonuses: { STR: 2, CHA: 1 }, traits: ['Ancestralidade Dracônica', 'Sopro de Dragão', 'Resistência a Dano'] },
        'gnome-forest': { name: 'Gnomo (Floresta)', bonuses: { INT: 2, DEX: 1 }, traits: ['Visão no Escuro', 'Esperteza Gnômica', 'Ilusionista Nato'] },
        'gnome-rock': { name: 'Gnomo (Rocha)', bonuses: { INT: 2, CON: 1 }, traits: ['Visão no Escuro', 'Esperteza Gnômica', 'Conhecimento de Artífice'] },
        'half-elf': { name: 'Meio-Elfo', bonuses: { CHA: 2, choice1: 1, choice2: 1 }, traits: ['Visão no Escuro', 'Versatilidade de Perícias', 'Ancestralidade Feérica'] },
        'half-orc': { name: 'Meio-Orc', bonuses: { STR: 2, CON: 1 }, traits: ['Visão no Escuro', 'Fúria Selvagem', 'Ataques Selvagens'] },
        'tiefling': { name: 'Tiefling', bonuses: { CHA: 2, INT: 1 }, traits: ['Visão no Escuro', 'Resistência Infernal', 'Legado Infernal'] },
        'aasimar': { name: 'Aasimar', bonuses: { CHA: 2, WIS: 1 }, traits: ['Visão no Escuro', 'Resistência Celestial', 'Cura Mágica'] },
        'goliath': { name: 'Golias', bonuses: { STR: 2, CON: 1 }, traits: ['Resistência Natural', 'Nascido nas Montanhas', 'Constituição Poderosa'] },
        'tabaxi': { name: 'Tabaxi', bonuses: { DEX: 2, CHA: 1 }, traits: ['Visão no Escuro', 'Garras de Gato', 'Agilidade Felina'] },
        'kenku': { name: 'Kenku', bonuses: { DEX: 2, WIS: 1 }, traits: ['Mimetismo', 'Falsificador Experto', 'Treinamento Kenku'] },
        'firbolg': { name: 'Firbolg', bonuses: { WIS: 2, STR: 1 }, traits: ['Magia Firbolg', 'Fala das Feras e Folhas', 'Aparência Oculta'] },
        'tortle': { name: 'Tortle', bonuses: { STR: 2, WIS: 1 }, traits: ['Armadura Natural', 'Garras', 'Prender Respiração', 'Defesa do Casco'] },
        'aarakocra': { name: 'Aarakocra', bonuses: { DEX: 2, WIS: 1 }, traits: ['Voo', 'Talons'] },
        'genasi-air': { name: 'Genasi (Ar)', bonuses: { CON: 2, DEX: 1 }, traits: ['Prender Respiração Infinito', 'Mesclar-se ao Vento'] },
        'genasi-earth': { name: 'Genasi (Terra)', bonuses: { CON: 2, STR: 1 }, traits: ['Caminhar sobre Terra', 'Mesclar-se à Pedra'] },
        'genasi-fire': { name: 'Genasi (Fogo)', bonuses: { CON: 2, INT: 1 }, traits: ['Visão no Escuro', 'Resistência ao Fogo', 'Alcance das Chamas'] },
        'genasi-water': { name: 'Genasi (Água)', bonuses: { CON: 2, WIS: 1 }, traits: ['Respiração Anfíbia', 'Nadar', 'Chamar às Ondas'] },
        'warforged': { name: 'Forjados', bonuses: { CON: 2, choice: 1 }, traits: ['Construção Viva', 'Armadura Integrada', 'Modo Sentinela'] }
    },
    
    // D&D 5e Classes with full details
    DND_CLASSES: {
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
    
    // D&D 5e Attributes
    DND_ATTRIBUTES: [
        { id: 'dndStr', name: 'FOR', fullName: 'Força', description: 'Força física, capacidade atlética' },
        { id: 'dndDex', name: 'DES', fullName: 'Destreza', description: 'Agilidade, reflexos, equilíbrio' },
        { id: 'dndCon', name: 'CON', fullName: 'Constituição', description: 'Saúde, vigor, resistência' },
        { id: 'dndInt', name: 'INT', fullName: 'Inteligência', description: 'Raciocínio, memória, conhecimento' },
        { id: 'dndWis', name: 'SAB', fullName: 'Sabedoria', description: 'Percepção, intuição, perspicácia' },
        { id: 'dndCha', name: 'CAR', fullName: 'Carisma', description: 'Força de personalidade, liderança' }
    ],
    
    // D&D 5e Spellcasting Ability by Class
    DND_SPELLCASTING_ABILITY: {
        'bard': 'CHA',
        'cleric': 'WIS',
        'druid': 'WIS',
        'paladin': 'CHA',
        'ranger': 'WIS',
        'sorcerer': 'CHA',
        'warlock': 'CHA',
        'wizard': 'INT'
    },
    
    // D&D 5e Spell Slots by Level (Full Casters)
    DND_SPELL_SLOTS_FULL: {
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
    
    // Calculate D&D modifier from ability score
    calculateDndModifier(score) {
        score = parseInt(score) || 10;
        return Math.floor((score - 10) / 2);
    },
    
    // Get D&D attribute value (FOR=STR, DES=DEX, CON=CON, INT=INT, SAB=WIS, CAR=CHA)
    getDndAttrValue(charData, attrName) {
        const attrMap = {
            'STR': charData.dndStr || 10,
            'DEX': charData.dndDex || 10,
            'CON': charData.dndCon || 10,
            'INT': charData.dndInt || 10,
            'WIS': charData.dndWis || 10,
            'CHA': charData.dndCha || 10
        };
        return parseInt(attrMap[attrName]) || 10;
    },
    
    // Calculate D&D Max HP: Hit Die max at level 1 + (avg HD + CON mod) × (level - 1)
    calculateDndMaxHP(charData) {
        const className = (charData.dndClass || 'fighter').toLowerCase();
        const hitDie = this.DND_HIT_DICE[className] || 10;
        const level = parseInt(charData.charLevel) || 1;
        const conMod = this.calculateDndModifier(charData.dndCon);
        
        // Level 1: max hit die + CON mod
        // Levels 2+: average of hit die (rounded up) + CON mod per level
        const avgHitDie = Math.ceil(hitDie / 2) + 1;
        const firstLevelHP = hitDie + conMod;
        const additionalHP = (level - 1) * (avgHitDie + conMod);
        
        return Math.max(1, firstLevelHP + additionalHP);
    },
    
    // Calculate D&D Proficiency Bonus
    calculateDndProficiencyBonus(charData) {
        const level = Math.min(20, Math.max(1, parseInt(charData.charLevel) || 1));
        return this.DND_PROFICIENCY_BONUS[level] || 2;
    },
    
    // Calculate D&D Armor Class
    calculateDndAC(charData) {
        const dexMod = this.calculateDndModifier(charData.dndDex);
        const armorType = charData.dndArmorType || 'none';
        const shieldBonus = charData.dndHasShield ? 2 : 0;
        
        if (armorType === 'none') {
            // Unarmored: 10 + DEX modifier
            return 10 + dexMod + shieldBonus;
        }
        
        const armor = this.DND_ARMOR[armorType];
        if (!armor) return 10 + dexMod + shieldBonus;
        
        let ac = armor.baseAC;
        
        if (armor.maxDex === null) {
            // Light armor: full DEX
            ac += dexMod;
        } else if (armor.maxDex === 0) {
            // Heavy armor: no DEX
        } else {
            // Medium armor: limited DEX
            ac += Math.min(dexMod, armor.maxDex);
        }
        
        return ac + shieldBonus;
    },
    
    // Calculate D&D Initiative
    calculateDndInitiative(charData) {
        return this.calculateDndModifier(charData.dndDex);
    },
    
    // Calculate D&D Skill Total
    calculateDndSkillTotal(charData, skillId) {
        const skill = this.DND_SKILLS.find(s => s.id === skillId);
        if (!skill) return 0;
        
        const attrMod = this.calculateDndModifier(this.getDndAttrValue(charData, skill.attr));
        const profBonus = this.calculateDndProficiencyBonus(charData);
        
        // Check if proficient
        const proficient = charData.dndSkillProficiencies && charData.dndSkillProficiencies[skillId];
        // Check if expertise (double proficiency)
        const expertise = charData.dndSkillExpertise && charData.dndSkillExpertise[skillId];
        
        if (expertise) {
            return attrMod + (profBonus * 2);
        } else if (proficient) {
            return attrMod + profBonus;
        }
        return attrMod;
    },
    
    // Calculate D&D Passive Perception
    calculateDndPassivePerception(charData) {
        return 10 + this.calculateDndSkillTotal(charData, 'perception');
    },
    
    // Calculate D&D Saving Throw
    calculateDndSavingThrow(charData, attr) {
        const attrMod = this.calculateDndModifier(this.getDndAttrValue(charData, attr));
        const profBonus = this.calculateDndProficiencyBonus(charData);
        
        // Check if proficient in this save
        const proficient = charData.dndSaveProficiencies && charData.dndSaveProficiencies[attr];
        
        return proficient ? attrMod + profBonus : attrMod;
    },
    
    // Calculate D&D Spell Save DC
    calculateDndSpellDC(charData) {
        const className = (charData.dndClass || '').toLowerCase();
        const spellAttr = this.DND_SPELLCASTING_ABILITY[className];
        if (!spellAttr) return 0;
        
        const attrMod = this.calculateDndModifier(this.getDndAttrValue(charData, spellAttr));
        const profBonus = this.calculateDndProficiencyBonus(charData);
        
        return 8 + attrMod + profBonus;
    },
    
    // Calculate D&D Spell Attack Bonus
    calculateDndSpellAttack(charData) {
        const className = (charData.dndClass || '').toLowerCase();
        const spellAttr = this.DND_SPELLCASTING_ABILITY[className];
        if (!spellAttr) return 0;
        
        const attrMod = this.calculateDndModifier(this.getDndAttrValue(charData, spellAttr));
        const profBonus = this.calculateDndProficiencyBonus(charData);
        
        return attrMod + profBonus;
    },
    
    // Get D&D Spell Slots for character level (full caster)
    getDndSpellSlots(charData) {
        const level = Math.min(20, Math.max(1, parseInt(charData.charLevel) || 1));
        return this.DND_SPELL_SLOTS_FULL[level] || [0,0,0,0,0,0,0,0,0];
    },
    
    // Calculate D&D Carrying Capacity (STR × 15 lbs)
    calculateDndCarryingCapacity(charData) {
        const str = parseInt(charData.dndStr) || 10;
        return str * 15;
    },
    
    // Update all D&D calculations
    updateDndCalculations(charData) {
        return {
            maxHp: this.calculateDndMaxHP(charData),
            proficiencyBonus: this.calculateDndProficiencyBonus(charData),
            armorClass: this.calculateDndAC(charData),
            initiative: this.calculateDndInitiative(charData),
            passivePerception: this.calculateDndPassivePerception(charData),
            spellDC: this.calculateDndSpellDC(charData),
            spellAttack: this.calculateDndSpellAttack(charData),
            spellSlots: this.getDndSpellSlots(charData),
            carryingCapacity: this.calculateDndCarryingCapacity(charData),
            strMod: this.calculateDndModifier(charData.dndStr),
            dexMod: this.calculateDndModifier(charData.dndDex),
            conMod: this.calculateDndModifier(charData.dndCon),
            intMod: this.calculateDndModifier(charData.dndInt),
            wisMod: this.calculateDndModifier(charData.dndWis),
            chaMod: this.calculateDndModifier(charData.dndCha)
        };
    },
    
    // ========== Realms&Scripts RULES ===========
    // Skill definitions with attribute mappings
    // armorPenalty = true significa que tem penalidade de carga (armadura média -2, pesada -5)
    SKILLS: [
        { id: 'acrobacia', name: 'Acrobacia', attr: 'AGI', armorPenalty: true },
        { id: 'adestramento', name: 'Adestramento', attr: 'CAR', armorPenalty: false },
        { id: 'artes', name: 'Artes', attr: 'VON', armorPenalty: false },
        { id: 'atletismo', name: 'Atletismo', attr: 'FOR', armorPenalty: false },
        { id: 'atualidades', name: 'Atualidades', attr: 'INT', armorPenalty: false },
        { id: 'ciencias', name: 'Ciências', attr: 'INT', armorPenalty: false },
        { id: 'crime', name: 'Crime', attr: 'AGI', armorPenalty: true },
        { id: 'diplomacia', name: 'Diplomacia', attr: 'CAR', armorPenalty: false },
        { id: 'enganacao', name: 'Enganação', attr: 'CAR', armorPenalty: false },
        { id: 'fortitude', name: 'Fortitude', attr: 'CON', armorPenalty: false },
        { id: 'furtividade', name: 'Furtividade', attr: 'AGI', armorPenalty: true },
        { id: 'iniciativa', name: 'Iniciativa', attr: 'AGI', armorPenalty: false },
        { id: 'intimidacao', name: 'Intimidação', attr: 'CAR', armorPenalty: false },
        { id: 'intuicao', name: 'Intuição', attr: 'VON', armorPenalty: false },
        { id: 'investigacao', name: 'Investigação', attr: 'INT', armorPenalty: false },
        { id: 'luta', name: 'Luta', attr: 'FOR', armorPenalty: false },
        { id: 'medicina', name: 'Medicina', attr: 'INT', armorPenalty: false },
        { id: 'programacao', name: 'Programação', attr: 'INT', armorPenalty: false },
        { id: 'percepcao', name: 'Percepção', attr: 'VON', armorPenalty: false },
        { id: 'pilotagem', name: 'Pilotagem', attr: 'AGI', armorPenalty: false },
        { id: 'pontaria', name: 'Pontaria', attr: 'AGI', armorPenalty: false },
        { id: 'profissao', name: 'Profissão', attr: 'INT', armorPenalty: false },
        { id: 'reflexos', name: 'Reflexos', attr: 'AGI', armorPenalty: false },
        { id: 'religiao', name: 'Religião', attr: 'VON', armorPenalty: false },
        { id: 'sentir', name: 'Sentir', attr: 'VON', armorPenalty: false },
        { id: 'sobrevivencia', name: 'Sobrevivência', attr: 'INT', armorPenalty: false },
        { id: 'tatica', name: 'Tática', attr: 'INT', armorPenalty: false },
        { id: 'tecnologia', name: 'Tecnologia', attr: 'INT', armorPenalty: false }
    ],

    // Training levels
    TRAINING_LEVELS: {
        0: { name: 'Sem Treino', bonus: 0, cost: 0 },
        1: { name: 'Treinada', bonus: 1, cost: 1 },
        2: { name: 'Veterana', bonus: 3, cost: 3 },
        3: { name: 'Expert', bonus: 5, cost: 5 }
    },

    // Armor bonuses and penalties
    ARMOR_BONUS: {
        'none': { ca: 0, weight: 0, skillPenalty: 0, paPenalty: 0 },
        'light': { ca: 3, weight: 3, skillPenalty: 0, paPenalty: 0 },
        'medium': { ca: 5, weight: 5, skillPenalty: -2, paPenalty: -1 },
        'heavy': { ca: 7, weight: 7, skillPenalty: -5, paPenalty: -3 }
    },

    // Race bonuses info
    RACE_BONUSES: {
        'humano': {
            name: 'Humano',
            attrs: 'Sem bônus (0 em todos)',
            special: '+2 Perícias Extras (qualquer)',
            skills: 'Coringas (escolhe 2 de qualquer)',
            description: 'Versatilidade: capacidade de se especializar em qualquer área'
        },
        'elfo': {
            name: 'Elfo',
            attrs: 'FOR-1, CON-1, INT+1, VON+2, DES+2',
            special: 'Olhos Fundidos desde nascimento',
            skills: 'Herbalismo, Primeiros Socorros, Concentração',
            description: 'Capacidade de manipular javatons mais facilmente pelas orelhas alongadas'
        },
        'anao': {
            name: 'Anão',
            attrs: 'FOR+2, CON+1, DES-1, CAR-2',
            special: 'Músculos dos Braços Fundidos desde nascimento',
            skills: 'Engenharia, Mineração, Intimidação',
            description: 'Força sobre-humana nos braços, afinidade com engenharia'
        },
        'demonio': {
            name: 'Demônio',
            attrs: 'FOR+1, CON+1, VON+1, CAR-1',
            special: 'Fusão temporária de pernas (1x/dia)',
            skills: 'Escolhe 1: Sobrevivência, Cultura ou Percepção',
            description: 'Pode fundir javatons às pernas temporariamente para fuga rápida ou ataque poderoso'
        }
    },

    // Get attribute value by name
    getAttrValue(charData, attrName) {
        const attrMap = {
            'FOR': charData.attrFor || 0,
            'CON': charData.attrCon || 0,
            'VON': charData.attrVon || 0,
            'CAR': charData.attrCar || 0,
            'INT': charData.attrInt || 0,
            'AGI': charData.attrAgi || 0
        };
        return parseInt(attrMap[attrName]) || 0;
    },

    // Calculate max HP: (heartLevel × 20) + (level × CON)
    calculateMaxHP(charData) {
        const heartLevel = parseFloat(charData.fusionHeart) || 1;
        const level = parseInt(charData.charLevel) || 1;
        const con = parseInt(charData.attrCon) || 0;
        return Math.floor((heartLevel * 20) + (level * con));
    },

    // Calculate max PE: (brainLevel × 6) + (level × VON)
    calculateMaxPE(charData) {
        const brainLevel = parseFloat(charData.fusionBrain) || 1;
        const level = parseInt(charData.charLevel) || 1;
        const von = parseInt(charData.attrVon) || 0;
        return Math.floor((brainLevel * 6) + (level * von));
    },

    // Calculate PA: AGI + Level + 4 - armor penalty - weight penalty (min 1)
    calculatePA(charData) {
        const agi = parseInt(charData.attrAgi) || 0;
        const level = parseInt(charData.charLevel) || 1;
        const armorPenalty = this.ARMOR_BONUS[charData.armorType || 'none'].paPenalty;
        
        // Weight penalty
        let weightPenalty = 0;
        const weightStatus = this.getWeightStatus(charData);
        if (weightStatus === 'overweight') {
            weightPenalty = -5;
        } else if (weightStatus === 'heavy') {
            weightPenalty = -2;
        }
        
        const pa = agi + level + 4 + armorPenalty + weightPenalty;
        return Math.max(1, pa); // Minimum PA is 1
    },

    // Calculate CA: 10 + armor bonus
    calculateCA(charData) {
        const armorBonus = this.ARMOR_BONUS[charData.armorType || 'none'].ca;
        return 10 + armorBonus;
    },

    // Calculate Dodge: CA + Reflexos skill
    calculateDodge(charData) {
        const ca = this.calculateCA(charData);
        const reflexosTotal = this.calculateSkillTotal(charData, 'reflexos');
        return ca + reflexosTotal;
    },

    // Calculate Initiative bonus
    calculateInitiative(charData) {
        return this.calculateSkillTotal(charData, 'iniciativa');
    },

    // Calculate max weight capacity: ((CON + FOR) × 2) + 12
    calculateMaxWeight(charData) {
        const con = parseInt(charData.attrCon) || 0;
        const forr = parseInt(charData.attrFor) || 0;
        return ((con + forr) * 2) + 12;
    },

    // Calculate heavy weight threshold (1.5x max)
    calculateHeavyWeight(charData) {
        return Math.floor(this.calculateMaxWeight(charData) * 1.5);
    },

    // Calculate current weight from inventory
    calculateCurrentWeight(charData) {
        let weight = 0;
        
        // Armor weight
        weight += this.ARMOR_BONUS[charData.armorType || 'none'].weight;
        
        // Inventory items weight
        if (charData.inventory && Array.isArray(charData.inventory)) {
            charData.inventory.forEach(item => {
                weight += parseFloat(item.weight) || 0;
            });
        }
        
        return Math.round(weight * 100) / 100;
    },

    // Get weight status
    getWeightStatus(charData) {
        const current = this.calculateCurrentWeight(charData);
        const max = this.calculateMaxWeight(charData);
        const heavy = this.calculateHeavyWeight(charData);
        
        if (current > heavy) return 'overweight';
        if (current > max) return 'heavy';
        return 'normal';
    },

    // Calculate skill total
    calculateSkillTotal(charData, skillId) {
        const skill = this.SKILLS.find(s => s.id === skillId);
        if (!skill) return 0;

        // Base attribute value
        let total = this.getAttrValue(charData, skill.attr);

        // Training bonus
        const trainingLevel = (charData.skills && charData.skills[skillId]) || 0;
        total += this.TRAINING_LEVELS[trainingLevel].bonus;

        // Armor penalty for skills with armorPenalty flag
        if (skill.armorPenalty) {
            const armorType = charData.armorType || 'none';
            total += this.ARMOR_BONUS[armorType].skillPenalty;
        }

        // Muscle bonuses
        if (skillId === 'luta') {
            total += parseInt(charData.fusionMuscleArms) || 0;
        } else if (skillId === 'percepcao') {
            total += parseInt(charData.fusionMuscleHead) || 0;
        } else if (skillId === 'pontaria') {
            total += parseInt(charData.fusionMuscleBack) || 0;
        } else if (skillId === 'atletismo') {
            total += parseInt(charData.fusionMuscleChest) || 0;
        } else if (skillId === 'acrobacia') {
            total += parseInt(charData.fusionMuscleLegs) || 0;
        }

        return total;
    },

    // Calculate damage reduction from defending (arms bones)
    calculateDefendReduction(charData) {
        return parseInt(charData.fusionBoneArms) || 0;
    },

    // Calculate general damage reduction (average of other bones)
    calculateDamageReduction(charData) {
        const head = parseInt(charData.fusionBoneHead) || 0;
        const back = parseInt(charData.fusionBoneBack) || 0;
        const chest = parseInt(charData.fusionBoneChest) || 0;
        const legs = parseInt(charData.fusionBoneLegs) || 0;
        return Math.floor((head + back + chest + legs) / 4);
    },

    // Calculate fall damage reduction (legs bones)
    calculateFallReduction(charData) {
        return parseInt(charData.fusionBoneLegs) || 0;
    },

    // Calculate PN per level (sanity / 5)
    calculatePNPerLevel(charData) {
        const sanity = parseInt(charData.sanity) || 20;
        return Math.floor(sanity / 5);
    },

    // Calculate used attribute points
    calculateUsedAttrPoints(charData) {
        return (
            Math.abs(parseInt(charData.attrFor) || 0) +
            Math.abs(parseInt(charData.attrCon) || 0) +
            Math.abs(parseInt(charData.attrVon) || 0) +
            Math.abs(parseInt(charData.attrCar) || 0) +
            Math.abs(parseInt(charData.attrInt) || 0) +
            Math.abs(parseInt(charData.attrAgi) || 0)
        );
    },

    // Get all trained skills (level > 0)
    getTrainedSkills(charData) {
        const trained = [];
        
        this.SKILLS.forEach(skill => {
            const level = (charData.skills && charData.skills[skill.id]) || 0;
            if (level > 0) {
                trained.push({
                    ...skill,
                    level,
                    total: this.calculateSkillTotal(charData, skill.id)
                });
            }
        });
        
        return trained.sort((a, b) => b.total - a.total);
    },

    // Get all proficient D&D skills
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

    // Update all calculated fields
    updateAllCalculations(charData) {
        return {
            maxHp: this.calculateMaxHP(charData),
            maxPE: this.calculateMaxPE(charData),
            pa: this.calculatePA(charData),
            ca: this.calculateCA(charData),
            dodge: this.calculateDodge(charData),
            initiative: this.calculateInitiative(charData),
            maxWeight: this.calculateMaxWeight(charData),
            heavyWeight: this.calculateHeavyWeight(charData),
            currentWeight: this.calculateCurrentWeight(charData),
            weightStatus: this.getWeightStatus(charData),
            reduceDefend: this.calculateDefendReduction(charData),
            reduceDamage: this.calculateDamageReduction(charData),
            reduceFall: this.calculateFallReduction(charData),
            usedAttrPoints: this.calculateUsedAttrPoints(charData),
            pnPerLevel: this.calculatePNPerLevel(charData)
        };
    }
};
