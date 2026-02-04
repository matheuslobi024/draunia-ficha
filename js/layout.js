// ========== LAYOUT CUSTOMIZATION MODULE ==========
// Desktop: Drag and Drop | Mobile: Setas

const Layout = {
    LAYOUT_KEY: 'draunia_layout',
    isEditMode: false,
    draggedElement: null,

    init() {
        this.loadLayout();
        this.createControls();
        
        if (this.isMobile()) {
            console.log('Layout: modo mobile - usando setas');
            this.createMobileArrows();
        } else {
            console.log('Layout: modo desktop - usando drag-drop');
            this.bindEvents();
        }
        
        // Listener para mudança de tamanho de tela
        window.addEventListener('resize', () => this.handleResize());
    },

    isMobile() {
        return window.matchMedia('(max-width: 768px)').matches;
    },
    
    handleResize() {
        const wasMobile = document.body.classList.contains('mobile-layout-mode');
        const isMobile = this.isMobile();
        
        if (isMobile && !wasMobile) {
            document.body.classList.add('mobile-layout-mode');
            this.createMobileArrows();
        } else if (!isMobile && wasMobile) {
            document.body.classList.remove('mobile-layout-mode');
            this.removeMobileArrows();
            this.bindEvents();
        }
    },

    createControls() {
        const controls = document.createElement('div');
        controls.className = 'layout-controls';
        
        const editBtn = document.createElement('button');
        editBtn.id = 'layoutEditBtn';
        editBtn.className = 'layout-edit-btn';
        editBtn.innerHTML = '<i class="fas fa-th"></i> Editar Layout';
        editBtn.addEventListener('click', () => this.toggleEditMode());
        
        const resetBtn = document.createElement('button');
        resetBtn.id = 'layoutResetBtn';
        resetBtn.className = 'layout-reset-btn hidden';
        resetBtn.innerHTML = '<i class="fas fa-undo"></i> Resetar';
        resetBtn.addEventListener('click', () => this.resetLayout());
        
        controls.appendChild(editBtn);
        controls.appendChild(resetBtn);
        document.body.appendChild(controls);
        
        const tooltip = document.createElement('div');
        tooltip.className = 'layout-help-tooltip';
        const tooltipText = this.isMobile() 
            ? '<i class="fas fa-info-circle"></i> Use as setas para reorganizar os cards.'
            : '<i class="fas fa-info-circle"></i> Arraste os cards para reorganizar.';
        tooltip.innerHTML = tooltipText;
        document.body.appendChild(tooltip);
        
        const notification = document.createElement('div');
        notification.id = 'layoutNotification';
        notification.className = 'layout-saved-notification';
        notification.innerHTML = '<i class="fas fa-check"></i> Layout salvo!';
        document.body.appendChild(notification);
        
        // Marca se é mobile
        if (this.isMobile()) {
            document.body.classList.add('mobile-layout-mode');
        }
    },

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        document.body.classList.toggle('layout-edit-mode', this.isEditMode);
        
        const editBtn = document.getElementById('layoutEditBtn');
        const resetBtn = document.getElementById('layoutResetBtn');
        
        if (this.isEditMode) {
            editBtn.innerHTML = '<i class="fas fa-check"></i> Salvar Layout';
            editBtn.classList.add('active');
            resetBtn.classList.remove('hidden');
            
            if (this.isMobile()) {
                this.showMobileArrows();
            } else {
                this.enableDragAndDrop();
            }
        } else {
            editBtn.innerHTML = '<i class="fas fa-th"></i> Editar Layout';
            editBtn.classList.remove('active');
            resetBtn.classList.add('hidden');
            
            if (this.isMobile()) {
                this.hideMobileArrows();
            } else {
                this.disableDragAndDrop();
            }
            this.saveLayout();
            this.showNotification();
        }
    },

    showNotification() {
        const notification = document.getElementById('layoutNotification');
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 2000);
    },

    bindEvents() {
        document.querySelectorAll('.draggable-card').forEach(el => {
            el.setAttribute('draggable', 'false');
        });
        
        document.querySelectorAll('.layout-container').forEach(container => {
            container.addEventListener('dragover', (e) => this.handleContainerDragOver(e));
            container.addEventListener('drop', (e) => this.handleContainerDrop(e));
            container.addEventListener('dragenter', (e) => this.handleContainerDragEnter(e));
            container.addEventListener('dragleave', (e) => this.handleContainerDragLeave(e));
        });
    },

    enableDragAndDrop() {
        document.querySelectorAll('.draggable-card').forEach(el => {
            el.setAttribute('draggable', 'true');
            el.addEventListener('dragstart', (e) => this.handleDragStart(e));
            el.addEventListener('dragend', (e) => this.handleDragEnd(e));
            el.addEventListener('dragover', (e) => this.handleDragOver(e));
            el.addEventListener('drop', (e) => this.handleDrop(e));
            el.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            el.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        });
    },

    disableDragAndDrop() {
        document.querySelectorAll('.draggable-card').forEach(el => {
            el.setAttribute('draggable', 'false');
        });
    },

    handleDragStart(e) {
        if (!this.isEditMode) return;
        this.draggedElement = e.target.closest('.draggable-card');
        if (!this.draggedElement) return;
        
        this.draggedElement.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.draggedElement.dataset.cardId);
    },

    handleDragEnd(e) {
        if (!this.isEditMode || !this.draggedElement) return;
        
        this.draggedElement.classList.remove('dragging');
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
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
                    if (card.dataset.cardId) cardOrder.push(card.dataset.cardId);
                });
                
                layout[tabId][containerId] = cardOrder;
            });
        });
        
        localStorage.setItem(this.LAYOUT_KEY, JSON.stringify(layout));
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
                        let card = tab.querySelector(`[data-card-id="${cardId}"]`);
                        if (card) container.appendChild(card);
                    });
                });
            });
        } catch (e) {
            console.error('Erro ao carregar layout:', e);
        }
    },

    resetLayout() {
        if (confirm('Resetar layout para o padrão?')) {
            localStorage.removeItem(this.LAYOUT_KEY);
            location.reload();
        }
    },

    // ========== SISTEMA DE SETAS MOBILE ==========
    
    createMobileArrows() {
        document.querySelectorAll('.draggable-card').forEach(card => {
            if (card.querySelector('.mobile-arrows')) return;
            
            const arrowsContainer = document.createElement('div');
            arrowsContainer.className = 'mobile-arrows';
            
            const upBtn = document.createElement('button');
            upBtn.className = 'mobile-arrow-btn arrow-up';
            upBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
            upBtn.title = 'Mover para cima';
            upBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.moveCardUp(card);
            });
            
            const downBtn = document.createElement('button');
            downBtn.className = 'mobile-arrow-btn arrow-down';
            downBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
            downBtn.title = 'Mover para baixo';
            downBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.moveCardDown(card);
            });
            
            arrowsContainer.appendChild(upBtn);
            arrowsContainer.appendChild(downBtn);
            card.appendChild(arrowsContainer);
        });
    },
    
    removeMobileArrows() {
        document.querySelectorAll('.mobile-arrows').forEach(el => el.remove());
    },
    
    showMobileArrows() {
        document.querySelectorAll('.mobile-arrows').forEach(el => {
            el.classList.add('visible');
        });
    },
    
    hideMobileArrows() {
        document.querySelectorAll('.mobile-arrows').forEach(el => {
            el.classList.remove('visible');
        });
    },
    
    moveCardUp(card) {
        const container = card.parentElement;
        const prevCard = card.previousElementSibling;
        
        if (prevCard && prevCard.classList.contains('draggable-card')) {
            // Move dentro do mesmo container
            container.insertBefore(card, prevCard);
            this.animateCard(card, 'up');
        } else {
            // Tenta mover para container anterior
            const activeTab = document.querySelector('.tab-content.active');
            const containers = Array.from(activeTab.querySelectorAll('.layout-container'));
            const currentIndex = containers.indexOf(container);
            
            if (currentIndex > 0) {
                const prevContainer = containers[currentIndex - 1];
                prevContainer.appendChild(card);
                this.animateCard(card, 'up');
            }
        }
    },
    
    moveCardDown(card) {
        const container = card.parentElement;
        const nextCard = card.nextElementSibling;
        
        if (nextCard && nextCard.classList.contains('draggable-card')) {
            // Move dentro do mesmo container
            container.insertBefore(nextCard, card);
            this.animateCard(card, 'down');
        } else {
            // Tenta mover para próximo container
            const activeTab = document.querySelector('.tab-content.active');
            const containers = Array.from(activeTab.querySelectorAll('.layout-container'));
            const currentIndex = containers.indexOf(container);
            
            if (currentIndex < containers.length - 1) {
                const nextContainer = containers[currentIndex + 1];
                // Insere no início do próximo container
                const firstCard = nextContainer.querySelector('.draggable-card');
                if (firstCard) {
                    nextContainer.insertBefore(card, firstCard);
                } else {
                    nextContainer.appendChild(card);
                }
                this.animateCard(card, 'down');
            }
        }
    },
    
    animateCard(card, direction) {
        card.classList.add('card-moved');
        card.classList.add(`card-moved-${direction}`);
        
        setTimeout(() => {
            card.classList.remove('card-moved', `card-moved-${direction}`);
        }, 300);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => Layout.init(), 100);
});
