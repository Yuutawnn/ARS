/**
 * React Bits - Dock Component Engine (Vanilla High-Performance)
 * Spring-based proximity magnification with Sapphire Nightfall Whisper theme
 * Responsive Mobile Optimization
 */

(function () {
    function initDock(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        function getResponsiveSizes() {
            const width = window.innerWidth;
            if (width <= 375) {
                return { baseItemSize: 28, magnification: 28, distance: 0, isMobile: true };
            } else if (width <= 640) {
                return { baseItemSize: 30, magnification: 30, distance: 0, isMobile: true };
            }
            return {
                baseItemSize: options.baseItemSize || 42,
                magnification: options.magnification || 62,
                distance: options.distance || 140,
                isMobile: false
            };
        }

        let resp = getResponsiveSizes();

        const config = {
            baseItemSize: resp.baseItemSize,
            magnification: resp.magnification,
            distance: resp.distance,
            items: options.items || []
        };

        // Render HTML
        container.innerHTML = `
            <div class="dock-panel border-glow-card" style="--border-radius: 9999px; --glow-padding: 24px; --card-bg: rgba(0, 0, 0, 0.88); --edge-sensitivity: 15; overflow: visible !important;" role="toolbar" aria-label="Application dock navigation">
                <span class="edge-light"></span>
                <div class="border-glow-inner dock-inner flex-row items-center justify-center h-full w-full" style="overflow: visible !important;">
                    ${config.items.map((item, idx) => {
                        let iconMarkup = '';
                        if (item.avatarSrc) {
                            iconMarkup = `<img src="${item.avatarSrc}" alt="${item.label}" class="w-full h-full object-cover rounded-full pointer-events-none">`;
                        } else if (item.svg) {
                            iconMarkup = item.svg;
                        } else if (item.icon === 'discord') {
                            iconMarkup = `<svg class="w-5 h-5 pointer-events-none fill-current text-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`;
                        } else {
                            iconMarkup = `<i data-lucide="${item.icon}" class="w-5 h-5 pointer-events-none"></i>`;
                        }
                        return `
                        <div class="dock-item ${item.avatarSrc ? 'dock-item-avatar' : ''}" data-index="${idx}" tabindex="0" role="button" aria-label="${item.label}">
                            <div class="dock-icon w-full h-full flex items-center justify-center">
                                ${iconMarkup}
                            </div>
                            <div class="dock-label">${item.label}</div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        if (typeof initBorderGlow === 'function') initBorderGlow();

        const panel = container.querySelector('.dock-panel');
        const dockItems = Array.from(panel.querySelectorAll('.dock-item'));

        let mouseX = Infinity;
        let isHovering = false;
        let currentSizes = dockItems.map(() => config.baseItemSize);
        let targetSizes = dockItems.map(() => config.baseItemSize);
        let velocities = dockItems.map(() => 0);
        let rafId = null;

        function applySizes(sizes) {
            dockItems.forEach((el, i) => {
                el.style.width = `${sizes[i]}px`;
                el.style.height = `${sizes[i]}px`;
            });
        }

        applySizes(currentSizes);

        // Spring animation tuning
        const stiffness = 0.2;
        const damping = 0.72;

        function updateTargets() {
            if (!isHovering || mouseX === Infinity || resp.isMobile) {
                targetSizes.fill(config.baseItemSize);
                return;
            }

            dockItems.forEach((el, i) => {
                const rect = el.getBoundingClientRect();
                const itemCenterX = rect.left + rect.width / 2;
                const dist = Math.abs(mouseX - itemCenterX);

                if (dist < config.distance) {
                    const t = 1 - dist / config.distance;
                    const curve = Math.cos((1 - t) * Math.PI * 0.5);
                    targetSizes[i] = config.baseItemSize + (config.magnification - config.baseItemSize) * curve;
                } else {
                    targetSizes[i] = config.baseItemSize;
                }
            });
        }

        function animate() {
            let needsUpdate = false;

            dockItems.forEach((el, i) => {
                const diff = targetSizes[i] - currentSizes[i];
                const force = diff * stiffness;
                velocities[i] = (velocities[i] + force) * damping;
                currentSizes[i] += velocities[i];

                if (Math.abs(diff) > 0.1 || Math.abs(velocities[i]) > 0.1) {
                    needsUpdate = true;
                }

                el.style.width = `${currentSizes[i]}px`;
                el.style.height = `${currentSizes[i]}px`;
            });

            if (needsUpdate || isHovering) {
                rafId = requestAnimationFrame(animate);
            } else {
                rafId = null;
            }
        }

        function onMouseMove(e) {
            if (resp.isMobile || config.distance === 0) return;
            mouseX = e.clientX;
            isHovering = true;
            updateTargets();
            if (!rafId) {
                rafId = requestAnimationFrame(animate);
            }
        }

        function onMouseLeave() {
            mouseX = Infinity;
            isHovering = false;
            updateTargets();
            if (!rafId) {
                rafId = requestAnimationFrame(animate);
            }
        }

        panel.addEventListener('mousemove', onMouseMove);
        panel.addEventListener('mouseleave', onMouseLeave);

        // Window resize adaptation
        window.addEventListener('resize', () => {
            resp = getResponsiveSizes();
            config.baseItemSize = resp.baseItemSize;
            config.magnification = resp.magnification;
            config.distance = resp.distance;
            targetSizes.fill(resp.baseItemSize);
            currentSizes.fill(resp.baseItemSize);
            applySizes(currentSizes);
        }, { passive: true });

        // Click & keyboard interactions
        dockItems.forEach((el, idx) => {
            const item = config.items[idx];
            el.addEventListener('click', (e) => {
                if (typeof item.onClick === 'function') {
                    item.onClick(e, el);
                }
            });
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (typeof item.onClick === 'function') {
                        item.onClick(e, el);
                    }
                }
            });
        });
    }

    window.initDock = initDock;
})();
