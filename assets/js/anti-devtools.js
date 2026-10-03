/**
 * ARS PAULINE - Anti-DevTools & Asset Protection Module
 * Features:
 * - Blocks Developer Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S, Ctrl+P, Mac Cmd+Opt+...)
 * - Blocks Context Menu (Right Click) with sleek Sapphire Toast notification
 * - Prevents dragging images and sensitive assets
 * - Detects DevTools opening (docked & undocked via dimensions & debugger timing)
 * - Anti-Debug loop trap to neutralize script tampering and pause inspection
 * - AMOLED Glass Security Warning Overlay with Recheck option
 * - Console auto-clear & stylized security banner
 */

(function () {
    'use strict';

    let isDevToolsOpen = false;
    let toastTimeout = null;
    let consecutivePauseCount = 0;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // =========================================================================
    // 1. KEYBOARD SHORTCUTS PROTECTION (Capture Phase)
    // =========================================================================
    window.addEventListener('keydown', function (e) {
        const key = e.key ? e.key.toLowerCase() : '';
        const keyCode = e.keyCode || e.which;
        const isCtrlOrMeta = e.ctrlKey || e.metaKey;

        // F12 key
        if (keyCode === 123 || key === 'f12') {
            e.preventDefault();
            e.stopPropagation();
            showSecurityToast('Phím tắt F12 (DevTools) đã bị vô hiệu hóa.');
            return false;
        }

        // Ctrl + Shift + I (Inspect Element) / Cmd + Option + I
        if ((isCtrlOrMeta && e.shiftKey && (keyCode === 73 || key === 'i')) ||
            (e.metaKey && e.altKey && (keyCode === 73 || key === 'i'))) {
            e.preventDefault();
            e.stopPropagation();
            showSecurityToast('Tính năng kiểm tra phần tử (Inspect) đã bị khóa.');
            return false;
        }

        // Ctrl + Shift + J (Console) / Cmd + Option + J
        if ((isCtrlOrMeta && e.shiftKey && (keyCode === 74 || key === 'j')) ||
            (e.metaKey && e.altKey && (keyCode === 74 || key === 'j'))) {
            e.preventDefault();
            e.stopPropagation();
            showSecurityToast('Tính năng Developer Console đã bị khóa.');
            return false;
        }

        // Ctrl + Shift + C (Element Selector) / Cmd + Option + C
        if ((isCtrlOrMeta && e.shiftKey && (keyCode === 67 || key === 'c')) ||
            (e.metaKey && e.altKey && (keyCode === 67 || key === 'c'))) {
            e.preventDefault();
            e.stopPropagation();
            showSecurityToast('Tính năng chọn phần tử đã bị khóa.');
            return false;
        }

        // Ctrl + U (View Source) / Cmd + Option + U
        if ((isCtrlOrMeta && (keyCode === 85 || key === 'u')) ||
            (e.metaKey && e.altKey && (keyCode === 85 || key === 'u'))) {
            e.preventDefault();
            e.stopPropagation();
            showSecurityToast('Xem mã nguồn trang web (View Source) đã bị khóa.');
            return false;
        }

        // Ctrl + S (Save Webpage) / Cmd + S
        if (isCtrlOrMeta && (keyCode === 83 || key === 's')) {
            e.preventDefault();
            e.stopPropagation();
            showSecurityToast('Lưu trang web đã bị vô hiệu hóa.');
            return false;
        }

        // Ctrl + P (Print / Save as PDF) / Cmd + P
        if (isCtrlOrMeta && (keyCode === 80 || key === 'p')) {
            e.preventDefault();
            e.stopPropagation();
            showSecurityToast('In trang web đã bị vô hiệu hóa.');
            return false;
        }
    }, true);

    // =========================================================================
    // 2. CONTEXT MENU & DRAG ASSET PROTECTION
    // =========================================================================
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        e.stopPropagation();
        showSecurityToast('Chuột phải đã bị vô hiệu hóa bởi ARS Security.');
        return false;
    }, true);

    document.addEventListener('dragstart', function (e) {
        if (e.target && e.target.nodeName === 'IMG') {
            e.preventDefault();
            return false;
        }
    }, true);

    // =========================================================================
    // 3. TOAST NOTIFICATION
    // =========================================================================
    function showSecurityToast(message) {
        const toast = document.getElementById('ars-security-toast');
        const msgEl = document.getElementById('ars-toast-message');
        if (!toast || !msgEl) return;

        msgEl.textContent = message || 'Thao tác này đã bị vô hiệu hóa bởi ARS Security.';
        toast.classList.remove('opacity-0', 'translate-y-12', 'pointer-events-none');
        toast.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-12', 'pointer-events-none');
            toast.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
        }, 2500);
    }

    // =========================================================================
    // 4. CONSOLE STYLED SECURITY BANNER
    // =========================================================================
    function printSecurityWarning() {
        try {
            console.clear();
            const titleStyle = 'color: #ff3333; font-size: 24px; font-weight: 900; background: #000; padding: 6px 12px; border-left: 5px solid #0474C4;';
            const bodyStyle = 'color: #A8C4EC; font-size: 13px; font-weight: 600; line-height: 1.8;';
            const discordStyle = 'color: #0474C4; font-size: 14px; font-weight: 800; text-decoration: underline;';

            console.log('%c⛔ ARS PAULINE - SECURITY WARNING ⛔', titleStyle);
            console.log(
                '%c\nCẢNH BÁO BẢO MẬT HỆ THỐNG:\n' +
                'Khu vực này được bảo vệ bởi ARS PAULINE Security.\n' +
                'Mọi hành vi sao chép mã nguồn, trích xuất tài nguyên hình ảnh hoặc can thiệp dữ liệu đều bị nghiêm cấm!\n\n' +
                '%cTham gia Discord chính thức: https://discord.gg/arsontop',
                bodyStyle,
                discordStyle
            );
        } catch (err) {}
    }

    // =========================================================================
    // 5. DEVTOOLS DETECTION & SECURITY OVERLAY
    // =========================================================================
    function setDevToolsState(opened) {
        if (opened === isDevToolsOpen) return;
        isDevToolsOpen = opened;

        const overlay = document.getElementById('ars-security-overlay');
        if (!overlay) return;

        if (opened) {
            overlay.classList.remove('opacity-0', 'pointer-events-none');
            overlay.classList.add('opacity-100', 'pointer-events-auto');
            document.body.style.overflow = 'hidden';
            printSecurityWarning();
        } else {
            overlay.classList.add('opacity-0', 'pointer-events-none');
            overlay.classList.remove('opacity-100', 'pointer-events-auto');
            document.body.style.overflow = '';
        }
    }

    // Check window dimensions (docked DevTools on desktop)
    function checkDimensionDisparity() {
        if (isMobile) return false;
        if (!window.outerWidth || !window.outerHeight) return false;
        const threshold = 160;
        const widthDiff = window.outerWidth - window.innerWidth > threshold;
        const heightDiff = window.outerHeight - window.innerHeight > threshold;
        return widthDiff || heightDiff;
    }

    // Check debugger execution timing
    function checkDebuggerExecution() {
        // Skip check during initial startup
        if (performance.now() < 1500) return false;
        const start = performance.now();
        /* eslint-disable no-debugger */
        debugger;
        /* eslint-enable no-debugger */
        const end = performance.now();
        return (end - start > 120);
    }

    // Continuous detector check loop
    function runDetectorCheck() {
        const isDocked = checkDimensionDisparity();
        if (isDocked) {
            consecutivePauseCount = 2;
            setDevToolsState(true);
            return;
        }

        const isPaused = checkDebuggerExecution();
        if (isPaused) {
            consecutivePauseCount++;
            if (consecutivePauseCount >= 2) {
                setDevToolsState(true);
            }
            return;
        } else {
            consecutivePauseCount = Math.max(0, consecutivePauseCount - 1);
        }

        // If previously open but now closed and no pause:
        if (isDevToolsOpen && !isDocked && consecutivePauseCount === 0) {
            setDevToolsState(false);
        }
    }

    // Anti-Debug Trap: Repeatedly invokes debugger to freeze inspector when DevTools is opened
    function startAntiDebugTrap() {
        setInterval(() => {
            (function () {
                try {
                    (function a(i) {
                        if (('' + (i / i)).length !== 1 || i === 0) {
                            (function () {}).constructor('debugger')();
                        } else {
                            debugger;
                        }
                        a(++i);
                    })(0);
                } catch (e) {}
            })();
        }, 1200);
    }

    // Init module
    function initSecurityModule() {
        if (window.lucide) lucide.createIcons();
        printSecurityWarning();

        // Button to re-verify if DevTools was closed
        const recheckBtn = document.getElementById('btn-recheck-devtools');
        if (recheckBtn) {
            recheckBtn.addEventListener('click', () => {
                const stillDocked = checkDimensionDisparity();
                if (!stillDocked) {
                    consecutivePauseCount = 0;
                    setDevToolsState(false);
                    showSecurityToast('Đã xác thực. Chào mừng trở lại!');
                } else {
                    recheckBtn.classList.add('animate-shake');
                    setTimeout(() => recheckBtn.classList.remove('animate-shake'), 500);
                    showSecurityToast('DevTools vẫn đang mở! Vui lòng đóng cửa sổ kiểm tra.');
                }
            });
        }

        // Periodically run detection
        setInterval(runDetectorCheck, 1000);
        window.addEventListener('resize', runDetectorCheck);

        // Start anti-debug trap
        startAntiDebugTrap();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSecurityModule);
    } else {
        initSecurityModule();
    }
})();
