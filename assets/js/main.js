/**
 * ARS PAULINE - Main Interactive Script (Community Edition)
 * - Community Lore, FAQs Accordions & Reveal Animations
 * - React Bits Dock Navigation & PatternWaves Background
 */

document.addEventListener('DOMContentLoaded', () => {
    renderAllClanData();
    initMobileNav();
    initFaqAccordion();
    initDockNav();
    initRevealAnimations();
    initCardTilt();
    initBorderGlow();
    initBlockReveal();
    syncLiveDiscordInvites();
});

/* ==========================================================================
   2. RENDER DATA (ORIGIN STORY, ALLIES & FAQS - CARD-LESS EDITORIAL)
   ========================================================================== */
function renderAllClanData() {
    if (typeof ClanData === 'undefined') return;

    // 1. Community Info Strip
    const gameEl = document.getElementById('stat-game');
    const formerNameEl = document.getElementById('stat-former-name');
    const compServersEl = document.getElementById('stat-comp-servers') || document.getElementById('stat-tournaments');
    const rankVnEl = document.getElementById('stat-rank-vn');
    const rankAsiaEl = document.getElementById('stat-rank-asia');
    const discordEl = document.getElementById('stat-discord');

    if (gameEl) gameEl.textContent = ClanData.info.communityInfo.game;
    if (formerNameEl) formerNameEl.textContent = ClanData.info.communityInfo.formerName;
    if (compServersEl) compServersEl.textContent = ClanData.info.communityInfo.compServers || ClanData.info.communityInfo.tournaments;
    if (rankVnEl) rankVnEl.textContent = ClanData.info.communityInfo.rankVN || 'Former #1 VN';
    if (rankAsiaEl) rankAsiaEl.textContent = ClanData.info.communityInfo.rankAsia || 'Former #3 Asia';
    if (discordEl) discordEl.textContent = ClanData.info.communityInfo.discord;

    function formatMarkdown(text) {
        if (!text) return '';
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="text-[#A8C4EC]">$1</em>');
    }

    // 2. Render Origin Story (Split thành từng câu nhỏ cho block-reveal đẹp hơn)
    const originStoryContainer = document.getElementById('origin-story-container');
    if (originStoryContainer && ClanData.origin) {
        // Tách paragraph thành từng dòng nhỏ cho block-reveal
        function splitSentences(html) {
            // Bước 1: Split theo dấu câu kết thúc (. ! ?) theo sau bởi khoảng trắng + chữ hoa
            let parts = html.split(/(?<=[.!?])\s+(?=[A-ZĐTK""\u201C<])/);
            
            // Bước 2: Split thêm theo dấu gạch em-dash ( — ) cho câu dài
            let result = [];
            parts.forEach(part => {
                if (part.length > 80 && part.includes(' — ')) {
                    const subParts = part.split(/\s*—\s*/);
                    subParts.forEach((sp, i) => {
                        if (i < subParts.length - 1) {
                            result.push(sp.trim() + ' —');
                        } else {
                            result.push(sp.trim());
                        }
                    });
                } else {
                    result.push(part);
                }
            });
            
            return result.filter(s => s.trim().length > 0);
        }

        let lineIndex = 0;
        const allSentencesHtml = ClanData.origin.paragraphs.map((p) => {
            const sentences = splitSentences(p);
            const sentencesHtml = sentences.map((sentence) => {
                lineIndex++;
                return `
                    <div class="block-reveal-block block-delay-${Math.min(lineIndex, 12)}">
                        <span class="block-text text-slate-200 text-sm sm:text-base leading-relaxed inline-block py-0.5">${sentence}</span>
                    </div>`;
            }).join('');
            return `<div class="mb-4">${sentencesHtml}</div>`;
        }).join('');

        // Fun fact: tách title và content thành 2 dòng
        lineIndex++;
        const funFactTitleDelay = Math.min(lineIndex, 12);
        lineIndex++;
        const funFactContentDelay = Math.min(lineIndex, 12);
        lineIndex++;
        const refLinkDelay = Math.min(lineIndex, 12);

        originStoryContainer.innerHTML = `
            <div class="block-reveal-group space-y-4">
                ${allSentencesHtml}
                
                <!-- Fun fact callout với Border Glow -->
                <div class="mt-8 border-glow-card rounded-2xl bg-black/60 shadow-lg shadow-[#0474C4]/5" style="--border-radius: 18px;">
                    <span class="edge-light"></span>
                    <div class="border-glow-inner p-5 sm:p-6">
                        <div class="block-reveal block-delay-${funFactTitleDelay}">
                            <div class="block-text flex items-center gap-2 text-[#A8C4EC] font-bold font-heading text-sm py-0.5 mb-2">
                                <i data-lucide="sparkles" class="w-4 h-4 text-[#0474C4]"></i>
                                <span>${ClanData.origin.funFact.title}</span>
                            </div>
                        </div>
                        <div class="block-reveal-block block-delay-${funFactContentDelay}">
                            <p class="block-text text-slate-300 text-xs sm:text-sm leading-relaxed py-0.5">
                                ${formatMarkdown(ClanData.origin.funFact.content)}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Reference Link -->
                <div class="block-reveal block-delay-${refLinkDelay}">
                    <div class="block-text mt-6 py-0.5 flex flex-wrap items-center gap-3">
                        <a href="${ClanData.origin.fandomUrl}" target="_blank" class="inline-flex items-center gap-2 text-xs text-[#A8C4EC] hover:text-white transition-colors font-mono group">
                            <i data-lucide="external-link" class="w-3.5 h-3.5 text-[#0474C4]"></i>
                            <span class="underline underline-offset-4 group-hover:text-white">Nguồn cảm hứng: Type-Moon Fandom (Ars Paulina)</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    // 3. Render Allies & Partners (Synced Discord Avatar & Names với 3D Card Tilt & Border Glow)
    const partnersContainer = document.getElementById('partners-list');
    if (partnersContainer && ClanData.partners) {
        partnersContainer.innerHTML = ClanData.partners.map((partner, idx) => `
            <div class="reveal delay-${Math.min((idx + 1) * 100, 400)} h-full">
                <div class="tilt-card-wrapper w-full h-full">
                    <div class="partner-item tilt-card border-glow-card group relative rounded-2xl bg-black/70 shadow-xl shadow-[#0474C4]/5 cursor-pointer overflow-visible h-full flex flex-col justify-between" data-code="${partner.code}" style="--border-radius: 20px; --edge-sensitivity: 15;">
                        <span class="edge-light"></span>
                        <div class="border-glow-inner h-full flex flex-col justify-between p-5 sm:p-6 relative rounded-2xl overflow-hidden">
                            <!-- 3D Specular Glare Reflection -->
                            <div class="tilt-card-glare absolute inset-0 pointer-events-none opacity-0 z-20 rounded-2xl"></div>

                            <!-- Dynamic Hover Partner Banner (Fade In on hover, Fade Out on leave) -->
                            ${partner.banner ? `
                            <div class="partner-banner-layer absolute inset-0 pointer-events-none z-0 rounded-2xl overflow-hidden">
                                <img src="${partner.banner}" alt="${partner.name} banner" class="partner-banner-img w-full h-full object-cover object-center" loading="eager">
                                <div class="partner-banner-overlay absolute inset-0"></div>
                            </div>
                            ` : ''}

                            <div class="flex items-start gap-4 sm:gap-5 flex-1 relative z-10">
                                <!-- Synced Avatar with thin clean border -->
                                <div class="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-[1px] bg-gradient-to-b from-[#0474C4]/60 to-[#5379AE]/20 flex-shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-[#0474C4]/15">
                                    <img id="partner-img-${partner.code}" src="${partner.avatar || partner.iconUrl}" alt="${partner.name}" class="w-full h-full object-cover rounded-[15px]" onerror="this.src='${partner.iconUrl}'">
                                    <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-black" title="Trực tuyến"></span>
                                </div>

                                <!-- Details Column (Equal Height Flex) -->
                                <div class="flex-1 min-w-0 flex flex-col justify-between h-full">
                                    <div>
                                        <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                                            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${partner.type.includes('ALLY') ? 'bg-[#0474C4]/25 text-[#A8C4EC] border border-[#0474C4]/40' : 'bg-[#5379AE]/20 text-slate-300 border border-[#5379AE]/30'}">
                                                ${partner.typeLabel || partner.type}
                                            </span>
                                            <span class="text-xs font-mono text-[#5379AE]">#${partner.code}</span>
                                        </div>
                                        
                                        <h3 id="partner-name-${partner.code}" class="text-base sm:text-lg font-bold font-heading text-white group-hover:text-[#A8C4EC] transition-colors truncate">
                                            ${partner.name}
                                        </h3>

                                        <!-- Uniform 2-Line Tagline Area for Equal Height Across All Cards -->
                                        <p class="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed min-h-[34px] sm:min-h-[36px] flex items-center">
                                            ${partner.tagline || 'Cộng đồng đối tác đồng hành cùng ARS Pauline.'}
                                        </p>
                                    </div>

                                    <!-- Stats & Link Anchored to Bottom -->
                                    <div class="mt-4 pt-3 border-t border-[#5379AE]/15 flex items-center justify-between gap-2">
                                        <div class="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                                            <span class="flex items-center gap-1.5 text-emerald-400 font-medium">
                                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                                <span id="partner-online-${partner.code}">${partner.presence ? partner.presence.toLocaleString() : '---'}</span> online
                                            </span>
                                            <span>•</span>
                                            <span class="text-slate-300">
                                                <span id="partner-members-${partner.code}">${partner.members ? partner.members.toLocaleString() : '---'}</span> mems
                                            </span>
                                        </div>

                                        <a href="${partner.inviteUrl}" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0474C4]/20 hover:bg-[#0474C4] border border-[#0474C4]/40 text-white font-mono text-xs font-semibold transition-all group/btn">
                                            <span>Vào Server</span>
                                            <i data-lucide="external-link" class="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 4. Render FAQs (Clean Minimalist Divider Accordions With Smooth Reveal)
    const faqContainer = document.getElementById('faq-accordion-container');
    if (faqContainer && ClanData.faqs) {
        faqContainer.innerHTML = ClanData.faqs.map((faq, idx) => `
            <div class="faq-item border-b border-[#5379AE]/25 py-4 transition-colors reveal delay-${Math.min(idx * 100 + 100, 500)}">
                <button class="faq-question w-full flex items-center justify-between py-2 text-left font-medium text-white hover:text-[#A8C4EC] focus:outline-none cursor-pointer group">
                    <span class="text-sm sm:text-base flex items-center gap-3 font-semibold">
                        <span class="text-[#0474C4] font-mono text-xs">#0${idx + 1}</span>
                        ${faq.question}
                    </span>
                    <i data-lucide="chevron-down" class="faq-icon w-4 h-4 text-[#5379AE] group-hover:text-[#A8C4EC] transition-transform duration-300"></i>
                </button>
                <div class="faq-answer-wrapper">
                    <div class="faq-answer pt-3 pb-2 text-slate-300 text-xs sm:text-sm leading-relaxed">
                        ${faq.answer}
                    </div>
                </div>
            </div>
        `).join('');
    }

    if (window.lucide) lucide.createIcons();
    initRevealAnimations();
    initBorderGlow();
    initCardTilt();
}

/* ==========================================================================
   3. MOBILE NAVIGATION & ACCORDIONS
   ========================================================================== */
function initMobileNav() {
    const toggleBtn = document.getElementById('mobile-menu-btn');
    const menuEl = document.getElementById('mobile-menu');
    if (!toggleBtn || !menuEl) return;

    toggleBtn.addEventListener('click', () => {
        menuEl.classList.toggle('hidden');
    });

    menuEl.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuEl.classList.add('hidden');
        });
    });
}

function initFaqAccordion() {
    document.addEventListener('click', (e) => {
        const questionBtn = e.target.closest('.faq-question');
        if (!questionBtn) return;

        const faqItem = questionBtn.closest('.faq-item');
        if (!faqItem) return;

        const isCurrentlyActive = faqItem.classList.contains('active');

        // Đóng êm ái các mục FAQ khác đang mở
        document.querySelectorAll('.faq-item.active').forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('active');
            }
        });

        // Bật / tắt mục FAQ hiện tại với animation reveal
        if (isCurrentlyActive) {
            faqItem.classList.remove('active');
        } else {
            faqItem.classList.add('active');
        }
    });
}

/* ==========================================================================
   4. REACT BITS DOCK NAVIGATION INTEGRATION
   ========================================================================== */
function initDockNav() {
    if (typeof window.initDock !== 'function') return;

    window.initDock('dock-container', {
        baseItemSize: 44,
        magnification: 64,
        distance: 150,
        items: [
            {
                avatarSrc: 'assets/images/avatar.webp',
                label: 'ARS PAULINE',
                onClick: () => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            },
            {
                icon: 'home',
                label: 'Trang Chủ',
                onClick: () => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            },
            {
                icon: 'book-open',
                label: 'Khởi Đầu',
                onClick: () => {
                    document.getElementById('origin')?.scrollIntoView({ behavior: 'smooth' });
                }
            },
            {
                icon: 'handshake',
                label: 'Liên Minh',
                onClick: () => {
                    document.getElementById('partners')?.scrollIntoView({ behavior: 'smooth' });
                }
            },
            {
                icon: 'help-circle',
                label: 'Hỏi Đáp',
                onClick: () => {
                    document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' });
                }
            },
            {
                icon: 'discord',
                label: 'Discord Clan',
                onClick: () => {
                    window.open('https://discord.gg/arsontop', '_blank');
                }
            },
            {
                icon: 'share-2',
                label: 'Sao Chép Link',
                onClick: (e, el) => {
                    navigator.clipboard.writeText('https://discord.gg/arsontop').then(() => {
                        const labelEl = el.querySelector('.dock-label');
                        if (labelEl) {
                            const original = labelEl.textContent;
                            labelEl.textContent = 'Đã Sao Chép!';
                            labelEl.style.color = '#A8C4EC';
                            setTimeout(() => {
                                labelEl.textContent = original;
                                labelEl.style.color = '';
                            }, 2000);
                        }
                    });
                }
            }
        ]
    });
}

/* ==========================================================================
   CANVAS BLOCK REVEAL ANIMATION (IntersectionObserver Trigger)
   - Quan sát mỗi .block-reveal-group
   - Khi cuộn tới, thêm .is-revealing vào tất cả con .block-reveal / .block-reveal-block
   - Sau khi hoàn thành animation, gỡ bỏ overflow: hidden để bảo toàn dấu tiếng Việt
   - Animation chỉ chạy 1 lần (unobserve sau khi kích hoạt)
   ========================================================================== */
function initBlockReveal() {
    const groups = document.querySelectorAll('.block-reveal-group');
    if (!groups.length) return;

    function activateReveal(items) {
        items.forEach(el => {
            el.classList.add('is-revealing');
            // Mở hoàn toàn overflow: visible sau khi animation chạy xong để không bao giờ cắt dấu mũ, dấu móc
            setTimeout(() => {
                el.classList.add('is-revealed');
                el.style.overflow = 'visible';
            }, 1600);
        });
    }

    if (!('IntersectionObserver' in window)) {
        // Fallback: hiện tất cả ngay lập tức
        groups.forEach(group => {
            activateReveal(group.querySelectorAll('.block-reveal, .block-reveal-block'));
        });
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const group = entry.target;
                activateReveal(group.querySelectorAll('.block-reveal, .block-reveal-block'));
                obs.unobserve(group); // Chỉ chạy 1 lần
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    });

    groups.forEach(group => observer.observe(group));
}

/* ==========================================================================
   5. INTERSECTION OBSERVER BIDIRECTIONAL REVEAL ANIMATIONS
   - Tự động hiện khi cuộn tới vùng nhìn
   - Cuộn xuống: Nội dung bên trên lướt lên và mờ dần biến mất (.exit-above)
   - Cuộn lên: Nội dung bên dưới lướt xuống và mờ dần biến mất (.exit-below)
   - Tốc độ reveal chậm rãi, mượt mà (1.35s - 1.4s), chuẩn điện ảnh
   ========================================================================== */
function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal, .reveal-scale');
    if (!reveals.length) return;

    if (!('IntersectionObserver' in window)) {
        reveals.forEach(el => el.classList.add('revealed'));
        return;
    }

    if (window._revealObserver) {
        window._revealObserver.disconnect();
    }

    // Root margin: Top -7% triggers exit-above khi nội dung cuộn qua mép trên
    // Bottom -7% triggers reveal / exit-below khi nội dung cuộn qua mép dưới
    window._revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const el = entry.target;
            const rect = entry.boundingClientRect;
            
            if (entry.isIntersecting) {
                el.classList.add('revealed');
                el.classList.remove('exit-above', 'exit-below');
            } else {
                // Safeguard: Luôn giữ Hero hiển thị đầy đủ khi ở đỉnh trang
                if (window.scrollY <= 40 && el.closest('#hero')) {
                    el.classList.add('revealed');
                    el.classList.remove('exit-above', 'exit-below');
                    return;
                }

                el.classList.remove('revealed');
                if (rect.top < 0) {
                    // Phần tử đã cuộn vượt lên trên khung nhìn
                    el.classList.add('exit-above');
                    el.classList.remove('exit-below');
                } else {
                    // Phần tử nằm phía dưới khung nhìn
                    el.classList.add('exit-below');
                    el.classList.remove('exit-above');
                }
            }
        });
    }, {
        root: null,
        rootMargin: '-7% 0px -7% 0px',
        threshold: [0, 0.05]
    });

    reveals.forEach(el => {
        window._revealObserver.observe(el);
    });

    // Safeguard listener khi cuộn về đầu trang
    if (!window._revealScrollBound) {
        window._revealScrollBound = true;
        window.addEventListener('scroll', () => {
            if (window.scrollY <= 40) {
                document.querySelectorAll('#hero .reveal, #hero .reveal-scale').forEach(el => {
                    el.classList.add('revealed');
                    el.classList.remove('exit-above', 'exit-below');
                });
            }
        }, { passive: true });
    }
}

/* ==========================================================================
   6. LIVE DISCORD INVITE SYNC (AVATAR, NAME, MEMBERS & ONLINE STATUS)
   ========================================================================== */
function syncLiveDiscordInvites() {
    if (typeof ClanData === 'undefined' || !ClanData.partners) return;

    ClanData.partners.forEach(partner => {
        if (!partner.code) return;
        fetch(`https://discord.com/api/v10/invites/${partner.code}?with_counts=true`)
            .then(res => {
                if (!res.ok) throw new Error('Invite fetch failed: ' + res.status);
                return res.json();
            })
            .then(data => {
                if (data && data.guild) {
                    // 1. Live Server Name
                    const nameEl = document.getElementById(`partner-name-${partner.code}`);
                    if (nameEl && data.guild.name) {
                        nameEl.textContent = data.guild.name;
                    }

                    // 2. Live Server Avatar (Supports animated GIF or WebP)
                    const imgEl = document.getElementById(`partner-img-${partner.code}`);
                    if (imgEl && data.guild.icon) {
                        const isAnimated = data.guild.icon.startsWith('a_');
                        const ext = isAnimated ? 'gif' : 'webp';
                        imgEl.src = `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.${ext}?size=128`;
                    }

                    // 3. Live Presence & Member Counts
                    const onlineEl = document.getElementById(`partner-online-${partner.code}`);
                    if (onlineEl && typeof data.approximate_presence_count === 'number') {
                        onlineEl.textContent = data.approximate_presence_count.toLocaleString();
                    }

                    const membersEl = document.getElementById(`partner-members-${partner.code}`);
                    if (membersEl && typeof data.approximate_member_count === 'number') {
                        membersEl.textContent = data.approximate_member_count.toLocaleString();
                    }
                }
            })
            .catch(() => {
                // Silently fallback to cached assets without UI interruption
            });
    });
}

/* ==========================================================================
   7. 3D CARD TILT ENGINE (SILKY LERP PHYSICS WITH GLOW GLARE)
   - Chuyển động mượt mà tuyệt đối với thuật toán Lerp (Linear Interpolation)
   - Hệ số giảm chấn 0.085 tạo quán tính vật lý tự nhiên, không giật lắc
   - Hồi vị trí đàn hồi êm ái khi rời chuột (spring settling)
   ========================================================================== */
function initCardTilt() {
    const cards = document.querySelectorAll('.tilt-card');
    if (!cards.length) return;

    cards.forEach(card => {
        if (card.dataset.tiltInit) return;
        card.dataset.tiltInit = 'true';

        let glare = card.querySelector('.tilt-card-glare');
        if (!glare) {
            glare = document.createElement('div');
            glare.className = 'tilt-card-glare absolute inset-0 pointer-events-none opacity-0';
            card.appendChild(glare);
        }

        const maxTilt = 12; // Độ nghiêng mượt mà, sống động tương tự banner
        
        let isHovered = false;
        let currentTiltX = 0;
        let currentTiltY = 0;
        let targetTiltX = 0;
        let targetTiltY = 0;
        let currentScale = 1;
        let targetScale = 1;
        let currentGlareX = 50;
        let currentGlareY = 50;
        let targetGlareX = 50;
        let targetGlareY = 50;
        let animId = null;

        function renderLoop() {
            // Hệ số nội suy Lerp mượt mà, nhạy bén
            const damping = 0.095;
            currentTiltX += (targetTiltX - currentTiltX) * damping;
            currentTiltY += (targetTiltY - currentTiltY) * damping;
            currentScale += (targetScale - currentScale) * damping;
            currentGlareX += (targetGlareX - currentGlareX) * damping;
            currentGlareY += (targetGlareY - currentGlareY) * damping;

            card.style.transform = `perspective(1100px) rotateX(${currentTiltX.toFixed(3)}deg) rotateY(${currentTiltY.toFixed(3)}deg) scale3d(${currentScale.toFixed(4)}, ${currentScale.toFixed(4)}, ${currentScale.toFixed(4)})`;

            if (glare) {
                glare.style.background = `radial-gradient(circle at ${currentGlareX.toFixed(1)}% ${currentGlareY.toFixed(1)}%, rgba(168, 196, 236, 0.42) 0%, rgba(4, 116, 196, 0.16) 38%, transparent 70%)`;
            }

            // Kiểm tra xem thẻ đã hoàn tất dao động và dừng lại chưa
            const isSettled = !isHovered && 
                Math.abs(currentTiltX) < 0.02 && 
                Math.abs(currentTiltY) < 0.02 && 
                Math.abs(currentScale - 1) < 0.001;

            if (!isSettled) {
                animId = requestAnimationFrame(renderLoop);
            } else {
                card.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                animId = null;
            }
        }

        function startLoop() {
            if (!animId) {
                animId = requestAnimationFrame(renderLoop);
            }
        }

        card.addEventListener('pointerenter', () => {
            isHovered = true;
            targetScale = 1.025;
            if (glare) glare.style.opacity = '1';
            startLoop();
        });

        card.addEventListener('pointermove', (e) => {
            const rect = card.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

            targetTiltX = (0.5 - y) * maxTilt;
            targetTiltY = (x - 0.5) * maxTilt;
            targetGlareX = x * 100;
            targetGlareY = y * 100;

            startLoop();
        });

        card.addEventListener('pointerleave', () => {
            isHovered = false;
            targetTiltX = 0;
            targetTiltY = 0;
            targetScale = 1;
            if (glare) glare.style.opacity = '0';
            startLoop();
        });
    });
}

/* ==========================================================================
   REACT BITS: BORDER GLOW INTERACTIVITY (VANILLA JS COMPANION)
   - Edge Proximity & Cursor Angle calculation
   ========================================================================== */
function initBorderGlow() {
    const cards = document.querySelectorAll('.border-glow-card');
    if (!cards.length) return;

    function getCenterOfElement(el) {
        const rect = el.getBoundingClientRect();
        return [rect.width / 2, rect.height / 2];
    }

    function getEdgeProximity(el, x, y) {
        const [cx, cy] = getCenterOfElement(el);
        const dx = x - cx;
        const dy = y - cy;
        let kx = Infinity;
        let ky = Infinity;
        if (dx !== 0) kx = cx / Math.abs(dx);
        if (dy !== 0) ky = cy / Math.abs(dy);
        return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    }

    function getCursorAngle(el, x, y) {
        const [cx, cy] = getCenterOfElement(el);
        const dx = x - cx;
        const dy = y - cy;
        if (dx === 0 && dy === 0) return 0;
        const radians = Math.atan2(dy, dx);
        let degrees = radians * (180 / Math.PI) + 90;
        if (degrees < 0) degrees += 360;
        return degrees;
    }

    cards.forEach(card => {
        if (!card.querySelector(':scope > .edge-light')) {
            const edgeLight = document.createElement('span');
            edgeLight.className = 'edge-light';
            card.insertBefore(edgeLight, card.firstChild);
        }

        if (card.dataset.borderGlowInit) return;
        card.dataset.borderGlowInit = 'true';

        card.addEventListener('pointermove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const edge = getEdgeProximity(card, x, y);
            const angle = getCursorAngle(card, x, y);

            card.style.setProperty('--edge-proximity', `${(edge * 100).toFixed(3)}`);
            card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
        });

        card.addEventListener('pointerleave', () => {
            card.style.setProperty('--edge-proximity', '0');
        });
    });
}




