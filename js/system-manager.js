// ========== SYSTEM MANAGER MODULE ==========
// Manages custom RPG systems

const SystemManager = {
    // Current editing system
    currentEditingSystem: null,
    
    // Built-in systems (cannot be deleted)
    builtInSystems: ['realsscripts', 'dnd5e'],
    
    // Default systems
    defaultSystems: {
        'realsscripts': {
            id: 'realsscripts',
            name: 'Reals&Scripts',
            description: 'Sistema original com Fusões, PA, atributos personalizados e mecânicas únicas de Draunia.',
            icon: 'fa-scroll',
            isBuiltIn: true,
            config: {
                attrType: 'realsscripts',
                attrPointLimit: 8,
                modifierCalc: 'direct',
                hpFormula: 'realsscripts',
                hasEnergyPoints: true,
                energyName: 'PE',
                peFormula: 'realsscripts',
                hasSanity: true,
                sanityHasMax: false,
                hasActionPoints: true,
                paFormula: 'realsscripts',
                hasFusions: true,
                caFormula: 'realsscripts',
                hasDodge: true,
                dodgeFormula: 'realsscripts',
                hasClasses: false,
                skillSystem: 'realsscripts',
                skillList: 'realsscripts',
                hasSpellSlots: false
            }
        },
        'dnd5e': {
            id: 'dnd5e',
            name: 'Sistema Clássico',
            description: 'Baseado em D&D 5e, com atributos tradicionais e mecânicas simplificadas.',
            icon: 'fa-dragon',
            isBuiltIn: true,
            config: {
                attrType: 'dnd',
                attrPointLimit: 0,
                modifierCalc: 'dnd',
                hpFormula: 'dnd',
                hasEnergyPoints: false,
                hasSanity: true,
                sanityHasMax: true,
                sanityFormula: 'dnd',
                hasActionPoints: false,
                hasFusions: false,
                caFormula: 'dnd',
                hasDodge: false,
                hasClasses: true,
                classAffectsHp: true,
                skillSystem: 'dnd',
                skillList: 'dnd',
                hasSpellSlots: true
            }
        }
    },
    
    // Custom systems (loaded from Firebase)
    customSystems: {},
    
    // Initialize system manager
    async init() {
        console.log('[SystemManager] init() chamado');
        await this.loadCustomSystems();
        this.bindEditorEvents();
        console.log('[SystemManager] Inicialização completa');
    },
    
    // Load custom systems from Firebase
    async loadCustomSystems() {
        try {
            const systems = await API.getCustomSystems();
            this.customSystems = systems || {};
        } catch (error) {
            console.error('Erro ao carregar sistemas:', error);
            this.customSystems = {};
        }
    },
    
    // Get all available systems
    getAllSystems() {
        return { ...this.defaultSystems, ...this.customSystems };
    },
    
    // Get system by ID
    getSystem(systemId) {
        return this.getAllSystems()[systemId] || this.defaultSystems['realsscripts'];
    },
    
    // Bind editor form events
    bindEditorEvents() {
        // Attribute type change
        const attrType = document.getElementById('attrType');
        if (attrType) {
            attrType.addEventListener('change', () => {
                const customSection = document.getElementById('customAttrsSection');
                customSection.classList.toggle('hidden', attrType.value !== 'custom');
            });
        }
        
        // HP formula change
        const hpFormula = document.getElementById('hpFormula');
        if (hpFormula) {
            hpFormula.addEventListener('change', () => {
                document.getElementById('customHpSection').classList.toggle('hidden', hpFormula.value !== 'custom');
                document.getElementById('flatHpSection').classList.toggle('hidden', hpFormula.value !== 'flat');
            });
        }
        
        // Energy points toggle
        const hasEnergyPoints = document.getElementById('hasEnergyPoints');
        if (hasEnergyPoints) {
            hasEnergyPoints.addEventListener('change', () => {
                document.getElementById('energyPointsConfig').classList.toggle('hidden', !hasEnergyPoints.checked);
            });
        }
        
        // PE formula change
        const peFormula = document.getElementById('peFormula');
        if (peFormula) {
            peFormula.addEventListener('change', () => {
                document.getElementById('simplePeSection').classList.toggle('hidden', peFormula.value !== 'simple');
                document.getElementById('attrPeSection').classList.toggle('hidden', peFormula.value !== 'attr');
            });
        }
        
        // Sanity toggle
        const hasSanity = document.getElementById('hasSanity');
        if (hasSanity) {
            hasSanity.addEventListener('change', () => {
                document.getElementById('sanityConfig').classList.toggle('hidden', !hasSanity.checked);
            });
        }
        
        // Sanity max toggle
        const sanityHasMax = document.getElementById('sanityHasMax');
        if (sanityHasMax) {
            sanityHasMax.addEventListener('change', () => {
                document.getElementById('sanityMaxConfig').classList.toggle('hidden', !sanityHasMax.checked);
            });
        }
        
        // Sanity formula change
        const sanityFormula = document.getElementById('sanityFormula');
        if (sanityFormula) {
            sanityFormula.addEventListener('change', () => {
                document.getElementById('flatSanitySection').classList.toggle('hidden', sanityFormula.value !== 'flat');
            });
        }
        
        // Action points toggle
        const hasActionPoints = document.getElementById('hasActionPoints');
        if (hasActionPoints) {
            hasActionPoints.addEventListener('change', () => {
                document.getElementById('actionPointsConfig').classList.toggle('hidden', !hasActionPoints.checked);
            });
        }
        
        // PA formula change
        const paFormula = document.getElementById('paFormula');
        if (paFormula) {
            paFormula.addEventListener('change', () => {
                document.getElementById('flatPaSection').classList.toggle('hidden', paFormula.value !== 'flat');
            });
        }
        
        // Dodge toggle
        const hasDodge = document.getElementById('hasDodge');
        if (hasDodge) {
            hasDodge.addEventListener('change', () => {
                document.getElementById('dodgeConfig').classList.toggle('hidden', !hasDodge.checked);
            });
        }
        
        // Classes toggle
        const hasClasses = document.getElementById('hasClasses');
        if (hasClasses) {
            hasClasses.addEventListener('change', () => {
                document.getElementById('classesConfig').classList.toggle('hidden', !hasClasses.checked);
            });
        }
    },
    
    // Show systems manager modal
    showManager() {
        console.log('[SystemManager] showManager() chamado');
        this.renderSystemsList();
        document.getElementById('characterModal').classList.add('hidden');
        const managerModal = document.getElementById('systemsManagerModal');
        console.log('[SystemManager] systemsManagerModal encontrado:', managerModal);
        if (managerModal) {
            managerModal.classList.remove('hidden');
            console.log('[SystemManager] Manager modal aberto');
        } else {
            console.error('[SystemManager] systemsManagerModal NÃO encontrado!');
        }
    },
    
    // Close systems manager
    closeManager() {
        document.getElementById('systemsManagerModal').classList.add('hidden');
        document.getElementById('characterModal').classList.remove('hidden');
    },
    
    // Render systems list in manager
    renderSystemsList() {
        const container = document.getElementById('systemsManagerList');
        const allSystems = this.getAllSystems();
        
        let html = '';
        for (const [id, system] of Object.entries(allSystems)) {
            const isBuiltIn = system.isBuiltIn;
            html += `
                <div class="system-manager-item ${isBuiltIn ? 'built-in' : ''}" data-system-id="${id}">
                    <div class="system-item-icon">
                        <i class="fas ${system.icon || 'fa-dice-d20'}"></i>
                    </div>
                    <div class="system-item-info">
                        <h4>${system.name}</h4>
                        <p>${system.description || ''}</p>
                        ${isBuiltIn ? '<span class="built-in-badge">Sistema Padrão</span>' : ''}
                    </div>
                    <div class="system-item-actions">
                        ${!isBuiltIn ? `
                            <button class="btn-icon" onclick="SystemManager.editSystem('${id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-danger-icon" onclick="SystemManager.confirmDeleteSystem('${id}')" title="Excluir">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : `
                            <button class="btn-icon" onclick="SystemManager.viewSystem('${id}')" title="Visualizar">
                                <i class="fas fa-eye"></i>
                            </button>
                        `}
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html || '<p class="no-systems">Nenhum sistema personalizado criado.</p>';
    },
    
    // Show system select modal
    showSystemSelect() {
        this.renderSystemOptions();
        document.getElementById('characterModal').classList.add('hidden');
        document.getElementById('systemSelectModal').classList.remove('hidden');
    },
    
    // Render system options for selection
    renderSystemOptions() {
        const container = document.getElementById('systemOptionsList');
        const allSystems = this.getAllSystems();
        
        let html = '';
        for (const [id, system] of Object.entries(allSystems)) {
            html += `
                <div class="system-card" data-system="${id}" onclick="App.selectSystem('${id}')">
                    <div class="system-icon"><i class="fas ${system.icon || 'fa-dice-d20'}"></i></div>
                    <h3>${system.name}</h3>
                    <p>${system.description || ''}</p>
                    ${this.renderSystemFeatures(system)}
                </div>
            `;
        }
        
        container.innerHTML = html;
    },
    
    // Render system features list
    renderSystemFeatures(system) {
        const config = system.config || {};
        const features = [];
        
        // Attributes
        if (config.attrType === 'realsscripts') {
            features.push('6 Atributos: FOR, CON, VON, CAR, INT, AGI');
        } else if (config.attrType === 'dnd') {
            features.push('6 Atributos: FOR, DES, CON, INT, SAB, CAR');
        }
        
        if (config.hasFusions) features.push('Fusões');
        if (config.hasActionPoints) features.push('Pontos de Ação (PA)');
        if (config.hasEnergyPoints) features.push(`${config.energyName || 'PE'}`);
        if (config.hasSanity) features.push('Sanidade');
        if (config.hasClasses) features.push('Classes');
        if (config.hasSpellSlots) features.push('Espaços de Magia');
        
        if (features.length === 0) return '';
        
        return `
            <ul class="system-features">
                ${features.slice(0, 4).map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
            </ul>
        `;
    },
    
    // Create new system
    createNew() {
        console.log('[SystemManager] createNew() chamado');
        this.currentEditingSystem = null;
        this.resetEditorForm();
        document.getElementById('systemEditorTitle').textContent = 'Criar Novo Sistema';
        document.getElementById('deleteSystemBtn').classList.add('hidden');
        document.getElementById('systemsManagerModal').classList.add('hidden');
        document.getElementById('systemSelectModal').classList.add('hidden');
        const editorModal = document.getElementById('systemEditorModal');
        console.log('[SystemManager] systemEditorModal encontrado:', editorModal);
        if (editorModal) {
            editorModal.classList.remove('hidden');
            console.log('[SystemManager] Modal aberto com sucesso');
        } else {
            console.error('[SystemManager] Modal systemEditorModal NÃO encontrado!');
        }
    },
    
    // Edit existing system
    editSystem(systemId) {
        const system = this.customSystems[systemId];
        if (!system) return;
        
        this.currentEditingSystem = systemId;
        this.loadSystemIntoEditor(system);
        document.getElementById('systemEditorTitle').textContent = 'Editar Sistema';
        document.getElementById('deleteSystemBtn').classList.remove('hidden');
        document.getElementById('systemsManagerModal').classList.add('hidden');
        document.getElementById('systemEditorModal').classList.remove('hidden');
    },
    
    // View built-in system (read-only)
    viewSystem(systemId) {
        const system = this.defaultSystems[systemId];
        if (!system) return;
        
        this.currentEditingSystem = null;
        this.loadSystemIntoEditor(system);
        document.getElementById('systemEditorTitle').textContent = `Visualizar: ${system.name}`;
        document.getElementById('deleteSystemBtn').classList.add('hidden');
        document.getElementById('systemsManagerModal').classList.add('hidden');
        document.getElementById('systemEditorModal').classList.remove('hidden');
        
        // Disable all inputs for viewing
        this.setEditorReadOnly(true);
    },
    
    // Set editor to read-only mode
    setEditorReadOnly(readOnly) {
        const editor = document.getElementById('systemEditorModal');
        const inputs = editor.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.disabled = readOnly;
        });
    },
    
    // Reset editor form
    resetEditorForm() {
        this.setEditorReadOnly(false);
        
        document.getElementById('systemName').value = '';
        document.getElementById('systemDescription').value = '';
        document.getElementById('systemIcon').value = 'fa-dice-d20';
        document.getElementById('attrType').value = 'realsscripts';
        document.getElementById('attrPointLimit').value = '8';
        document.getElementById('modifierCalc').value = 'direct';
        document.getElementById('hpFormula').value = 'realsscripts';
        document.getElementById('hasEnergyPoints').checked = true;
        document.getElementById('energyName').value = 'PE';
        document.getElementById('peFormula').value = 'realsscripts';
        document.getElementById('hasSanity').checked = true;
        document.getElementById('sanityHasMax').checked = false;
        document.getElementById('hasActionPoints').checked = false;
        document.getElementById('hasFusions').checked = false;
        document.getElementById('caFormula').value = 'realsscripts';
        document.getElementById('hasDodge').checked = false;
        document.getElementById('hasClasses').checked = false;
        document.getElementById('skillSystem').value = 'realsscripts';
        document.getElementById('skillList').value = 'realsscripts';
        document.getElementById('hasSpellSlots').checked = false;
        
        // Hide conditional sections
        document.getElementById('customAttrsSection').classList.add('hidden');
        document.getElementById('customHpSection').classList.add('hidden');
        document.getElementById('flatHpSection').classList.add('hidden');
        document.getElementById('energyPointsConfig').classList.remove('hidden');
        document.getElementById('simplePeSection').classList.add('hidden');
        document.getElementById('attrPeSection').classList.add('hidden');
        document.getElementById('sanityConfig').classList.remove('hidden');
        document.getElementById('sanityMaxConfig').classList.add('hidden');
        document.getElementById('actionPointsConfig').classList.add('hidden');
        document.getElementById('flatPaSection').classList.add('hidden');
        document.getElementById('dodgeConfig').classList.add('hidden');
        document.getElementById('classesConfig').classList.add('hidden');
    },
    
    // Load system data into editor
    loadSystemIntoEditor(system) {
        this.resetEditorForm();
        
        const config = system.config || {};
        
        document.getElementById('systemName').value = system.name || '';
        document.getElementById('systemDescription').value = system.description || '';
        document.getElementById('systemIcon').value = system.icon || 'fa-dice-d20';
        
        // Attributes
        document.getElementById('attrType').value = config.attrType || 'realsscripts';
        document.getElementById('attrPointLimit').value = config.attrPointLimit || 8;
        document.getElementById('modifierCalc').value = config.modifierCalc || 'direct';
        if (config.attrType === 'custom') {
            document.getElementById('customAttrsSection').classList.remove('hidden');
            document.getElementById('customAttrs').value = config.customAttrs || '';
        }
        
        // HP
        document.getElementById('hpFormula').value = config.hpFormula || 'realsscripts';
        if (config.hpFormula === 'custom') {
            document.getElementById('customHpSection').classList.remove('hidden');
            document.getElementById('customHpFormula').value = config.customHpFormula || '';
        } else if (config.hpFormula === 'flat') {
            document.getElementById('flatHpSection').classList.remove('hidden');
            document.getElementById('flatHpBase').value = config.flatHpBase || 10;
            document.getElementById('flatHpPerLevel').value = config.flatHpPerLevel || 5;
        }
        
        // Energy Points
        document.getElementById('hasEnergyPoints').checked = config.hasEnergyPoints !== false;
        document.getElementById('energyPointsConfig').classList.toggle('hidden', !config.hasEnergyPoints);
        document.getElementById('energyName').value = config.energyName || 'PE';
        document.getElementById('peFormula').value = config.peFormula || 'realsscripts';
        
        // Sanity
        document.getElementById('hasSanity').checked = config.hasSanity !== false;
        document.getElementById('sanityConfig').classList.toggle('hidden', !config.hasSanity);
        document.getElementById('sanityHasMax').checked = config.sanityHasMax || false;
        document.getElementById('sanityMaxConfig').classList.toggle('hidden', !config.sanityHasMax);
        
        // Action Points
        document.getElementById('hasActionPoints').checked = config.hasActionPoints || false;
        document.getElementById('actionPointsConfig').classList.toggle('hidden', !config.hasActionPoints);
        document.getElementById('paFormula').value = config.paFormula || 'realsscripts';
        
        // Fusions
        document.getElementById('hasFusions').checked = config.hasFusions || false;
        
        // Defenses
        document.getElementById('caFormula').value = config.caFormula || 'realsscripts';
        document.getElementById('hasDodge').checked = config.hasDodge || false;
        document.getElementById('dodgeConfig').classList.toggle('hidden', !config.hasDodge);
        
        // Classes
        document.getElementById('hasClasses').checked = config.hasClasses || false;
        document.getElementById('classesConfig').classList.toggle('hidden', !config.hasClasses);
        if (config.hasClasses) {
            document.getElementById('classAffectsHp').checked = config.classAffectsHp !== false;
            document.getElementById('classList').value = config.classList || '';
        }
        
        // Skills
        document.getElementById('skillSystem').value = config.skillSystem || 'realsscripts';
        document.getElementById('skillList').value = config.skillList || 'realsscripts';
        
        // Spell Slots
        document.getElementById('hasSpellSlots').checked = config.hasSpellSlots || false;
    },
    
    // Collect data from editor form
    collectEditorData() {
        const name = document.getElementById('systemName').value.trim();
        if (!name) {
            alert('Por favor, insira um nome para o sistema.');
            return null;
        }
        
        const config = {
            attrType: document.getElementById('attrType').value,
            attrPointLimit: parseInt(document.getElementById('attrPointLimit').value) || 0,
            modifierCalc: document.getElementById('modifierCalc').value,
            customAttrs: document.getElementById('customAttrs').value,
            
            hpFormula: document.getElementById('hpFormula').value,
            customHpFormula: document.getElementById('customHpFormula').value,
            flatHpBase: parseInt(document.getElementById('flatHpBase').value) || 10,
            flatHpPerLevel: parseInt(document.getElementById('flatHpPerLevel').value) || 5,
            
            hasEnergyPoints: document.getElementById('hasEnergyPoints').checked,
            energyName: document.getElementById('energyName').value || 'PE',
            peFormula: document.getElementById('peFormula').value,
            peMultiplier: parseInt(document.getElementById('peMultiplier').value) || 5,
            peAttr: document.getElementById('peAttr').value,
            peAttrMultiplier: parseInt(document.getElementById('peAttrMultiplier').value) || 2,
            
            hasSanity: document.getElementById('hasSanity').checked,
            sanityHasMax: document.getElementById('sanityHasMax').checked,
            sanityFormula: document.getElementById('sanityFormula').value,
            flatSanity: parseInt(document.getElementById('flatSanity').value) || 100,
            
            hasActionPoints: document.getElementById('hasActionPoints').checked,
            paFormula: document.getElementById('paFormula').value,
            flatPa: parseInt(document.getElementById('flatPa').value) || 3,
            
            hasFusions: document.getElementById('hasFusions').checked,
            
            caFormula: document.getElementById('caFormula').value,
            hasDodge: document.getElementById('hasDodge').checked,
            dodgeFormula: document.getElementById('dodgeFormula').value,
            
            hasClasses: document.getElementById('hasClasses').checked,
            classAffectsHp: document.getElementById('classAffectsHp').checked,
            classList: document.getElementById('classList').value,
            
            skillSystem: document.getElementById('skillSystem').value,
            skillList: document.getElementById('skillList').value,
            
            hasSpellSlots: document.getElementById('hasSpellSlots').checked
        };
        
        return {
            name: name,
            description: document.getElementById('systemDescription').value.trim(),
            icon: document.getElementById('systemIcon').value,
            isBuiltIn: false,
            config: config
        };
    },
    
    // Save system
    async saveSystem() {
        console.log('[SystemManager] saveSystem() chamado');
        const systemData = this.collectEditorData();
        console.log('[SystemManager] Dados coletados:', systemData);
        if (!systemData) {
            console.log('[SystemManager] Dados inválidos, retornando');
            return;
        }
        
        try {
            let systemId;
            if (this.currentEditingSystem) {
                // Update existing
                systemId = this.currentEditingSystem;
                systemData.id = systemId;
            } else {
                // Create new with unique ID
                systemId = 'custom_' + Date.now();
                systemData.id = systemId;
            }
            
            console.log('[SystemManager] Salvando sistema:', systemId);
            // Save to Firebase
            await API.saveCustomSystem(systemId, systemData);
            console.log('[SystemManager] Sistema salvo no Firebase');
            
            // Update local cache
            this.customSystems[systemId] = systemData;
            
            alert('Sistema salvo com sucesso!');
            this.closeEditor();
            this.showManager();
        } catch (error) {
            console.error('Erro ao salvar sistema:', error);
            alert('Erro ao salvar sistema. Tente novamente.');
        }
    },
    
    // Confirm delete system
    confirmDeleteSystem(systemId) {
        if (confirm('Tem certeza que deseja excluir este sistema? Fichas que usam este sistema podem ser afetadas.')) {
            this.deleteSystemById(systemId);
        }
    },
    
    // Delete system from editor
    async deleteSystem() {
        if (!this.currentEditingSystem) return;
        
        if (confirm('Tem certeza que deseja excluir este sistema?')) {
            await this.deleteSystemById(this.currentEditingSystem);
            this.closeEditor();
            this.showManager();
        }
    },
    
    // Delete system by ID
    async deleteSystemById(systemId) {
        try {
            await API.deleteCustomSystem(systemId);
            delete this.customSystems[systemId];
            this.renderSystemsList();
            alert('Sistema excluído com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir sistema:', error);
            alert('Erro ao excluir sistema.');
        }
    },
    
    // Close editor
    closeEditor() {
        document.getElementById('systemEditorModal').classList.add('hidden');
        this.currentEditingSystem = null;
        this.setEditorReadOnly(false);
    }
};
