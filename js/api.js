// ========== API MODULE - FIREBASE ==========
// Comunicação com Firebase para autenticação e dados

const API = {
    // Current user data
    currentUser: null,
    currentUserData: null,
    
    // Auth state listener callback
    onAuthStateChange: null,
    
    // Initialize API
    init() {
        return new Promise((resolve) => {
            // Listen for auth state changes
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    // Get user data from Firestore
                    await this.loadUserData();
                    console.log('✅ Usuário logado:', user.email);
                } else {
                    this.currentUser = null;
                    this.currentUserData = null;
                    console.log('❌ Usuário deslogado');
                }
                
                if (this.onAuthStateChange) {
                    this.onAuthStateChange(user);
                }
                
                resolve(user);
            });
        });
    },
    
    // Load user data from Firestore
    async loadUserData() {
        if (!this.currentUser) return null;
        
        try {
            const doc = await db.collection('users').doc(this.currentUser.uid).get();
            if (doc.exists) {
                this.currentUserData = doc.data();
            } else {
                // Create user document if doesn't exist
                this.currentUserData = {
                    name: this.currentUser.displayName || this.currentUser.email.split('@')[0],
                    email: this.currentUser.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                await db.collection('users').doc(this.currentUser.uid).set(this.currentUserData);
            }
            return this.currentUserData;
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            return null;
        }
    },
    
    // Check if server/firebase is available (always true for Firebase)
    async checkServer() {
        return true;
    },
    
    // ================== AUTH ==================
    
    async register(name, email, password) {
        try {
            // Create user with email and password
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Update profile with display name
            await user.updateProfile({ displayName: name });
            
            // Create user document in Firestore
            await db.collection('users').doc(user.uid).set({
                name: name,
                email: email.toLowerCase().trim(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            this.currentUser = user;
            this.currentUserData = { name, email };
            
            return { name, email };
        } catch (error) {
            console.error('Erro ao registrar:', error);
            let message = 'Erro ao registrar';
            if (error.code === 'auth/email-already-in-use') {
                message = 'Este email já está cadastrado';
            } else if (error.code === 'auth/weak-password') {
                message = 'A senha deve ter pelo menos 6 caracteres';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Email inválido';
            }
            throw new Error(message);
        }
    },
    
    async login(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            this.currentUser = userCredential.user;
            await this.loadUserData();
            
            return {
                name: this.currentUserData?.name || this.currentUser.displayName || email.split('@')[0],
                email: this.currentUser.email
            };
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            let message = 'Erro ao fazer login';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                message = 'Email ou senha incorretos';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Email inválido';
            } else if (error.code === 'auth/too-many-requests') {
                message = 'Muitas tentativas. Tente novamente mais tarde';
            }
            throw new Error(message);
        }
    },
    
    logout() {
        auth.signOut();
        this.currentUser = null;
        this.currentUserData = null;
    },
    
    isLoggedIn() {
        return this.currentUser !== null;
    },
    
    getUser() {
        if (!this.currentUser) return null;
        return {
            name: this.currentUserData?.name || this.currentUser.displayName || 'Jogador',
            email: this.currentUser.email,
            uid: this.currentUser.uid
        };
    },
    
    // ================== CHARACTERS ==================
    
    async getCharacters() {
        if (!this.currentUser) return [];
        
        try {
            const snapshot = await db.collection('users')
                .doc(this.currentUser.uid)
                .collection('characters')
                .orderBy('updatedAt', 'desc')
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().charName || 'Sem Nome',
                race: doc.data().charRace || '',
                level: doc.data().charLevel || 1,
                lastModified: doc.data().updatedAt?.toDate() || new Date()
            }));
        } catch (error) {
            console.error('Erro ao carregar personagens:', error);
            return [];
        }
    },
    
    async getCharacter(charId) {
        if (!this.currentUser) throw new Error('Não autenticado');
        
        try {
            const doc = await db.collection('users')
                .doc(this.currentUser.uid)
                .collection('characters')
                .doc(charId)
                .get();
            
            if (!doc.exists) {
                throw new Error('Personagem não encontrado');
            }
            
            return doc.data();
        } catch (error) {
            console.error('Erro ao carregar personagem:', error);
            throw error;
        }
    },
    
    async saveCharacter(charId, characterData) {
        if (!this.currentUser) throw new Error('Não autenticado');
        
        try {
            // Add timestamp
            characterData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            
            await db.collection('users')
                .doc(this.currentUser.uid)
                .collection('characters')
                .doc(charId)
                .set(characterData, { merge: true });
            
            return { success: true };
        } catch (error) {
            console.error('Erro ao salvar personagem:', error);
            throw error;
        }
    },
    
    async createCharacter() {
        if (!this.currentUser) throw new Error('Não autenticado');
        
        try {
            const newCharacter = {
                charName: 'Novo Personagem',
                charRace: '',
                charLevel: 1,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const docRef = await db.collection('users')
                .doc(this.currentUser.uid)
                .collection('characters')
                .add(newCharacter);
            
            return {
                id: docRef.id,
                ...newCharacter
            };
        } catch (error) {
            console.error('Erro ao criar personagem:', error);
            throw error;
        }
    },
    
    async deleteCharacter(charId) {
        if (!this.currentUser) throw new Error('Não autenticado');
        
        try {
            await db.collection('users')
                .doc(this.currentUser.uid)
                .collection('characters')
                .doc(charId)
                .delete();
            
            return { success: true };
        } catch (error) {
            console.error('Erro ao deletar personagem:', error);
            throw error;
        }
    },
    
    // ================== CUSTOM SYSTEMS ==================
    
    async getCustomSystems() {
        if (!this.currentUser) return {};
        
        try {
            const snapshot = await db.collection('users')
                .doc(this.currentUser.uid)
                .collection('systems')
                .get();
            
            const systems = {};
            snapshot.docs.forEach(doc => {
                systems[doc.id] = doc.data();
            });
            return systems;
        } catch (error) {
            console.error('Erro ao carregar sistemas:', error);
            return {};
        }
    },
    
    async saveCustomSystem(systemId, systemData) {
        if (!this.currentUser) throw new Error('Não autenticado');
        
        try {
            systemData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            
            await db.collection('users')
                .doc(this.currentUser.uid)
                .collection('systems')
                .doc(systemId)
                .set(systemData, { merge: true });
            
            return { success: true };
        } catch (error) {
            console.error('Erro ao salvar sistema:', error);
            throw error;
        }
    },
    
    async deleteCustomSystem(systemId) {
        if (!this.currentUser) throw new Error('Não autenticado');
        
        try {
            await db.collection('users')
                .doc(this.currentUser.uid)
                .collection('systems')
                .doc(systemId)
                .delete();
            
            return { success: true };
        } catch (error) {
            console.error('Erro ao deletar sistema:', error);
            throw error;
        }
    }
};
