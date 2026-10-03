/**
 * DotField Engine - Integrated from React Bits
 * High-performance, highly visible Canvas + SVG Implementation
 */

const TWO_PI = Math.PI * 2;

function createDotField(container, options = {}) {
  if (!container) return null;

  const config = {
    dotRadius: options.dotRadius ?? 1.8,
    dotSpacing: options.dotSpacing ?? 55, // Giãn cách trên 50px thoáng đãng
    cursorRadius: options.cursorRadius ?? 450,
    cursorForce: options.cursorForce ?? 0.1,
    bulgeOnly: options.bulgeOnly !== undefined ? options.bulgeOnly : true,
    bulgeStrength: options.bulgeStrength ?? 70,
    glowRadius: options.glowRadius ?? 160,
    sparkle: options.sparkle !== undefined ? options.sparkle : false, // Tắt nhấp nháy
    waveAmplitude: options.waveAmplitude ?? 0,
    gradientFrom: options.gradientFrom ?? 'rgba(168, 196, 236, 0.32)', // #A8C4EC (Whisper Blue)
    gradientTo: options.gradientTo ?? 'rgba(4, 116, 196, 0.20)',     // #0474C4 (Sapphire Primary)
    glowColor: options.glowColor ?? 'rgba(83, 121, 174, 0.15)',      // #5379AE (Slate Sapphire)
  };

  // Đảm bảo container phủ trọn màn hình
  container.classList.add('dot-field-container');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '0';

  // Tạo Canvas
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d', { alpha: true });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let dots = [];
  const mouse = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 };
  let size = { w: window.innerWidth, h: window.innerHeight };
  let glowOpacity = 0;
  let engagement = 0;
  let rafId = null;
  let resizeTimer = null;
  let frameCount = 0;

  function doResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    size.w = w;
    size.h = h;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildDots(w, h);
  }

  function resize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(doResize, 60);
  }

  function buildDots(w, h) {
    const step = config.dotRadius + config.dotSpacing;
    const cols = Math.floor(w / step);
    const rows = Math.floor(h / step);
    const padX = (w % step) / 2;
    const padY = (h % step) / 2;
    dots = new Array(rows * cols);
    let idx = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const ax = padX + col * step + step / 2;
        const ay = padY + row * step + step / 2;
        dots[idx++] = { ax, ay, sx: ax, sy: ay, vx: 0, vy: 0, x: ax, y: ay };
      }
    }
  }

  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }

  function updateMouseSpeed() {
    const dx = mouse.prevX - mouse.x;
    const dy = mouse.prevY - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    mouse.speed += (dist - mouse.speed) * 0.5;
    if (mouse.speed < 0.001) mouse.speed = 0;
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
  }

  const speedInterval = setInterval(updateMouseSpeed, 20);

  function tick() {
    frameCount++;
    const len = dots.length;
    const { w, h } = size;
    const t = frameCount * 0.02;

    const targetEngagement = Math.min(mouse.speed / 4, 1);
    engagement += (targetEngagement - engagement) * 0.08;
    if (engagement < 0.001) engagement = 0;
    const eng = engagement;

    glowOpacity += (eng - glowOpacity) * 0.08;

    ctx.clearRect(0, 0, w, h);

    if (w > 0 && h > 0 && len > 0) {
      // 1. Vẽ SVG Radial Glow tại con trỏ chuột
      if (mouse.x > -500 && mouse.y > -500 && glowOpacity > 0.01) {
        ctx.save();
        const glowGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, config.glowRadius);
        glowGrad.addColorStop(0, config.glowColor);
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, config.glowRadius, 0, TWO_PI);
        ctx.fill();
        ctx.restore();
      }

      // 2. Vẽ Lưới Chấm DotField
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, config.gradientFrom);
      grad.addColorStop(1, config.gradientTo);
      ctx.fillStyle = grad;

      const cr = config.cursorRadius;
      const crSq = cr * cr;
      const rad = config.dotRadius;
      const isBulge = config.bulgeOnly;

      ctx.beginPath();

      for (let i = 0; i < len; i++) {
        const d = dots[i];
        if (!d) continue;

        const dx = mouse.x - d.ax;
        const dy = mouse.y - d.ay;
        const distSq = dx * dx + dy * dy;

        // Tương tác Bulge khi chuột đến gần
        if (distSq < crSq && mouse.x > -500) {
          const dist = Math.sqrt(distSq);
          if (isBulge) {
            const ratio = 1 - dist / cr;
            // Cho phép dạt nhẹ ngay cả khi chuột di chuyển chậm
            const effectiveEng = Math.max(eng, 0.4);
            const push = ratio * ratio * config.bulgeStrength * effectiveEng;
            const angle = Math.atan2(dy, dx);
            d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15;
            d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15;
          } else {
            const angle = Math.atan2(dy, dx);
            const move = (500 / dist) * (mouse.speed * config.cursorForce);
            d.vx += Math.cos(angle) * -move;
            d.vy += Math.sin(angle) * -move;
          }
        } else if (isBulge) {
          d.sx += (d.ax - d.sx) * 0.1;
          d.sy += (d.ay - d.sy) * 0.1;
        }

        if (!isBulge) {
          d.vx *= 0.9;
          d.vy *= 0.9;
          d.x = d.ax + d.vx;
          d.y = d.ay + d.vy;
          d.sx += (d.x - d.sx) * 0.1;
          d.sy += (d.y - d.sy) * 0.1;
        }

        let drawX = d.sx;
        let drawY = d.sy;

        if (config.waveAmplitude > 0) {
          drawY += Math.sin(d.ax * 0.03 + t) * config.waveAmplitude;
          drawX += Math.cos(d.ay * 0.03 + t * 0.7) * config.waveAmplitude * 0.5;
        }

        // Sparkle ngẫu nhiên
        if (config.sparkle) {
          const hash = ((i * 2654435761) ^ (frameCount >> 3)) >>> 0;
          if ((hash % 100) < 3) {
            ctx.moveTo(drawX + rad * 1.6, drawY);
            ctx.arc(drawX, drawY, rad * 1.6, 0, TWO_PI);
          } else {
            ctx.moveTo(drawX + rad, drawY);
            ctx.arc(drawX, drawY, rad, 0, TWO_PI);
          }
        } else {
          ctx.moveTo(drawX + rad, drawY);
          ctx.arc(drawX, drawY, rad, 0, TWO_PI);
        }
      }

      ctx.fill();
    }

    rafId = requestAnimationFrame(tick);
  }

  doResize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', onMouseMove, { passive: true });
  rafId = requestAnimationFrame(tick);

  return {
    destroy: () => {
      cancelAnimationFrame(rafId);
      clearInterval(speedInterval);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      canvas.remove();
    },
    updateColors: (gradientFrom, gradientTo, glowColor) => {
      config.gradientFrom = gradientFrom;
      config.gradientTo = gradientTo;
      if (glowColor) config.glowColor = glowColor;
    }
  };
}

// Global initialization
window.createDotField = createDotField;
