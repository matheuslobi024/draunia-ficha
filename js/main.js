// ========================================
// REALMS&SCRIPTS - MAIN APPLICATION
// ========================================

// ========== SYSTEM DATA ==========
const RealmsScripts = {
    races: {
        humano: {
            name: 'Humano',
            fusion: 'Nenhuma fusão inata',
            special: '+2 Perícias Extras',
            description: 'Versátil e adaptável'
        },
        elfo: {
            name: 'Elfo',
            fusion: 'Olhos Fundidos',
            special: 'Usa Funções com Id de objeto',
            description: 'Afinidade com javacons'
        },
        anao: {
            name: 'Anão',
            fusion: 'Músculos dos Braços Fundidos',
            special: 'Força sobre-humana nos braços',
            description: 'Mestres da forja'
        },
        demonio: {
            name: 'Demônio',
            fusion: 'Fusão temporária nas pernas (1x/dia)',
            special: 'Fuga rápida ou ataque poderoso',
            description: 'Chifres místicos'
        }
    },
    
    skills: [
        { id: 'acrobacia', name: 'Acrobacia', attr: 'AGI', armorPenalty: true },
        { id: 'adestramento', name: 'Adestramento', attr: 'CAR' },
        { id: 'artes', name: 'Artes', attr: 'VON' },
        { id: 'atletismo', name: 'Atletismo', attr: 'FOR' },
        { id: 'atualidades', name: 'Atualidades', attr: 'INT' },
        { id: 'ciencias', name: 'Ciências', attr: 'INT' },
        { id: 'crime', name: 'Crime', attr: 'AGI', armorPenalty: true },
        { id: 'diplomacia', name: 'Diplomacia', attr: 'CAR' },
        { id: 'enganacao', name: 'Enganação', attr: 'CAR' },
        { id: 'fortitude', name: 'Fortitude', attr: 'CON' },
        { id: 'furtividade', name: 'Furtividade', attr: 'AGI', armorPenalty: true },
        { id: 'iniciativa', name: 'Iniciativa', attr: 'AGI' },
        { id: 'intimidacao', name: 'Intimidação', attr: 'CAR' },
        { id: 'intuicao', name: 'Intuição', attr: 'VON' },
        { id: 'investigacao', name: 'Investigação', attr: 'INT' },
        { id: 'luta', name: 'Luta', attr: 'FOR' },
        { id: 'medicina', name: 'Medicina', attr: 'INT' },
        { id: 'percepcao', name: 'Percepção', attr: 'VON' },
        { id: 'pilotagem', name: 'Pilotagem', attr: 'AGI' },
        { id: 'pontaria', name: 'Pontaria', attr: 'AGI' },
        { id: 'profissao', name: 'Profissão', attr: 'INT' },
        { id: 'programacao', name: 'Programação', attr: 'INT' },
        { id: 'reflexos', name: 'Reflexos', attr: 'AGI' },
        { id: 'religiao', name: 'Religião', attr: 'VON' },
        { id: 'sentir', name: 'Sentir', attr: 'VON' },
        { id: 'sobrevivencia', name: 'Sobrevivência', attr: 'INT' },
        { id: 'tatica', name: 'Tática', attr: 'INT' },
        { id: 'tecnologia', name: 'Tecnologia', attr: 'INT' }
    ],
    
    trainingLevels: {
        0: { name: 'Sem Treino', bonus: 0 },
        1: { name: 'Treinada', bonus: 1 },
        2: { name: 'Veterana', bonus: 3 },
        3: { name: 'Expert', bonus: 5 }
    },
    
    armorBonus: {
        none: { ca: 0, weight: 0, skillPenalty: 0, paPenalty: 0 },
        light: { ca: 3, weight: 3, skillPenalty: 0, paPenalty: 0 },
        medium: { ca: 5, weight: 5, skillPenalty: -2, paPenalty: -1 },
        heavy: { ca: 7, weight: 7, skillPenalty: -5, paPenalty: -3 }
    }
};

// ========== MAIN APP ==========
const App = {
    currentUser: null,
    currentCharId: null,
    charData: null,
    saveTimeout: null,
    isInitialized: false,
    diceRollsEnabled: true,
    
    // Initialize App
    async init() {
        console.log('🚀 Initializing App...');
        
        // Load dice roll preference from localStorage
        const savedPref = localStorage.getItem('diceRollsEnabled');
        this.diceRollsEnabled = savedPref === null ? true : savedPref === 'true';
        
        // Setup auth listener
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = {
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || user.email.split('@')[0]
                };
                await this.onUserLoggedIn();
            } else {
                this.currentUser = null;
                this.showAuthModal();
            }
            
            // Hide splash screen
            setTimeout(() => {
                const splash = document.getElementById('splashScreen');
                if (splash) {
                    splash.classList.add('fade-out');
                    setTimeout(() => splash.remove(), 500);
                }
            }, 500);
        });
        
        // Set dice roll toggle state
        const diceToggle = document.getElementById('diceRollToggle');
        if (diceToggle) diceToggle.checked = this.diceRollsEnabled;
        
        this.bindEvents();
        this.generateSkillsList();
        this.isInitialized = true;
    },
    
    toggleDiceRolls(enabled) {
        this.diceRollsEnabled = enabled;
        localStorage.setItem('diceRollsEnabled', enabled);
    },
    
    // ========== AUTH ==========
    showAuthModal() {
        document.getElementById('authModal').classList.remove('hidden');
        document.getElementById('characterModal').classList.add('hidden');
        document.getElementById('mainApp').classList.add('hidden');
    },
    
    async login(email, password) {
        try {
            await auth.signInWithEmailAndPassword(email, password);
            return { success: true };
        } catch (error) {
            return { success: false, message: this.getErrorMessage(error.code) };
        }
    },
    
    async register(name, email, password) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({ displayName: name });
            return { success: true };
        } catch (error) {
            return { success: false, message: this.getErrorMessage(error.code) };
        }
    },
    
    logout() {
        auth.signOut();
        this.currentCharId = null;
        this.charData = null;
    },
    
    getErrorMessage(code) {
        const messages = {
            'auth/email-already-in-use': 'Este email já está em uso',
            'auth/invalid-email': 'Email inválido',
            'auth/weak-password': 'Senha muito fraca (mínimo 6 caracteres)',
            'auth/user-not-found': 'Usuário não encontrado',
            'auth/wrong-password': 'Senha incorreta',
            'auth/invalid-credential': 'Credenciais inválidas'
        };
        return messages[code] || 'Erro na autenticação';
    },
    
    async onUserLoggedIn() {
        document.getElementById('authModal').classList.add('hidden');
        document.getElementById('menuUserName').textContent = this.currentUser.name;
        
        const characters = await this.getCharacters();
        if (characters.length > 0) {
            this.showCharacterModal();
        } else {
            await this.createNewCharacter();
        }
    },
    
    // ========== CHARACTERS ==========
    async getCharacters() {
        const snapshot = await db.collection('users')
            .doc(this.currentUser.uid)
            .collection('characters')
            .orderBy('updatedAt', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    },
    
    async showCharacterModal() {
        document.getElementById('characterModal').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
        
        const characters = await this.getCharacters();
        const list = document.getElementById('characterList');
        
        if (characters.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-slash"></i>
                    <p>Nenhuma ficha encontrada</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = characters.map(char => `
            <div class="character-item" onclick="App.loadCharacter('${char.id}')">
                <div class="char-info">
                    <span class="name">${char.charName || 'Sem Nome'}</span>
                    <span class="details">Nível ${char.charLevel || 1} • ${RealmsScripts.races[char.charRace]?.name || 'Humano'}</span>
                </div>
                <button class="delete-btn" onclick="event.stopPropagation(); App.deleteCharacter('${char.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    },
    
    async createNewCharacter() {
        const charRef = await db.collection('users')
            .doc(this.currentUser.uid)
            .collection('characters')
            .add(this.getDefaultCharData());
        
        await this.loadCharacter(charRef.id);
    },
    
    getDefaultCharData() {
        return {
            // Info
            charName: 'Novo Personagem',
            charLevel: 1,
            charRace: 'humano',
            systemId: 'realsscripts',
            
            // Attributes
            attrFor: 0,
            attrCon: 0,
            attrVon: 0,
            attrCar: 0,
            attrInt: 0,
            attrAgi: 0,
            
            // Resources
            currentHp: 20,
            currentPe: 6,
            sanity: 20,
            currentPa: 5,
            
            // Fusions (new dropdown format)
            fusionHeart: 'vermelho',
            fusionBrain: 'vermelho',
            fusionEyes: 'nao',
            // Muscles (by body part)
            fusionMuscleArms: 'vermelho',
            fusionMuscleHead: 'vermelho',
            fusionMuscleBack: 'vermelho',
            fusionMuscleChest: 'vermelho',
            fusionMuscleLegs: 'vermelho',
            // Bones (by body part)
            fusionBoneArms: 'comeco',
            fusionBoneHead: 'comeco',
            fusionBoneBack: 'comeco',
            fusionBoneChest: 'comeco',
            fusionBoneLegs: 'comeco',
            
            // Combat
            armorType: 'none',
            attacks: [],
            
            // Skills
            skills: {},
            
            // Inventory
            inventory: [],
            money: 0,
            
            // Notes
            charHistory: '',
            charNotes: '',
            charAbilities: '',
            
            // Meta
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
    },
    
    async loadCharacter(charId) {
        const doc = await db.collection('users')
            .doc(this.currentUser.uid)
            .collection('characters')
            .doc(charId)
            .get();
        
        if (!doc.exists) {
            alert('Personagem não encontrado');
            return;
        }
        
        this.currentCharId = charId;
        this.charData = { id: charId, ...doc.data() };
        
        document.getElementById('characterModal').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        
        this.populateSheet();
        this.updateCalculations();
    },
    
    async deleteCharacter(charId) {
        if (!confirm('Tem certeza que deseja deletar esta ficha?')) return;
        
        await db.collection('users')
            .doc(this.currentUser.uid)
            .collection('characters')
            .doc(charId)
            .delete();
        
        if (this.currentCharId === charId) {
            this.currentCharId = null;
            this.charData = null;
        }
        
        this.showCharacterModal();
    },
    
    async deleteCurrentCharacter() {
        if (!this.currentCharId) return;
        await this.deleteCharacter(this.currentCharId);
        this.closeSideMenu();
    },
    
    // ========== DATA BINDING ==========
    populateSheet() {
        const data = this.charData;
        
        // Header
        document.getElementById('charName').textContent = data.charName || 'Personagem';
        
        // Fill all data-field inputs
        document.querySelectorAll('[data-field]').forEach(el => {
            const field = el.dataset.field;
            if (data[field] !== undefined) {
                if (el.type === 'checkbox') {
                    el.checked = data[field];
                } else {
                    el.value = data[field];
                }
            }
        });
        
        // Race info
        this.updateRaceInfo();
        
        // Skills
        this.updateSkillsDisplay();
        
        // Attacks
        this.renderAttacks();
        
        // Inventory
        this.renderInventory();
        
        // Sync combat resources
        this.syncCombatResources();
        
        // Update fusion effects display
        this.updateFusionEffects();
    },
    
    updateFusionEffects() {
        // Update fusion effect texts if elements exist
        const fusionData = {
            heart: {
                vermelho: 'HP Base: 20',
                rosaEscuro: 'HP Base: 40',
                rosaProfundo: 'HP Base: 60',
                rosaShock: 'HP Base: 80',
                rosaClaro: 'HP Base: 100',
                prata: 'HP Base: 120',
                branco: 'HP Base: 140'
            },
            brain: {
                vermelho: 'PE Base: 6',
                rosaEscuro: 'PE Base: 12',
                rosaProfundo: 'PE Base: 18',
                rosaShock: 'PE Base: 24',
                rosaClaro: 'PE Base: 30',
                prata: 'PE Base: 36',
                branco: 'PE Base: 42'
            },
            eyes: {
                nao: 'Sem bônus',
                fundido: '+5 em Investigação e Percepção'
            }
        };
        
        // Update effect displays if they exist
        const heartEffect = document.getElementById('heartEffect');
        const brainEffect = document.getElementById('brainEffect');
        const eyesEffect = document.getElementById('eyesEffect');
        
        if (heartEffect && this.charData.fusionHeart) {
            heartEffect.textContent = fusionData.heart[this.charData.fusionHeart] || '';
        }
        if (brainEffect && this.charData.fusionBrain) {
            brainEffect.textContent = fusionData.brain[this.charData.fusionBrain] || '';
        }
        if (eyesEffect && this.charData.fusionEyes) {
            eyesEffect.textContent = fusionData.eyes[this.charData.fusionEyes] || '';
        }
    },
    
    // ========== SAVING ==========
    scheduleAutoSave() {
        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        
        const indicator = document.getElementById('saveIndicator');
        indicator.classList.add('saving');
        
        this.saveTimeout = setTimeout(() => this.saveCharacter(), 1500);
    },
    
    async saveCharacter() {
        if (!this.currentCharId || !this.charData) return;
        
        try {
            this.charData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            
            await db.collection('users')
                .doc(this.currentUser.uid)
                .collection('characters')
                .doc(this.currentCharId)
                .set(this.charData, { merge: true });
            
            const indicator = document.getElementById('saveIndicator');
            indicator.classList.remove('saving');
            
            console.log('✅ Saved');
        } catch (error) {
            console.error('Save error:', error);
        }
    },
    
    // ========== CALCULATIONS ==========
    getFusionMultiplier(fusionType, value) {
        // Convert fusion dropdown values to numeric multipliers
        const multipliers = {
            heart: { vermelho: 1, rosaEscuro: 2, rosaProfundo: 3, rosaShock: 4, rosaClaro: 5, prata: 6, branco: 7 },
            brain: { vermelho: 1, rosaEscuro: 2, rosaProfundo: 3, rosaShock: 4, rosaClaro: 5, prata: 6, branco: 7 },
            muscle: { vermelho: 0, rosaProfundo: 2, rosaClaro: 4, prata: 6, branco: 8 },
            bone: { comeco: 0, transiente: 1, mesclado: 2, integrado: 3, fundido: 4 },
            eyes: { nao: 0, fundido: 5 }
        };
        return multipliers[fusionType]?.[value] || (fusionType === 'heart' || fusionType === 'brain' ? 1 : 0);
    },
    
    updateCalculations() {
        const data = this.charData;
        
        // Get fusion multipliers
        const heartLevel = this.getFusionMultiplier('heart', data.fusionHeart);
        const brainLevel = this.getFusionMultiplier('brain', data.fusionBrain);
        
        // Max HP: (heartLevel × 20) + (level × CON)
        const maxHp = Math.floor(heartLevel * 20 + (parseInt(data.charLevel) || 1) * (parseInt(data.attrCon) || 0));
        document.getElementById('maxHp').textContent = maxHp;
        
        // Max PE: (brainLevel × 6) + (level × VON)
        const maxPe = Math.floor(brainLevel * 6 + (parseInt(data.charLevel) || 1) * (parseInt(data.attrVon) || 0));
        document.getElementById('maxPe').textContent = maxPe;
        
        // PA: AGI + Level + 4 - penalties
        const armor = RealmsScripts.armorBonus[data.armorType || 'none'];
        const maxPa = Math.max(1, (parseInt(data.attrAgi) || 0) + (parseInt(data.charLevel) || 1) + 4 + armor.paPenalty);
        document.getElementById('maxPa').textContent = maxPa;
        
        // CA: 10 + armor
        const ca = 10 + armor.ca;
        document.getElementById('combatCA').textContent = ca;
        
        // Esquiva: CA + Reflexos
        const reflexosTotal = this.calculateSkillTotal('reflexos');
        const dodge = ca + reflexosTotal;
        document.getElementById('combatDodge').textContent = dodge;
        
        // Iniciativa
        const initiative = this.calculateSkillTotal('iniciativa');
        document.getElementById('combatInit').textContent = initiative >= 0 ? `+${initiative}` : initiative;
        
        // Update bars
        this.updateResourceBars(maxHp, maxPe);
        
        // Update quick stats
        document.getElementById('quickHp').textContent = `${data.currentHp || 0}/${maxHp}`;
        document.getElementById('quickPe').textContent = `${data.currentPe || 0}/${maxPe}`;
        document.getElementById('quickSan').textContent = data.sanity || 0;
        document.getElementById('quickPa').textContent = `${data.currentPa || 0}/${maxPa}`;
        
        // Update combat max values
        const combatMaxHp = document.getElementById('combatMaxHp');
        const combatMaxPe = document.getElementById('combatMaxPe');
        const combatMaxPa = document.getElementById('combatMaxPa');
        if (combatMaxHp) combatMaxHp.textContent = maxHp;
        if (combatMaxPe) combatMaxPe.textContent = maxPe;
        if (combatMaxPa) combatMaxPa.textContent = maxPa;
        
        // Update used attr points (sum of all, negative values give points back)
        const usedPoints = (parseInt(data.attrFor) || 0) +
                          (parseInt(data.attrCon) || 0) +
                          (parseInt(data.attrVon) || 0) +
                          (parseInt(data.attrCar) || 0) +
                          (parseInt(data.attrInt) || 0) +
                          (parseInt(data.attrAgi) || 0);
        document.getElementById('usedAttrPoints').textContent = usedPoints;
        
        // Update combat skills display
        document.getElementById('skillLuta').textContent = this.formatBonus(this.calculateSkillTotal('luta'));
        document.getElementById('skillPontaria').textContent = this.formatBonus(this.calculateSkillTotal('pontaria'));
        document.getElementById('skillReflexos').textContent = this.formatBonus(reflexosTotal);
        document.getElementById('skillIniciativa').textContent = this.formatBonus(initiative);
        
        // Fusions summary - calculate from individual body parts
        const boneArms = this.getFusionMultiplier('bone', data.fusionBoneArms);
        const boneHead = this.getFusionMultiplier('bone', data.fusionBoneHead);
        const boneBack = this.getFusionMultiplier('bone', data.fusionBoneBack);
        const boneChest = this.getFusionMultiplier('bone', data.fusionBoneChest);
        const boneLegs = this.getFusionMultiplier('bone', data.fusionBoneLegs);
        
        document.getElementById('defendReduction').textContent = boneArms;
        const avgBoneReduction = Math.floor((boneArms + boneHead + boneBack + boneChest + boneLegs) / 5);
        document.getElementById('damageReduction').textContent = avgBoneReduction;
        document.getElementById('fallReduction').textContent = boneLegs;
        
        // Weight
        this.updateWeight();
        
        // Update all skills
        this.updateSkillsDisplay();
        
        // Update fusion effects
        this.updateFusionEffects();
        
        // Sync combat resources
        this.syncCombatResources();
    },
    
    formatBonus(value) {
        return value >= 0 ? `+${value}` : `${value}`;
    },
    
    updateResourceBars(maxHp, maxPe) {
        const data = this.charData;
        
        const hpPercent = Math.min(100, Math.max(0, ((data.currentHp || 0) / maxHp) * 100));
        document.getElementById('hpBar').style.width = `${hpPercent}%`;
        
        const pePercent = Math.min(100, Math.max(0, ((data.currentPe || 0) / maxPe) * 100));
        document.getElementById('peBar').style.width = `${pePercent}%`;
    },
    
    calculateSkillTotal(skillId) {
        const data = this.charData;
        const skill = RealmsScripts.skills.find(s => s.id === skillId);
        if (!skill) return 0;
        
        // Base attribute
        const attrMap = { FOR: 'attrFor', CON: 'attrCon', VON: 'attrVon', CAR: 'attrCar', INT: 'attrInt', AGI: 'attrAgi' };
        let total = parseInt(data[attrMap[skill.attr]]) || 0;
        
        // Training bonus
        const training = (data.skills && data.skills[skillId]) || 0;
        total += RealmsScripts.trainingLevels[training]?.bonus || 0;
        
        // Armor penalty
        if (skill.armorPenalty) {
            const armor = RealmsScripts.armorBonus[data.armorType || 'none'];
            total += armor.skillPenalty;
        }
        
        // Muscle bonuses (using individual body parts)
        // Arms = Luta, Head = Percepção, Back = Pontaria, Chest = Atletismo, Legs = Acrobacia
        if (skillId === 'luta') {
            total += this.getFusionMultiplier('muscle', data.fusionMuscleArms);
        } else if (skillId === 'percepcao') {
            total += this.getFusionMultiplier('muscle', data.fusionMuscleHead);
        } else if (skillId === 'pontaria') {
            total += this.getFusionMultiplier('muscle', data.fusionMuscleBack);
        } else if (skillId === 'atletismo') {
            total += this.getFusionMultiplier('muscle', data.fusionMuscleChest);
        } else if (skillId === 'acrobacia') {
            total += this.getFusionMultiplier('muscle', data.fusionMuscleLegs);
        }
        
        // Eyes bonus
        const eyesBonus = this.getFusionMultiplier('eyes', data.fusionEyes);
        if (skillId === 'percepcao' || skillId === 'investigacao') {
            total += eyesBonus;
        }
        
        return total;
    },
    
    // ========== RESOURCES ==========
    modifyResource(type, amount) {
        const data = this.charData;
        
        if (type === 'hp') {
            const maxHp = parseInt(document.getElementById('maxHp').textContent) || 20;
            data.currentHp = Math.min(maxHp, Math.max(0, (parseInt(data.currentHp) || 0) + amount));
            document.getElementById('currentHp').value = data.currentHp;
        } else if (type === 'pe') {
            const maxPe = parseInt(document.getElementById('maxPe').textContent) || 6;
            data.currentPe = Math.min(maxPe, Math.max(0, (parseInt(data.currentPe) || 0) + amount));
            document.getElementById('currentPe').value = data.currentPe;
        } else if (type === 'san') {
            data.sanity = Math.max(0, (parseInt(data.sanity) || 0) + amount);
            document.getElementById('sanity').value = data.sanity;
        } else if (type === 'pa') {
            const maxPa = parseInt(document.getElementById('maxPa').textContent) || 5;
            data.currentPa = Math.min(maxPa, Math.max(0, (parseInt(data.currentPa) || 0) + amount));
            document.getElementById('currentPa').value = data.currentPa;
        }
        
        this.updateCalculations();
        this.scheduleAutoSave();
    },
    
    resetPa() {
        const maxPa = parseInt(document.getElementById('maxPa').textContent) || 5;
        this.charData.currentPa = maxPa;
        document.getElementById('currentPa').value = maxPa;
        this.updateCalculations();
        this.scheduleAutoSave();
    },
    
    openResourceModal(type) {
        // Could open a quick edit modal - for now just scroll to resources
        this.switchTab('Personagem');
        document.querySelector('.resource-item.' + type)?.scrollIntoView({ behavior: 'smooth' });
    },
    
    // ========== RACE INFO ==========
    updateRaceInfo() {
        const race = RealmsScripts.races[this.charData.charRace];
        const el = document.getElementById('raceInfo');
        if (race) {
            el.innerHTML = `
                <strong>${race.fusion}</strong><br>
                ${race.special}<br>
                <em>${race.description}</em>
            `;
        } else {
            el.innerHTML = '';
        }
    },
    
    // ========== SKILLS ==========
    generateSkillsList() {
        const list = document.getElementById('skillsList');
        list.innerHTML = RealmsScripts.skills.map(skill => `
            <div class="skill-item" data-skill="${skill.id}">
                <div class="skill-info">
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-attr">${skill.attr}</span>
                </div>
                <div class="skill-training">
                    ${[0,1,2,3].map(lvl => `
                        <button class="training-btn ${lvl === 0 ? 'active' : ''}" 
                                data-skill="${skill.id}" 
                                data-level="${lvl}"
                                title="${RealmsScripts.trainingLevels[lvl].name}">
                            ${lvl === 0 ? '○' : lvl === 1 ? '◐' : lvl === 2 ? '◑' : '●'}
                        </button>
                    `).join('')}
                </div>
                <span class="skill-total" id="skill_${skill.id}">+0</span>
                <button class="skill-roll" onclick="App.rollSkill('${skill.id}')">
                    <i class="fas fa-dice-d20"></i>
                </button>
            </div>
        `).join('');
    },
    
    updateSkillsDisplay() {
        RealmsScripts.skills.forEach(skill => {
            const total = this.calculateSkillTotal(skill.id);
            const el = document.getElementById(`skill_${skill.id}`);
            if (el) el.textContent = this.formatBonus(total);
            
            // Update training buttons
            const level = (this.charData.skills && this.charData.skills[skill.id]) || 0;
            document.querySelectorAll(`.training-btn[data-skill="${skill.id}"]`).forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.level) === level);
            });
        });
    },
    
    setSkillTraining(skillId, level) {
        if (!this.charData.skills) this.charData.skills = {};
        this.charData.skills[skillId] = level;
        this.updateSkillsDisplay();
        this.updateCalculations();
        this.scheduleAutoSave();
    },
    
    rollSkill(skillId) {
        if (!this.diceRollsEnabled) return;
        
        const total = this.calculateSkillTotal(skillId);
        const roll = Math.floor(Math.random() * 20) + 1;
        const result = roll + total;
        
        const skill = RealmsScripts.skills.find(s => s.id === skillId);
        this.showDiceResult(result, `${skill?.name || skillId}: 1d20 (${roll}) ${this.formatBonus(total)}`);
    },
    
    // ========== ATTACKS ==========
    addAttack() {
        if (!this.charData.attacks) this.charData.attacks = [];
        this.charData.attacks.push({
            name: 'Novo Ataque',
            bonus: '+0',
            damage: '1d6',
            crit: '2x',
            paCost: 1,
            peCost: 0
        });
        this.renderAttacks();
        this.scheduleAutoSave();
    },
    
    renderAttacks() {
        const list = document.getElementById('attacksList');
        const attacks = this.charData.attacks || [];
        
        if (attacks.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-crosshairs"></i>
                    <p>Nenhum ataque cadastrado</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = attacks.map((atk, i) => {
            const paCost = atk.paCost || 0;
            const peCost = atk.peCost || 0;
            const costText = [];
            if (paCost > 0) costText.push(`${paCost} PA`);
            if (peCost > 0) costText.push(`${peCost} PE`);
            const costDisplay = costText.length > 0 ? `(${costText.join(', ')})` : '';
            
            return `
            <div class="attack-item" data-index="${i}">
                <div class="attack-header">
                    <input type="text" value="${atk.name}" placeholder="Nome" onchange="App.updateAttack(${i}, 'name', this.value)">
                    <button class="delete-attack" onclick="App.deleteAttack(${i})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="attack-stats">
                    <div class="attack-stat">
                        <label>Bônus</label>
                        <input type="text" value="${atk.bonus}" onchange="App.updateAttack(${i}, 'bonus', this.value)">
                    </div>
                    <div class="attack-stat">
                        <label>Dano</label>
                        <input type="text" value="${atk.damage}" onchange="App.updateAttack(${i}, 'damage', this.value)">
                    </div>
                    <div class="attack-stat">
                        <label>Crítico</label>
                        <input type="text" value="${atk.crit}" onchange="App.updateAttack(${i}, 'crit', this.value)">
                    </div>
                </div>
                <div class="attack-stats">
                    <div class="attack-stat">
                        <label>Custo PA</label>
                        <input type="number" value="${paCost}" min="0" onchange="App.updateAttack(${i}, 'paCost', this.value)">
                    </div>
                    <div class="attack-stat">
                        <label>Custo PE</label>
                        <input type="number" value="${peCost}" min="0" onchange="App.updateAttack(${i}, 'peCost', this.value)">
                    </div>
                </div>
                <button class="execute-attack-btn" onclick="App.executeAttack(${i})">
                    <i class="fas fa-dice-d20"></i> Atacar <span class="attack-cost">${costDisplay}</span>
                </button>
            </div>
        `;
        }).join('');
    },
    
    updateAttack(index, field, value) {
        if (this.charData.attacks && this.charData.attacks[index]) {
            if (field === 'paCost' || field === 'peCost') {
                this.charData.attacks[index][field] = parseInt(value) || 0;
            } else {
                this.charData.attacks[index][field] = value;
            }
            this.scheduleAutoSave();
        }
    },
    
    deleteAttack(index) {
        if (this.charData.attacks) {
            this.charData.attacks.splice(index, 1);
            this.renderAttacks();
            this.scheduleAutoSave();
        }
    },
    
    rollAttack(index) {
        const atk = this.charData.attacks[index];
        if (!atk) return;
        
        const bonus = parseInt(atk.bonus) || 0;
        const roll = Math.floor(Math.random() * 20) + 1;
        const result = roll + bonus;
        
        this.showDiceResult(result, `${atk.name}: 1d20 (${roll}) ${this.formatBonus(bonus)}`);
    },
    
    executeAttack(index) {
        const atk = this.charData.attacks[index];
        if (!atk) return;
        
        const paCost = parseInt(atk.paCost) || 0;
        const peCost = parseInt(atk.peCost) || 0;
        const currentPa = parseInt(this.charData.currentPa) || 0;
        const currentPe = parseInt(this.charData.currentPe) || 0;
        
        // Check if enough resources
        if (currentPa < paCost) {
            alert(`PA insuficiente! Necessário: ${paCost}, Atual: ${currentPa}`);
            return;
        }
        if (currentPe < peCost) {
            alert(`PE insuficiente! Necessário: ${peCost}, Atual: ${currentPe}`);
            return;
        }
        
        // Deduct resources
        this.charData.currentPa = currentPa - paCost;
        this.charData.currentPe = currentPe - peCost;
        
        // Update UI
        document.getElementById('currentPa').value = this.charData.currentPa;
        document.getElementById('currentPe').value = this.charData.currentPe;
        this.syncCombatResources();
        this.updateCalculations();
        this.scheduleAutoSave();
        
        // Skip dice roll if disabled
        if (!this.diceRollsEnabled) return;
        
        // Roll the attack
        const bonus = parseInt(atk.bonus) || 0;
        const roll = Math.floor(Math.random() * 20) + 1;
        const result = roll + bonus;
        
        let breakdown = `${atk.name}: 1d20 (${roll}) ${this.formatBonus(bonus)}`;
        if (paCost > 0 || peCost > 0) {
            breakdown += `\n[Gasto: ${paCost > 0 ? paCost + ' PA' : ''}${paCost > 0 && peCost > 0 ? ', ' : ''}${peCost > 0 ? peCost + ' PE' : ''}]`;
        }
        
        this.showDiceResult(result, breakdown);
    },
    
    syncCombatResources() {
        // Sync combat tab inputs with main values
        const combatHp = document.getElementById('combatHp');
        const combatPe = document.getElementById('combatPe');
        const combatSan = document.getElementById('combatSan');
        const combatPa = document.getElementById('combatPa');
        
        if (combatHp) combatHp.value = this.charData.currentHp || 0;
        if (combatPe) combatPe.value = this.charData.currentPe || 0;
        if (combatSan) combatSan.value = this.charData.sanity || 0;
        if (combatPa) combatPa.value = this.charData.currentPa || 0;
        
        // Update combat bars
        const maxHp = parseInt(document.getElementById('maxHp')?.textContent) || 20;
        const maxPe = parseInt(document.getElementById('maxPe')?.textContent) || 6;
        
        const combatHpBar = document.getElementById('combatHpBar');
        const combatPeBar = document.getElementById('combatPeBar');
        
        if (combatHpBar) {
            const hpPercent = Math.min(100, Math.max(0, ((this.charData.currentHp || 0) / maxHp) * 100));
            combatHpBar.style.width = `${hpPercent}%`;
        }
        if (combatPeBar) {
            const pePercent = Math.min(100, Math.max(0, ((this.charData.currentPe || 0) / maxPe) * 100));
            combatPeBar.style.width = `${pePercent}%`;
        }
    },
    
    updateCombatResource(type, value) {
        const val = parseInt(value) || 0;
        
        if (type === 'hp') {
            const maxHp = parseInt(document.getElementById('maxHp').textContent) || 20;
            this.charData.currentHp = Math.min(maxHp, Math.max(0, val));
            document.getElementById('currentHp').value = this.charData.currentHp;
        } else if (type === 'pe') {
            const maxPe = parseInt(document.getElementById('maxPe').textContent) || 6;
            this.charData.currentPe = Math.min(maxPe, Math.max(0, val));
            document.getElementById('currentPe').value = this.charData.currentPe;
        } else if (type === 'san') {
            this.charData.sanity = Math.max(0, val);
            document.getElementById('sanity').value = this.charData.sanity;
        } else if (type === 'pa') {
            const maxPa = parseInt(document.getElementById('maxPa').textContent) || 5;
            this.charData.currentPa = Math.min(maxPa, Math.max(0, val));
            document.getElementById('currentPa').value = this.charData.currentPa;
        }
        
        this.updateCalculations();
        this.scheduleAutoSave();
    },
    
    // ========== INVENTORY ==========
    addItem() {
        if (!this.charData.inventory) this.charData.inventory = [];
        this.charData.inventory.push({
            name: '',
            weight: 0,
            qty: 1
        });
        this.renderInventory();
        this.scheduleAutoSave();
    },
    
    renderInventory() {
        const list = document.getElementById('inventoryList');
        const items = this.charData.inventory || [];
        
        if (items.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <p>Inventário vazio</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = items.map((item, i) => `
            <div class="inventory-item" data-index="${i}">
                <input type="text" class="item-name" value="${item.name}" placeholder="Nome do item" onchange="App.updateItem(${i}, 'name', this.value)">
                <input type="number" class="item-weight" value="${item.weight}" placeholder="Peso" step="0.1" min="0" onchange="App.updateItem(${i}, 'weight', this.value)">
                <input type="number" class="item-qty" value="${item.qty}" placeholder="Qtd" min="1" onchange="App.updateItem(${i}, 'qty', this.value)">
                <button class="delete-item" onclick="App.deleteItem(${i})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    },
    
    updateItem(index, field, value) {
        if (this.charData.inventory && this.charData.inventory[index]) {
            this.charData.inventory[index][field] = field === 'name' ? value : parseFloat(value) || 0;
            this.updateWeight();
            this.scheduleAutoSave();
        }
    },
    
    deleteItem(index) {
        if (this.charData.inventory) {
            this.charData.inventory.splice(index, 1);
            this.renderInventory();
            this.updateWeight();
            this.scheduleAutoSave();
        }
    },
    
    updateWeight() {
        const data = this.charData;
        
        // Max weight: (CON + FOR) × 2 + 12
        const maxWeight = ((parseInt(data.attrCon) || 0) + (parseInt(data.attrFor) || 0)) * 2 + 12;
        const heavyWeight = Math.floor(maxWeight * 1.5);
        
        // Current weight
        let currentWeight = RealmsScripts.armorBonus[data.armorType || 'none'].weight;
        if (data.inventory) {
            data.inventory.forEach(item => {
                currentWeight += (parseFloat(item.weight) || 0) * (parseInt(item.qty) || 1);
            });
        }
        currentWeight = Math.round(currentWeight * 100) / 100;
        
        document.getElementById('currentWeight').textContent = currentWeight;
        document.getElementById('maxWeight').textContent = maxWeight;
        
        // Update bar
        const percent = Math.min(100, (currentWeight / heavyWeight) * 100);
        document.getElementById('weightBar').style.width = `${percent}%`;
        document.getElementById('heavyMark').style.left = `${(maxWeight / heavyWeight) * 100}%`;
        
        // Status
        const statusEl = document.getElementById('weightStatus');
        statusEl.className = 'weight-status';
        if (currentWeight > heavyWeight) {
            statusEl.textContent = 'Sobrecarregado (-5 PA)';
            statusEl.classList.add('overweight');
        } else if (currentWeight > maxWeight) {
            statusEl.textContent = 'Pesado (-2 PA)';
            statusEl.classList.add('heavy');
        } else {
            statusEl.textContent = 'Normal';
            statusEl.classList.add('normal');
        }
    },
    
    // ========== DICE ==========
    showDiceResult(total, breakdown) {
        document.getElementById('diceTotal').textContent = total;
        document.getElementById('diceBreakdown').textContent = breakdown;
        document.getElementById('diceModal').classList.remove('hidden');
    },
    
    closeDiceModal() {
        document.getElementById('diceModal').classList.add('hidden');
    },
    
    // ========== NAVIGATION ==========
    switchTab(tabName) {
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab${tabName}`);
        });
    },
    
    // ========== SIDE MENU ==========
    openSideMenu() {
        document.getElementById('sideMenu').classList.add('open');
    },
    
    closeSideMenu() {
        document.getElementById('sideMenu').classList.remove('open');
    },
    
    // ========== EXPORT ==========
    exportCharacter() {
        if (!this.charData) return;
        
        const data = JSON.stringify(this.charData, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.charData.charName || 'personagem'}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.closeSideMenu();
    },
    
    // ========== EVENT BINDINGS ==========
    bindEvents() {
        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
                document.getElementById('loginForm').classList.toggle('hidden', tabName !== 'login');
                document.getElementById('registerForm').classList.toggle('hidden', tabName !== 'register');
            });
        });
        
        // Login form
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const result = await this.login(email, password);
            if (!result.success) alert(result.message);
        });
        
        // Register form
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const result = await this.register(name, email, password);
            if (!result.success) alert(result.message);
        });
        
        // Logout buttons
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
        // New character
        document.getElementById('newCharacterBtn').addEventListener('click', () => this.createNewCharacter());
        
        // Menu button
        document.getElementById('menuBtn').addEventListener('click', () => this.openSideMenu());
        
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        // Attribute buttons
        document.querySelectorAll('.attr-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const attr = btn.dataset.attr;
                const input = document.getElementById(attr);
                const delta = btn.classList.contains('plus') ? 1 : -1;
                const newVal = (parseInt(input.value) || 0) + delta;
                input.value = newVal;
                this.charData[attr] = newVal;
                this.updateCalculations();
                this.scheduleAutoSave();
            });
        });
        
        // Data field inputs
        document.querySelectorAll('[data-field]').forEach(el => {
            el.addEventListener('change', () => {
                const field = el.dataset.field;
                this.charData[field] = el.type === 'number' ? parseFloat(el.value) || 0 : el.value;
                
                // Update header name
                if (field === 'charName') {
                    document.getElementById('charName').textContent = el.value || 'Personagem';
                }
                
                // Update race info
                if (field === 'charRace') {
                    this.updateRaceInfo();
                }
                
                this.updateCalculations();
                this.scheduleAutoSave();
            });
        });
        
        // Skill training buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('training-btn') || e.target.closest('.training-btn')) {
                const btn = e.target.classList.contains('training-btn') ? e.target : e.target.closest('.training-btn');
                const skillId = btn.dataset.skill;
                const level = parseInt(btn.dataset.level);
                this.setSkillTraining(skillId, level);
            }
        });
        
        // Skill search
        document.getElementById('skillSearch').addEventListener('input', (e) => {
            const search = e.target.value.toLowerCase();
            document.querySelectorAll('.skill-item').forEach(item => {
                const name = item.querySelector('.skill-name').textContent.toLowerCase();
                item.style.display = name.includes(search) ? '' : 'none';
            });
        });
        
        // Close dice modal on click outside
        document.getElementById('diceModal').addEventListener('click', (e) => {
            if (e.target.id === 'diceModal') this.closeDiceModal();
        });
    }
};

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
