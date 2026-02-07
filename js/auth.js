// ========== AUTH MODULE - FIREBASE ==========
// Wrapper para autenticação Firebase

const Auth = {
    // Initialize auth
    async init() {
        await API.init();
        return true; // Firebase is always "available"
    },

    // Register new user
    async register(name, email, password) {
        try {
            const user = await API.register(name, email, password);
            return { success: true, message: 'Conta criada com sucesso!', user };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // Login
    async login(email, password) {
        try {
            const user = await API.login(email, password);
            return { success: true, user };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // Logout
    logout() {
        API.logout();
    },

    // Get current user
    getCurrentUser() {
        return API.getUser();
    },

    // Check if logged in
    isLoggedIn() {
        return API.isLoggedIn();
    },

    // Get characters for current user
    async getCharacters() {
        try {
            return await API.getCharacters();
        } catch (error) {
            console.error('Erro ao carregar personagens:', error);
            return [];
        }
    },

    // Get single character
    async getCharacter(charId) {
        try {
            return await API.getCharacter(charId);
        } catch (error) {
            console.error('Erro ao carregar personagem:', error);
            return null;
        }
    },

    // Save character
    async saveCharacter(charId, characterData) {
        try {
            await API.saveCharacter(charId, characterData);
            return true;
        } catch (error) {
            console.error('Erro ao salvar personagem:', error);
            return false;
        }
    },

    // Delete character
    async deleteCharacter(characterId) {
        try {
            await API.deleteCharacter(characterId);
            return true;
        } catch (error) {
            console.error('Erro ao deletar personagem:', error);
            return false;
        }
    },

    // Create new character
    async createNewCharacter() {
        try {
            return await API.createCharacter();
        } catch (error) {
            console.error('Erro ao criar personagem:', error);
            return null;
        }
    },

    // Get default character data based on system
    getDefaultCharacterData(systemId = 'realsscripts') {
        const baseData = {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            system: systemId,
            
            // Basic Info
            charName: 'Novo Personagem',
            charRace: '',
            charLevel: 1,
            levelPoints: 0,
            portrait: '',
            
            // Equipment
            armorType: 'none',
            gold: 0,
            inventory: [],
            
            // Skills
            skills: {},
            
            // Attacks
            attacks: [],
            
            // Abilities
            abilities: '',
            
            // Appearance
            age: '',
            height: '',
            charWeight: '',
            eyes: '',
            skin: '',
            hair: '',
            appearanceDesc: '',
            
            // Personality
            personalityTraits: '',
            ideals: '',
            bonds: '',
            flaws: '',
            
            // History
            backstory: '',
            notes: '',
            quickNotes: ''
        };
        
        // Get system config
        const system = SystemManager.getSystem(systemId);
        const config = system.config || {};
        
        // Add system-specific defaults
        if (config.attrType === 'realsscripts' || systemId === 'realsscripts') {
            // Realms&Scripts attributes
            baseData.attrFor = 0;
            baseData.attrCon = 0;
            baseData.attrVon = 0;
            baseData.attrCar = 0;
            baseData.attrInt = 0;
            baseData.attrAgi = 0;
            
            // Default HP/PE/Sanity for Realms&Scripts
            baseData.currentHp = 20;
            baseData.currentPE = 6;
            baseData.sanity = 20;
            
            // Fusions - Organs
            baseData.fusionBrain = '1';
            baseData.fusionHeart = '1';
            baseData.fusionEyes = 'normal';
            
            // Fusions - Bones
            baseData.fusionBoneArms = '0';
            baseData.fusionBoneHead = '0';
            baseData.fusionBoneBack = '0';
            baseData.fusionBoneChest = '0';
            baseData.fusionBoneLegs = '0';
            
            // Fusions - Muscles
            baseData.fusionMuscleArms = '0';
            baseData.fusionMuscleHead = '0';
            baseData.fusionMuscleBack = '0';
            baseData.fusionMuscleChest = '0';
            baseData.fusionMuscleLegs = '0';
        } else if (config.attrType === 'dnd' || systemId === 'dnd5e') {
            // D&D attributes (base 10)
            baseData.dndStr = 10;
            baseData.dndDex = 10;
            baseData.dndCon = 10;
            baseData.dndInt = 10;
            baseData.dndWis = 10;
            baseData.dndCha = 10;
            
            // D&D class
            baseData.dndClass = '';
            
            // D&D HP/Sanity
            baseData.dndCurrentHp = 10;
            baseData.dndSanity = 50;
            
            // Spell slots
            baseData.dndSlot1 = 0;
            baseData.dndSlot2 = 0;
            baseData.dndSlot3 = 0;
            baseData.dndSlot4 = 0;
            baseData.dndSlot5 = 0;
            
            // Skill proficiencies
            baseData.dndSkillProficiencies = {};
        }
        
        return baseData;
    }
};
