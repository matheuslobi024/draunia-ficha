// ========== SHEET MODULE ==========

const Sheet = {
    currentCharacter: null,
    saveTimeout: null,

    // Initialize sheet
    init() {
        this.bindEvents();
        this.generateSkillsHTML();
        this.generateCombatSkillsHTML();
        this.setupSkillSearch();
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

        // Add attack button
        const addAttackBtn = document.getElementById('addAttackBtn');
        if (addAttackBtn) {
            addAttackBtn.addEventListener('click', () => this.addAttack());
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

        // Collect attacks
        this.collectAttacks();

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

        // Load inventory
        this.loadInventory();

        // Load attacks
        this.loadAttacks();

        // Sync vital values to main tab
        const currentHpMain = document.getElementById('currentHpMain');
        const sanityMain = document.getElementById('sanityMain');
        const currentPEMain = document.getElementById('currentPEMain');
        const currentPAInput = document.getElementById('currentPA');
        
        if (currentHpMain) currentHpMain.value = character.currentHp || 20;
        if (sanityMain) sanityMain.value = character.sanity || 20;
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

    // Add new attack
    addAttack() {
        this.addAttackHTML();
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

        Calculations.SKILLS.forEach(skill => {
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
    },

    // Combat skills to display
    COMBAT_SKILLS: ['luta', 'pontaria', 'atletismo', 'acrobacia', 'reflexos', 'furtividade', 'intimidacao', 'percepcao', 'tatica', 'medicina'],

    // Generate combat skills HTML for combat tab
    generateCombatSkillsHTML() {
        const grid = document.getElementById('combatSkillsGrid');
        if (!grid) return;

        grid.innerHTML = '';

        this.COMBAT_SKILLS.forEach(skillId => {
            const skill = Calculations.SKILLS.find(s => s.id === skillId);
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

        this.COMBAT_SKILLS.forEach(skillId => {
            const total = Calculations.calculateSkillTotal(this.currentCharacter, skillId);
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
        const race = this.currentCharacter.charRace;
        const bonusEl = document.getElementById('raceBonus');
        if (!bonusEl) return;

        if (race && Calculations.RACE_BONUSES[race]) {
            bonusEl.textContent = '★ ' + Calculations.RACE_BONUSES[race];
        } else {
            bonusEl.textContent = '';
        }
    },

    // Update all calculations and display
    updateCalculations() {
        if (!this.currentCharacter) return;

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

        // Update combat skills in combat tab
        this.updateCombatSkills();

        // Update trained skills list in principal tab
        this.updateTrainedSkillsList();

        // Update race bonus
        this.updateRaceBonus();
    },

    // Update trained skills list
    updateTrainedSkillsList() {
        const container = document.getElementById('trainedSkillsList');
        if (!container) return;

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
};
