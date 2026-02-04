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

    // Get default character data
    getDefaultCharacterData() {
        return {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            
            // Basic Info
            charName: 'Novo Personagem',
            charRace: '',
            charLevel: 1,
            levelPoints: 0,
            portrait: '',
            
            // Attributes
            attrFor: 0,
            attrCon: 0,
            attrVon: 0,
            attrCar: 0,
            attrInt: 0,
            attrAgi: 0,
            
            // Combat
            currentHp: 20,
            currentPE: 6,
            sanity: 20,
            
            // Fusions - Organs
            fusionBrain: '1',
            fusionHeart: '1',
            fusionEyes: 'normal',
            
            // Fusions - Bones
            fusionBoneArms: '0',
            fusionBoneHead: '0',
            fusionBoneBack: '0',
            fusionBoneChest: '0',
            fusionBoneLegs: '0',
            
            // Fusions - Muscles
            fusionMuscleArms: '0',
            fusionMuscleHead: '0',
            fusionMuscleBack: '0',
            fusionMuscleChest: '0',
            fusionMuscleLegs: '0',
            
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
    }
};
