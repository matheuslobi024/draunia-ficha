// ========== SYSTEMS API ==========
// API for personal systems, sharing, and Firebase operations

const SystemsAPI = {
    
    // ================== PERSONAL SYSTEMS ==================
    
    /**
     * Get all personal systems for current user
     * @returns {Promise<object>} Object with system IDs as keys
     */
    async getPersonalSystems() {
        if (!API.currentUser) return {};
        
        try {
            const snapshot = await db.collection('users')
                .doc(API.currentUser.uid)
                .collection('systems')
                .get();
            
            const systems = {};
            snapshot.forEach(doc => {
                systems[doc.id] = {
                    id: doc.id,
                    ...doc.data(),
                    isPersonal: true,
                    ownerId: API.currentUser.uid
                };
            });
            
            console.log(`[SystemsAPI] Loaded ${Object.keys(systems).length} personal systems`);
            return systems;
        } catch (error) {
            console.error('[SystemsAPI] Error loading personal systems:', error);
            return {};
        }
    },
    
    /**
     * Save a personal system
     * @param {string} systemId - System identifier
     * @param {object} systemData - System data to save
     * @returns {Promise<boolean>}
     */
    async savePersonalSystem(systemId, systemData) {
        if (!API.currentUser) throw new Error('Usuário não autenticado');
        
        try {
            const docRef = db.collection('users')
                .doc(API.currentUser.uid)
                .collection('systems')
                .doc(systemId);
            
            await docRef.set({
                ...systemData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdAt: systemData.createdAt || firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            console.log(`[SystemsAPI] Saved system: ${systemId}`);
            return true;
        } catch (error) {
            console.error('[SystemsAPI] Error saving system:', error);
            throw error;
        }
    },
    
    /**
     * Delete a personal system
     * @param {string} systemId - System identifier
     * @returns {Promise<boolean>}
     */
    async deletePersonalSystem(systemId) {
        if (!API.currentUser) throw new Error('Usuário não autenticado');
        
        try {
            await db.collection('users')
                .doc(API.currentUser.uid)
                .collection('systems')
                .doc(systemId)
                .delete();
            
            console.log(`[SystemsAPI] Deleted system: ${systemId}`);
            return true;
        } catch (error) {
            console.error('[SystemsAPI] Error deleting system:', error);
            throw error;
        }
    },
    
    // ================== SHARED SYSTEMS ==================
    
    /**
     * Get all systems shared with current user
     * @returns {Promise<object>}
     */
    async getSharedWithMe() {
        if (!API.currentUser) return {};
        
        try {
            const snapshot = await db.collection('sharedSystems')
                .where('sharedWith', 'array-contains', API.currentUser.email)
                .get();
            
            const systems = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                systems[doc.id] = {
                    id: doc.id,
                    ...data,
                    isShared: true,
                    isReadOnly: !data.editors?.includes(API.currentUser.email)
                };
            });
            
            console.log(`[SystemsAPI] Loaded ${Object.keys(systems).length} shared systems`);
            return systems;
        } catch (error) {
            console.error('[SystemsAPI] Error loading shared systems:', error);
            return {};
        }
    },
    
    /**
     * Share a personal system with other users
     * @param {string} systemId - System to share
     * @param {string[]} emails - Emails to share with
     * @param {boolean} canEdit - Whether they can edit (default: read-only)
     * @returns {Promise<string>} Share document ID
     */
    async shareSystem(systemId, emails, canEdit = false) {
        if (!API.currentUser) throw new Error('Usuário não autenticado');
        
        try {
            // First get the system data
            const systemDoc = await db.collection('users')
                .doc(API.currentUser.uid)
                .collection('systems')
                .doc(systemId)
                .get();
            
            if (!systemDoc.exists) {
                throw new Error('Sistema não encontrado');
            }
            
            const systemData = systemDoc.data();
            
            // Create shared system document
            const shareRef = db.collection('sharedSystems').doc();
            
            await shareRef.set({
                originalSystemId: systemId,
                ownerId: API.currentUser.uid,
                ownerEmail: API.currentUser.email,
                ownerName: API.currentUserData?.name || API.currentUser.displayName,
                name: systemData.name,
                description: systemData.description,
                config: systemData.config,
                systemData: systemData,
                sharedWith: emails.map(e => e.toLowerCase().trim()),
                editors: canEdit ? emails.map(e => e.toLowerCase().trim()) : [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`[SystemsAPI] Shared system ${systemId} with ${emails.length} users`);
            return shareRef.id;
        } catch (error) {
            console.error('[SystemsAPI] Error sharing system:', error);
            throw error;
        }
    },
    
    /**
     * Stop sharing a system
     * @param {string} shareId - Share document ID
     * @returns {Promise<boolean>}
     */
    async unshareSystem(shareId) {
        if (!API.currentUser) throw new Error('Usuário não autenticado');
        
        try {
            const docRef = db.collection('sharedSystems').doc(shareId);
            const doc = await docRef.get();
            
            if (!doc.exists) {
                throw new Error('Compartilhamento não encontrado');
            }
            
            if (doc.data().ownerId !== API.currentUser.uid) {
                throw new Error('Você não é o dono deste sistema');
            }
            
            await docRef.delete();
            console.log(`[SystemsAPI] Unshared system: ${shareId}`);
            return true;
        } catch (error) {
            console.error('[SystemsAPI] Error unsharing system:', error);
            throw error;
        }
    },
    
    /**
     * Update share permissions
     * @param {string} shareId - Share document ID
     * @param {string[]} emails - New list of emails
     * @param {string[]} editors - New list of editors
     * @returns {Promise<boolean>}
     */
    async updateSharePermissions(shareId, emails, editors = []) {
        if (!API.currentUser) throw new Error('Usuário não autenticado');
        
        try {
            const docRef = db.collection('sharedSystems').doc(shareId);
            const doc = await docRef.get();
            
            if (!doc.exists) {
                throw new Error('Compartilhamento não encontrado');
            }
            
            if (doc.data().ownerId !== API.currentUser.uid) {
                throw new Error('Você não é o dono deste sistema');
            }
            
            await docRef.update({
                sharedWith: emails.map(e => e.toLowerCase().trim()),
                editors: editors.map(e => e.toLowerCase().trim()),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`[SystemsAPI] Updated permissions for: ${shareId}`);
            return true;
        } catch (error) {
            console.error('[SystemsAPI] Error updating permissions:', error);
            throw error;
        }
    },
    
    /**
     * Get all systems I've shared
     * @returns {Promise<object>}
     */
    async getMySharedSystems() {
        if (!API.currentUser) return {};
        
        try {
            const snapshot = await db.collection('sharedSystems')
                .where('ownerId', '==', API.currentUser.uid)
                .get();
            
            const systems = {};
            snapshot.forEach(doc => {
                systems[doc.id] = {
                    shareId: doc.id,
                    ...doc.data()
                };
            });
            
            return systems;
        } catch (error) {
            console.error('[SystemsAPI] Error loading my shared systems:', error);
            return {};
        }
    },
    
    /**
     * Copy a shared system to personal systems
     * @param {string} shareId - Share document ID
     * @returns {Promise<string>} New system ID
     */
    async copySharedSystem(shareId) {
        if (!API.currentUser) throw new Error('Usuário não autenticado');
        
        try {
            const doc = await db.collection('sharedSystems').doc(shareId).get();
            
            if (!doc.exists) {
                throw new Error('Sistema compartilhado não encontrado');
            }
            
            const data = doc.data();
            const newSystemId = `${data.originalSystemId}_copy_${Date.now()}`;
            
            // Save as personal system
            await this.savePersonalSystem(newSystemId, {
                ...data.systemData,
                name: `${data.name} (Cópia)`,
                copiedFrom: shareId,
                originalOwner: data.ownerEmail
            });
            
            console.log(`[SystemsAPI] Copied shared system to: ${newSystemId}`);
            return newSystemId;
        } catch (error) {
            console.error('[SystemsAPI] Error copying system:', error);
            throw error;
        }
    },
    
    // ================== ALL SYSTEMS ==================
    
    /**
     * Get all available systems (built-in + personal + shared)
     * @returns {Promise<object>}
     */
    async getAllAvailableSystems() {
        const builtIn = SystemRegistry.getBuiltIn();
        const personal = await this.getPersonalSystems();
        const shared = await this.getSharedWithMe();
        
        return {
            builtIn,
            personal,
            shared,
            all: { ...builtIn, ...personal, ...shared }
        };
    },
    
    /**
     * Load and register all user systems into SystemRegistry
     */
    async loadUserSystems() {
        const personal = await this.getPersonalSystems();
        const shared = await this.getSharedWithMe();
        
        // Register personal systems
        for (const [id, system] of Object.entries(personal)) {
            this.registerCustomSystem(id, system);
        }
        
        // Register shared systems
        for (const [id, system] of Object.entries(shared)) {
            this.registerCustomSystem(id, system);
        }
        
        console.log(`[SystemsAPI] Registered ${Object.keys(personal).length} personal + ${Object.keys(shared).length} shared systems`);
    },
    
    /**
     * Register a custom system with SystemRegistry
     * @param {string} id - System ID
     * @param {object} systemData - System data from Firebase
     */
    registerCustomSystem(id, systemData) {
        const config = systemData.config || systemData.systemData?.config || {};
        
        // Create a system object compatible with SystemRegistry
        const system = {
            id,
            name: systemData.name,
            description: systemData.description,
            icon: systemData.icon || 'fa-cog',
            config,
            isBuiltIn: false,
            isPersonal: systemData.isPersonal || false,
            isShared: systemData.isShared || false,
            ownerId: systemData.ownerId,
            
            // Custom systems use dynamic calculations
            calculations: this.createCustomCalculations(config),
            
            // Skills from config
            skills: config.skills || [],
            
            // Attributes from config
            attributes: config.customAttrs || []
        };
        
        SystemRegistry.register(id, system);
    },
    
    /**
     * Create calculation functions for custom system
     * @param {object} config - System configuration
     * @returns {object} Calculations object
     */
    createCustomCalculations(config) {
        return {
            getAttrValue(charData, attrName) {
                // Check custom attributes first
                if (config.customAttrs) {
                    const customAttr = config.customAttrs.find(a => 
                        a.abbr?.toLowerCase() === attrName.toLowerCase() ||
                        a.name?.toLowerCase() === attrName.toLowerCase()
                    );
                    if (customAttr) {
                        const fieldId = `customAttr_${customAttr.abbr.toLowerCase()}`;
                        return parseInt(charData[fieldId]) || 0;
                    }
                }
                return 0;
            },
            
            calculateMaxHP(charData) {
                const level = parseInt(charData.charLevel) || 1;
                
                switch (config.hpFormula) {
                    case 'levelcon':
                        const con = this.getAttrValue(charData, 'con');
                        return level * (con + 10);
                    case 'flat':
                        const base = config.flatHpBase || 10;
                        const perLevel = config.flatHpPerLevel || 5;
                        return base + ((level - 1) * perLevel);
                    default:
                        return level * 10;
                }
            },
            
            calculateMaxPE(charData) {
                if (!config.hasEnergyPoints) return 0;
                const level = parseInt(charData.charLevel) || 1;
                return level * 5;
            },
            
            calculateCA(charData) {
                return 10;
            },
            
            calculatePA(charData) {
                if (!config.hasActionPoints) return 0;
                return config.flatPa || 3;
            },
            
            calculateInitiative(charData) {
                return 0;
            },
            
            calculateSkillTotal(charData, skillId) {
                const skill = config.skills?.find(s => s.id === skillId);
                if (!skill) return 0;
                
                let total = skill.attr ? this.getAttrValue(charData, skill.attr) : 0;
                
                const trainingLevel = charData.skills?.[skillId] || 0;
                const trainingBonus = [0, 1, 3, 5][trainingLevel] || 0;
                
                return total + trainingBonus;
            },
            
            updateAll(charData) {
                return {
                    maxHp: this.calculateMaxHP(charData),
                    maxPE: this.calculateMaxPE(charData),
                    ca: this.calculateCA(charData),
                    pa: this.calculatePA(charData),
                    initiative: this.calculateInitiative(charData)
                };
            }
        };
    }
};

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SystemsAPI;
}
