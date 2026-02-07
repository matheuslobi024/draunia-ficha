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
            name: 'D&D 5e Clássico',
            description: 'Sistema completo baseado em D&D 5e: 6 atributos (FOR, DES, CON, INT, SAB, CAR), modificadores calculados automaticamente, bônus de proficiência por nível, 18 perícias, classes com dados de vida, CA, iniciativa, spell slots e regras oficiais.',
            icon: 'fa-dragon',
            isBuiltIn: true,
            config: {
                attrType: 'dnd',
                attrPointLimit: 0,
                modifierCalc: 'dnd',
                hpFormula: 'dnd',
                hasEnergyPoints: false,
                hasSanity: false,
                sanityHasMax: false,
                hasActionPoints: false,
                hasFusions: false,
                caFormula: 'dnd',
                hasDodge: false,
                hasClasses: true,
                classAffectsHp: true,
                skillSystem: 'dnd',
                skillList: 'dnd',
                hasSpellSlots: true,
                hasSavingThrows: true,
                hasProficiencyBonus: true,
                hasPassivePerception: true,
                hasAdvantageDisadvantage: true
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
    
    // Helper to toggle sections based on select value
    toggleSectionByValue(selectId, sectionMap) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        select.addEventListener('change', () => {
            Object.entries(sectionMap).forEach(([value, sectionId]) => {
                const section = document.getElementById(sectionId);
                if (section) {
                    section.classList.toggle('hidden', select.value !== value);
                }
            });
        });
    },
    
    // Helper to toggle section based on checkbox
    toggleSectionByCheckbox(checkboxId, sectionId, inverse = false) {
        const checkbox = document.getElementById(checkboxId);
        const section = document.getElementById(sectionId);
        if (!checkbox || !section) return;
        
        checkbox.addEventListener('change', () => {
            const show = inverse ? !checkbox.checked : checkbox.checked;
            section.classList.toggle('hidden', !show);
        });
    },
    
    // Bind editor form events
    bindEditorEvents() {
        // Attribute type
        this.toggleSectionByValue('attrType', { 'custom': 'customAttrsSection' });
        
        // HP formula
        const hpFormula = document.getElementById('hpFormula');
        if (hpFormula) {
            hpFormula.addEventListener('change', () => {
                document.getElementById('customHpSection')?.classList.toggle('hidden', hpFormula.value !== 'custom');
                document.getElementById('flatHpSection')?.classList.toggle('hidden', hpFormula.value !== 'flat');
                document.getElementById('levelOnlyHpSection')?.classList.toggle('hidden', hpFormula.value !== 'levelonly');
            });
        }
        
        // Energy points
        this.toggleSectionByCheckbox('hasEnergyPoints', 'energyPointsConfig');
        
        // PE formula
        const peFormula = document.getElementById('peFormula');
        if (peFormula) {
            peFormula.addEventListener('change', () => {
                document.getElementById('simplePeSection')?.classList.toggle('hidden', peFormula.value !== 'simple');
                document.getElementById('attrPeSection')?.classList.toggle('hidden', peFormula.value !== 'attr');
                document.getElementById('attrLevelPeSection')?.classList.toggle('hidden', peFormula.value !== 'attrlevel');
                document.getElementById('customPeSection')?.classList.toggle('hidden', peFormula.value !== 'custom');
            });
        }
        
        // Sanity
        this.toggleSectionByCheckbox('hasSanity', 'sanityConfig');
        this.toggleSectionByCheckbox('sanityHasMax', 'sanityMaxConfig');
        
        // Sanity formula
        const sanityFormula = document.getElementById('sanityFormula');
        if (sanityFormula) {
            sanityFormula.addEventListener('change', () => {
                document.getElementById('flatSanitySection')?.classList.toggle('hidden', sanityFormula.value !== 'flat');
                document.getElementById('attrSanitySection')?.classList.toggle('hidden', sanityFormula.value !== 'attr');
                document.getElementById('customSanitySection')?.classList.toggle('hidden', sanityFormula.value !== 'custom');
            });
        }
        
        // Action points
        this.toggleSectionByCheckbox('hasActionPoints', 'actionPointsConfig');
        
        // PA formula
        const paFormula = document.getElementById('paFormula');
        if (paFormula) {
            paFormula.addEventListener('change', () => {
                document.getElementById('flatPaSection')?.classList.toggle('hidden', paFormula.value !== 'flat');
                document.getElementById('attrPaSection')?.classList.toggle('hidden', paFormula.value !== 'attr');
                document.getElementById('customPaSection')?.classList.toggle('hidden', paFormula.value !== 'custom');
            });
        }
        
        // Fusões
        this.toggleSectionByCheckbox('hasFusions', 'fusionsConfig');
        
        // CA formula
        const caFormula = document.getElementById('caFormula');
        if (caFormula) {
            caFormula.addEventListener('change', () => {
                document.getElementById('flatBaseCaSection')?.classList.toggle('hidden', caFormula.value !== 'flatbase');
                document.getElementById('customCaSection')?.classList.toggle('hidden', caFormula.value !== 'custom');
            });
        }
        
        // Dodge
        this.toggleSectionByCheckbox('hasDodge', 'dodgeConfig');
        
        // Dodge formula
        const dodgeFormula = document.getElementById('dodgeFormula');
        if (dodgeFormula) {
            dodgeFormula.addEventListener('change', () => {
                document.getElementById('customDodgeSection')?.classList.toggle('hidden', dodgeFormula.value !== 'custom');
            });
        }
        
        // Initiative formula
        const initFormula = document.getElementById('initiativeFormula');
        if (initFormula) {
            initFormula.addEventListener('change', () => {
                document.getElementById('skillInitSection')?.classList.toggle('hidden', initFormula.value !== 'skill');
                document.getElementById('customInitSection')?.classList.toggle('hidden', initFormula.value !== 'custom');
            });
        }
        
        // Saving throws
        this.toggleSectionByCheckbox('hasSavingThrows', 'savingThrowsConfig');
        
        // Classes
        this.toggleSectionByCheckbox('hasClasses', 'classesConfig');
        
        // Class list type
        const classListType = document.getElementById('classListType');
        if (classListType) {
            classListType.addEventListener('change', () => {
                document.getElementById('customClassSection')?.classList.toggle('hidden', classListType.value !== 'custom');
            });
        }
        
        // Skill system
        const skillSystem = document.getElementById('skillSystem');
        if (skillSystem) {
            skillSystem.addEventListener('change', () => {
                document.getElementById('ranksConfig')?.classList.toggle('hidden', skillSystem.value !== 'ranks');
            });
        }
        
        // Skill list
        const skillList = document.getElementById('skillList');
        if (skillList) {
            skillList.addEventListener('change', () => {
                document.getElementById('customSkillSection')?.classList.toggle('hidden', skillList.value !== 'custom');
            });
        }
        
        // Spell slots
        this.toggleSectionByCheckbox('hasSpellSlots', 'spellSlotsConfig');
        
        // Collapsible sections
        document.querySelectorAll('.system-section.collapsible .section-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const section = toggle.closest('.system-section');
                const content = section.querySelector('.section-content');
                section.classList.toggle('open');
                content?.classList.toggle('hidden');
            });
        });
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
        console.log('[SystemManager] closeManager() chamado');
        const managerModal = document.getElementById('systemsManagerModal');
        const charModal = document.getElementById('characterModal');
        console.log('[SystemManager] managerModal:', managerModal);
        console.log('[SystemManager] charModal:', charModal);
        if (managerModal) managerModal.classList.add('hidden');
        if (charModal) charModal.classList.remove('hidden');
        console.log('[SystemManager] Voltou para characterModal');
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
            features.push('Modificadores D&D ((attr-10)/2)');
        }
        
        if (config.hasFusions) features.push('Fusões');
        if (config.hasActionPoints) features.push('Pontos de Ação (PA)');
        if (config.hasEnergyPoints) features.push(`${config.energyName || 'PE'}`);
        if (config.hasSanity) features.push('Sanidade');
        if (config.hasClasses) features.push('Classes com Dados de Vida');
        if (config.hasSpellSlots) features.push('Espaços de Magia');
        if (config.hasProficiencyBonus) features.push('Bônus de Proficiência');
        if (config.hasSavingThrows) features.push('Testes de Resistência');
        if (config.hasPassivePerception) features.push('Percepção Passiva');
        if (config.skillSystem === 'dnd') features.push('18 Perícias D&D');
        
        if (features.length === 0) return '';
        
        return `
            <ul class="system-features">
                ${features.slice(0, 6).map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
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
        
        // Basic info
        this.setVal('systemName', '');
        this.setVal('systemDescription', '');
        this.setVal('systemIcon', 'fa-dice-d20');
        
        // Attributes
        this.setVal('attrType', 'realsscripts');
        this.setVal('attrPointLimit', '8');
        this.setVal('attrMinValue', '1');
        this.setVal('attrMaxValue', '10');
        this.setVal('modifierCalc', 'direct');
        this.setVal('customAttrs', '');
        
        // HP
        this.setVal('hpFormula', 'realsscripts');
        this.setVal('customHpFormula', '');
        this.setVal('flatHpBase', '10');
        this.setVal('flatHpPerLevel', '5');
        this.setVal('hpPerLevel', '6');
        
        // Energy points
        this.setChecked('hasEnergyPoints', true);
        this.setVal('energyName', 'PE');
        this.setVal('peFormula', 'simple');
        this.setVal('peMultiplier', '5');
        this.setVal('peAttr', 'von');
        this.setVal('peAttrMultiplier', '2');
        this.setVal('peLevelAttr', 'von');
        this.setVal('peLevelAttrMultiplier', '1');
        this.setVal('peLevelMultiplier', '5');
        this.setVal('customPeFormula', '');
        this.setChecked('peRegenPerRest', false);
        
        // Sanity
        this.setChecked('hasSanity', true);
        this.setVal('sanityName', 'Sanidade');
        this.setChecked('sanityHasMax', false);
        this.setVal('sanityFormula', 'flat');
        this.setVal('flatSanity', '100');
        this.setVal('sanityAttr', 'von');
        this.setVal('sanityAttrMultiplier', '10');
        this.setVal('customSanityFormula', '');
        this.setChecked('sanityCanGoNegative', false);
        
        // Action points
        this.setChecked('hasActionPoints', false);
        this.setVal('paName', 'PA');
        this.setVal('paFormula', 'flat');
        this.setVal('flatPa', '3');
        this.setVal('paAttr', 'agi');
        this.setVal('paBase', '4');
        this.setVal('customPaFormula', '');
        this.setChecked('paAffectedByArmor', false);
        
        // Fusões
        this.setChecked('hasFusions', false);
        this.setVal('fusionTypes', 'Arcana,Divina,Natural,Sombria');
        
        // Combat
        this.setVal('caFormula', 'base10agi');
        this.setVal('caBase', '10');
        this.setVal('caAttr', 'agi');
        this.setVal('customCaFormula', '');
        
        this.setChecked('hasDodge', false);
        this.setVal('dodgeFormula', 'agi');
        this.setVal('dodgeAttr', 'agi');
        this.setVal('customDodgeFormula', '');
        
        this.setVal('initiativeFormula', 'attr');
        this.setVal('initiativeAttr', 'agi');
        this.setVal('initSkill', '');
        this.setVal('customInitFormula', '');
        
        this.setChecked('hasSavingThrows', false);
        this.setVal('savingThrowType', 'three');
        
        // Classes
        this.setChecked('hasClasses', false);
        this.setChecked('classAffectsHp', false);
        this.setChecked('classAffectsSpellcasting', false);
        this.setChecked('allowMulticlass', false);
        this.setVal('classListType', 'freeform');
        this.setVal('classList', '');
        
        // Skills
        this.setVal('skillSystem', 'points');
        this.setVal('skillPointsPerLevel', '4');
        this.setVal('skillPointsAttr', 'int');
        this.setVal('skillList', 'realsscripts');
        this.setVal('customSkillList', '');
        
        // Magic
        this.setChecked('hasSpellSlots', false);
        this.setVal('spellSlotSystem', 'dnd');
        this.setVal('maxSpellLevel', '9');
        this.setChecked('hasCantrips', false);
        this.setChecked('hasRituals', false);
        
        // Advanced
        this.setChecked('hasEncumbrance', false);
        this.setChecked('hasAdvantage', false);
        this.setChecked('hasInspiration', false);
        this.setChecked('hasDeathSaves', false);
        this.setVal('shortRestRestore', 'hitdice');
        this.setVal('longRestRestore', 'full');
        
        // Hide all conditional sections
        const hiddenSections = [
            'customAttrsSection', 'customHpSection', 'flatHpSection', 'levelOnlyHpSection',
            'simplePeSection', 'attrPeSection', 'attrLevelPeSection', 'customPeSection',
            'sanityMaxConfig', 'flatSanitySection', 'attrSanitySection', 'customSanitySection',
            'actionPointsConfig', 'flatPaSection', 'attrPaSection', 'customPaSection',
            'fusionsConfig', 'flatBaseCaSection', 'customCaSection',
            'dodgeConfig', 'customDodgeSection', 'skillInitSection', 'customInitSection',
            'savingThrowsConfig', 'classesConfig', 'customClassSection',
            'ranksConfig', 'customSkillSection', 'spellSlotsConfig'
        ];
        hiddenSections.forEach(id => this.showSection(id, false));
        
        // Show sections that should be visible by default
        this.showSection('energyPointsConfig', true);
        this.showSection('sanityConfig', true);
    },

    // Helper functions for form manipulation
    // Helper to set value safely
    setVal(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value;
    },
    
    setChecked(id, value) {
        const el = document.getElementById(id);
        if (el) el.checked = !!value;
    },
    
    showSection(id, show = true) {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('hidden', !show);
    },
    
    loadSystemIntoEditor(system) {
        this.resetEditorForm();
        
        const c = system.config || {};
        
        this.setVal('systemName', system.name || '');
        this.setVal('systemDescription', system.description || '');
        this.setVal('systemIcon', system.icon || 'fa-dice-d20');
        
        // Attributes
        this.setVal('attrType', c.attrType || 'realsscripts');
        this.setVal('attrPointLimit', c.attrPointLimit || 8);
        this.setVal('attrMinValue', c.attrMinValue || 1);
        this.setVal('attrMaxValue', c.attrMaxValue || 10);
        this.setVal('modifierCalc', c.modifierCalc || 'direct');
        this.setVal('customAttrs', c.customAttrs || '');
        this.showSection('customAttrsSection', c.attrType === 'custom');
        
        // HP
        this.setVal('hpFormula', c.hpFormula || 'realsscripts');
        this.setVal('customHpFormula', c.customHpFormula || '');
        this.setVal('flatHpBase', c.flatHpBase || 10);
        this.setVal('flatHpPerLevel', c.flatHpPerLevel || 5);
        this.setVal('hpPerLevel', c.hpPerLevel || 6);
        this.showSection('customHpSection', c.hpFormula === 'custom');
        this.showSection('flatHpSection', c.hpFormula === 'flat');
        this.showSection('levelOnlyHpSection', c.hpFormula === 'levelonly');
        
        // Energy Points
        this.setChecked('hasEnergyPoints', c.hasEnergyPoints !== false);
        this.showSection('energyPointsConfig', c.hasEnergyPoints !== false);
        this.setVal('energyName', c.energyName || 'PE');
        this.setVal('peFormula', c.peFormula || 'simple');
        this.setVal('peMultiplier', c.peMultiplier || 5);
        this.setVal('peAttr', c.peAttr || 'von');
        this.setVal('peAttrMultiplier', c.peAttrMultiplier || 2);
        this.setVal('peLevelAttr', c.peLevelAttr || 'von');
        this.setVal('peLevelAttrMultiplier', c.peLevelAttrMultiplier || 1);
        this.setVal('peLevelMultiplier', c.peLevelMultiplier || 5);
        this.setVal('customPeFormula', c.customPeFormula || '');
        this.setChecked('peRegenPerRest', c.peRegenPerRest);
        this.showSection('simplePeSection', c.peFormula === 'simple');
        this.showSection('attrPeSection', c.peFormula === 'attr');
        this.showSection('attrLevelPeSection', c.peFormula === 'attrlevel');
        this.showSection('customPeSection', c.peFormula === 'custom');
        
        // Sanity
        this.setChecked('hasSanity', c.hasSanity !== false);
        this.showSection('sanityConfig', c.hasSanity !== false);
        this.setVal('sanityName', c.sanityName || 'Sanidade');
        this.setChecked('sanityHasMax', c.sanityHasMax);
        this.showSection('sanityMaxConfig', c.sanityHasMax);
        this.setVal('sanityFormula', c.sanityFormula || 'flat');
        this.setVal('flatSanity', c.flatSanity || 100);
        this.setVal('sanityAttr', c.sanityAttr || 'von');
        this.setVal('sanityAttrMultiplier', c.sanityAttrMultiplier || 10);
        this.setVal('customSanityFormula', c.customSanityFormula || '');
        this.setChecked('sanityCanGoNegative', c.sanityCanGoNegative);
        this.showSection('flatSanitySection', c.sanityFormula === 'flat');
        this.showSection('attrSanitySection', c.sanityFormula === 'attr');
        this.showSection('customSanitySection', c.sanityFormula === 'custom');
        
        // Action Points
        this.setChecked('hasActionPoints', c.hasActionPoints);
        this.showSection('actionPointsConfig', c.hasActionPoints);
        this.setVal('paName', c.paName || 'PA');
        this.setVal('paFormula', c.paFormula || 'flat');
        this.setVal('flatPa', c.flatPa || 3);
        this.setVal('paAttr', c.paAttr || 'agi');
        this.setVal('paBase', c.paBase || 4);
        this.setVal('customPaFormula', c.customPaFormula || '');
        this.setChecked('paAffectedByArmor', c.paAffectedByArmor);
        this.showSection('flatPaSection', c.paFormula === 'flat');
        this.showSection('attrPaSection', c.paFormula === 'attr');
        this.showSection('customPaSection', c.paFormula === 'custom');
        
        // Fusions
        this.setChecked('hasFusions', c.hasFusions);
        this.showSection('fusionsConfig', c.hasFusions);
        this.setVal('fusionTypes', c.fusionTypes || 'Arcana,Divina,Natural,Sombria');
        
        // Combat - CA
        this.setVal('caFormula', c.caFormula || 'base10agi');
        this.setVal('caBase', c.caBase || 10);
        this.setVal('caAttr', c.caAttr || 'agi');
        this.setVal('customCaFormula', c.customCaFormula || '');
        this.showSection('flatBaseCaSection', c.caFormula === 'flatbase');
        this.showSection('customCaSection', c.caFormula === 'custom');
        
        // Combat - Dodge
        this.setChecked('hasDodge', c.hasDodge);
        this.showSection('dodgeConfig', c.hasDodge);
        this.setVal('dodgeFormula', c.dodgeFormula || 'agi');
        this.setVal('dodgeAttr', c.dodgeAttr || 'agi');
        this.setVal('customDodgeFormula', c.customDodgeFormula || '');
        this.showSection('customDodgeSection', c.dodgeFormula === 'custom');
        
        // Combat - Initiative
        this.setVal('initiativeFormula', c.initiativeFormula || 'attr');
        this.setVal('initiativeAttr', c.initiativeAttr || 'agi');
        this.setVal('initSkill', c.initSkill || '');
        this.setVal('customInitFormula', c.customInitFormula || '');
        this.showSection('skillInitSection', c.initiativeFormula === 'skill');
        this.showSection('customInitSection', c.initiativeFormula === 'custom');
        
        // Combat - Saving Throws
        this.setChecked('hasSavingThrows', c.hasSavingThrows);
        this.showSection('savingThrowsConfig', c.hasSavingThrows);
        this.setVal('savingThrowType', c.savingThrowType || 'three');
        
        // Classes
        this.setChecked('hasClasses', c.hasClasses);
        this.showSection('classesConfig', c.hasClasses);
        this.setChecked('classAffectsHp', c.classAffectsHp);
        this.setChecked('classAffectsSpellcasting', c.classAffectsSpellcasting);
        this.setChecked('allowMulticlass', c.allowMulticlass);
        this.setVal('classListType', c.classListType || 'freeform');
        this.setVal('classList', c.classList || '');
        this.showSection('customClassSection', c.classListType === 'custom');
        
        // Skills
        this.setVal('skillSystem', c.skillSystem || 'points');
        this.setVal('skillPointsPerLevel', c.skillPointsPerLevel || 4);
        this.setVal('skillPointsAttr', c.skillPointsAttr || 'int');
        this.showSection('ranksConfig', c.skillSystem === 'ranks');
        this.setVal('skillList', c.skillList || 'realsscripts');
        this.setVal('customSkillList', c.customSkillList || '');
        this.showSection('customSkillSection', c.skillList === 'custom');
        
        // Magic
        this.setChecked('hasSpellSlots', c.hasSpellSlots);
        this.showSection('spellSlotsConfig', c.hasSpellSlots);
        this.setVal('spellSlotSystem', c.spellSlotSystem || 'dnd');
        this.setVal('maxSpellLevel', c.maxSpellLevel || 9);
        this.setChecked('hasCantrips', c.hasCantrips);
        this.setChecked('hasRituals', c.hasRituals);
        
        // Advanced options
        this.setChecked('hasEncumbrance', c.hasEncumbrance);
        this.setChecked('hasAdvantage', c.hasAdvantage);
        this.setChecked('hasInspiration', c.hasInspiration);
        this.setChecked('hasDeathSaves', c.hasDeathSaves);
        this.setVal('shortRestRestore', c.shortRestRestore || 'hitdice');
        this.setVal('longRestRestore', c.longRestRestore || 'full');
    },
    // Helper to get value safely
    getVal(id, fallback = '') {
        const el = document.getElementById(id);
        return el ? el.value : fallback;
    },
    
    getChecked(id, fallback = false) {
        const el = document.getElementById(id);
        return el ? el.checked : fallback;
    },
    
    getNum(id, fallback = 0) {
        const el = document.getElementById(id);
        return el ? (parseInt(el.value) || fallback) : fallback;
    },
    
    collectEditorData() {
        const name = document.getElementById('systemName')?.value.trim();
        if (!name) {
            alert('Por favor, insira um nome para o sistema.');
            return null;
        }
        
        const config = {
            // Atributos
            attrType: this.getVal('attrType', 'realsscripts'),
            attrPointLimit: this.getNum('attrPointLimit', 0),
            attrMinValue: this.getNum('attrMinValue', 1),
            attrMaxValue: this.getNum('attrMaxValue', 10),
            modifierCalc: this.getVal('modifierCalc', 'subtract5'),
            customAttrs: this.getVal('customAttrs'),
            
            // HP
            hpFormula: this.getVal('hpFormula', 'levelcon'),
            customHpFormula: this.getVal('customHpFormula'),
            flatHpBase: this.getNum('flatHpBase', 10),
            flatHpPerLevel: this.getNum('flatHpPerLevel', 5),
            hpPerLevel: this.getNum('hpPerLevel', 6),
            
            // Energy points
            hasEnergyPoints: this.getChecked('hasEnergyPoints'),
            energyName: this.getVal('energyName', 'PE'),
            peFormula: this.getVal('peFormula', 'simple'),
            peMultiplier: this.getNum('peMultiplier', 5),
            peAttr: this.getVal('peAttr', 'von'),
            peAttrMultiplier: this.getNum('peAttrMultiplier', 2),
            peLevelAttr: this.getVal('peLevelAttr', 'von'),
            peLevelAttrMultiplier: this.getNum('peLevelAttrMultiplier', 1),
            peLevelMultiplier: this.getNum('peLevelMultiplier', 5),
            customPeFormula: this.getVal('customPeFormula'),
            peRegenPerRest: this.getChecked('peRegenPerRest'),
            
            // Sanity
            hasSanity: this.getChecked('hasSanity'),
            sanityName: this.getVal('sanityName', 'Sanidade'),
            sanityHasMax: this.getChecked('sanityHasMax'),
            sanityFormula: this.getVal('sanityFormula', 'flat'),
            flatSanity: this.getNum('flatSanity', 100),
            sanityAttr: this.getVal('sanityAttr', 'von'),
            sanityAttrMultiplier: this.getNum('sanityAttrMultiplier', 10),
            customSanityFormula: this.getVal('customSanityFormula'),
            sanityCanGoNegative: this.getChecked('sanityCanGoNegative'),
            
            // Action points
            hasActionPoints: this.getChecked('hasActionPoints'),
            paName: this.getVal('paName', 'PA'),
            paFormula: this.getVal('paFormula', 'flat'),
            flatPa: this.getNum('flatPa', 3),
            paAttr: this.getVal('paAttr', 'agi'),
            paBase: this.getNum('paBase', 4),
            customPaFormula: this.getVal('customPaFormula'),
            paAffectedByArmor: this.getChecked('paAffectedByArmor'),
            
            // Fusões
            hasFusions: this.getChecked('hasFusions'),
            fusionTypes: this.getVal('fusionTypes', 'Arcana,Divina,Natural,Sombria'),
            
            // Combat
            caFormula: this.getVal('caFormula', 'base10agi'),
            caBase: this.getNum('caBase', 10),
            caAttr: this.getVal('caAttr', 'agi'),
            customCaFormula: this.getVal('customCaFormula'),
            
            hasDodge: this.getChecked('hasDodge'),
            dodgeFormula: this.getVal('dodgeFormula', 'agi'),
            dodgeAttr: this.getVal('dodgeAttr', 'agi'),
            customDodgeFormula: this.getVal('customDodgeFormula'),
            
            initiativeFormula: this.getVal('initiativeFormula', 'attr'),
            initiativeAttr: this.getVal('initiativeAttr', 'agi'),
            initSkill: this.getVal('initSkill'),
            customInitFormula: this.getVal('customInitFormula'),
            
            hasSavingThrows: this.getChecked('hasSavingThrows'),
            savingThrowType: this.getVal('savingThrowType', 'three'),
            
            // Classes
            hasClasses: this.getChecked('hasClasses'),
            classAffectsHp: this.getChecked('classAffectsHp'),
            classAffectsSpellcasting: this.getChecked('classAffectsSpellcasting'),
            allowMulticlass: this.getChecked('allowMulticlass'),
            classListType: this.getVal('classListType', 'freeform'),
            classList: this.getVal('classList'),
            
            // Skills
            skillSystem: this.getVal('skillSystem', 'points'),
            skillPointsPerLevel: this.getNum('skillPointsPerLevel', 5),
            skillPointsAttr: this.getVal('skillPointsAttr', 'int'),
            skillList: this.getVal('skillList', 'realsscripts'),
            customSkillList: this.getVal('customSkillList'),
            
            // Magic
            hasSpellSlots: this.getChecked('hasSpellSlots'),
            spellSlotSystem: this.getVal('spellSlotSystem', 'dnd'),
            maxSpellLevel: this.getNum('maxSpellLevel', 9),
            hasCantrips: this.getChecked('hasCantrips'),
            hasRituals: this.getChecked('hasRituals'),
            
            // Advanced options
            hasEncumbrance: this.getChecked('hasEncumbrance'),
            hasAdvantage: this.getChecked('hasAdvantage'),
            hasInspiration: this.getChecked('hasInspiration'),
            hasDeathSaves: this.getChecked('hasDeathSaves'),
            shortRestRestore: this.getVal('shortRestRestore', 'hitdice'),
            longRestRestore: this.getVal('longRestRestore', 'full')
        };
        
        return {
            name: name,
            description: (document.getElementById('systemDescription')?.value || '').trim(),
            icon: this.getVal('systemIcon', 'fa-dice-d20'),
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
        console.log('[SystemManager] closeEditor() chamado');
        document.getElementById('systemEditorModal').classList.add('hidden');
        this.currentEditingSystem = null;
        this.setEditorReadOnly(false);
        // Sempre volta pro manager de sistemas
        this.showManager();
    },
    
    // Back to character modal (for Voltar button in manager)
    backToCharacters() {
        console.log('[SystemManager] backToCharacters() chamado');
        document.getElementById('systemsManagerModal').classList.add('hidden');
        document.getElementById('systemSelectModal').classList.add('hidden');
        document.getElementById('systemEditorModal').classList.add('hidden');
        document.getElementById('characterModal').classList.remove('hidden');
    }
};
