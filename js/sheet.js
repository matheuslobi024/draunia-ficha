// ========== SHEET MODULE ==========

const Sheet = {
    currentCharacter: null,
    saveTimeout: null,
    currentSystem: 'realsscripts',

    // Initialize sheet
    init() {
        this.bindEvents();
        this.generateSkillsHTML();
        this.generateCombatSkillsHTML();
        this.setupSkillSearch();
        this.updateVitalsLayout();
        
        // Hide D&D races by default (R&S is default system)
        const dndRaces = document.getElementById('racesDnd');
        if (dndRaces) dndRaces.style.display = 'none';
    },

    // Set the system and adapt the UI
    setSystem(systemId) {
        this.currentSystem = systemId || 'realsscripts';
        
        // Get system config
        const system = SystemManager?.getSystem(systemId);
        const config = system?.config || {};
        
        const isDnd = systemId === 'dnd5e' || config.attrType === 'dnd';
        const isRS = systemId === 'realsscripts' || config.attrType === 'realsscripts';
        const isOP = systemId === 'ordemparanormal' || config.attrType === 'ordemparanormal';
        const isCustom = config.attrType === 'custom' && config.customAttrs && config.customAttrs.length > 0;
        const hasCustomRaces = config.races && config.races.length > 0;
        
        // Toggle body class for CSS
        document.body.classList.remove('system-dnd', 'system-op', 'system-rs', 'system-custom');
        if (isDnd) document.body.classList.add('system-dnd');
        else if (isOP) document.body.classList.add('system-op');
        else if (isRS) document.body.classList.add('system-rs');
        else if (isCustom) document.body.classList.add('system-custom');
        
        // Show/hide attribute sections
        const rsAttrs = document.getElementById('attributesRS');
        const dndAttrs = document.getElementById('attributesDND');
        const opAttrs = document.getElementById('attributesOP');
        const customAttrs = document.getElementById('attributesCustom');
        
        if (rsAttrs) rsAttrs.style.display = isRS && !isCustom ? '' : 'none';
        if (dndAttrs) dndAttrs.style.display = isDnd && !isCustom ? '' : 'none';
        if (opAttrs) opAttrs.style.display = isOP && !isCustom ? '' : 'none';
        if (customAttrs) customAttrs.style.display = isCustom ? '' : 'none';
        
        // Generate custom attributes if needed
        if (isCustom) {
            this.generateCustomAttributesHTML(config.customAttrs, config);
        }
        
        // Show/hide race optgroups
        const rsRaces = document.getElementById('racesRealsscripts');
        const dndRaces = document.getElementById('racesDnd');
        const customRaces = document.getElementById('racesCustom');
        
        // Handle race optgroups visibility
        if (hasCustomRaces) {
            // Custom system with custom races
            if (rsRaces) rsRaces.style.display = 'none';
            if (dndRaces) dndRaces.style.display = 'none';
            if (customRaces) {
                customRaces.style.display = '';
                this.populateCustomRaces(config.races);
            }
        } else if (isDnd) {
            if (rsRaces) rsRaces.style.display = 'none';
            if (dndRaces) dndRaces.style.display = '';
            if (customRaces) customRaces.style.display = 'none';
        } else {
            if (rsRaces) rsRaces.style.display = '';
            if (dndRaces) dndRaces.style.display = 'none';
            if (customRaces) customRaces.style.display = 'none';
        }
        
        // Handle class section visibility
        const classRow = document.getElementById('classRow');
        const hasClasses = config.hasClasses === true || isDnd;
        const hasCustomClasses = config.classes && config.classes.length > 0;
        const dndClasses = document.getElementById('classesDnd');
        const customClasses = document.getElementById('classesCustom');
        
        if (classRow) {
            classRow.style.display = hasClasses ? '' : 'none';
        }
        
        if (hasClasses) {
            if (hasCustomClasses) {
                if (dndClasses) dndClasses.style.display = 'none';
                if (customClasses) {
                    customClasses.style.display = '';
                    this.populateCustomClasses(config.classes);
                }
            } else if (isDnd) {
                if (dndClasses) dndClasses.style.display = '';
                if (customClasses) customClasses.style.display = 'none';
            }
        }
        
        // Regenerate skills for the current system
        this.generateSkillsHTML();
        this.generateCombatSkillsHTML();
        
        // Update class display and recalculate if D&D
        if (isDnd && this.currentCharacter) {
            this.updateDndClassDisplay();
            this.updateDndModifiers();
        }
        
        // Set current system in calculations
        Calculations.currentSystem = systemId;
        
        // Update vitals layout after CSS has been applied
        // Use requestAnimationFrame to ensure styles are computed
        requestAnimationFrame(() => {
            this.updateVitalsLayout();
        });
        
        console.log('[Sheet] Sistema configurado:', this.currentSystem, 'Config:', config);
    },
    
    // Update vitals compact card layout based on visible items
    // Note: CSS flexbox now handles the adaptive layout automatically
    updateVitalsLayout() {
        // Keep method for compatibility - flexbox handles layout now
    },
    
    // Populate custom classes select
    populateCustomClasses(classes) {
        const group = document.getElementById('classesCustom');
        if (!group || !classes) return;
        
        // Keep "Selecione..." option
        group.innerHTML = '<option value="">Selecione...</option>';
        
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id || cls.name.toLowerCase().replace(/\s+/g, '_');
            option.textContent = cls.name;
            if (cls.hitDie) option.dataset.hitDie = cls.hitDie;
            group.appendChild(option);
        });
    },
    
    // Populate custom races select
    populateCustomRaces(races) {
        const group = document.getElementById('racesCustom');
        if (!group || !races) return;
        
        // Keep "Selecione..." option
        group.innerHTML = '<option value="">Selecione...</option>';
        
        races.forEach(race => {
            const option = document.createElement('option');
            option.value = race.id || race.name.toLowerCase().replace(/\s+/g, '_');
            option.textContent = race.name;
            group.appendChild(option);
        });
    },
    
    // Generate custom attributes HTML based on system config
    generateCustomAttributesHTML(customAttrs, config) {
        const container = document.getElementById('customAttributesContainer');
        if (!container) return;
        
        // Show point limit info if applicable
        const pointInfo = document.getElementById('customAttrPointsInfo');
        if (pointInfo && config.attrPointLimit > 0) {
            pointInfo.innerHTML = `(<span id="usedCustomAttrPoints">0</span>/${config.attrPointLimit})`;
        } else if (pointInfo) {
            pointInfo.innerHTML = '';
        }
        
        // Generate attribute items
        let html = '';
        for (const attr of customAttrs) {
            const fieldId = 'customAttr_' + attr.abbr.toLowerCase();
            const min = config.attrMin !== undefined ? config.attrMin : 1;
            const max = config.attrMax !== undefined ? config.attrMax : 20;
            const defaultVal = attr.default !== undefined ? attr.default : 0;
            
            html += `
                <div class="attr-item">
                    <span class="attr-label" title="${attr.name}">${attr.abbr}</span>
                    <div class="attr-controls">
                        <button type="button" class="btn-adjust btn-attr" onclick="Sheet.adjustValue('${fieldId}', -1)"><i class="fas fa-minus"></i></button>
                        <input type="number" id="${fieldId}" data-field="${fieldId}" class="attr-input" value="${defaultVal}" min="${min}" max="${max}">
                        <button type="button" class="btn-adjust btn-attr" onclick="Sheet.adjustValue('${fieldId}', 1)"><i class="fas fa-plus"></i></button>
                    </div>
                    ${config.modifierCalc !== 'direct' ? `<span class="attr-mod" id="${fieldId}_mod">+0</span>` : ''}
                </div>
            `;
        }
        
        container.innerHTML = html;
        
        // Bind events to new inputs
        container.querySelectorAll('[data-field]').forEach(el => {
            el.addEventListener('input', () => this.onFieldChange());
            el.addEventListener('change', () => this.onFieldChange());
        });
        
        // Load values if character exists
        if (this.currentCharacter) {
            this.loadCustomAttributeValues(customAttrs);
        }
    },
    
    // Load custom attribute values from character
    loadCustomAttributeValues(customAttrs) {
        if (!this.currentCharacter) return;
        
        for (const attr of customAttrs) {
            const fieldId = 'customAttr_' + attr.abbr.toLowerCase();
            const input = document.getElementById(fieldId);
            if (input) {
                const savedValue = this.currentCharacter[fieldId];
                if (savedValue !== undefined) {
                    input.value = savedValue;
                } else {
                    input.value = attr.default !== undefined ? attr.default : 0;
                }
            }
        }
        
        this.updateCustomAttributeModifiers();
    },
    
    // Update custom attribute modifiers display
    updateCustomAttributeModifiers() {
        const system = SystemManager?.getSystem(this.currentSystem);
        const config = system?.config || {};
        
        if (config.attrType !== 'custom' || !config.customAttrs) return;
        
        for (const attr of config.customAttrs) {
            const fieldId = 'customAttr_' + attr.abbr.toLowerCase();
            const input = document.getElementById(fieldId);
            const modEl = document.getElementById(fieldId + '_mod');
            
            if (input && modEl) {
                const score = parseInt(input.value) || 0;
                let mod = score;
                
                if (config.modifierCalc === 'dnd') {
                    mod = Math.floor((score - 10) / 2);
                }
                
                const modStr = (mod >= 0 ? '+' : '') + mod;
                modEl.textContent = modStr;
            }
        }
    },

    // Update D&D class display (hit dice, etc)
    updateDndClassDisplay() {
        const charClass = this.currentCharacter?.dndClass || 'fighter';
        const classInfo = Calculations.DND_CLASSES[charClass];
        
        const hitDiceEl = document.getElementById('hitDiceDisplay');
        if (hitDiceEl && classInfo) {
            hitDiceEl.textContent = 'd' + classInfo.hitDie;
        }
    },

    // Update D&D modifiers display
    updateDndModifiers() {
        if (!this.currentCharacter) return;
        
        const attrs = ['Str', 'Dex', 'Con', 'Int', 'Wis', 'Cha'];
        const profBonus = Calculations.calculateDndProficiencyBonus(this.currentCharacter);
        
        attrs.forEach(attr => {
            const score = this.currentCharacter['dnd' + attr] || 10;
            const mod = Calculations.calculateDndModifier(score);
            const modStr = (mod >= 0 ? '+' : '') + mod;
            
            // Update modifier display
            const modEl = document.getElementById('mod' + attr);
            if (modEl) modEl.textContent = modStr;
            
            // Update saving throw
            const saveEl = document.getElementById('save' + attr + 'Val');
            const profEl = document.getElementById('save' + attr);
            if (saveEl && profEl) {
                const isProficient = this.currentCharacter['saveProf' + attr] || false;
                const saveVal = mod + (isProficient ? profBonus : 0);
                saveEl.textContent = (saveVal >= 0 ? '+' : '') + saveVal;
            }
        });
        
        // Update proficiency bonus display
        const profBonusEl = document.getElementById('profBonus');
        if (profBonusEl) profBonusEl.textContent = '+' + profBonus;
        
        // Update passive perception
        const passiveEl = document.getElementById('passivePerception');
        if (passiveEl) {
            const wisScore = this.currentCharacter.dndWis || 10;
            const wisMod = Calculations.calculateDndModifier(wisScore);
            const isProficient = this.currentCharacter.dndSkillProficiencies?.perception || false;
            passiveEl.textContent = 10 + wisMod + (isProficient ? profBonus : 0);
        }
    },

    // Adjust a numeric value by delta (+1 or -1)
    adjustValue(fieldId, delta) {
        const input = document.getElementById(fieldId);
        if (!input) return;

        let currentValue = parseInt(input.value) || 0;
        let newValue = currentValue + delta;

        // Respect minimum values
        const minValue = parseInt(input.min);
        if (!isNaN(minValue) && newValue < minValue) {
            newValue = minValue;
        }
        
        // Respect maximum values
        const maxValue = parseInt(input.max);
        if (!isNaN(maxValue) && newValue > maxValue) {
            newValue = maxValue;
        }

        // Update the input
        input.value = newValue;

        // Trigger input event to sync and save
        input.dispatchEvent(new Event('input', { bubbles: true }));
    },

    // Bind all events
    bindEvents() {
        // Auto-save on any input change
        document.querySelectorAll('[data-field]').forEach(el => {
            el.addEventListener('input', () => this.onFieldChange());
            el.addEventListener('change', () => this.onFieldChange());
        });

        // Sync HP between main and combat tabs
        this.syncVitalFields('currentHpMain', 'currentHp');
        this.syncVitalFields('currentHp', 'currentHpMain');
        this.syncVitalFields('sanityMain', 'sanity');
        this.syncVitalFields('sanity', 'sanityMain');
        this.syncVitalFields('currentPEMain', 'currentPE');
        this.syncVitalFields('currentPE', 'currentPEMain');

        // Portrait upload
        const portraitInput = document.getElementById('portraitInput');
        if (portraitInput) {
            portraitInput.addEventListener('change', (e) => this.handlePortraitUpload(e));
        }

        // Add item button
        const addItemBtn = document.getElementById('addItemBtn');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => this.addInventoryItem());
        }

        // Add attack button (R&S)
        const addAttackBtn = document.getElementById('addAttackBtn');
        if (addAttackBtn) {
            addAttackBtn.addEventListener('click', () => this.addAttack());
        }

        // Add attack button (D&D)
        const addDndAttackBtn = document.getElementById('addDndAttackBtn');
        if (addDndAttackBtn) {
            addDndAttackBtn.addEventListener('click', () => this.addDndAttack());
        }
    },

    // Sync vital fields between tabs
    syncVitalFields(sourceId, targetId) {
        const source = document.getElementById(sourceId);
        const target = document.getElementById(targetId);
        if (source && target) {
            source.addEventListener('input', () => {
                target.value = source.value;
                // Also update the character data
                if (sourceId.includes('Hp') || sourceId === 'currentHp') {
                    this.currentCharacter.currentHp = parseInt(source.value) || 0;
                } else if (sourceId.includes('sanity') || sourceId === 'sanity') {
                    this.currentCharacter.sanity = parseInt(source.value) || 0;
                } else if (sourceId.includes('PE') || sourceId === 'currentPE') {
                    this.currentCharacter.currentPE = parseInt(source.value) || 0;
                }
                this.onFieldChange();
            });
        }
    },

    // Handle field change with debounce
    onFieldChange() {
        this.showSaveStatus('saving');
        
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            this.collectAndSave();
            this.updateCalculations();
        }, 500);
    },

    // Show save status
    showSaveStatus(status) {
        const saveStatus = document.getElementById('saveStatus');
        if (!saveStatus) return;

        if (status === 'saving') {
            saveStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
            saveStatus.classList.add('saving');
        } else {
            saveStatus.innerHTML = '<i class="fas fa-check-circle"></i> Salvo';
            saveStatus.classList.remove('saving');
        }
    },

    // Collect form data and save
    async collectAndSave() {
        if (!this.currentCharacter) return;

        // Collect all fields
        document.querySelectorAll('[data-field]').forEach(el => {
            const field = el.dataset.field;
            if (el.type === 'checkbox') {
                this.currentCharacter[field] = el.checked;
            } else if (el.type === 'number') {
                this.currentCharacter[field] = parseFloat(el.value) || 0;
            } else {
                this.currentCharacter[field] = el.value;
            }
        });

        // Collect skills
        this.currentCharacter.skills = {};
        document.querySelectorAll('.skill-select').forEach(el => {
            const skillId = el.dataset.skill;
            this.currentCharacter.skills[skillId] = parseInt(el.value) || 0;
        });

        // Collect inventory
        this.collectInventory();

        // Collect attacks (both systems)
        this.collectAttacks();
        this.collectDndAttacks();

        // Update timestamp
        this.currentCharacter.updatedAt = new Date().toISOString();

        // Save to server
        const charId = App.getCurrentCharacterId();
        if (charId) {
            const saved = await Auth.saveCharacter(charId, this.currentCharacter);
            this.showSaveStatus(saved ? 'saved' : 'error');
        }
    },

    // Collect inventory items
    collectInventory() {
        const items = [];
        document.querySelectorAll('.inventory-item').forEach(row => {
            const nameInput = row.querySelector('.item-name');
            const weightInput = row.querySelector('.item-weight');
            if (nameInput && weightInput) {
                const name = nameInput.value.trim();
                const weight = parseFloat(weightInput.value) || 0;
                if (name || weight > 0) {
                    items.push({ name, weight });
                }
            }
        });
        this.currentCharacter.inventory = items;
    },

    // Collect attacks
    collectAttacks() {
        const attacks = [];
        document.querySelectorAll('#attacksBody tr').forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length >= 6) {
                attacks.push({
                    name: inputs[0].value,
                    damage: inputs[1].value,
                    range: inputs[2].value,
                    skill: inputs[3].value,
                    pa: inputs[4].value,
                    pe: inputs[5].value,
                    crit: inputs[6]?.value || ''
                });
            }
        });
        this.currentCharacter.attacks = attacks;
    },

    // Collect D&D attacks
    collectDndAttacks() {
        const attacks = [];
        document.querySelectorAll('#dndAttacksBody tr').forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length >= 4) {
                attacks.push({
                    name: inputs[0].value,
                    attackBonus: inputs[1].value,
                    damage: inputs[2].value,
                    range: inputs[3].value,
                    properties: inputs[4]?.value || ''
                });
            }
        });
        this.currentCharacter.dndAttacks = attacks;
    },

    // Load character data into form
    loadCharacter(character, charId = null) {
        this.currentCharacter = character;
        if (charId) {
            this.currentCharacter._id = charId;
        }

        // Load all fields
        document.querySelectorAll('[data-field]').forEach(el => {
            const field = el.dataset.field;
            const value = character[field];
            
            if (value !== undefined) {
                if (el.type === 'checkbox') {
                    el.checked = value;
                } else {
                    el.value = value;
                }
            }
        });

        // Load portrait
        if (character.portrait) {
            document.getElementById('charPortrait').src = character.portrait;
        }

        // Load skills
        if (character.skills) {
            Object.entries(character.skills).forEach(([skillId, level]) => {
                const select = document.querySelector(`.skill-select[data-skill="${skillId}"]`);
                if (select) {
                    select.value = level;
                }
            });
        }
        
        // Load custom attribute values if system has custom attributes
        const system = SystemManager?.getSystem(this.currentSystem);
        const config = system?.config || {};
        if (config.attrType === 'custom' && config.customAttrs) {
            this.loadCustomAttributeValues(config.customAttrs);
        }

        // Load inventory
        this.loadInventory();

        // Load attacks (both systems)
        this.loadAttacks();
        this.loadDndAttacks();

        // Sync vital values to main tab
        const currentHpMain = document.getElementById('currentHpMain');
        const sanityMain = document.getElementById('sanityMain');
        const maxSanityMain = document.getElementById('maxSanityMain');
        const currentPEMain = document.getElementById('currentPEMain');
        const currentPAInput = document.getElementById('currentPA');
        
        if (currentHpMain) currentHpMain.value = character.currentHp || 20;
        if (sanityMain) sanityMain.value = character.sanity || 20;
        if (maxSanityMain) maxSanityMain.textContent = character.maxSanity || 20;
        if (currentPEMain) currentPEMain.value = character.currentPE || 6;
        
        // Initialize currentPA if not set
        if (currentPAInput && !character.currentPA) {
            const maxPA = Calculations.calculatePA(character);
            currentPAInput.value = maxPA;
            this.currentCharacter.currentPA = maxPA;
        }

        // Update all calculations
        this.updateCalculations();

        // Update race bonus display
        this.updateRaceBonus();
    },

    // Load inventory items
    loadInventory() {
        const container = document.getElementById('inventoryItems');
        if (!container) return;

        container.innerHTML = '';
        
        const items = this.currentCharacter.inventory || [];
        items.forEach((item, index) => {
            this.addInventoryItemHTML(item.name, item.weight);
        });

        // Add empty row if no items
        if (items.length === 0) {
            this.addInventoryItemHTML('', 0);
        }
    },

    // Add inventory item HTML
    addInventoryItemHTML(name = '', weight = 0) {
        const container = document.getElementById('inventoryItems');
        if (!container) return;

        const div = document.createElement('div');
        div.className = 'inventory-item';
        div.innerHTML = `
            <input type="text" class="item-name" placeholder="Nome do item" value="${name}">
            <input type="number" class="item-weight" min="0" step="0.1" value="${weight}">
            <button class="btn-remove" onclick="Sheet.removeInventoryItem(this)">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Bind events
        div.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => this.onFieldChange());
        });

        container.appendChild(div);
    },

    // Add new inventory item
    addInventoryItem() {
        this.addInventoryItemHTML('', 0);
    },

    // Remove inventory item
    removeInventoryItem(btn) {
        btn.closest('.inventory-item').remove();
        this.onFieldChange();
    },

    // Load attacks
    loadAttacks() {
        const tbody = document.getElementById('attacksBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        const attacks = this.currentCharacter.attacks || [];
        attacks.forEach(attack => {
            this.addAttackHTML(attack);
        });
    },

    // Add attack HTML
    addAttackHTML(attack = {}) {
        const tbody = document.getElementById('attacksBody');
        if (!tbody) return;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><button class="btn-use-attack" onclick="Sheet.useAttack(this)" title="Usar Ataque"><i class="fas fa-bolt"></i></button></td>
            <td><input type="text" value="${attack.name || ''}" placeholder="Nome"></td>
            <td><input type="text" value="${attack.damage || ''}" placeholder="1d8+2"></td>
            <td><input type="text" value="${attack.range || ''}" placeholder="Corpo"></td>
            <td><input type="text" value="${attack.skill || ''}" placeholder="Luta"></td>
            <td><input type="text" value="${attack.pa || ''}" placeholder="2"></td>
            <td><input type="text" value="${attack.pe || ''}" placeholder="0"></td>
            <td><input type="text" value="${attack.crit || ''}" placeholder="20"></td>
            <td><button class="btn-remove" onclick="Sheet.removeAttack(this)"><i class="fas fa-times"></i></button></td>
        `;

        // Bind events
        tr.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => this.onFieldChange());
        });

        tbody.appendChild(tr);
    },

    // Add new attack (R&S)
    addAttack() {
        this.addAttackHTML();
    },

    // Add new attack (D&D)
    addDndAttack() {
        this.addDndAttackHTML();
    },

    // Add D&D attack HTML
    addDndAttackHTML(attack = {}) {
        const tbody = document.getElementById('dndAttacksBody');
        if (!tbody) return;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" value="${attack.name || ''}" placeholder="Espada Longa"></td>
            <td><input type="text" value="${attack.attackBonus || ''}" placeholder="+5"></td>
            <td><input type="text" value="${attack.damage || ''}" placeholder="1d8+3 cortante"></td>
            <td><input type="text" value="${attack.range || ''}" placeholder="1,5m"></td>
            <td><input type="text" value="${attack.properties || ''}" placeholder="Versátil (1d10)"></td>
            <td><button class="btn-remove" onclick="Sheet.removeDndAttack(this)"><i class="fas fa-times"></i></button></td>
        `;

        // Bind events
        tr.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => this.onFieldChange());
        });

        tbody.appendChild(tr);
    },

    // Remove D&D attack
    removeDndAttack(btn) {
        btn.closest('tr').remove();
        this.onFieldChange();
    },

    // Load D&D attacks
    loadDndAttacks() {
        const tbody = document.getElementById('dndAttacksBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        const attacks = this.currentCharacter.dndAttacks || [];
        attacks.forEach(attack => {
            this.addDndAttackHTML(attack);
        });
    },

    // Remove attack
    removeAttack(btn) {
        btn.closest('tr').remove();
        this.onFieldChange();
    },

    // Next turn - reset PA to max
    nextTurn() {
        const maxPA = Calculations.calculatePA(this.currentCharacter);
        const currentPAInput = document.getElementById('currentPA');
        if (currentPAInput) {
            currentPAInput.value = maxPA;
            this.currentCharacter.currentPA = maxPA;
            this.onFieldChange();
            this.showNotification('Turno avançado! PA restaurado.', 'success');
        }
    },

    // Restore HP to max
    restoreHp() {
        const maxHp = Calculations.calculateMaxHP(this.currentCharacter);
        const currentHpInput = document.getElementById('currentHp');
        const currentHpMainInput = document.getElementById('currentHpMain');
        
        if (currentHpInput) {
            currentHpInput.value = maxHp;
        }
        if (currentHpMainInput) {
            currentHpMainInput.value = maxHp;
        }
        this.currentCharacter.currentHp = maxHp;
        this.onFieldChange();
        this.showNotification('HP restaurado ao máximo!', 'success');
    },

    // Restore PE to max
    restorePE() {
        const maxPE = Calculations.calculateMaxPE(this.currentCharacter);
        const currentPEInput = document.getElementById('currentPE');
        const currentPEMainInput = document.getElementById('currentPEMain');
        
        if (currentPEInput) {
            currentPEInput.value = maxPE;
        }
        if (currentPEMainInput) {
            currentPEMainInput.value = maxPE;
        }
        this.currentCharacter.currentPE = maxPE;
        this.onFieldChange();
        this.showNotification('PE restaurado ao máximo!', 'success');
    },

    // Restore Sanity to max
    restoreSanity() {
        const maxSanity = Calculations.calculateMaxSanity(this.currentCharacter);
        const sanityInput = document.getElementById('sanity');
        const sanityMainInput = document.getElementById('sanityMain');
        
        if (sanityInput) {
            sanityInput.value = maxSanity;
        }
        if (sanityMainInput) {
            sanityMainInput.value = maxSanity;
        }
        this.currentCharacter.sanity = maxSanity;
        this.onFieldChange();
        this.showNotification('Sanidade restaurada ao máximo!', 'success');
    },

    // Use attack - consume PA and PE
    useAttack(btn) {
        const tr = btn.closest('tr');
        const inputs = tr.querySelectorAll('input');
        const attackName = inputs[0].value || 'Ataque';
        const paCost = parseInt(inputs[4].value) || 0;
        const peCost = parseInt(inputs[5].value) || 0;

        const currentPAInput = document.getElementById('currentPA');
        const currentPEInput = document.getElementById('currentPE');
        const currentPEInputMain = document.getElementById('currentPEMain');

        const currentPA = parseInt(currentPAInput?.value) || 0;
        const currentPE = parseInt(currentPEInput?.value) || 0;

        // Check if enough PA
        if (paCost > 0 && currentPA < paCost) {
            this.showNotification(`PA insuficiente! Precisa de ${paCost} PA, tem ${currentPA}.`, 'error');
            return;
        }

        // Check if enough PE
        if (peCost > 0 && currentPE < peCost) {
            this.showNotification(`PE insuficiente! Precisa de ${peCost} PE, tem ${currentPE}.`, 'error');
            return;
        }

        // Deduct PA
        if (paCost > 0 && currentPAInput) {
            currentPAInput.value = currentPA - paCost;
            this.currentCharacter.currentPA = currentPA - paCost;
        }

        // Deduct PE
        if (peCost > 0) {
            const newPE = currentPE - peCost;
            if (currentPEInput) {
                currentPEInput.value = newPE;
            }
            if (currentPEInputMain) {
                currentPEInputMain.value = newPE;
            }
            this.currentCharacter.currentPE = newPE;
        }

        this.onFieldChange();
        this.showNotification(`${attackName} usado! -${paCost} PA${peCost > 0 ? `, -${peCost} PE` : ''}`, 'success');
    },

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.sheet-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `sheet-notification ${type}`;
        notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // Setup skill search
    setupSkillSearch() {
        const searchInput = document.getElementById('skillSearchInput');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const skillItems = document.querySelectorAll('.skill-item');

            skillItems.forEach(item => {
                const skillName = item.querySelector('.skill-name')?.textContent.toLowerCase() || '';
                const skillAttr = item.querySelector('.skill-attr')?.textContent.toLowerCase() || '';

                if (skillName.includes(searchTerm) || skillAttr.includes(searchTerm)) {
                    item.classList.remove('hidden-by-search');
                } else {
                    item.classList.add('hidden-by-search');
                }
            });
        });
    },

    // Generate skills HTML
    generateSkillsHTML() {
        const grid = document.getElementById('skillsGrid');
        if (!grid) return;

        grid.innerHTML = '';
        
        // Get system config
        const system = SystemManager?.getSystem(this.currentSystem);
        const config = system?.config || {};
        
        const isDnd = this.currentSystem === 'dnd5e' || config.attrType === 'dnd' || config.skillSystem === 'dnd';
        const isOP = this.currentSystem === 'ordemparanormal' || config.skillSystem === 'ordemparanormal';
        const hasCustomSkills = config.skillSystem === 'custom' && config.skills && config.skills.length > 0;
        
        // Determine which skills to use
        let skills;
        if (hasCustomSkills) {
            // Use custom skills from system config
            skills = config.skills.map(s => ({
                id: s.id || s.name.toLowerCase().replace(/\s+/g, '_'),
                name: s.name,
                attr: s.attr || '-',
                armorPenalty: s.armorPenalty || false
            }));
        } else if (isDnd) {
            skills = Calculations.DND_SKILLS;
        } else if (isOP) {
            skills = Calculations.OP_SKILLS;
        } else {
            skills = Calculations.SKILLS;
        }

        if (isDnd && !hasCustomSkills) {
            // D&D-style skills with proficiency checkboxes
            grid.className = 'dnd-skills-grid';
            skills.forEach(skill => {
                const div = document.createElement('div');
                div.className = 'dnd-skill-item';
                div.innerHTML = `
                    <input type="checkbox" class="skill-prof" data-skill-prof="${skill.id}" title="Proficiente">
                    <input type="checkbox" class="skill-expertise" data-skill-exp="${skill.id}" title="Expertise">
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-attr">${skill.attr}</span>
                    <span class="skill-total" data-skill-total="${skill.id}">+0</span>
                `;

                const profCheckbox = div.querySelector('[data-skill-prof]');
                const expCheckbox = div.querySelector('[data-skill-exp]');
                profCheckbox.addEventListener('change', () => this.onDndSkillChange(skill.id, profCheckbox, expCheckbox));
                expCheckbox.addEventListener('change', () => this.onDndSkillChange(skill.id, profCheckbox, expCheckbox));

                grid.appendChild(div);
            });
        } else {
            // Realms&Scripts, Ordem Paranormal, or custom skills with training levels
            grid.className = 'skills-grid';
            skills.forEach(skill => {
                const div = document.createElement('div');
                div.className = 'skill-item' + (skill.armorPenalty ? ' armor-penalty' : '');
                div.innerHTML = `
                    <div class="skill-info">
                        <span class="skill-name">${skill.name}${skill.armorPenalty ? ' <i class="fas fa-weight-hanging" title="Penalidade de Carga"></i>' : ''}</span>
                        <span class="skill-attr">${skill.attr}</span>
                    </div>
                    <select class="skill-select" data-skill="${skill.id}">
                        <option value="0">Sem Treino</option>
                        <option value="1">Treinada</option>
                        <option value="2">Veterana</option>
                        <option value="3">Expert</option>
                    </select>
                    <span class="skill-total" data-skill-total="${skill.id}">+0</span>
                `;

                const select = div.querySelector('select');
                select.addEventListener('change', () => this.onFieldChange());

                grid.appendChild(div);
            });
        }
    },

    // Handle D&D skill proficiency change
    onDndSkillChange(skillId, profCheckbox, expCheckbox) {
        if (!this.currentCharacter) return;
        
        // Initialize skill objects if needed
        if (!this.currentCharacter.dndSkillProficiencies) {
            this.currentCharacter.dndSkillProficiencies = {};
        }
        if (!this.currentCharacter.dndSkillExpertise) {
            this.currentCharacter.dndSkillExpertise = {};
        }
        
        // Expertise requires proficiency
        if (expCheckbox.checked && !profCheckbox.checked) {
            profCheckbox.checked = true;
        }
        
        this.currentCharacter.dndSkillProficiencies[skillId] = profCheckbox.checked;
        this.currentCharacter.dndSkillExpertise[skillId] = expCheckbox.checked;
        
        this.onFieldChange();
    },

    // Combat skills to display
    COMBAT_SKILLS_RS: ['luta', 'pontaria', 'atletismo', 'acrobacia', 'reflexos', 'furtividade', 'intimidacao', 'percepcao', 'tatica', 'medicina'],
    COMBAT_SKILLS_DND: ['athletics', 'acrobatics', 'stealth', 'perception', 'insight', 'intimidation', 'investigation', 'survival', 'medicine', 'sleightOfHand'],

    // Generate combat skills HTML for combat tab
    // Combat skills for OP
    COMBAT_SKILLS_OP: ['luta', 'reflexos', 'pontaria', 'furtividade', 'atletismo', 'percepcao', 'iniciativa', 'intimidacao'],
    
    generateCombatSkillsHTML() {
        const grid = document.getElementById('combatSkillsGrid');
        if (!grid) return;

        grid.innerHTML = '';
        
        // Get system config
        const system = SystemManager?.getSystem(this.currentSystem);
        const config = system?.config || {};
        
        const isDnd = this.currentSystem === 'dnd5e' || config.attrType === 'dnd' || config.skillSystem === 'dnd';
        const isOP = this.currentSystem === 'ordemparanormal' || config.attrType === 'ordemparanormal';
        const hasCustomSkills = config.skillSystem === 'custom' && config.skills && config.skills.length > 0;
        
        let combatSkills;
        let allSkills;
        
        if (hasCustomSkills) {
            // For custom skills, show all skills in combat (user can have specific combat skills defined)
            allSkills = config.skills.map(s => ({
                id: s.id || s.name.toLowerCase().replace(/\s+/g, '_'),
                name: s.name,
                attr: s.attr || '-'
            }));
            // Show first 10 custom skills for combat tab or all if less than 10
            combatSkills = allSkills.slice(0, 10).map(s => s.id);
        } else if (isOP) {
            combatSkills = this.COMBAT_SKILLS_OP;
            allSkills = Calculations.OP_SKILLS;
        } else if (isDnd) {
            combatSkills = this.COMBAT_SKILLS_DND;
            allSkills = Calculations.DND_SKILLS;
        } else {
            combatSkills = this.COMBAT_SKILLS_RS;
            allSkills = Calculations.SKILLS;
        }

        combatSkills.forEach(skillId => {
            const skill = allSkills.find(s => s.id === skillId);
            if (!skill) return;

            const div = document.createElement('div');
            div.className = 'combat-skill-item';
            div.dataset.skillId = skillId;
            div.innerHTML = `
                <span class="combat-skill-name">${skill.name}</span>
                <span class="combat-skill-attr">${skill.attr}</span>
                <span class="combat-skill-total" data-combat-skill="${skillId}">+0</span>
            `;
            grid.appendChild(div);
        });
    },

    // Update combat skills display
    updateCombatSkills() {
        if (!this.currentCharacter) return;

        // Get system config
        const system = SystemManager?.getSystem(this.currentSystem);
        const config = system?.config || {};
        
        const isDnd = this.currentSystem === 'dnd5e' || config.attrType === 'dnd' || config.skillSystem === 'dnd';
        const isOP = this.currentSystem === 'ordemparanormal' || config.attrType === 'ordemparanormal';
        
        let combatSkills;
        if (isOP) {
            combatSkills = this.COMBAT_SKILLS_OP;
        } else if (isDnd) {
            combatSkills = this.COMBAT_SKILLS_DND;
        } else {
            combatSkills = this.COMBAT_SKILLS_RS;
        }

        combatSkills.forEach(skillId => {
            let total;
            if (isOP) {
                const skill = Calculations.OP_SKILLS.find(s => s.id === skillId);
                if (skill) {
                    const attrVal = Calculations.getOPAttrValue(this.currentCharacter, skill.attr);
                    const trainingLevel = this.currentCharacter.skills?.[skillId] || 0;
                    const trainingBonus = Calculations.getTrainingLevel(trainingLevel).bonus || 0;
                    total = attrVal + trainingBonus;
                } else {
                    total = 0;
                }
            } else if (isDnd) {
                total = Calculations.calculateDndSkillTotal(this.currentCharacter, skillId);
            } else {
                total = Calculations.calculateSkillTotal(this.currentCharacter, skillId);
            }
            
            const el = document.querySelector(`[data-combat-skill="${skillId}"]`);
            if (el) {
                el.textContent = (total >= 0 ? '+' : '') + total;
            }
        });
    },

    // Handle portrait upload
    handlePortraitUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = document.getElementById('charPortrait');
            img.src = event.target.result;
            this.currentCharacter.portrait = event.target.result;
            this.collectAndSave();
        };
        reader.readAsDataURL(file);
    },

    // Update race bonus display
    updateRaceBonus() {
        const bonusEl = document.getElementById('raceBonus');
        if (!bonusEl) return;
        
        // Get system config
        const system = SystemManager?.getSystem(this.currentSystem);
        const config = system?.config || {};
        
        const isDnd = this.currentSystem === 'dnd5e' || config.attrType === 'dnd';
        const race = this.currentCharacter.charRace;
        
        if (isDnd) {
            // D&D race bonus - use charRace field
            const raceInfo = Calculations.DND_RACES[race];
            
            if (raceInfo) {
                // Format bonuses
                const bonusList = [];
                if (raceInfo.bonuses.all) {
                    bonusList.push('+1 em todos');
                } else {
                    for (const [attr, val] of Object.entries(raceInfo.bonuses)) {
                        if (attr !== 'choice1' && attr !== 'choice2' && attr !== 'choice') {
                            bonusList.push(`${attr} +${val}`);
                        }
                    }
                }
                
                const bonusText = bonusList.length > 0 ? bonusList.join(', ') : '';
                const traitsText = raceInfo.traits.slice(0, 2).join(', ');
                
                bonusEl.innerHTML = `<strong>${raceInfo.name}</strong>: ${bonusText}<br><small>${traitsText}</small>`;
            } else {
                bonusEl.textContent = '';
            }
        } else if (this.currentSystem === 'ordemparanormal' || config.attrType === 'ordemparanormal') {
            // Ordem Paranormal - no race system, show trilha info
            const trilha = this.currentCharacter.opTrilha || 'combatente';
            const trilhaInfo = Calculations.OP_TRILHAS[trilha];
            if (trilhaInfo) {
                bonusEl.innerHTML = `
                    <div class="race-bonus-card">
                        <div class="race-name"><strong>📋 Trilha: ${trilhaInfo.name}</strong></div>
                        <div class="race-fusion"><i class="fas fa-heart"></i> PV: ${trilhaInfo.baseHp} + VIG (+${trilhaInfo.hpPerNex}/NEX)</div>
                        <div class="race-special"><i class="fas fa-bolt"></i> PE: ${trilhaInfo.basePe} + PRE (+${trilhaInfo.pePerNex}/NEX)</div>
                        <div class="race-skills"><i class="fas fa-star"></i> Perícias: +${trilhaInfo.skillsPerNex}/NEX</div>
                    </div>
                `;
            } else {
                bonusEl.textContent = '';
            }
        } else {
            // Realms&Scripts race bonus
            const raceInfo = race ? Calculations.RACE_BONUSES[race] : null;
            if (raceInfo) {
                bonusEl.innerHTML = `
                    <div class="race-bonus-card">
                        <div class="race-name"><strong>★ ${raceInfo.name}</strong></div>
                        <div class="race-fusion"><i class="fas fa-dna"></i> ${raceInfo.fusion}</div>
                        <div class="race-special"><i class="fas fa-star"></i> ${raceInfo.special}</div>
                        <div class="race-skills"><i class="fas fa-book"></i> ${raceInfo.skills}</div>
                        <div class="race-desc"><small>${raceInfo.description}</small></div>
                    </div>
                `;
            } else {
                bonusEl.textContent = '';
            }
        }
    },

    // Update all calculations and display
    updateCalculations() {
        if (!this.currentCharacter) return;

        // Get system config for dynamic behavior
        const system = SystemManager?.getSystem(this.currentSystem);
        const config = system?.config || {};
        
        // Set system in calculations module
        Calculations.currentSystem = this.currentSystem;
        
        const isDnd = this.currentSystem === 'dnd5e' || config.attrType === 'dnd';
        const isOP = this.currentSystem === 'ordemparanormal' || config.attrType === 'ordemparanormal';
        
        if (isDnd) {
            // D&D 5e calculations
            this.updateDndCalculations();
        } else if (isOP) {
            // Ordem Paranormal calculations
            this.updateOPCalculations(config);
        } else {
            // Use dynamic calculations based on system config
            this.updateDynamicCalculations(config);
        }

        // Update combat skills in combat tab
        this.updateCombatSkills();

        // Update trained skills list in principal tab
        this.updateTrainedSkillsList();

        // Update race bonus
        this.updateRaceBonus();
    },
    
    // Ordem Paranormal specific calculations
    updateOPCalculations(config) {
        const maxHp = Calculations.calculateOPMaxHP(this.currentCharacter);
        const maxPE = Calculations.calculateOPMaxPE(this.currentCharacter);
        const defenses = Calculations.calculateOPDefenses(this.currentCharacter);
        
        // Update HP
        const maxHpEl = document.getElementById('maxHp');
        const maxHpMainEl = document.getElementById('maxHpMain');
        const hpBar = document.getElementById('hpBar');
        if (maxHpEl) maxHpEl.textContent = maxHp;
        if (maxHpMainEl) maxHpMainEl.textContent = maxHp;
        if (hpBar) {
            const currentHp = parseInt(this.currentCharacter.currentHp) || 0;
            const percent = Math.min(100, Math.max(0, (currentHp / maxHp) * 100));
            hpBar.style.width = percent + '%';
        }
        
        // Update PE
        const maxPEEl = document.getElementById('maxPE');
        const maxPEMainEl = document.getElementById('maxPEMain');
        const peBar = document.getElementById('peBar');
        if (maxPEEl) maxPEEl.textContent = maxPE;
        if (maxPEMainEl) maxPEMainEl.textContent = maxPE;
        if (peBar) {
            const currentPE = parseInt(this.currentCharacter.currentPE) || 0;
            const percent = Math.min(100, Math.max(0, (currentPE / maxPE) * 100));
            peBar.style.width = percent + '%';
        }
        
        // Update OP Defenses
        const reflexosEl = document.getElementById('opReflexos');
        const fortitudeEl = document.getElementById('opFortitude');
        const vontadeEl = document.getElementById('opVontade');
        if (reflexosEl) reflexosEl.textContent = defenses.reflexos;
        if (fortitudeEl) fortitudeEl.textContent = defenses.fortitude;
        if (vontadeEl) vontadeEl.textContent = defenses.vontade;
        
        // Update NEX display
        const nex = parseInt(this.currentCharacter.charLevel) || 5;
        const nexEl = document.getElementById('opNexDisplay');
        if (nexEl) nexEl.textContent = nex + '%';
        
        // Update skill totals
        this.updateOPSkillTotals();
    },
    
    // Update OP skill totals
    updateOPSkillTotals() {
        if (!this.currentCharacter) return;
        
        Calculations.OP_SKILLS.forEach(skill => {
            const attrVal = Calculations.getOPAttrValue(this.currentCharacter, skill.attr);
            const trainingLevel = this.currentCharacter.skills?.[skill.id] || 0;
            const trainingBonus = Calculations.getTrainingLevel(trainingLevel).bonus || 0;
            const total = attrVal + trainingBonus;
            
            const totalEl = document.querySelector(`[data-skill-total="${skill.id}"]`);
            if (totalEl) {
                totalEl.textContent = (total >= 0 ? '+' : '') + total;
            }
        });
    },
    
    // Dynamic calculations based on system config
    updateDynamicCalculations(config) {
        // Calculate values using dynamic formulas
        const maxHp = Calculations.calculateDynamicMaxHP(this.currentCharacter);
        const maxPE = Calculations.calculateDynamicMaxPE(this.currentCharacter);
        const pa = Calculations.calculateDynamicPA(this.currentCharacter);
        const ca = Calculations.calculateDynamicCA(this.currentCharacter);
        const calc = Calculations.updateAllCalculations(this.currentCharacter);

        // Update HP
        const maxHpEl = document.getElementById('maxHp');
        const maxHpMainEl = document.getElementById('maxHpMain');
        const hpBar = document.getElementById('hpBar');
        if (maxHpEl) maxHpEl.textContent = maxHp;
        if (maxHpMainEl) maxHpMainEl.textContent = maxHp;
        if (hpBar) {
            const currentHp = parseInt(this.currentCharacter.currentHp) || 0;
            const percent = Math.min(100, Math.max(0, (currentHp / maxHp) * 100));
            hpBar.style.width = percent + '%';
        }

        // Update PE (if system has it)
        if (config.hasEnergyPoints !== false) {
            const maxPEEl = document.getElementById('maxPE');
            const maxPEMainEl = document.getElementById('maxPEMain');
            const peBar = document.getElementById('peBar');
            if (maxPEEl) maxPEEl.textContent = maxPE;
            if (maxPEMainEl) maxPEMainEl.textContent = maxPE;
            if (peBar) {
                const currentPE = parseInt(this.currentCharacter.currentPE) || 0;
                const percent = Math.min(100, Math.max(0, (currentPE / maxPE) * 100));
                peBar.style.width = percent + '%';
            }
        }

        // Update Sanity (if system has it)
        if (config.hasSanity) {
            const maxSanity = Calculations.calculateMaxSanity(this.currentCharacter);
            const maxSanityEl = document.getElementById('maxSanity');
            const maxSanityMainEl = document.getElementById('maxSanityMain');
            const sanBar = document.getElementById('sanBar');
            if (maxSanityEl) maxSanityEl.textContent = maxSanity;
            if (maxSanityMainEl) maxSanityMainEl.textContent = maxSanity;
            if (sanBar) {
                const currentSanity = parseInt(this.currentCharacter.sanity) || 0;
                const percent = Math.min(100, Math.max(0, (currentSanity / maxSanity) * 100));
                sanBar.style.width = percent + '%';
            }
        }

        // Update PA (if system has it)
        if (config.hasActionPoints) {
            const maxPAEl = document.getElementById('maxPA');
            const paBar = document.getElementById('paBar');
            if (maxPAEl) maxPAEl.textContent = pa;
            if (paBar) {
                const currentPA = parseInt(this.currentCharacter.currentPA) || 0;
                const percent = Math.min(100, Math.max(0, (currentPA / pa) * 100));
                paBar.style.width = percent + '%';
            }
        }

        // Update CA
        const caEl = document.getElementById('armorClass');
        if (caEl) caEl.textContent = ca;

        // Update Dodge (if system has it)
        if (config.hasDodge) {
            const dodgeEl = document.getElementById('dodge');
            if (dodgeEl) dodgeEl.textContent = calc.dodge;
        }

        // Update Initiative
        const initEl = document.getElementById('initiative');
        if (initEl) initEl.textContent = (calc.initiative >= 0 ? '+' : '') + calc.initiative;

        // Update Weight
        const currentWeightEl = document.getElementById('currentWeight');
        const maxWeightEl = document.getElementById('maxWeight');
        const maxWeightInfoEl = document.getElementById('maxWeightInfo');
        const heavyWeightInfoEl = document.getElementById('heavyWeightInfo');
        const weightStatusEl = document.getElementById('weightStatus');

        if (currentWeightEl) currentWeightEl.textContent = calc.currentWeight;
        if (maxWeightEl) maxWeightEl.textContent = calc.maxWeight;
        if (maxWeightInfoEl) maxWeightInfoEl.textContent = calc.maxWeight;
        if (heavyWeightInfoEl) heavyWeightInfoEl.textContent = calc.heavyWeight;
        
        if (weightStatusEl) {
            weightStatusEl.className = 'weight-badge ' + calc.weightStatus;
            const statusText = {
                'normal': 'OK',
                'heavy': 'PESADO',
                'overweight': 'EXCESSO'
            };
            weightStatusEl.textContent = statusText[calc.weightStatus];
        }

        // Update Damage Reductions (if system has fusions)
        if (config.hasFusions) {
            const reduceDefendEl = document.getElementById('reduceDefend');
            const reduceDamageEl = document.getElementById('reduceDamage');
            const reduceFallEl = document.getElementById('reduceFall');

            if (reduceDefendEl) reduceDefendEl.textContent = calc.reduceDefend;
            if (reduceDamageEl) reduceDamageEl.textContent = calc.reduceDamage;
            if (reduceFallEl) reduceFallEl.textContent = calc.reduceFall;
        }

        // Update Attribute Points
        const usedAttrEl = document.getElementById('usedAttrPoints');
        if (usedAttrEl) usedAttrEl.textContent = calc.usedAttrPoints;

        // Update PN per Level (if system has sanity)
        if (config.hasSanity) {
            const pnEl = document.getElementById('pnPerLevel');
            if (pnEl) pnEl.textContent = calc.pnPerLevel;
        }

        // Update all skill totals based on skill system type
        const hasCustomSkills = config.skillSystem === 'custom' && config.skills && config.skills.length > 0;
        
        if (hasCustomSkills) {
            // Custom skills
            config.skills.forEach(skill => {
                const skillId = skill.id || skill.name.toLowerCase().replace(/\s+/g, '_');
                const totalEl = document.querySelector(`[data-skill-total="${skillId}"]`);
                if (totalEl) {
                    const skillInfo = {
                        id: skillId,
                        attr: skill.attr || '-',
                        armorPenalty: skill.armorPenalty || false
                    };
                    const total = Calculations.calculateGenericSkillTotal(this.currentCharacter, skillId, skillInfo, 'custom');
                    totalEl.textContent = (total >= 0 ? '+' : '') + total;
                }
            });
        } else {
            // Standard R&S skills
            Calculations.SKILLS.forEach(skill => {
                const totalEl = document.querySelector(`[data-skill-total="${skill.id}"]`);
                if (totalEl) {
                    const total = Calculations.calculateSkillTotal(this.currentCharacter, skill.id);
                    totalEl.textContent = (total >= 0 ? '+' : '') + total;
                }
            });
        }
    },

    // Realms&Scripts specific calculations
    updateRsCalculations() {
        const calc = Calculations.updateAllCalculations(this.currentCharacter);

        // Update HP
        const maxHpEl = document.getElementById('maxHp');
        const maxHpMainEl = document.getElementById('maxHpMain');
        const hpBar = document.getElementById('hpBar');
        if (maxHpEl) maxHpEl.textContent = calc.maxHp;
        if (maxHpMainEl) maxHpMainEl.textContent = calc.maxHp;
        if (hpBar) {
            const currentHp = parseInt(this.currentCharacter.currentHp) || 0;
            const percent = Math.min(100, Math.max(0, (currentHp / calc.maxHp) * 100));
            hpBar.style.width = percent + '%';
        }

        // Update PE
        const maxPEEl = document.getElementById('maxPE');
        const maxPEMainEl = document.getElementById('maxPEMain');
        const peBar = document.getElementById('peBar');
        if (maxPEEl) maxPEEl.textContent = calc.maxPE;
        if (maxPEMainEl) maxPEMainEl.textContent = calc.maxPE;
        if (peBar) {
            const currentPE = parseInt(this.currentCharacter.currentPE) || 0;
            const percent = Math.min(100, Math.max(0, (currentPE / calc.maxPE) * 100));
            peBar.style.width = percent + '%';
        }

        // Update PA
        const maxPAEl = document.getElementById('maxPA');
        if (maxPAEl) maxPAEl.textContent = calc.pa;

        // Update CA
        const caEl = document.getElementById('armorClass');
        if (caEl) caEl.textContent = calc.ca;

        // Update Dodge
        const dodgeEl = document.getElementById('dodge');
        if (dodgeEl) dodgeEl.textContent = calc.dodge;

        // Update Initiative
        const initEl = document.getElementById('initiative');
        if (initEl) initEl.textContent = (calc.initiative >= 0 ? '+' : '') + calc.initiative;

        // Update Weight
        const currentWeightEl = document.getElementById('currentWeight');
        const maxWeightEl = document.getElementById('maxWeight');
        const maxWeightInfoEl = document.getElementById('maxWeightInfo');
        const heavyWeightInfoEl = document.getElementById('heavyWeightInfo');
        const weightStatusEl = document.getElementById('weightStatus');

        if (currentWeightEl) currentWeightEl.textContent = calc.currentWeight;
        if (maxWeightEl) maxWeightEl.textContent = calc.maxWeight;
        if (maxWeightInfoEl) maxWeightInfoEl.textContent = calc.maxWeight;
        if (heavyWeightInfoEl) heavyWeightInfoEl.textContent = calc.heavyWeight;
        
        if (weightStatusEl) {
            weightStatusEl.className = 'weight-badge ' + calc.weightStatus;
            const statusText = {
                'normal': 'OK',
                'heavy': 'PESADO',
                'overweight': 'EXCESSO'
            };
            weightStatusEl.textContent = statusText[calc.weightStatus];
        }

        // Update Damage Reductions
        const reduceDefendEl = document.getElementById('reduceDefend');
        const reduceDamageEl = document.getElementById('reduceDamage');
        const reduceFallEl = document.getElementById('reduceFall');

        if (reduceDefendEl) reduceDefendEl.textContent = calc.reduceDefend;
        if (reduceDamageEl) reduceDamageEl.textContent = calc.reduceDamage;
        if (reduceFallEl) reduceFallEl.textContent = calc.reduceFall;

        // Update Attribute Points
        const usedAttrEl = document.getElementById('usedAttrPoints');
        if (usedAttrEl) usedAttrEl.textContent = calc.usedAttrPoints;

        // Update PN per Level
        const pnEl = document.getElementById('pnPerLevel');
        if (pnEl) pnEl.textContent = calc.pnPerLevel;

        // Update all skill totals
        Calculations.SKILLS.forEach(skill => {
            const totalEl = document.querySelector(`[data-skill-total="${skill.id}"]`);
            if (totalEl) {
                const total = Calculations.calculateSkillTotal(this.currentCharacter, skill.id);
                totalEl.textContent = (total >= 0 ? '+' : '') + total;
            }
        });
    },

    // D&D 5e specific calculations
    updateDndCalculations() {
        // Update D&D modifiers and saving throws
        this.updateDndModifiers();
        this.updateDndClassDisplay();

        // Calculate D&D values
        const maxHp = Calculations.calculateDndMaxHP(this.currentCharacter);
        const ac = Calculations.calculateDndAC(this.currentCharacter);
        const initiative = Calculations.calculateDndInitiative(this.currentCharacter);
        const profBonus = Calculations.calculateDndProficiencyBonus(this.currentCharacter);
        const passivePerception = Calculations.calculateDndPassivePerception(this.currentCharacter);

        // Update HP
        const maxHpEl = document.getElementById('maxHp');
        const maxHpMainEl = document.getElementById('maxHpMain');
        const hpBar = document.getElementById('hpBar');
        if (maxHpEl) maxHpEl.textContent = maxHp;
        if (maxHpMainEl) maxHpMainEl.textContent = maxHp;
        if (hpBar) {
            const currentHp = parseInt(this.currentCharacter.currentHp) || 0;
            const percent = Math.min(100, Math.max(0, (currentHp / maxHp) * 100));
            hpBar.style.width = percent + '%';
        }

        // Update AC
        const caEl = document.getElementById('armorClass');
        if (caEl) caEl.textContent = ac;

        // Update Initiative
        const initEl = document.getElementById('initiative');
        if (initEl) initEl.textContent = (initiative >= 0 ? '+' : '') + initiative;

        // Update Proficiency Bonus
        const profBonusEl = document.getElementById('profBonus');
        if (profBonusEl) profBonusEl.textContent = '+' + profBonus;

        // Update Passive Perception
        const passiveEl = document.getElementById('passivePerception');
        if (passiveEl) passiveEl.textContent = passivePerception;

        // Update all D&D skill totals
        Calculations.DND_SKILLS.forEach(skill => {
            const totalEl = document.querySelector(`[data-skill-total="${skill.id}"]`);
            if (totalEl) {
                const total = Calculations.calculateDndSkillTotal(this.currentCharacter, skill.id);
                totalEl.textContent = (total >= 0 ? '+' : '') + total;
            }
        });

        // Update Spell DC if character is a caster
        const spellDC = Calculations.calculateDndSpellDC(this.currentCharacter);
        const spellDCEl = document.getElementById('spellDC');
        if (spellDCEl) spellDCEl.textContent = spellDC;

        // Calculate and update speed (base 30 for most races)
        const speed = this.currentCharacter.dndSpeed || 30;
        const speedEl = document.getElementById('dndSpeed');
        if (speedEl) speedEl.textContent = speed + ' ft';
    },

    // Update trained skills list
    updateTrainedSkillsList() {
        const container = document.getElementById('trainedSkillsList');
        if (!container) return;

        // Get system config
        const system = SystemManager?.getSystem(this.currentSystem);
        const config = system?.config || {};
        
        const isDnd = this.currentSystem === 'dnd5e' || config.attrType === 'dnd' || config.skillSystem === 'dnd';
        
        if (isDnd) {
            // D&D proficient skills
            const proficient = Calculations.getDndProficientSkills(this.currentCharacter);
            
            if (proficient.length === 0) {
                container.innerHTML = '<p class="no-skills">Nenhuma proficiência</p>';
                return;
            }
            
            container.innerHTML = proficient.map(skill => `
                <div class="trained-skill-item">
                    <span class="skill-name">
                        ${skill.proficiency === 2 ? '★★' : '★'} ${skill.name}
                    </span>
                    <span class="skill-bonus">${skill.total >= 0 ? '+' : ''}${skill.total}</span>
                </div>
            `).join('');
        } else {
            // Realms&Scripts trained skills
            const trained = Calculations.getTrainedSkills(this.currentCharacter);
            
            if (trained.length === 0) {
                container.innerHTML = '<p class="no-skills">Nenhuma perícia treinada</p>';
                return;
            }
            
            container.innerHTML = trained.map(skill => `
                <div class="trained-skill-item">
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-bonus">${skill.total >= 0 ? '+' : ''}${skill.total}</span>
                </div>
            `).join('');
        }
    }
};
