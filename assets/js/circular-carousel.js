/**
 * React Bits - CircularCarousel Component Engine (Vanilla High-Performance)
 * 3D Cylinder / Orbit / Wheel / Panorama Interactive Carousel
 * Pure CSS 3D Transforms + Physics Simulation Loop + Touch/Wheel Gestures
 */

(function () {
    'use strict';

    const photo = id => `https://images.unsplash.com/${id}?w=900&q=80&auto=format&fit=max&sat=-100`;

    const DEFAULT_ITEMS = [
        {
            src: photo('photo-1506744038136-46273834b3fb'),
            alt: 'Mist drifting through a mountain valley',
            title: 'Valley',
            subtitle: 'Landscape'
        },
        {
            src: photo('photo-1524504388940-b1c1722653e1'),
            alt: 'A woman with long hair in soft studio light',
            title: 'Portrait',
            subtitle: 'Studio'
        },
        {
            src: photo('photo-1486406146926-c627a92ad1ab'),
            alt: 'Glass towers seen from street level',
            title: 'Towers',
            subtitle: 'Architecture'
        },
        {
            src: photo('photo-1502680390469-be75c86b636f'),
            alt: 'A surfer carving inside a breaking wave',
            title: 'Swell',
            subtitle: 'Ocean'
        },
        {
            src: photo('photo-1487958449943-2429e8be8625'),
            alt: 'An angular white building against the sky',
            title: 'Facade',
            subtitle: 'Architecture'
        },
        {
            src: photo('photo-1509631179647-0177331693ae'),
            alt: 'A model in striped trousers leaning on a wall',
            title: 'Pose',
            subtitle: 'Editorial'
        }
    ];

    const PRESETS = {
        cylinder: {
            axis: 'y',
            tilt: -5,
            perspective: 2500,
            curve: 1,
            spread: 1,
            inward: false,
            billboard: false,
            backfaces: true,
            window: 0
        },
        orbit: {
            axis: 'y',
            tilt: -16,
            perspective: 1500,
            curve: 0,
            spread: 1.45,
            inward: false,
            billboard: true,
            backfaces: false,
            window: 0
        },
        wheel: {
            axis: 'x',
            tilt: 0,
            perspective: 1800,
            curve: 0,
            spread: 1,
            inward: false,
            billboard: false,
            backfaces: true,
            window: 1.7
        },
        panorama: {
            axis: 'y',
            tilt: 0,
            perspective: 0,
            curve: 1,
            spread: 1,
            inward: true,
            billboard: false,
            backfaces: false,
            window: 0
        }
    };

    const INTRO_LENGTH = { assemble: 1500, rise: 1400, spin: 1800, none: 0 };
    const TILES = 8;
    const OVERLAP = 2.5;
    const DRAG_THRESHOLD = 5;
    const SPRING = 118;
    const SETTLE_SPEED = 9;
    const CAPTION_SPACE = 76;
    const TO_RAD = Math.PI / 180;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const wrap = degrees => ((((degrees + 180) % 360) + 360) % 360) - 180;
    const easeOut = t => 1 - Math.pow(1 - t, 4);
    const easeOutQuint = t => 1 - Math.pow(1 - t, 5);

    const rotateX = (p, degrees) => {
        const r = degrees * TO_RAD;
        const c = Math.cos(r);
        const s = Math.sin(r);
        return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
    };

    const rotateY = (p, degrees) => {
        const r = degrees * TO_RAD;
        const c = Math.cos(r);
        const s = Math.sin(r);
        return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
    };

    function createDigitReelHTML(digit) {
        const val = Number(digit);
        const reelSpan = '0123456789'.split('').map(n => `<span>${n}</span>`).join('');
        return `
            <span class="circular-carousel__digit">
                <span class="circular-carousel__reel" style="transform: translateY(${-val * 10}%)">
                    ${reelSpan}
                </span>
            </span>
        `;
    }

    function createDigitsHTML(value) {
        const str = String(value).padStart(2, '0');
        return `
            <span class="circular-carousel__digits">
                ${str.split('').map(d => createDigitReelHTML(d)).join('')}
            </span>
        `;
    }

    function initCircularCarousel(container, options = {}) {
        const root = typeof container === 'string' ? document.getElementById(container) : container;
        if (!root) return null;

        const list = options.items && options.items.length ? options.items : DEFAULT_ITEMS;
        const count = list.length;
        const shape = PRESETS[options.preset] ? options.preset : 'cylinder';
        const layout = PRESETS[shape];
        const axis = layout.axis;
        const tiltValue = options.tilt !== undefined ? options.tilt : layout.tilt;
        const curveValue = layout.billboard ? 0 : clamp(options.curve !== undefined ? options.curve : layout.curve, 0, 1);

        const cardWidth = options.cardWidth || 220;
        const aspectRatio = options.aspectRatio !== undefined ? options.aspectRatio : 1;
        const gap = options.gap !== undefined ? options.gap : 25;
        const intro = options.intro || 'rise';
        const autoplay = options.autoplay || 'drift';
        const speed = options.speed !== undefined ? options.speed : 14;
        const interval = Math.max(0.5, options.interval || 3);
        const direction = options.direction || 'left';
        const draggable = options.draggable !== undefined ? options.draggable : true;
        const momentum = clamp(options.momentum !== undefined ? options.momentum : 0.6, 0, 1);
        const snap = options.snap !== undefined ? options.snap : true;
        const pauseOnHover = options.pauseOnHover !== undefined ? options.pauseOnHover : true;
        const focusOnClick = options.focusOnClick !== undefined ? options.focusOnClick : true;
        const parallax = clamp(options.parallax !== undefined ? options.parallax : 0.3, 0, 1);
        const stretch = clamp(options.stretch !== undefined ? options.stretch : 0.5, 0, 1);
        const depthFade = clamp(options.depthFade !== undefined ? options.depthFade : 0.55, 0, 1);
        const fadeColor = options.fadeColor || '#000000';
        const innerShade = clamp(options.innerShade !== undefined ? options.innerShade : 0.6, 0, 1);
        const cornerRadius = options.cornerRadius !== undefined ? options.cornerRadius : 12;
        const captions = options.captions !== undefined ? options.captions : true;

        const cardW = Math.max(40, cardWidth);
        const cardH = cardW / clamp(aspectRatio, 0.2, 5);
        const along = axis === 'x' ? cardH : cardW;
        const step = 360 / count;

        const n = Math.max(count, 3);
        const pitch = (along + gap) * layout.spread;
        const chord = pitch / (2 * Math.sin(Math.PI / n));
        const arc = (n * pitch) / (2 * Math.PI);
        const radius = Math.max(chord + (arc - chord) * curveValue, along * 0.6);

        // Precompute Curved Mesh Tiles
        const total = curveValue > 0.001 ? TILES : 1;
        const length = along / total;
        const bend = curveValue > 0.001 ? radius / curveValue : 0;
        const tiles = Array.from({ length: total }, (_, index) => {
            const start = index * length - (index > 0 ? OVERLAP / 2 : 0);
            const end = (index + 1) * length + (index < total - 1 ? OVERLAP / 2 : 0);
            const center = (start + end) / 2 - along / 2;
            const alpha = bend ? center / bend : 0;
            const shift = bend ? bend * Math.sin(alpha) : center;
            const sink = bend ? bend * (1 - Math.cos(alpha)) : 0;
            const depth = layout.inward ? sink : -sink;
            const turn = ((layout.inward ? -alpha : alpha) * 180) / Math.PI;
            const move =
                axis === 'x'
                    ? `translate3d(0px, ${shift}px, ${depth}px) rotateX(${-turn}deg)`
                    : `translate3d(${shift}px, 0px, ${depth}px) rotateY(${turn}deg)`;
            return { index, total, start, end, size: end - start, move };
        });

        function renderTileHTML(item, tile, back) {
            const strip = back ? tile.total - 1 - tile.index : tile.index;
            const first = strip === 0;
            const last = strip === tile.total - 1;
            const r = 'var(--cc-radius)';
            const frameRadius =
                axis === 'x'
                    ? `${first ? r : '0'} ${first ? r : '0'} ${last ? r : '0'} ${last ? r : '0'}`
                    : `${first ? r : '0'} ${last ? r : '0'} ${last ? r : '0'} ${first ? r : '0'}`;
            const offset = back ? along - tile.end : tile.start;
            const size = tile.size;
            const boxStyle =
                axis === 'x'
                    ? `left: ${-cardW / 2}px; top: ${-size / 2}px; width: ${cardW}px; height: ${size}px;`
                    : `left: ${-size / 2}px; top: ${-cardH / 2}px; width: ${size}px; height: ${cardH}px;`;
            const photoStyle =
                axis === 'x'
                    ? `left: 0px; top: ${-offset}px; width: ${cardW}px; height: ${cardH}px;`
                    : `left: ${-offset}px; top: 0px; width: ${cardW}px; height: ${cardH}px;`;
            const flip = axis === 'x' ? ' rotateX(180deg)' : ' rotateY(180deg)';

            return `
                <div class="circular-carousel__tile" style="${boxStyle} transform: ${tile.move + (back ? flip : '')};" aria-hidden="true">
                    <div class="circular-carousel__frame" style="height: ${axis === 'x' ? size : cardH}px; border-radius: ${frameRadius};">
                        <img class="circular-carousel__photo" src="${item.src}" alt="${item.alt || ''}" draggable="false" decoding="async" style="${photoStyle}">
                        ${back ? '<div class="circular-carousel__inner"></div>' : ''}
                        <div class="circular-carousel__shade"></div>
                    </div>
                </div>
            `;
        }

        function renderCardHTML(item, idx) {
            const frontTiles = tiles.map(tile => renderTileHTML(item, tile, false)).join('');
            const backTiles = layout.backfaces ? tiles.map(tile => renderTileHTML(item, tile, true)).join('') : '';
            return `
                <div class="circular-carousel__card" data-cc-index="${idx}" role="group" aria-roledescription="slide" aria-label="${item.title || item.alt || `Image ${idx + 1}`}, ${idx + 1} of ${count}">
                    ${frontTiles}
                    ${backTiles}
                </div>
            `;
        }

        const initialLabel = list[0].title || list[0].alt || 'Image 1';

        // Render Base HTML
        root.innerHTML = `
            <div class="circular-carousel ${options.className || ''}" style="--cc-fade: ${fadeColor}; --cc-radius: ${Math.max(0, cornerRadius)}px; --cc-inner: ${(1 - clamp(innerShade, 0, 1)).toFixed(3)};" role="region" aria-roledescription="carousel" aria-label="Image carousel" tabindex="0" data-axis="${axis}" data-shape="${shape}" ${draggable ? 'data-draggable' : ''}>
                <div class="circular-carousel__view">
                    <div class="circular-carousel__stage">
                        <div class="circular-carousel__camera">
                            <div class="circular-carousel__ring">
                                ${list.map((item, idx) => renderCardHTML(item, idx)).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                ${captions ? `
                    <div class="circular-carousel__caption" aria-hidden="true">
                        <span class="circular-carousel__title">
                            <span class="circular-carousel__title-text">${list[0].title || list[0].alt || ''}</span>
                            ${list[0].subtitle ? `<span class="circular-carousel__subtitle">${list[0].subtitle}</span>` : ''}
                        </span>
                        <span class="circular-carousel__count">
                            <span class="circular-carousel__digits-wrapper">${createDigitsHTML(1)}</span>
                            <span class="circular-carousel__slash">/</span>
                            <span>${String(count).padStart(2, '0')}</span>
                        </span>
                    </div>
                ` : ''}
                <div class="circular-carousel__live" aria-live="polite" aria-atomic="true">
                    ${initialLabel}, 1 of ${count}
                </div>
            </div>
        `;

        const wrapper = root.querySelector('.circular-carousel');
        const stage = root.querySelector('.circular-carousel__stage');
        const camera = root.querySelector('.circular-carousel__camera');
        const ring = root.querySelector('.circular-carousel__ring');
        const cardEls = Array.from(root.querySelectorAll('.circular-carousel__card'));
        const captionTitleEl = root.querySelector('.circular-carousel__title');
        const captionCountWrapper = root.querySelector('.circular-carousel__digits-wrapper');
        const liveEl = root.querySelector('.circular-carousel__live');

        // State Machine
        const dragSign = layout.inward ? -1 : 1;
        const directionSign = (direction === 'right' ? 1 : -1) * dragSign;

        const state = {
            angle: 0,
            velocity: 0,
            target: null,
            dir: directionSign,
            press: null,
            drag: false,
            hover: false,
            pointer: { inside: false, x: 0, y: 0 },
            yaw: 0,
            pitch: 0,
            intro: null,
            introDone: false,
            holdUntil: 0,
            stepAt: 0,
            suppressClick: false,
            wheelTimer: 0,
            fit: 1,
            shift: 0,
            drop: 0,
            last: 0,
            active: 0,
            ready: false
        };

        const settings = {
            count,
            step,
            radius,
            layout,
            axis,
            tilt: tiltValue,
            perspective: layout.inward ? radius : (options.perspective !== undefined ? options.perspective : layout.perspective),
            cardW,
            cardH,
            intro: intro in INTRO_LENGTH ? intro : 'rise',
            autoplay,
            speed,
            interval,
            draggable,
            momentum,
            snap,
            pauseOnHover,
            parallax,
            stretch,
            depthFade,
            captions
        };

        let raf = 0;
        let visible = true;

        const nearest = angle => Math.round(angle / settings.step) * settings.step;

        const measure = () => {
            const rect = wrapper.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            const room = settings.captions ? CAPTION_SPACE : 0;
            const width = rect.width * 0.94;
            const height = (rect.height - room) * 0.92;
            const P = settings.perspective;
            let minX = Infinity;
            let maxX = -Infinity;
            let minY = Infinity;
            let maxY = -Infinity;

            if (settings.layout.inward) {
                minX = -width / 2;
                maxX = width / 2;
                minY = -settings.cardH / 2;
                maxY = settings.cardH / 2;
            } else {
                const corners = [
                    [-settings.cardW / 2, -settings.cardH / 2],
                    [settings.cardW / 2, -settings.cardH / 2],
                    [-settings.cardW / 2, settings.cardH / 2],
                    [settings.cardW / 2, settings.cardH / 2]
                ];
                const limit = settings.layout.window ? settings.layout.window * settings.step : 180;
                for (let a = -limit; a <= limit; a += limit / 24) {
                    for (const [cx, cy] of corners) {
                        let p;
                        if (settings.axis === 'x') {
                            p = rotateX([cx, cy, settings.radius], -a);
                            p = [p[0], p[1], p[2] - settings.radius];
                            p = rotateY(p, settings.tilt);
                        } else if (settings.layout.billboard) {
                            const c = rotateY([0, 0, settings.radius], a);
                            p = [c[0] + cx, cy, c[2] - settings.radius];
                            p = rotateX(p, settings.tilt);
                        } else {
                            p = rotateY([cx, cy, settings.radius], a);
                            p = [p[0], p[1], p[2] - settings.radius];
                            p = rotateX(p, settings.tilt);
                        }
                        if (p[2] >= P * 0.95) continue;
                        const k = P / (P - p[2]);
                        minX = Math.min(minX, p[0] * k);
                        maxX = Math.max(maxX, p[0] * k);
                        minY = Math.min(minY, p[1] * k);
                        maxY = Math.max(maxY, p[1] * k);
                    }
                }
            }

            const spanX = Math.max(maxX - minX, 1);
            const spanY = Math.max(maxY - minY, 1);
            const fit = Math.min(1, width / spanX, height / spanY);
            state.fit = fit;
            state.shift = -((minY + maxY) / 2) * fit - room / 2;
            state.drop = settings.axis === 'x' ? (rect.width / fit) * 0.55 + settings.cardW : (rect.height / fit) * 0.55 + settings.cardH;
            stage.style.perspective = `${P}px`;
            stage.style.transform = `translate3d(0, ${state.shift}px, 0) scale(${fit})`;
        };

        const introCard = (elapsed, landing) => {
            if (!state.intro) return { radius: 1, lift: 0 };
            const type = state.intro.type;
            const reach = Math.abs(wrap(landing + state.angle));
            if (type === 'assemble') {
                const delay = (reach / 180) * 420;
                const p = easeOut(clamp((elapsed - delay) / 1080, 0, 1));
                return { radius: 1 + 0.6 * (1 - p), lift: 0 };
            }
            if (type === 'rise') {
                const delay = (reach / 180) * 480;
                const p = easeOutQuint(clamp((elapsed - delay) / 900, 0, 1));
                return { radius: 1, lift: (1 - p) * state.drop };
            }
            if (type === 'spin') {
                const p = easeOut(clamp(elapsed / INTRO_LENGTH.spin, 0, 1));
                return { radius: 1 + 0.28 * (1 - p), lift: 0 };
            }
            return { radius: 1, lift: 0 };
        };

        const advance = (s, dt, now) => {
            if (!state.introDone && state.ready) {
                if (!state.intro) {
                    if (s.intro === 'none') state.introDone = true;
                    else state.intro = { type: s.intro, start: now };
                }
                if (state.intro && now - state.intro.start >= INTRO_LENGTH[state.intro.type]) {
                    state.intro = null;
                    state.introDone = true;
                }
            }

            const paused = (s.pauseOnHover && state.hover) || state.drag || now < state.holdUntil;
            const cruise = s.autoplay === 'drift' && !paused && !state.intro ? s.speed * state.dir : 0;
            let busy = Boolean(state.intro) || state.drag;

            if (state.drag || state.intro) {
                state.velocity = state.drag ? state.velocity : 0;
            } else if (state.target !== null) {
                let remaining = dt;
                const damping = 2 * Math.sqrt(SPRING);
                while (remaining > 0) {
                    const h = Math.min(remaining, 1 / 240);
                    const accel = SPRING * (state.target - state.angle) - damping * state.velocity;
                    state.velocity += accel * h;
                    state.angle += state.velocity * h;
                    remaining -= h;
                }
                if (Math.abs(state.target - state.angle) < 0.004 && Math.abs(state.velocity) < 0.03) {
                    state.angle = state.target;
                    state.velocity = 0;
                    state.target = null;
                }
                busy = true;
            } else {
                const tau = 0.18 + s.momentum * 1.5;
                state.velocity += (cruise - state.velocity) * (1 - Math.exp(-dt / tau));
                state.angle += state.velocity * dt;
                if (cruise === 0 && s.snap && Math.abs(state.velocity) < SETTLE_SPEED) {
                    state.target = nearest(state.angle);
                }
                busy = busy || cruise !== 0 || Math.abs(state.velocity) > 0.01 || state.target !== null;
            }

            if (s.autoplay === 'step' && !paused && !state.intro && state.introDone) {
                if (!state.stepAt) state.stepAt = now + s.interval * 1000;
                if (now >= state.stepAt) {
                    state.target = (state.target !== null ? state.target : nearest(state.angle)) + s.step * state.dir;
                    state.stepAt = now + s.interval * 1000;
                }
                busy = true;
            } else {
                state.stepAt = 0;
            }

            if (now < state.holdUntil) busy = true;

            const ease = 1 - Math.exp(-dt / 0.35);
            const aimYaw = state.pointer.inside ? state.pointer.x * s.parallax * 9 : 0;
            const aimPitch = state.pointer.inside ? -state.pointer.y * s.parallax * 6 : 0;
            state.yaw += (aimYaw - state.yaw) * ease;
            state.pitch += (aimPitch - state.pitch) * ease;
            if (Math.abs(aimYaw - state.yaw) > 0.01 || Math.abs(aimPitch - state.pitch) > 0.01) busy = true;

            return busy;
        };

        const render = (s, now) => {
            const elapsed = state.intro ? now - state.intro.start : 0;
            const swell = 1 + s.stretch * 0.12 * Math.min(1, Math.abs(state.velocity) / 420);
            let spinOffset = 0;
            if (state.intro && state.intro.type === 'spin') {
                const p = easeOut(clamp(elapsed / INTRO_LENGTH.spin, 0, 1));
                spinOffset = -300 * state.dir * (1 - p);
            } else if (state.intro && state.intro.type === 'assemble') {
                const p = easeOut(clamp(elapsed / INTRO_LENGTH.assemble, 0, 1));
                spinOffset = -32 * state.dir * (1 - p);
            }
            const angle = state.angle + spinOffset;
            const R = s.radius * swell;

            if (s.axis === 'x') {
                camera.style.transform = `translate3d(0, 0, ${-R}px) rotateY(${s.tilt + state.yaw}deg) rotateX(${state.pitch}deg)`;
                ring.style.transform = `rotateX(${-angle}deg)`;
            } else if (s.layout.inward) {
                camera.style.transform = `translate3d(0, 0, ${s.perspective - 1}px) rotateX(${s.tilt + state.pitch}deg) rotateY(${state.yaw}deg)`;
                ring.style.transform = `rotateY(${angle}deg)`;
            } else {
                camera.style.transform = `translate3d(0, 0, ${-R}px) rotateX(${s.tilt + state.pitch}deg) rotateY(${state.yaw}deg)`;
                ring.style.transform = `rotateY(${angle}deg)`;
            }

            for (let index = 0; index < s.count; index++) {
                const card = cardEls[index];
                if (!card) continue;
                const base = index * s.step;
                const mod = introCard(elapsed, base);
                const r = R * mod.radius;
                let transform;
                if (s.axis === 'x') {
                    transform = `rotateX(${-base}deg) translateZ(${r}px)`;
                } else if (s.layout.inward) {
                    transform = `rotateY(${base}deg) translateZ(${-r}px)`;
                } else {
                    transform = `rotateY(${base}deg) translateZ(${r}px)`;
                    if (s.layout.billboard) transform += ` rotateY(${-(base + angle)}deg)`;
                }
                if (mod.lift) transform += s.axis === 'x' ? ` translateX(${mod.lift}px)` : ` translateY(${mod.lift}px)`;
                card.style.transform = transform;

                const world = wrap(base + angle);
                const facing = Math.cos(world * TO_RAD);
                if (s.layout.inward) card.style.visibility = Math.abs(world) > 86 ? 'hidden' : '';
                const fade = s.depthFade * Math.pow((1 - facing) / 2, 1.25);
                card.style.setProperty('--cc-depth', fade.toFixed(3));
            }

            const index = ((Math.round(-state.angle / s.step) % s.count) + s.count) % s.count || 0;
            if (index !== state.active) {
                state.active = index;
                updateCaptions(index);
                if (typeof options.onChange === 'function') options.onChange(index);
            }
        };

        function updateCaptions(idx) {
            const item = list[idx] || list[0];
            if (captionTitleEl) {
                captionTitleEl.innerHTML = `
                    <span class="circular-carousel__title-text">${item.title || item.alt || ''}</span>
                    ${item.subtitle ? `<span class="circular-carousel__subtitle">${item.subtitle}</span>` : ''}
                `;
            }
            if (captionCountWrapper) {
                captionCountWrapper.innerHTML = createDigitsHTML(idx + 1);
            }
            if (liveEl) {
                const currentLabel = item.title || item.alt || `Image ${idx + 1}`;
                liveEl.textContent = `${currentLabel}, ${idx + 1} of ${count}`;
            }
        }

        const frame = now => {
            raf = 0;
            const dt = state.last ? Math.min((now - state.last) / 1000, 0.05) : 1 / 60;
            state.last = now;
            const busy = advance(settings, dt, now);
            render(settings, now);
            if (busy && visible && !document.hidden) {
                raf = requestAnimationFrame(frame);
            } else {
                state.last = 0;
            }
        };

        const wake = () => {
            if (!raf && visible && !document.hidden) {
                raf = requestAnimationFrame(frame);
            }
        };

        const focusIndex = idx => {
            let target = -idx * settings.step;
            target += 360 * Math.round((state.angle - target) / 360);
            state.target = target;
            state.holdUntil = performance.now() + 2800;
            wake();
        };

        const stepBy = delta => {
            const base = state.target !== null ? state.target : Math.round(state.angle / settings.step) * settings.step;
            state.target = base - delta * settings.step * (settings.layout.inward ? -1 : 1);
            state.holdUntil = performance.now() + 2800;
            wake();
        };

        // Pointer & Gesture Handlers
        const updatePointer = e => {
            const rect = wrapper.getBoundingClientRect();
            state.pointer.x = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
            state.pointer.y = clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
        };

        const handlePointerDown = e => {
            state.suppressClick = false;
            if (!draggable || e.button !== 0) return;
            state.press = {
                id: e.pointerId,
                x: e.clientX,
                y: e.clientY,
                angle: state.angle,
                moved: false,
                origin: 0,
                samples: [{ time: performance.now(), angle: state.angle }]
            };
        };

        const handlePointerMove = e => {
            if (e.pointerType === 'mouse') {
                state.pointer.inside = true;
                updatePointer(e);
            }
            const press = state.press;
            if (!press || press.id !== e.pointerId) {
                wake();
                return;
            }
            const delta = settings.axis === 'x' ? e.clientY - press.y : e.clientX - press.x;
            const cross = settings.axis === 'x' ? e.clientX - press.x : e.clientY - press.y;
            if (!press.moved) {
                if (Math.abs(delta) < DRAG_THRESHOLD) return;
                if (Math.abs(cross) > Math.abs(delta) * 1.2 && e.pointerType !== 'mouse') {
                    state.press = null;
                    return;
                }
                press.moved = true;
                press.origin = delta;
                state.drag = true;
                state.target = null;
                state.velocity = 0;
                wrapper.setAttribute('data-dragging', '');
                try {
                    wrapper.setPointerCapture(e.pointerId);
                } catch (err) {}
            }
            const perPixel = 180 / (Math.PI * settings.radius * state.fit);
            state.angle = press.angle + (delta - press.origin) * perPixel * (settings.layout.inward ? -1 : 1);
            const now = performance.now();
            press.samples.push({ time: now, angle: state.angle });
            while (press.samples.length > 2 && now - press.samples[0].time > 110) press.samples.shift();
            wake();
        };

        const releasePointer = e => {
            const press = state.press;
            if (!press || press.id !== e.pointerId) return;
            state.press = null;
            if (!press.moved) return;
            state.drag = false;
            wrapper.removeAttribute('data-dragging');
            state.suppressClick = true;
            const first = press.samples[0];
            const last = press.samples[press.samples.length - 1];
            const span = (last.time - first.time) / 1000;
            const velocity = span > 0.008 ? clamp((last.angle - first.angle) / span, -1400, 1400) : 0;
            state.velocity = velocity;
            if (Math.abs(velocity) > 60) state.dir = Math.sign(velocity);
            const coasting = settings.autoplay === 'drift' && !(settings.pauseOnHover && state.hover && e.pointerType === 'mouse');
            if (settings.snap && !coasting) {
                const tau = 0.18 + settings.momentum * 1.5;
                state.target = Math.round((state.angle + velocity * tau * 0.55) / settings.step) * settings.step;
            }
            wake();
        };

        const handlePointerEnter = e => {
            if (e.pointerType !== 'mouse') return;
            state.hover = true;
            wake();
        };

        const handlePointerLeave = e => {
            if (e.pointerType === 'mouse') {
                state.hover = false;
                state.pointer.inside = false;
            }
            wake();
        };

        const handleClick = e => {
            if (state.suppressClick) {
                state.suppressClick = false;
                return;
            }
            const card = e.target.closest('[data-cc-index]');
            if (!card) return;
            const idx = Number(card.getAttribute('data-cc-index'));
            if (focusOnClick) focusIndex(idx);
            if (typeof options.onItemClick === 'function') options.onItemClick(list[idx], idx);
        };

        const handleKeyDown = e => {
            const forward = settings.axis === 'x' ? 'ArrowDown' : 'ArrowRight';
            const backward = settings.axis === 'x' ? 'ArrowUp' : 'ArrowLeft';
            if (e.key === forward) stepBy(1);
            else if (e.key === backward) stepBy(-1);
            else if (e.key === 'Home') focusIndex(0);
            else if (e.key === 'End') focusIndex(count - 1);
            else if (e.key === 'Enter' || e.key === ' ') {
                if (typeof options.onItemClick === 'function') options.onItemClick(list[state.active], state.active);
            } else return;
            e.preventDefault();
        };

        const onWheel = e => {
            if (!settings.draggable) return;
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0;
            if (!delta) return;
            e.preventDefault();
            const perPixel = 180 / (Math.PI * settings.radius * state.fit);
            state.target = null;
            state.angle -= delta * perPixel * (settings.layout.inward ? -1 : 1);
            state.velocity = -delta * perPixel * (settings.layout.inward ? -1 : 1) * 30;
            state.holdUntil = performance.now() + 1600;
            clearTimeout(state.wheelTimer);
            state.wheelTimer = setTimeout(() => {
                if (settings.snap) state.target = nearest(state.angle + state.velocity * 0.12);
                wake();
            }, 140);
            wake();
        };

        // Event Listeners
        wrapper.addEventListener('pointerdown', handlePointerDown);
        wrapper.addEventListener('pointermove', handlePointerMove);
        wrapper.addEventListener('pointerup', releasePointer);
        wrapper.addEventListener('pointercancel', releasePointer);
        wrapper.addEventListener('pointerenter', handlePointerEnter);
        wrapper.addEventListener('pointerleave', handlePointerLeave);
        wrapper.addEventListener('click', handleClick);
        wrapper.addEventListener('keydown', handleKeyDown);
        wrapper.addEventListener('wheel', onWheel, { passive: false });

        // Observers
        const ro = new ResizeObserver(() => {
            measure();
            wake();
        });
        ro.observe(wrapper);

        const io = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) wake();
            else {
                cancelAnimationFrame(raf);
                raf = 0;
                state.last = 0;
            }
        });
        io.observe(wrapper);

        // Preload images
        const sources = list.map(item => item.src).slice(0, 12);
        const loadImg = src => new Promise(resolve => {
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => (img.decode ? img.decode().then(resolve, resolve) : resolve());
            img.onerror = resolve;
            img.src = src;
        });

        Promise.race([
            Promise.all(sources.map(loadImg)),
            new Promise(resolve => setTimeout(resolve, 2000))
        ]).then(() => {
            state.introDone = false;
            state.intro = null;
            state.ready = true;
            wrapper.setAttribute('data-ready', '');
            measure();
            render(settings, performance.now());
            wake();
        });

        measure();
        render(settings, performance.now());
        wake();

        return {
            focusIndex,
            stepBy,
            destroy() {
                cancelAnimationFrame(raf);
                ro.disconnect();
                io.disconnect();
                wrapper.removeEventListener('pointerdown', handlePointerDown);
                wrapper.removeEventListener('pointermove', handlePointerMove);
                wrapper.removeEventListener('pointerup', releasePointer);
                wrapper.removeEventListener('pointercancel', releasePointer);
                wrapper.removeEventListener('pointerenter', handlePointerEnter);
                wrapper.removeEventListener('pointerleave', handlePointerLeave);
                wrapper.removeEventListener('click', handleClick);
                wrapper.removeEventListener('keydown', handleKeyDown);
                wrapper.removeEventListener('wheel', onWheel);
            }
        };
    }

    window.initCircularCarousel = initCircularCarousel;
})();
