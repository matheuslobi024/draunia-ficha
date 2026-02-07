// ========== SYSTEM EDITOR MODULE ==========
// Full-screen system editor with multiple panels

const SystemEditor = {
    currentSystem: null,
    isNewSystem: true,
    hasUnsavedChanges: false,
    
    // Default system template
    defaultTemplate: {
        id: '',
        name: '',
        description: '',
        version: '1.0',
        icon: 'fa-dice-d20',
        isBuiltIn: false,
        config: {
            // Attributes
            attrType: 'realsscripts',
            customAttrs: [],
            modifierCalc: 'direct',
            attrMin: 1,
            attrMax: 20,
            attrPointLimit: 0,
            
            // HP
            hpFormula: 'realsscripts',
            hpBase: 10,
            hpPerLevel: 5,
            customHpFormula: '',
            
            // PE
            hasEnergyPoints: true,
            energyName: 'PE',
            peFormula: 'realsscripts',
            customPeFormula: '',
            
            // Sanity
            hasSanity: true,
            sanityName: 'Sanidade',
            sanityHasMax: false,
            sanityFormula: 'flat',
            
            // PA
            hasActionPoints: false,
            paName: 'PA',
            paFormula: 'realsscripts',
            
            // Combat
            caFormula: 'realsscripts',
            hasDodge: false,
            dodgeFormula: 'realsscripts',
            initiativeFormula: 'agi',
            hasSavingThrows: false,
            saveType: 'dnd',
            hasFusions: false,
            
            // Classes
            hasClasses: false,
            classAffectsHP: true,
            allowMulticlass: false,
            classes: [],
            
            // Races
            hasRaces: true,
            races: [],
            
            // Skills
            skillSystem: 'realsscripts',
            skills: [],
            
            // Magic
            hasMagic: false,
            magicSystem: 'dnd',
            hasCantrips: true,
            spellAttr: 'int',
            maxSpellLevel: 9,
            
            // Fields
            fieldRace: true,
            fieldClass: false,
            fieldBackground: true,
            fieldWeight: true,
            fieldAttacks: true
        }
    },
    
    // Initialize editor
    init() {
        this.bindNavigation();
        this.bindTabs();
        this.bindToggles();
        this.bindIconPicker();
        console.log('[SystemEditor] Initialized');
    },
    
    // Bind sidebar navigation
    bindNavigation() {
        document.querySelectorAll('.sys-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const panel = item.dataset.panel;
                this.navigateToPanel(panel);
            });
        });
    },
    
    // Navigate to a panel
    navigateToPanel(panelId) {
        // Update nav
        document.querySelectorAll('.sys-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.panel === panelId);
        });
        
        // Update panels
        document.querySelectorAll('.sys-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === 'panel-' + panelId);
        });
    },
    
    // Bind tab switching within panels
    bindTabs() {
        // Resource tabs
        document.querySelectorAll('[data-restab]').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.restab;
                document.querySelectorAll('[data-restab]').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('[id^="restab-"]').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('restab-' + tabId)?.classList.add('active');
            });
        });
        
        // Combat tabs
        document.querySelectorAll('[data-combtab]').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.combtab;
                document.querySelectorAll('[data-combtab]').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('[id^="combtab-"]').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('combtab-' + tabId)?.classList.add('active');
            });
        });
    },
    
    // Bind toggle switches
    bindToggles() {
        // PE toggle
        const hasPE = document.getElementById('sysHasPE');
        if (hasPE) {
            hasPE.addEventListener('change', () => {
                document.getElementById('sysPEConfig')?.classList.toggle('hidden', !hasPE.checked);
            });
        }
        
        // Sanity toggle
        const hasSanity = document.getElementById('sysHasSanity');
        if (hasSanity) {
            hasSanity.addEventListener('change', () => {
                document.getElementById('sysSanityConfig')?.classList.toggle('hidden', !hasSanity.checked);
            });
        }
        
        // Sanity max toggle
        const sanityMax = document.getElementById('sysSanityHasMax');
        if (sanityMax) {
            sanityMax.addEventListener('change', () => {
                document.getElementById('sysSanityMaxConfig')?.classList.toggle('hidden', !sanityMax.checked);
            });
        }
        
        // PA toggle
        const hasPA = document.getElementById('sysHasPA');
        if (hasPA) {
            hasPA.addEventListener('change', () => {
                document.getElementById('sysPAConfig')?.classList.toggle('hidden', !hasPA.checked);
            });
        }
        
        // Classes toggle
        const hasClasses = document.getElementById('sysHasClasses');
        if (hasClasses) {
            hasClasses.addEventListener('change', () => {
                document.getElementById('sysClassesConfig')?.classList.toggle('hidden', !hasClasses.checked);
                document.getElementById('sysClassesListSection').style.display = hasClasses.checked ? 'block' : 'none';
            });
        }
        
        // Dodge toggle
        const hasDodge = document.getElementById('sysHasDodge');
        if (hasDodge) {
            hasDodge.addEventListener('change', () => {
                document.getElementById('sysDodgeConfig')?.classList.toggle('hidden', !hasDodge.checked);
            });
        }
        
        // Saves toggle
        const hasSaves = document.getElementById('sysHasSaves');
        if (hasSaves) {
            hasSaves.addEventListener('change', () => {
                document.getElementById('sysSavesConfig')?.classList.toggle('hidden', !hasSaves.checked);
            });
        }
        
        // Fusions toggle
        const hasFusions = document.getElementById('sysHasFusions');
        if (hasFusions) {
            hasFusions.addEventListener('change', () => {
                document.getElementById('sysFusionsConfig')?.classList.toggle('hidden', !hasFusions.checked);
            });
        }
        
        // Magic toggle
        const hasMagic = document.getElementById('sysHasMagic');
        if (hasMagic) {
            hasMagic.addEventListener('change', () => {
                document.getElementById('sysMagicConfig')?.classList.toggle('hidden', !hasMagic.checked);
            });
        }
        
        // HP formula change
        const hpFormula = document.getElementById('sysHpFormula');
        if (hpFormula) {
            hpFormula.addEventListener('change', () => {
                document.getElementById('sysHpCustom')?.classList.toggle('hidden', hpFormula.value !== 'custom');
                document.getElementById('sysHpFlat')?.classList.toggle('hidden', hpFormula.value !== 'flat');
            });
        }
        
        // PE formula change
        const peFormula = document.getElementById('sysPEFormula');
        if (peFormula) {
            peFormula.addEventListener('change', () => {
                document.getElementById('sysPECustom')?.classList.toggle('hidden', peFormula.value !== 'custom');
            });
        }
        
        // Modifier calc change
        const modCalc = document.getElementById('sysModifierCalc');
        if (modCalc) {
            modCalc.addEventListener('change', () => {
                document.getElementById('sysCustomModSection')?.classList.toggle('hidden', modCalc.value !== 'custom');
            });
        }
        
        // CA formula change
        const caFormula = document.getElementById('sysCAFormula');
        if (caFormula) {
            caFormula.addEventListener('change', () => {
                document.getElementById('sysCACustom')?.classList.toggle('hidden', caFormula.value !== 'custom');
            });
        }
        
        // Dodge formula change
        const dodgeFormula = document.getElementById('sysDodgeFormula');
        if (dodgeFormula) {
            dodgeFormula.addEventListener('change', () => {
                document.getElementById('sysDodgeCustom')?.classList.toggle('hidden', dodgeFormula.value !== 'custom');
            });
        }
        
        // Initiative formula change
        const initFormula = document.getElementById('sysInitFormula');
        if (initFormula) {
            initFormula.addEventListener('change', () => {
                document.getElementById('sysInitCustom')?.classList.toggle('hidden', initFormula.value !== 'custom');
            });
        }
    },
    
    // Bind icon picker
    bindIconPicker() {
        document.querySelectorAll('.sys-icon-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.sys-icon-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                this.hasUnsavedChanges = true;
            });
        });
    },
    
    // Open editor for new system
    createNew() {
        this.isNewSystem = true;
        this.currentSystem = JSON.parse(JSON.stringify(this.defaultTemplate));
        this.currentSystem.id = 'custom_' + Date.now();
        
        document.getElementById('sysEditingName').textContent = 'Novo Sistema';
        document.getElementById('sysDeleteBtn').style.display = 'none';
        
        this.loadSystemToForm();
        this.show();
        this.navigateToPanel('basic');
        
        console.log('[SystemEditor] Creating new system');
    },
    
    // Open editor for existing system
    editSystem(systemId) {
        const system = SystemManager.getSystem(systemId);
        if (!system) {
            console.error('[SystemEditor] System not found:', systemId);
            return;
        }
        
        if (system.isBuiltIn) {
            alert('Sistemas padrão não podem ser editados. Crie uma cópia personalizada.');
            return;
        }
        
        this.isNewSystem = false;
        this.currentSystem = JSON.parse(JSON.stringify(system));
        
        document.getElementById('sysEditingName').textContent = system.name;
        document.getElementById('sysDeleteBtn').style.display = 'block';
        
        this.loadSystemToForm();
        this.show();
        this.navigateToPanel('overview');
        
        console.log('[SystemEditor] Editing system:', systemId);
    },
    
    // View system (read-only for built-in)
    viewSystem(systemId) {
        const system = SystemManager.getSystem(systemId);
        if (!system) return;
        
        this.currentSystem = JSON.parse(JSON.stringify(system));
        this.isNewSystem = false;
        
        document.getElementById('sysEditingName').textContent = system.name + ' (Somente Leitura)';
        document.getElementById('sysDeleteBtn').style.display = 'none';
        
        this.loadSystemToForm();
        this.show();
        this.navigateToPanel('overview');
    },
    
    // Load system data to form
    loadSystemToForm() {
        const sys = this.currentSystem;
        const cfg = sys.config || {};
        
        // Basic info
        this.setVal('sysName', sys.name);
        this.setVal('sysDescription', sys.description);
        this.setVal('sysVersion', sys.version || '1.0');
        
        // Icon
        this.selectIcon(sys.icon || 'fa-dice-d20');
        
        // Attributes
        this.setVal('sysAttrPreset', cfg.attrType || 'realsscripts');
        this.setVal('sysModifierCalc', cfg.modifierCalc || 'direct');
        this.setVal('sysAttrMin', cfg.attrMin || 1);
        this.setVal('sysAttrMax', cfg.attrMax || 20);
        this.setVal('sysAttrPointLimit', cfg.attrPointLimit || 0);
        
        // Load custom attributes if any
        if (cfg.attrType === 'custom' && cfg.customAttrs) {
            this.renderAttrsTable(cfg.customAttrs);
        }
        // Trigger preset change to show/hide section
        this.onAttrPresetChange();
        
        // HP
        this.setVal('sysHpFormula', cfg.hpFormula || 'realsscripts');
        this.setVal('sysHpBase', cfg.hpBase || 10);
        this.setVal('sysHpPerLevel', cfg.hpPerLevel || 5);
        
        // PE
        this.setChecked('sysHasPE', cfg.hasEnergyPoints !== false);
        this.setVal('sysPEName', cfg.energyName || 'PE');
        this.setVal('sysPEFormula', cfg.peFormula || 'realsscripts');
        
        // Sanity
        this.setChecked('sysHasSanity', cfg.hasSanity !== false);
        this.setVal('sysSanityName', cfg.sanityName || 'Sanidade');
        this.setChecked('sysSanityHasMax', cfg.sanityHasMax === true);
        
        // PA
        this.setChecked('sysHasPA', cfg.hasActionPoints === true);
        this.setVal('sysPAName', cfg.paName || 'PA');
        this.setVal('sysPAFormula', cfg.paFormula || 'realsscripts');
        
        // Combat
        this.setVal('sysCAFormula', cfg.caFormula || 'realsscripts');
        this.setVal('sysCACustomFormula', cfg.caCustomFormula || '');
        this.setChecked('sysHasDodge', cfg.hasDodge === true);
        this.setVal('sysDodgeFormula', cfg.dodgeFormula || 'realsscripts');
        this.setVal('sysDodgeCustomFormula', cfg.dodgeCustomFormula || '');
        this.setVal('sysInitFormula', cfg.initiativeFormula || 'agi');
        this.setVal('sysInitCustomFormula', cfg.initCustomFormula || '');
        this.setChecked('sysHasSaves', cfg.hasSavingThrows === true);
        this.setChecked('sysHasFusions', cfg.hasFusions === true);
        
        // Classes
        this.setChecked('sysHasClasses', cfg.hasClasses === true);
        this.setChecked('sysClassAffectsHP', cfg.classAffectsHP !== false);
        this.setChecked('sysAllowMulticlass', cfg.allowMulticlass === true);
        this.renderClassesTable(cfg.classes || []);
        
        // Races
        this.setChecked('sysHasRaces', cfg.hasRaces !== false);
        this.renderRacesTable(cfg.races || []);
        
        // Skills
        this.setVal('sysSkillSystem', cfg.skillSystem || 'realsscripts');
        this.renderSkillsTable(cfg.skills || []);
        
        // Magic
        this.setChecked('sysHasMagic', cfg.hasMagic === true);
        this.setVal('sysMagicSystem', cfg.magicSystem || 'dnd');
        this.setChecked('sysHasCantrips', cfg.hasCantrips !== false);
        this.setVal('sysSpellAttr', cfg.spellAttr || 'int');
        this.setVal('sysMaxSpellLevel', cfg.maxSpellLevel || 9);
        
        // Fields
        this.setChecked('sysFieldRace', cfg.fieldRace !== false);
        this.setChecked('sysFieldClass', cfg.fieldClass === true);
        this.setChecked('sysFieldBackground', cfg.fieldBackground !== false);
        this.setChecked('sysFieldWeight', cfg.fieldWeight !== false);
        this.setChecked('sysFieldAttacks', cfg.fieldAttacks !== false);
        
        // Trigger toggle visibility
        this.refreshToggles();
        
        // Update overview
        this.updateOverview();
        
        this.hasUnsavedChanges = false;
    },
    
    // Collect form data to system object
    collectFormData() {
        const sys = this.currentSystem;
        
        // Basic info
        sys.name = this.getVal('sysName') || 'Sistema Sem Nome';
        sys.description = this.getVal('sysDescription') || '';
        sys.version = this.getVal('sysVersion') || '1.0';
        sys.icon = this.getSelectedIcon();
        
        // Config
        const cfg = sys.config;
        
        // Attributes
        cfg.attrType = this.getVal('sysAttrPreset');
        cfg.modifierCalc = this.getVal('sysModifierCalc');
        cfg.attrMin = parseInt(this.getVal('sysAttrMin')) || 1;
        cfg.attrMax = parseInt(this.getVal('sysAttrMax')) || 20;
        cfg.attrPointLimit = parseInt(this.getVal('sysAttrPointLimit')) || 0;
        cfg.customAttrs = this.collectAttrsTable();
        
        // HP
        cfg.hpFormula = this.getVal('sysHpFormula');
        cfg.hpBase = parseInt(this.getVal('sysHpBase')) || 10;
        cfg.hpPerLevel = parseInt(this.getVal('sysHpPerLevel')) || 5;
        
        // PE
        cfg.hasEnergyPoints = this.getChecked('sysHasPE');
        cfg.energyName = this.getVal('sysPEName') || 'PE';
        cfg.peFormula = this.getVal('sysPEFormula');
        
        // Sanity
        cfg.hasSanity = this.getChecked('sysHasSanity');
        cfg.sanityName = this.getVal('sysSanityName') || 'Sanidade';
        cfg.sanityHasMax = this.getChecked('sysSanityHasMax');
        
        // PA
        cfg.hasActionPoints = this.getChecked('sysHasPA');
        cfg.paName = this.getVal('sysPAName') || 'PA';
        cfg.paFormula = this.getVal('sysPAFormula');
        
        // Combat
        cfg.caFormula = this.getVal('sysCAFormula');
        cfg.caCustomFormula = this.getVal('sysCACustomFormula');
        cfg.hasDodge = this.getChecked('sysHasDodge');
        cfg.dodgeFormula = this.getVal('sysDodgeFormula');
        cfg.dodgeCustomFormula = this.getVal('sysDodgeCustomFormula');
        cfg.initiativeFormula = this.getVal('sysInitFormula');
        cfg.initCustomFormula = this.getVal('sysInitCustomFormula');
        cfg.hasSavingThrows = this.getChecked('sysHasSaves');
        cfg.hasFusions = this.getChecked('sysHasFusions');
        
        // Classes
        cfg.hasClasses = this.getChecked('sysHasClasses');
        cfg.classAffectsHP = this.getChecked('sysClassAffectsHP');
        cfg.allowMulticlass = this.getChecked('sysAllowMulticlass');
        cfg.classes = this.collectClassesTable().filter(c => c.name);
        
        // Races
        cfg.hasRaces = this.getChecked('sysHasRaces');
        cfg.races = this.collectRacesTable().filter(r => r.name);
        
        // Skills
        cfg.skillSystem = this.getVal('sysSkillSystem');
        cfg.skills = this.collectSkillsTable().filter(s => s.name);
        
        // Magic
        cfg.hasMagic = this.getChecked('sysHasMagic');
        cfg.magicSystem = this.getVal('sysMagicSystem');
        cfg.hasCantrips = this.getChecked('sysHasCantrips');
        cfg.spellAttr = this.getVal('sysSpellAttr');
        cfg.maxSpellLevel = parseInt(this.getVal('sysMaxSpellLevel')) || 9;
        
        // Fields
        cfg.fieldRace = this.getChecked('sysFieldRace');
        cfg.fieldClass = this.getChecked('sysFieldClass');
        cfg.fieldBackground = this.getChecked('sysFieldBackground');
        cfg.fieldWeight = this.getChecked('sysFieldWeight');
        cfg.fieldAttacks = this.getChecked('sysFieldAttacks');
        
        return sys;
    },
    
    // Helper functions
    setVal(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value ?? '';
    },
    
    getVal(id) {
        return document.getElementById(id)?.value || '';
    },
    
    setChecked(id, checked) {
        const el = document.getElementById(id);
        if (el) el.checked = checked;
    },
    
    getChecked(id) {
        return document.getElementById(id)?.checked || false;
    },
    
    selectIcon(iconClass) {
        document.querySelectorAll('.sys-icon-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.icon === iconClass);
        });
    },
    
    getSelectedIcon() {
        return document.querySelector('.sys-icon-option.selected')?.dataset?.icon || 'fa-dice-d20';
    },
    
    // Refresh toggle visibility
    refreshToggles() {
        const triggers = [
            ['sysHasPE', 'sysPEConfig'],
            ['sysHasSanity', 'sysSanityConfig'],
            ['sysSanityHasMax', 'sysSanityMaxConfig'],
            ['sysHasPA', 'sysPAConfig'],
            ['sysHasClasses', 'sysClassesConfig'],
            ['sysHasDodge', 'sysDodgeConfig'],
            ['sysHasSaves', 'sysSavesConfig'],
            ['sysHasFusions', 'sysFusionsConfig'],
            ['sysHasMagic', 'sysMagicConfig']
        ];
        
        triggers.forEach(([checkboxId, sectionId]) => {
            const checkbox = document.getElementById(checkboxId);
            const section = document.getElementById(sectionId);
            if (checkbox && section) {
                section.classList.toggle('hidden', !checkbox.checked);
            }
        });
        
        // Classes list visibility
        const hasClasses = document.getElementById('sysHasClasses');
        const classesSection = document.getElementById('sysClassesListSection');
        if (hasClasses && classesSection) {
            classesSection.style.display = hasClasses.checked ? 'block' : 'none';
        }
        
        // HP formula sections
        const hpFormula = document.getElementById('sysHpFormula')?.value;
        document.getElementById('sysHpCustom')?.classList.toggle('hidden', hpFormula !== 'custom');
        document.getElementById('sysHpFlat')?.classList.toggle('hidden', hpFormula !== 'flat');
        
        // Modifier calc section
        const modCalc = document.getElementById('sysModifierCalc')?.value;
        document.getElementById('sysCustomModSection')?.classList.toggle('hidden', modCalc !== 'custom');
        
        // Combat custom formula sections
        const caFormula = document.getElementById('sysCAFormula')?.value;
        document.getElementById('sysCACustom')?.classList.toggle('hidden', caFormula !== 'custom');
        
        const dodgeFormula = document.getElementById('sysDodgeFormula')?.value;
        document.getElementById('sysDodgeCustom')?.classList.toggle('hidden', dodgeFormula !== 'custom');
        
        const initFormula = document.getElementById('sysInitFormula')?.value;
        document.getElementById('sysInitCustom')?.classList.toggle('hidden', initFormula !== 'custom');
    },
    
    // Update overview panel
    updateOverview() {
        const cfg = this.currentSystem?.config || {};
        
        // Stats
        document.getElementById('ovAttrCount').textContent = cfg.attrType === 'custom' ? (cfg.customAttrs?.length || 0) : 6;
        document.getElementById('ovSkillCount').textContent = cfg.skills?.length || (cfg.skillSystem === 'dnd' ? 18 : 36);
        document.getElementById('ovClassCount').textContent = cfg.classes?.length || 0;
        document.getElementById('ovRaceCount').textContent = cfg.races?.length || 0;
        
        // Features
        const features = [];
        if (cfg.hasEnergyPoints) features.push({ icon: 'fa-bolt', name: cfg.energyName || 'PE' });
        if (cfg.hasSanity) features.push({ icon: 'fa-brain', name: cfg.sanityName || 'Sanidade' });
        if (cfg.hasActionPoints) features.push({ icon: 'fa-running', name: cfg.paName || 'PA' });
        if (cfg.hasClasses) features.push({ icon: 'fa-hat-wizard', name: 'Classes' });
        if (cfg.hasFusions) features.push({ icon: 'fa-dna', name: 'Fusões' });
        if (cfg.hasSavingThrows) features.push({ icon: 'fa-shield-virus', name: 'Resistências' });
        if (cfg.hasMagic) features.push({ icon: 'fa-magic', name: 'Magias' });
        if (cfg.hasDodge) features.push({ icon: 'fa-running', name: 'Esquiva' });
        
        const featuresContainer = document.getElementById('sysOverviewFeatures');
        if (featuresContainer) {
            featuresContainer.innerHTML = features.map(f => `
                <div class="sys-card" style="cursor:default;">
                    <div class="sys-card-header">
                        <div class="sys-card-icon"><i class="fas ${f.icon}"></i></div>
                        <div class="sys-card-title">
                            <h4>${f.name}</h4>
                            <span>Ativo</span>
                        </div>
                    </div>
                </div>
            `).join('') || '<p style="color:var(--text-muted)">Nenhum recurso ativo</p>';
        }
    },
    
    // Render classes table
    renderClassesTable(classes) {
        const tbody = document.getElementById('sysClassesTableBody');
        if (!tbody) return;
        
        if (classes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Nenhuma classe definida</td></tr>';
            return;
        }
        
        tbody.innerHTML = classes.map((cls, i) => `
            <tr data-index="${i}">
                <td><input type="text" value="${cls.name || ''}" data-field="name"></td>
                <td>
                    <select data-field="hitDie">
                        <option value="6" ${cls.hitDie == 6 ? 'selected' : ''}>d6</option>
                        <option value="8" ${cls.hitDie == 8 ? 'selected' : ''}>d8</option>
                        <option value="10" ${cls.hitDie == 10 ? 'selected' : ''}>d10</option>
                        <option value="12" ${cls.hitDie == 12 ? 'selected' : ''}>d12</option>
                    </select>
                </td>
                <td><input type="text" value="${cls.primaryAttr || ''}" data-field="primaryAttr"></td>
                <td>
                    <label class="sys-toggle" style="margin:0;">
                        <input type="checkbox" ${cls.spellcaster ? 'checked' : ''} data-field="spellcaster">
                        <span class="slider"></span>
                    </label>
                </td>
                <td class="actions-cell">
                    <button onclick="SystemEditor.removeClass(${i})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },
    
    // Collect classes from table
    collectClassesTable() {
        const rows = document.querySelectorAll('#sysClassesTableBody tr[data-index]');
        return Array.from(rows).map(row => ({
            name: row.querySelector('[data-field="name"]')?.value || '',
            hitDie: parseInt(row.querySelector('[data-field="hitDie"]')?.value) || 8,
            primaryAttr: row.querySelector('[data-field="primaryAttr"]')?.value || 'STR',
            spellcaster: row.querySelector('[data-field="spellcaster"]')?.checked || false
        })); // Keep all rows, filter only on save
    },
    
    // Add class row
    addClass() {
        const classes = this.collectClassesTable();
        classes.push({ name: '', hitDie: 10, primaryAttr: 'STR', spellcaster: false });
        this.renderClassesTable(classes);
        this.hasUnsavedChanges = true;
    },
    
    // Remove class row
    removeClass(index) {
        const classes = this.collectClassesTable();
        classes.splice(index, 1);
        this.renderClassesTable(classes);
        this.hasUnsavedChanges = true;
    },
    
    // Render races table
    renderRacesTable(races) {
        const tbody = document.getElementById('sysRacesTableBody');
        if (!tbody) return;
        
        if (races.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Nenhuma raça definida</td></tr>';
            return;
        }
        
        tbody.innerHTML = races.map((race, i) => `
            <tr data-index="${i}">
                <td><input type="text" value="${race.name || ''}" data-field="name"></td>
                <td><input type="text" value="${race.bonuses || ''}" data-field="bonuses" placeholder="FOR+2, CON+1"></td>
                <td><input type="text" value="${race.traits || ''}" data-field="traits" placeholder="Visão no Escuro..."></td>
                <td class="actions-cell">
                    <button onclick="SystemEditor.removeRace(${i})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },
    
    // Collect races from table
    collectRacesTable() {
        const rows = document.querySelectorAll('#sysRacesTableBody tr[data-index]');
        return Array.from(rows).map(row => ({
            name: row.querySelector('[data-field="name"]')?.value || '',
            bonuses: row.querySelector('[data-field="bonuses"]')?.value || '',
            traits: row.querySelector('[data-field="traits"]')?.value || ''
        })); // Keep all rows, filter only on save
    },
    
    // Add race row
    addRace() {
        const races = this.collectRacesTable();
        races.push({ name: '', bonuses: '', traits: '' });
        this.renderRacesTable(races);
        this.hasUnsavedChanges = true;
    },
    
    // Remove race row
    removeRace(index) {
        const races = this.collectRacesTable();
        races.splice(index, 1);
        this.renderRacesTable(races);
        this.hasUnsavedChanges = true;
    },
    
    // Render skills table
    renderSkillsTable(skills) {
        const tbody = document.getElementById('sysSkillsTableBody');
        if (!tbody) return;
        
        if (skills.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Nenhuma perícia definida (usando preset)</td></tr>';
            return;
        }
        
        tbody.innerHTML = skills.map((skill, i) => `
            <tr data-index="${i}">
                <td><input type="text" value="${skill.name || ''}" data-field="name"></td>
                <td><input type="text" value="${skill.attr || ''}" data-field="attr" placeholder="FOR, DES..."></td>
                <td>
                    <label class="sys-toggle" style="margin:0;">
                        <input type="checkbox" ${skill.armorPenalty ? 'checked' : ''} data-field="armorPenalty">
                        <span class="slider"></span>
                    </label>
                </td>
                <td class="actions-cell">
                    <button onclick="SystemEditor.removeSkill(${i})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },
    
    // Collect skills from table
    collectSkillsTable() {
        const rows = document.querySelectorAll('#sysSkillsTableBody tr[data-index]');
        return Array.from(rows).map(row => ({
            name: row.querySelector('[data-field="name"]')?.value || '',
            attr: row.querySelector('[data-field="attr"]')?.value || 'FOR',
            armorPenalty: row.querySelector('[data-field="armorPenalty"]')?.checked || false
        })); // Keep all rows, filter only on save
    },
    
    // Add skill row
    addSkill() {
        const skills = this.collectSkillsTable();
        skills.push({ name: '', attr: 'FOR', armorPenalty: false });
        this.renderSkillsTable(skills);
        this.hasUnsavedChanges = true;
    },
    
    // Remove skill row
    removeSkill(index) {
        const skills = this.collectSkillsTable();
        skills.splice(index, 1);
        this.renderSkillsTable(skills);
        this.hasUnsavedChanges = true;
    },
    
    // Preset handlers
    onAttrPresetChange() {
        const preset = this.getVal('sysAttrPreset');
        const section = document.getElementById('sysCustomAttrsSection');
        
        if (preset === 'custom') {
            section?.classList.remove('hidden');
            // Se não há atributos, iniciar com alguns vazios
            const currentAttrs = this.collectAttrsTable();
            if (currentAttrs.length === 0) {
                this.renderAttrsTable([]);
            }
        } else {
            section?.classList.add('hidden');
            
            // Carregar preset de atributos
            if (preset === 'dnd') {
                const dndAttrs = [
                    { name: 'Força', abbr: 'FOR', default: 10 },
                    { name: 'Destreza', abbr: 'DES', default: 10 },
                    { name: 'Constituição', abbr: 'CON', default: 10 },
                    { name: 'Inteligência', abbr: 'INT', default: 10 },
                    { name: 'Sabedoria', abbr: 'SAB', default: 10 },
                    { name: 'Carisma', abbr: 'CAR', default: 10 }
                ];
                this.renderAttrsTable(dndAttrs);
            } else if (preset === 'realsscripts') {
                const rsAttrs = [
                    { name: 'Força', abbr: 'FOR', default: 0 },
                    { name: 'Constituição', abbr: 'CON', default: 0 },
                    { name: 'Vontade', abbr: 'VON', default: 0 },
                    { name: 'Carisma', abbr: 'CAR', default: 0 },
                    { name: 'Inteligência', abbr: 'INT', default: 0 },
                    { name: 'Agilidade', abbr: 'AGI', default: 0 }
                ];
                this.renderAttrsTable(rsAttrs);
            }
        }
        this.hasUnsavedChanges = true;
    },
    
    onRacePresetChange() {
        const preset = this.getVal('sysRacePreset');
        if (preset === 'dnd') {
            // Load D&D races
            const dndRaces = Object.entries(Calculations.DND_RACES || {}).map(([id, r]) => ({
                id,
                name: r.name,
                bonuses: Object.entries(r.bonuses).filter(([k]) => !k.startsWith('choice')).map(([k, v]) => `${k}+${v}`).join(', '),
                traits: (r.traits || []).slice(0, 2).join(', ')
            }));
            this.renderRacesTable(dndRaces);
        } else if (preset === 'realsscripts') {
            const rsRaces = [
                { name: 'Humano', bonuses: '+1 qualquer', traits: 'Versátil, Adaptável' },
                { name: 'Elfo', bonuses: 'AGI+1, INT+1', traits: 'Visão no Escuro' },
                { name: 'Anão', bonuses: 'CON+2', traits: 'Resistência' },
                { name: 'Demônio', bonuses: 'FOR+1, CAR+1', traits: 'Herança Infernal' },
                { name: 'Anjo', bonuses: 'CAR+2', traits: 'Luz Celestial' },
                { name: 'Híbrido', bonuses: 'Variável', traits: 'Dupla Herança' },
                { name: 'Construto', bonuses: 'CON+2', traits: 'Sem necessidades biológicas' }
            ];
            this.renderRacesTable(rsRaces);
        }
        this.hasUnsavedChanges = true;
    },
    
    onSkillPresetChange() {
        const preset = this.getVal('sysSkillPreset');
        if (preset === 'dnd') {
            const dndSkills = (Calculations.DND_SKILLS || []).map(s => ({
                name: s.name,
                attr: s.attr,
                armorPenalty: false
            }));
            this.renderSkillsTable(dndSkills);
        } else if (preset === 'realsscripts') {
            const rsSkills = (Calculations.SKILLS || []).map(s => ({
                name: s.name,
                attr: s.attr,
                armorPenalty: s.armorPenalty || false
            }));
            this.renderSkillsTable(rsSkills);
        }
        this.hasUnsavedChanges = true;
    },
    
    // Insert variable into formula field
    insertVar(fieldId, varName) {
        const field = document.getElementById(fieldId);
        if (field) {
            const start = field.selectionStart;
            const end = field.selectionEnd;
            const text = field.value;
            field.value = text.substring(0, start) + varName + text.substring(end);
            field.focus();
            field.setSelectionRange(start + varName.length, start + varName.length);
        }
    },
    
    // ========== CUSTOM ATTRIBUTES ==========
    
    // Render custom attributes list
    renderAttrsTable(attrs) {
        const container = document.getElementById('sysAttrsList');
        if (!container) return;
        
        if (!attrs || attrs.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Nenhum atributo definido. Clique em "Adicionar Atributo" para começar.</p>';
            return;
        }
        
        container.innerHTML = attrs.map((attr, i) => `
            <div class="sys-attr-item" data-index="${i}">
                <input type="text" value="${attr.name || ''}" data-field="name" placeholder="Nome do Atributo">
                <input type="text" value="${attr.abbr || ''}" data-field="abbr" class="attr-abbr" placeholder="ABR" maxlength="3">
                <input type="number" value="${attr.default || 10}" data-field="default" class="attr-default" min="1" max="100">
                <button onclick="SystemEditor.removeAttribute(${i})" title="Remover">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    },
    
    // Collect custom attributes from list
    collectAttrsTable() {
        const items = document.querySelectorAll('#sysAttrsList .sys-attr-item[data-index]');
        return Array.from(items).map(item => ({
            name: item.querySelector('[data-field="name"]')?.value || '',
            abbr: (item.querySelector('[data-field="abbr"]')?.value || '').toUpperCase(),
            default: parseInt(item.querySelector('[data-field="default"]')?.value) || 10
        })).filter(a => a.name && a.abbr);
    },
    
    // Add custom attribute
    addAttribute() {
        const attrs = this.collectAttrsTable();
        attrs.push({ name: '', abbr: '', default: 10 });
        this.renderAttrsTable(attrs);
        this.hasUnsavedChanges = true;
    },
    
    // Remove custom attribute
    removeAttribute(index) {
        const attrs = this.collectAttrsTable();
        attrs.splice(index, 1);
        this.renderAttrsTable(attrs);
        this.hasUnsavedChanges = true;
    },
    
    // Show editor
    show() {
        document.getElementById('systemEditorScreen')?.classList.add('active');
        document.getElementById('characterModal')?.classList.add('hidden');
        document.getElementById('systemsManagerModal')?.classList.add('hidden');
    },
    
    // Close editor
    close() {
        if (this.hasUnsavedChanges) {
            if (!confirm('Você tem alterações não salvas. Deseja sair mesmo assim?')) {
                return;
            }
        }
        
        document.getElementById('systemEditorScreen')?.classList.remove('active');
        document.getElementById('characterModal')?.classList.remove('hidden');
        
        this.currentSystem = null;
        this.hasUnsavedChanges = false;
    },
    
    // Save system
    async save() {
        const system = this.collectFormData();
        
        if (!system.name || system.name.trim() === '') {
            alert('Por favor, insira um nome para o sistema.');
            this.navigateToPanel('basic');
            document.getElementById('sysName')?.focus();
            return;
        }
        
        try {
            if (this.isNewSystem) {
                await API.saveCustomSystem(system);
                SystemManager.customSystems[system.id] = system;
            } else {
                await API.saveCustomSystem(system);
                SystemManager.customSystems[system.id] = system;
            }
            
            this.hasUnsavedChanges = false;
            document.getElementById('sysEditingName').textContent = system.name;
            
            alert('Sistema salvo com sucesso!');
            console.log('[SystemEditor] System saved:', system.id);
        } catch (error) {
            console.error('[SystemEditor] Save error:', error);
            alert('Erro ao salvar sistema: ' + error.message);
        }
    },
    
    // Confirm delete
    confirmDelete() {
        document.getElementById('sysDeleteDialog')?.classList.add('active');
    },
    
    // Cancel delete
    cancelDelete() {
        document.getElementById('sysDeleteDialog')?.classList.remove('active');
    },
    
    // Perform delete
    async doDelete() {
        if (!this.currentSystem || this.isNewSystem) {
            this.cancelDelete();
            return;
        }
        
        try {
            await API.deleteCustomSystem(this.currentSystem.id);
            delete SystemManager.customSystems[this.currentSystem.id];
            
            this.cancelDelete();
            this.hasUnsavedChanges = false;
            this.close();
            
            alert('Sistema excluído com sucesso!');
        } catch (error) {
            console.error('[SystemEditor] Delete error:', error);
            alert('Erro ao excluir sistema: ' + error.message);
        }
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    SystemEditor.init();
});
