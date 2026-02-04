// ========== LAYOUT CUSTOMIZATION MODULE ==========

const Layout = {
    LAYOUT_KEY: 'draunia_layout',
    isEditMode: false,
    draggedElement: null,
    
    // Touch-specific properties
    touchStartY: 0,
    touchStartX: 0,
    touchCurrentY: 0,
    touchCurrentX: 0,
    touchClone: null,
    isTouchDragging: false,
    scrollThreshold: 50, // pixels from edge to trigger scroll

    // Initialize layout system
    init() {
        this.loadLayout();
        this.createControls();
        this.bindEvents();
        this.bindTouchEvents();
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
        tooltip.innerHTML = '<i class="fas fa-info-circle"></i> Arraste os cards pelo ícone <i class="fas fa-grip-horizontal"></i> para reorganizar. Clique em "Editar Layout" novamente para salvar.';
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
            this.enableDragAndDrop();
        } else {
            editBtn.innerHTML = '<i class="fas fa-th"></i> Editar Layout';
            editBtn.classList.remove('active');
            resetBtn.classList.add('hidden');
            this.disableDragAndDrop();
            this.saveLayout();
            this.showNotification();
        }
    },

    // Show saved notification
    showNotification() {
        const notification = document.getElementById('layoutNotification');
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    },

    // Bind events
    bindEvents() {
        // Initially make cards not draggable
        document.querySelectorAll('.draggable-card').forEach(el => {
            el.setAttribute('draggable', 'false');
        });
        
        // Also allow container drops
        document.querySelectorAll('.layout-container').forEach(container => {
            container.addEventListener('dragover', this.handleContainerDragOver.bind(this));
            container.addEventListener('drop', this.handleContainerDrop.bind(this));
            container.addEventListener('dragenter', this.handleContainerDragEnter.bind(this));
            container.addEventListener('dragleave', this.handleContainerDragLeave.bind(this));
        });
    },

    // Enable drag and drop
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
        
        // Highlight containers
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

    // Container drag over
    handleContainerDragOver(e) {
        if (!this.isEditMode || !this.draggedElement) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    },

    // Container drag enter
    handleContainerDragEnter(e) {
        if (!this.isEditMode || !this.draggedElement) return;
        const container = e.target.closest('.layout-container');
        if (container && !container.contains(this.draggedElement)) {
            container.classList.add('drag-over');
        }
    },

    // Container drag leave
    handleContainerDragLeave(e) {
        if (!this.isEditMode) return;
        const container = e.target.closest('.layout-container');
        // Only remove if we're actually leaving the container
        if (container && e.relatedTarget && !container.contains(e.relatedTarget)) {
            container.classList.remove('drag-over');
        }
    },

    // Container drop
    handleContainerDrop(e) {
        if (!this.isEditMode || !this.draggedElement) return;
        e.preventDefault();
        
        const container = e.target.closest('.layout-container');
        if (!container) return;
        
        container.classList.remove('drag-over');
        
        // If dropping on the container (not a specific card), append to end
        if (!e.target.closest('.draggable-card')) {
            container.appendChild(this.draggedElement);
        }
    },

    // Drag over handler
    handleDragOver(e) {
        if (!this.isEditMode) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    },

    // Drag enter handler
    handleDragEnter(e) {
        if (!this.isEditMode) return;
        const target = e.target.closest('.draggable-card');
        if (target && target !== this.draggedElement) {
            target.classList.add('drag-over');
        }
    },

    // Drag leave handler
    handleDragLeave(e) {
        if (!this.isEditMode) return;
        const target = e.target.closest('.draggable-card');
        if (target && e.relatedTarget && !target.contains(e.relatedTarget)) {
            target.classList.remove('drag-over');
        }
    },

    // Drop handler
    handleDrop(e) {
        if (!this.isEditMode) return;
        e.preventDefault();
        e.stopPropagation();
        
        const target = e.target.closest('.draggable-card');
        if (!target || target === this.draggedElement || !this.draggedElement) return;
        
        target.classList.remove('drag-over');
        
        // Get the parent container
        const container = target.parentElement;
        const draggedContainer = this.draggedElement.parentElement;
        
        // Check if same container
        if (container === draggedContainer) {
            // Same container - reorder
            const allCards = Array.from(container.querySelectorAll('.draggable-card'));
            const draggedIndex = allCards.indexOf(this.draggedElement);
            const targetIndex = allCards.indexOf(target);
            
            if (draggedIndex < targetIndex) {
                target.after(this.draggedElement);
            } else {
                target.before(this.draggedElement);
            }
        } else {
            // Different containers - move before target
            target.before(this.draggedElement);
        }
    },

    // Save layout to localStorage
    saveLayout() {
        const layout = {};
        
        // Save order for each tab
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

    // Load layout from localStorage
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
                    
                    // Reorder cards - find them across the entire tab
                    cardOrder.forEach(cardId => {
                        // First try to find in the current container
                        let card = container.querySelector(`[data-card-id="${cardId}"]`);
                        
                        // If not found, look in the entire tab
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

    // Reset layout to default
    resetLayout() {
        if (confirm('Tem certeza que deseja resetar o layout para o padrão?')) {
            localStorage.removeItem(this.LAYOUT_KEY);
            location.reload();
        }
    },

    // ========== TOUCH EVENTS FOR MOBILE ==========
    
    bindTouchEvents() {
        // Bind touch events to draggable cards
        document.querySelectorAll('.draggable-card').forEach(el => {
            el.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
            el.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
            el.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
            el.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });
        });
    },

    handleTouchStart(e) {
        if (!this.isEditMode) return;
        
        const card = e.target.closest('.draggable-card');
        if (!card) return;
        
        // Check if touch started on drag handle or card header
        const handle = e.target.closest('.drag-handle, .card-header, h3, h4');
        if (!handle && !e.target.closest('.draggable-card > *:first-child')) {
            return; // Only drag from header area
        }
        
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.touchCurrentX = touch.clientX;
        this.touchCurrentY = touch.clientY;
        this.draggedElement = card;
        
        // Small delay to distinguish between tap and drag
        this.touchTimeout = setTimeout(() => {
            if (this.draggedElement) {
                this.startTouchDrag(touch);
            }
        }, 150);
    },

    startTouchDrag(touch) {
        if (!this.draggedElement) return;
        
        this.isTouchDragging = true;
        this.draggedElement.classList.add('dragging');
        
        // Create clone for visual feedback
        this.touchClone = this.draggedElement.cloneNode(true);
        this.touchClone.classList.add('touch-drag-clone');
        this.touchClone.style.cssText = `
            position: fixed;
            top: ${this.draggedElement.getBoundingClientRect().top}px;
            left: ${this.draggedElement.getBoundingClientRect().left}px;
            width: ${this.draggedElement.offsetWidth}px;
            height: ${this.draggedElement.offsetHeight}px;
            opacity: 0.8;
            z-index: 10000;
            pointer-events: none;
            transform: scale(1.02);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transition: none;
        `;
        document.body.appendChild(this.touchClone);
        
        // Make original semi-transparent
        this.draggedElement.style.opacity = '0.4';
        
        // Haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    },

    handleTouchMove(e) {
        if (!this.isEditMode || !this.draggedElement) return;
        
        const touch = e.touches[0];
        this.touchCurrentX = touch.clientX;
        this.touchCurrentY = touch.clientY;
        
        // Check if moved enough to start dragging
        const deltaX = Math.abs(this.touchCurrentX - this.touchStartX);
        const deltaY = Math.abs(this.touchCurrentY - this.touchStartY);
        
        if (!this.isTouchDragging && (deltaX > 10 || deltaY > 10)) {
            clearTimeout(this.touchTimeout);
            this.startTouchDrag(touch);
        }
        
        if (!this.isTouchDragging) return;
        
        e.preventDefault(); // Prevent scrolling while dragging
        
        // Move clone
        if (this.touchClone) {
            const offsetX = this.touchCurrentX - this.touchStartX;
            const offsetY = this.touchCurrentY - this.touchStartY;
            const originalRect = this.draggedElement.getBoundingClientRect();
            
            this.touchClone.style.left = `${originalRect.left + offsetX}px`;
            this.touchClone.style.top = `${originalRect.top + offsetY}px`;
        }
        
        // Auto-scroll when near edges
        this.handleAutoScroll();
        
        // Find element under touch
        this.updateDropTarget(touch);
    },

    handleAutoScroll() {
        const scrollSpeed = 10;
        
        if (this.touchCurrentY < this.scrollThreshold) {
            window.scrollBy(0, -scrollSpeed);
        } else if (this.touchCurrentY > window.innerHeight - this.scrollThreshold) {
            window.scrollBy(0, scrollSpeed);
        }
    },

    updateDropTarget(touch) {
        // Temporarily hide clone to get element underneath
        if (this.touchClone) {
            this.touchClone.style.display = 'none';
        }
        
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (this.touchClone) {
            this.touchClone.style.display = '';
        }
        
        // Remove previous highlights
        document.querySelectorAll('.drag-over, .touch-drop-target').forEach(el => {
            el.classList.remove('drag-over', 'touch-drop-target');
        });
        
        if (!elementBelow) return;
        
        // Check for card or container
        const targetCard = elementBelow.closest('.draggable-card');
        const targetContainer = elementBelow.closest('.layout-container');
        
        if (targetCard && targetCard !== this.draggedElement) {
            targetCard.classList.add('drag-over', 'touch-drop-target');
        } else if (targetContainer) {
            targetContainer.classList.add('drag-over');
        }
    },

    handleTouchEnd(e) {
        clearTimeout(this.touchTimeout);
        
        if (!this.isEditMode || !this.draggedElement) {
            this.cleanupTouchDrag();
            return;
        }
        
        if (this.isTouchDragging) {
            // Find drop target
            if (this.touchClone) {
                this.touchClone.style.display = 'none';
            }
            
            const elementBelow = document.elementFromPoint(this.touchCurrentX, this.touchCurrentY);
            
            if (elementBelow) {
                const targetCard = elementBelow.closest('.draggable-card');
                const targetContainer = elementBelow.closest('.layout-container');
                
                if (targetCard && targetCard !== this.draggedElement) {
                    // Drop on another card
                    const container = targetCard.parentElement;
                    const draggedContainer = this.draggedElement.parentElement;
                    
                    if (container === draggedContainer) {
                        const allCards = Array.from(container.querySelectorAll('.draggable-card'));
                        const draggedIndex = allCards.indexOf(this.draggedElement);
                        const targetIndex = allCards.indexOf(targetCard);
                        
                        if (draggedIndex < targetIndex) {
                            targetCard.after(this.draggedElement);
                        } else {
                            targetCard.before(this.draggedElement);
                        }
                    } else {
                        targetCard.before(this.draggedElement);
                    }
                } else if (targetContainer && !targetContainer.contains(this.draggedElement)) {
                    // Drop in container
                    targetContainer.appendChild(this.draggedElement);
                }
            }
            
            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
        }
        
        this.cleanupTouchDrag();
    },

    cleanupTouchDrag() {
        // Remove clone
        if (this.touchClone) {
            this.touchClone.remove();
            this.touchClone = null;
        }
        
        // Reset dragged element
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
            this.draggedElement.style.opacity = '';
        }
        
        // Remove all highlights
        document.querySelectorAll('.drag-over, .touch-drop-target').forEach(el => {
            el.classList.remove('drag-over', 'touch-drop-target');
        });
        
        this.isTouchDragging = false;
        this.draggedElement = null;
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure everything is loaded
    setTimeout(() => Layout.init(), 100);
});
