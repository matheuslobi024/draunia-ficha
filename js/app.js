// ========== APP MODULE ==========
// Main application controller with Firebase

const App = {
    currentCharacterId: null,
    currentSystem: null,
    pendingNewCharacter: false,
    initialized: false,
    
    // Initialize application
    async init() {
        console.log('[App] init() iniciando...');
        // Show loading state
        this.showLoading(true);
        
        // Initialize Firebase Auth
        await Auth.init();
        console.log('[App] Auth inicializado');
        
        // Initialize System Manager
        await SystemManager.init();
        console.log('[App] SystemManager inicializado');
        
        this.bindAuthEvents();
        console.log('[App] bindAuthEvents() concluído');
        this.bindNavEvents();
        Sheet.init();
        
        // Listen for auth state changes
        API.onAuthStateChange = (user) => {
            if (this.initialized) {
                this.checkAuthState();
            }
        };
        
        await this.checkAuthState();
        this.initialized = true;
        this.showLoading(false);
        console.log('[App] init() concluído');
    },

    // Show/hide loading
    showLoading(show) {
        const modal = document.getElementById('authModal');
        if (show && modal) {
            modal.classList.remove('hidden');
        }
    },

    // Bind authentication events
    bindAuthEvents() {
        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchAuthTab(tabName);
            });
        });

        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // New character button - now shows system select first
        const newCharBtn = document.getElementById('newCharacterBtn');
        if (newCharBtn) {
            newCharBtn.addEventListener('click', () => this.showSystemSelect());
        }

        // Switch character button
        const switchCharBtn = document.getElementById('switchCharBtn');
        if (switchCharBtn) {
            switchCharBtn.addEventListener('click', () => this.showCharacterModal());
        }
        
        // Manage systems button
        const manageSysBtn = document.getElementById('manageSysBtn');
        console.log('[App] manageSysBtn encontrado:', manageSysBtn);
        if (manageSysBtn) {
            manageSysBtn.addEventListener('click', () => {
                console.log('[App] Botão Gerenciar Sistemas clicado');
                SystemManager.showManager();
            });
        } else {
            console.error('[App] ERRO: manageSysBtn NÃO encontrado!');
        }
    },

    // Bind navigation events
    bindNavEvents() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.closest('.nav-tab').dataset.tab;
                this.switchTab(tabName);
            });
        });
    },

    // Switch auth tab
    switchAuthTab(tabName) {
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        document.getElementById('loginForm').classList.toggle('hidden', tabName !== 'login');
        document.getElementById('registerForm').classList.toggle('hidden', tabName !== 'register');
    },

    // Switch main tab
    switchTab(tabName) {
        // Update nav buttons
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabName}`);
        });
    },

    // Check authentication state
    async checkAuthState() {
        if (Auth.isLoggedIn()) {
            const user = Auth.getCurrentUser();
            document.getElementById('userName').textContent = user.name;
            document.getElementById('authModal').classList.add('hidden');
            
            // Check if user has characters
            const characters = await Auth.getCharacters();
            if (characters.length > 0) {
                await this.showCharacterModal();
            } else {
                await this.createNewCharacter();
            }
        } else {
            document.getElementById('authModal').classList.remove('hidden');
            document.getElementById('mainContent').classList.add('hidden');
        }
    },

    // Handle login
    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const result = await Auth.login(email, password);

        if (result.success) {
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
            await this.checkAuthState();
        } else {
            alert(result.message);
        }
    },

    // Handle register
    async handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        const result = await Auth.register(name, email, password);

        if (result.success) {
            document.getElementById('registerName').value = '';
            document.getElementById('registerEmail').value = '';
            document.getElementById('registerPassword').value = '';
            await this.checkAuthState();
        } else {
            alert(result.message);
        }
    },

    // Handle logout
    handleLogout() {
        Auth.logout();
        this.currentCharacterId = null;
        document.getElementById('mainContent').classList.add('hidden');
        document.getElementById('characterModal').classList.add('hidden');
        document.getElementById('authModal').classList.remove('hidden');
        location.reload();
    },

    // Show character selection modal
    async showCharacterModal() {
        const characters = await Auth.getCharacters();
        const list = document.getElementById('characterList');

        if (characters.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Nenhuma ficha criada</p>';
        } else {
            list.innerHTML = characters.map(char => {
                // Get system info for display
                const systemId = char.system || 'realsscripts';
                const system = SystemManager.getSystem(systemId);
                const systemName = system?.name || 'Sistema Desconhecido';
                const systemIcon = system?.icon || 'fa-dice-d20';
                
                return `
                <div class="character-item" data-id="${char.id}">
                    <div class="character-system-badge" title="${systemName}">
                        <i class="fas ${systemIcon}"></i>
                    </div>
                    <div class="character-item-info" onclick="App.selectCharacter('${char.id}')">
                        <h4>${char.name || 'Sem nome'}</h4>
                        <span>${char.race || 'Sem raça'} • Nível ${char.level || 1}</span>
                        <span class="character-system-name">${systemName}</span>
                    </div>
                    <button class="delete-char-btn" onclick="App.deleteCharacter('${char.id}', event)" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            }).join('');
        }

        document.getElementById('characterModal').classList.remove('hidden');
        document.getElementById('mainContent').classList.add('hidden');
    },

    // Select character
    async selectCharacter(charId) {
        // Show loading state
        const charModal = document.getElementById('characterModal');
        const charItem = charModal.querySelector(`[data-id="${charId}"]`);
        if (charItem) {
            charItem.classList.add('loading');
        }
        
        try {
            const character = await Auth.getCharacter(charId);

            if (character) {
                this.currentCharacterId = charId;
                this.currentSystem = character.system || 'realsscripts';
                Sheet.loadCharacter(character, charId);
                this.applySystemToUI(this.currentSystem);
                document.getElementById('characterModal').classList.add('hidden');
                document.getElementById('mainContent').classList.remove('hidden');
            } else {
                console.error('[App] Character not found:', charId);
                alert('Erro ao carregar personagem. Tente novamente.');
                // Remove loading state
                if (charItem) {
                    charItem.classList.remove('loading');
                }
            }
        } catch (error) {
            console.error('[App] Error selecting character:', error);
            alert('Erro ao carregar personagem. Tente novamente.');
            // Remove loading state
            if (charItem) {
                charItem.classList.remove('loading');
            }
        }
    },

    // Show system select modal
    showSystemSelect() {
        this.pendingNewCharacter = true;
        SystemManager.showSystemSelect();
    },
    
    // Show system editor from select modal
    showSystemEditor() {
        SystemManager.createNew();
    },
    
    // Cancel system select
    cancelSystemSelect() {
        this.pendingNewCharacter = false;
        document.getElementById('systemSelectModal').classList.add('hidden');
        document.getElementById('characterModal').classList.remove('hidden');
    },
    
    // Select system and create character
    async selectSystem(systemId) {
        this.currentSystem = systemId;
        document.getElementById('systemSelectModal').classList.add('hidden');
        
        if (this.pendingNewCharacter) {
            this.pendingNewCharacter = false;
            await this.createNewCharacterWithSystem(systemId);
        }
    },
    
    // Create new character with selected system
    async createNewCharacterWithSystem(systemId) {
        const newChar = await Auth.createNewCharacter();
        if (newChar) {
            this.currentCharacterId = newChar.id;
            this.currentSystem = systemId;
            
            const defaultData = Auth.getDefaultCharacterData(systemId);
            defaultData.system = systemId;
            
            Sheet.loadCharacter(defaultData, newChar.id);
            this.applySystemToUI(systemId);
            
            document.getElementById('characterModal').classList.add('hidden');
            document.getElementById('mainContent').classList.remove('hidden');
        }
    },

    // Create new character (legacy, defaults to realsscripts)
    async createNewCharacter() {
        await this.createNewCharacterWithSystem('realsscripts');
    },
    
    // Apply system-specific UI changes
    applySystemToUI(systemId) {
        const system = SystemManager.getSystem(systemId);
        const config = system?.config || {};
        
        // Tell Sheet module which system is active
        Sheet.setSystem(systemId);
        
        // Hide/show elements based on system
        document.querySelectorAll('.system-realsscripts').forEach(el => {
            el.classList.toggle('hidden', systemId !== 'realsscripts' && config.attrType !== 'realsscripts');
        });
        
        document.querySelectorAll('.system-dnd5e').forEach(el => {
            el.classList.toggle('hidden', systemId !== 'dnd5e' && config.attrType !== 'dnd');
        });
        
        // Show/hide PA section
        const paElements = document.querySelectorAll('.pa-box, [data-field="currentPA"]');
        paElements.forEach(el => {
            if (el.closest('.vital-box')) {
                el.closest('.vital-box').classList.toggle('hidden', !config.hasActionPoints);
            }
        });
        
        // Show/hide Fusions section
        const fusionElements = document.querySelectorAll('.fusions-section, [data-card-id="fusions"]');
        fusionElements.forEach(el => {
            el.classList.toggle('hidden', !config.hasFusions);
        });
        
        // Show/hide Dodge
        document.querySelectorAll('#dodge').forEach(el => {
            el.closest('.defense-box')?.classList.toggle('hidden', !config.hasDodge);
        });
        
        // Show/hide Damage Reduction (Realms&Scripts only)
        document.querySelectorAll('.damage-reduction, [data-card-id="combat-reduction"]').forEach(el => {
            el.classList.toggle('hidden', !config.hasFusions);
        });
        
        // Update energy points name
        if (config.energyName && config.energyName !== 'PE') {
            document.querySelectorAll('.pe-box label, .pe-compact label').forEach(el => {
                el.textContent = config.energyName;
            });
        }
        
        // Store current system for calculations
        Calculations.currentSystem = systemId;
        
        console.log('[App] Sistema UI aplicado:', systemId, config);
    },

    // Delete character
    async deleteCharacter(charId, event) {
        event.stopPropagation();
        
        if (confirm('Tem certeza que deseja excluir esta ficha? Esta ação não pode ser desfeita.')) {
            await Auth.deleteCharacter(charId);
            await this.showCharacterModal();
        }
    },
    
    // Get current character ID
    getCurrentCharacterId() {
        return this.currentCharacterId;
    },
    
    // Get current system
    getCurrentSystem() {
        return this.currentSystem;
    }
};

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
