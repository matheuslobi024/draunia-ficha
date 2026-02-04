// ========== LAYOUT CUSTOMIZATION MODULE ==========

const Layout = {
    LAYOUT_KEY: 'draunia_layout',
    isEditMode: false,
    draggedElement: null,
    isMobile: false,

    // Initialize layout system
    init() {
        this.isMobile = this.detectMobile();
        this.loadLayout();
        this.createControls();
        this.bindEvents();
    },

    // Detect if user is on mobile device
    detectMobile() {
        return window.matchMedia('(max-width: 768px)').matches || 
               'ontouchstart' in window ||
               navigator.maxTouchPoints > 0;
    },

    // Create edit mode controls
    createControls() {
        // Container for buttons
        const controls = document.createElement('div');
        controls.className = 'layout-controls';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.id = 'layoutEditBtn';
        editBtn.className = 'layout-edit-btn';
        editBtn.innerHTML = '<i class="fas fa-th"></i> Editar Layout';
        editBtn.title = 'Personalizar Layout';
        editBtn.addEventListener('click', () => this.toggleEditMode());
        
        // Reset button (hidden by default)
        const resetBtn = document.createElement('button');
        resetBtn.id = 'layoutResetBtn';
        resetBtn.className = 'layout-reset-btn hidden';
        resetBtn.innerHTML = '<i class="fas fa-undo"></i> Resetar';
        resetBtn.title = 'Resetar Layout';
        resetBtn.addEventListener('click', () => this.resetLayout());
        
        controls.appendChild(editBtn);
        controls.appendChild(resetBtn);
        document.body.appendChild(controls);
        
        // Help tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'layout-help-tooltip';
        if (this.isMobile) {
            tooltip.innerHTML = '<i class="fas fa-info-circle"></i> Use as setas ↑↓ para mover os cards.';
        } else {
            tooltip.innerHTML = '<i class="fas fa-info-circle"></i> Arraste os cards para reorganizar.';
        }
        document.body.appendChild(tooltip);
        
        // Notification element
        const notification = document.createElement('div');
        notification.id = 'layoutNotification';
        notification.className = 'layout-saved-notification';
        notification.innerHTML = '<i class="fas fa-check"></i> Layout salvo!';
        document.body.appendChild(notification);
    },

    // Toggle edit mode
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        document.body.classList.toggle('layout-edit-mode', this.isEditMode);
        
        const editBtn = document.getElementById('layoutEditBtn');
        const resetBtn = document.getElementById('layoutResetBtn');
        
        if (this.isEditMode) {
            editBtn.innerHTML = '<i class="fas fa-check"></i> Salvar Layout';
            editBtn.classList.add('active');
            resetBtn.classList.remove('hidden');
            
            if (this.isMobile) {
                this.createMobileControls();
            } else {
                this.enableDragAndDrop();
            }
        } else {
            editBtn.innerHTML = '<i class="fas fa-th"></i> Editar Layout';
            editBtn.classList.remove('active');
            resetBtn.classList.add('hidden');
            
            if (this.isMobile) {
                this.removeMobileControls();
            } else {
                this.disableDragAndDrop();
            }
            
            this.saveLayout();
            this.showNotification();
        }
    },

    // ========== MOBILE: Arrow Button Controls ==========
    
    createMobileControls() {
        document.querySelectorAll('.draggable-card').forEach(card => {
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'mobile-card-controls';
            
            // Move up button
            const upBtn = document.createElement('button');
            upBtn.className = 'mobile-move-btn move-up';
            upBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
            upBtn.setAttribute('aria-label', 'Mover para cima');
            upBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.moveCardUp(card);
            });
            
            // Move down button
            const downBtn = document.createElement('button');
            downBtn.className = 'mobile-move-btn move-down';
            downBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
            downBtn.setAttribute('aria-label', 'Mover para baixo');
            downBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.moveCardDown(card);
            });
            
            controlsDiv.appendChild(upBtn);
            controlsDiv.appendChild(downBtn);
            
            // Insert at the beginning of the card
            card.insertBefore(controlsDiv, card.firstChild);
        });
    },

    removeMobileControls() {
        document.querySelectorAll('.mobile-card-controls').forEach(ctrl => {
            ctrl.remove();
        });
    },

    moveCardUp(card) {
        const container = card.parentElement;
        const allCards = Array.from(container.querySelectorAll('.draggable-card'));
        const currentIndex = allCards.indexOf(card);
        
        if (currentIndex > 0) {
            // Move before the previous card
            const prevCard = allCards[currentIndex - 1];
            container.insertBefore(card, prevCard);
            this.flashCard(card);
            
            // Haptic feedback
            if (navigator.vibrate) navigator.vibrate(30);
        } else {
            // Already at top, try to move to previous container
            const prevContainer = this.getPreviousContainer(container);
            if (prevContainer) {
                prevContainer.appendChild(card);
                this.flashCard(card);
                if (navigator.vibrate) navigator.vibrate(30);
            }
        }
    },

    moveCardDown(card) {
        const container = card.parentElement;
        const allCards = Array.from(container.querySelectorAll('.draggable-card'));
        const currentIndex = allCards.indexOf(card);
        
        if (currentIndex < allCards.length - 1) {
            // Move after the next card
            const nextCard = allCards[currentIndex + 1];
            nextCard.after(card);
            this.flashCard(card);
            
            // Haptic feedback
            if (navigator.vibrate) navigator.vibrate(30);
        } else {
            // Already at bottom, try to move to next container
            const nextContainer = this.getNextContainer(container);
            if (nextContainer) {
                nextContainer.insertBefore(card, nextContainer.firstChild);
                this.flashCard(card);
                if (navigator.vibrate) navigator.vibrate(30);
            }
        }
    },

    getPreviousContainer(currentContainer) {
        const tab = currentContainer.closest('.tab-content');
        const containers = Array.from(tab.querySelectorAll('.layout-container'));
        const currentIndex = containers.indexOf(currentContainer);
        return currentIndex > 0 ? containers[currentIndex - 1] : null;
    },

    getNextContainer(currentContainer) {
        const tab = currentContainer.closest('.tab-content');
        const containers = Array.from(tab.querySelectorAll('.layout-container'));
        const currentIndex = containers.indexOf(currentContainer);
        return currentIndex < containers.length - 1 ? containers[currentIndex + 1] : null;
    },

    flashCard(card) {
        card.classList.add('card-moved');
        setTimeout(() => card.classList.remove('card-moved'), 400);
    },

    // ========== DESKTOP: Drag and Drop ==========

    // Show saved notification
    showNotification() {
        const notification = document.getElementById('layoutNotification');
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    },

    // Bind events for desktop
    bindEvents() {
        // Initially make cards not draggable
        document.querySelectorAll('.draggable-card').forEach(el => {
            el.setAttribute('draggable', 'false');
        });
        
        // Allow container drops
        document.querySelectorAll('.layout-container').forEach(container => {
            container.addEventListener('dragover', this.handleContainerDragOver.bind(this));
            container.addEventListener('drop', this.handleContainerDrop.bind(this));
            container.addEventListener('dragenter', this.handleContainerDragEnter.bind(this));
            container.addEventListener('dragleave', this.handleContainerDragLeave.bind(this));
        });
    },

    // Enable drag and drop (desktop)
    enableDragAndDrop() {
        document.querySelectorAll('.draggable-card').forEach(el => {
            el.setAttribute('draggable', 'true');
            el.addEventListener('dragstart', this.handleDragStart.bind(this));
            el.addEventListener('dragend', this.handleDragEnd.bind(this));
            el.addEventListener('dragover', this.handleDragOver.bind(this));
            el.addEventListener('drop', this.handleDrop.bind(this));
            el.addEventListener('dragenter', this.handleDragEnter.bind(this));
            el.addEventListener('dragleave', this.handleDragLeave.bind(this));
        });
    },

    // Disable drag and drop
    disableDragAndDrop() {
        document.querySelectorAll('.draggable-card').forEach(el => {
            el.setAttribute('draggable', 'false');
        });
    },

    // Drag start handler
    handleDragStart(e) {
        if (!this.isEditMode) return;
        
        this.draggedElement = e.target.closest('.draggable-card');
        if (!this.draggedElement) return;
        
        this.draggedElement.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.draggedElement.dataset.cardId);
        
        document.querySelectorAll('.layout-container').forEach(container => {
            container.style.minHeight = container.offsetHeight + 'px';
        });
    },

    // Drag end handler
    handleDragEnd(e) {
        if (!this.isEditMode) return;
        
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
        }
        
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });
        
        document.querySelectorAll('.layout-container').forEach(container => {
            container.style.minHeight = '';
        });
        
        this.draggedElement = null;
    },

    handleContainerDragOver(e) {
        if (!this.isEditMode || !this.draggedElement) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    },

    handleContainerDragEnter(e) {
        if (!this.isEditMode || !this.draggedElement) return;
        const container = e.target.closest('.layout-container');
        if (container && !container.contains(this.draggedElement)) {
            container.classList.add('drag-over');
        }
    },

    handleContainerDragLeave(e) {
        if (!this.isEditMode) return;
        const container = e.target.closest('.layout-container');
        if (container && e.relatedTarget && !container.contains(e.relatedTarget)) {
            container.classList.remove('drag-over');
        }
    },

    handleContainerDrop(e) {
        if (!this.isEditMode || !this.draggedElement) return;
        e.preventDefault();
        
        const container = e.target.closest('.layout-container');
        if (!container) return;
        
        container.classList.remove('drag-over');
        
        if (!e.target.closest('.draggable-card')) {
            container.appendChild(this.draggedElement);
        }
    },

    handleDragOver(e) {
        if (!this.isEditMode) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    },

    handleDragEnter(e) {
        if (!this.isEditMode) return;
        const target = e.target.closest('.draggable-card');
        if (target && target !== this.draggedElement) {
            target.classList.add('drag-over');
        }
    },

    handleDragLeave(e) {
        if (!this.isEditMode) return;
        const target = e.target.closest('.draggable-card');
        if (target && e.relatedTarget && !target.contains(e.relatedTarget)) {
            target.classList.remove('drag-over');
        }
    },

    handleDrop(e) {
        if (!this.isEditMode) return;
        e.preventDefault();
        e.stopPropagation();
        
        const target = e.target.closest('.draggable-card');
        if (!target || target === this.draggedElement || !this.draggedElement) return;
        
        target.classList.remove('drag-over');
        
        const container = target.parentElement;
        const draggedContainer = this.draggedElement.parentElement;
        
        if (container === draggedContainer) {
            const allCards = Array.from(container.querySelectorAll('.draggable-card'));
            const draggedIndex = allCards.indexOf(this.draggedElement);
            const targetIndex = allCards.indexOf(target);
            
            if (draggedIndex < targetIndex) {
                target.after(this.draggedElement);
            } else {
                target.before(this.draggedElement);
            }
        } else {
            target.before(this.draggedElement);
        }
    },

    // ========== SAVE/LOAD LAYOUT ==========

    saveLayout() {
        const layout = {};
        
        document.querySelectorAll('.tab-content').forEach(tab => {
            const tabId = tab.id;
            layout[tabId] = {};
            
            tab.querySelectorAll('.layout-container').forEach(container => {
                const containerId = container.dataset.containerId;
                if (!containerId) return;
                
                const cardOrder = [];
                container.querySelectorAll('.draggable-card').forEach(card => {
                    if (card.dataset.cardId) {
                        cardOrder.push(card.dataset.cardId);
                    }
                });
                
                layout[tabId][containerId] = cardOrder;
            });
        });
        
        localStorage.setItem(this.LAYOUT_KEY, JSON.stringify(layout));
        console.log('Layout salvo!', layout);
    },

    loadLayout() {
        const savedLayout = localStorage.getItem(this.LAYOUT_KEY);
        if (!savedLayout) return;
        
        try {
            const layout = JSON.parse(savedLayout);
            
            Object.entries(layout).forEach(([tabId, containers]) => {
                const tab = document.getElementById(tabId);
                if (!tab) return;
                
                Object.entries(containers).forEach(([containerId, cardOrder]) => {
                    const container = tab.querySelector(`[data-container-id="${containerId}"]`);
                    if (!container) return;
                    
                    cardOrder.forEach(cardId => {
                        let card = container.querySelector(`[data-card-id="${cardId}"]`);
                        
                        if (!card) {
                            card = tab.querySelector(`[data-card-id="${cardId}"]`);
                        }
                        
                        if (card) {
                            container.appendChild(card);
                        }
                    });
                });
            });
            
            console.log('Layout carregado!');
        } catch (e) {
            console.error('Erro ao carregar layout:', e);
        }
    },

    resetLayout() {
        if (confirm('Tem certeza que deseja resetar o layout para o padrão?')) {
            localStorage.removeItem(this.LAYOUT_KEY);
            location.reload();
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => Layout.init(), 100);
});
