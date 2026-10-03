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
            <div class="dock-panel border-glow-card" style="--border-radius: 9999px; --glow-padding: 24px; --card-bg: rgba(0, 0, 0, 0.88); --edge-sensitivity: 15;" role="toolbar" aria-label="Application dock navigation">
                <span class="edge-light"></span>
                <div class="border-glow-inner dock-inner flex-row items-center justify-center h-full w-full">
                    ${config.items.map((item, idx) => `
                        <div class="dock-item ${item.avatarSrc ? 'dock-item-avatar' : ''}" data-index="${idx}" tabindex="0" role="button" aria-label="${item.label}">
                            <div class="dock-icon w-full h-full flex items-center justify-center">
                                ${item.avatarSrc 
                                    ? `<img src="${item.avatarSrc}" alt="${item.label}" class="w-full h-full object-cover rounded-full pointer-events-none">` 
                                    : `<i data-lucide="${item.icon}" class="w-5 h-5 pointer-events-none"></i>`
                                }
                            </div>
                            <div class="dock-label">${item.label}</div>
                        </div>
                    `).join('')}
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
