// ========== APP MODULE ==========
// Main application controller with Firebase

const App = {
    currentCharacterId: null,
    initialized: false,
    
    // Initialize application
    async init() {
        // Show loading state
        this.showLoading(true);
        
        // Initialize Firebase Auth
        await Auth.init();
        
        this.bindAuthEvents();
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

        // New character button
        const newCharBtn = document.getElementById('newCharacterBtn');
        if (newCharBtn) {
            newCharBtn.addEventListener('click', () => this.createNewCharacter());
        }

        // Switch character button
        const switchCharBtn = document.getElementById('switchCharBtn');
        if (switchCharBtn) {
            switchCharBtn.addEventListener('click', () => this.showCharacterModal());
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
            list.innerHTML = characters.map(char => `
                <div class="character-item" data-id="${char.id}">
                    <div class="character-item-info" onclick="App.selectCharacter('${char.id}')">
                        <h4>${char.name || 'Sem nome'}</h4>
                        <span>${char.race || 'Sem raça'} • Nível ${char.level || 1}</span>
                    </div>
                    <button class="delete-char-btn" onclick="App.deleteCharacter('${char.id}', event)" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }

        document.getElementById('characterModal').classList.remove('hidden');
        document.getElementById('mainContent').classList.add('hidden');
    },

    // Select character
    async selectCharacter(charId) {
        const character = await Auth.getCharacter(charId);

        if (character) {
            this.currentCharacterId = charId;
            Sheet.loadCharacter(character, charId);
            document.getElementById('characterModal').classList.add('hidden');
            document.getElementById('mainContent').classList.remove('hidden');
        }
    },

    // Create new character
    async createNewCharacter() {
        const newChar = await Auth.createNewCharacter();
        if (newChar) {
            this.currentCharacterId = newChar.id;
            const defaultData = Auth.getDefaultCharacterData();
            Sheet.loadCharacter(defaultData, newChar.id);
            document.getElementById('characterModal').classList.add('hidden');
            document.getElementById('mainContent').classList.remove('hidden');
        }
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
    }
};

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
