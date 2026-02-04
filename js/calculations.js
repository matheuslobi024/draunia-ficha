// ========== CALCULATIONS MODULE ==========

const Calculations = {
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
        'none': { ca: 0, weight: 0, skillPenalty: 0 },
        'light': { ca: 3, weight: 3, skillPenalty: 0 },
        'medium': { ca: 5, weight: 5, skillPenalty: -2 },
        'heavy': { ca: 7, weight: 7, skillPenalty: -5 }
    },

    // Race bonuses info
    RACE_BONUSES: {
        'humano': '+2 Perícias Treinadas Extras',
        'elfo': 'Olhos Fundidos',
        'anao': '+1 Músculo de Braços',
        'demonio': '+1 Músculo de Pernas'
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

    // Calculate PA: AGI + Level + 4
    calculatePA(charData) {
        const agi = parseInt(charData.attrAgi) || 0;
        const level = parseInt(charData.charLevel) || 1;
        return agi + level + 4;
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
