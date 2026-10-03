'use client';

import { useRef, useState } from 'react';
import './TiltedCard.css';

export default function TiltedCard({
  children,
  className = '',
  maxTilt = 15,
  scale = 1.03,
  glare = true,
  perspective = 1000
}) {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({
    transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
  });
  const [glareStyle, setGlareStyle] = useState({
    opacity: 0,
    background: 'none'
  });

  const state = useRef({
    currentTiltX: 0,
    currentTiltY: 0,
    targetTiltX: 0,
    targetTiltY: 0,
    currentScale: 1,
    targetScale: 1,
    currentGlareX: 50,
    currentGlareY: 50,
    targetGlareX: 50,
    targetGlareY: 50,
    isHovered: false,
    animId: null
  });

  const startLoop = () => {
    if (state.current.animId) return;

    const loop = () => {
      const s = state.current;
      const ease = 0.085;
      s.currentTiltX += (s.targetTiltX - s.currentTiltX) * ease;
      s.currentTiltY += (s.targetTiltY - s.currentTiltY) * ease;
      s.currentScale += (s.targetScale - s.currentScale) * ease;
      s.currentGlareX += (s.targetGlareX - s.currentGlareX) * ease;
      s.currentGlareY += (s.targetGlareY - s.currentGlareY) * ease;

      setStyle({
        transform: `perspective(${perspective}px) rotateX(${s.currentTiltX.toFixed(3)}deg) rotateY(${s.currentTiltY.toFixed(3)}deg) scale3d(${s.currentScale.toFixed(4)}, ${s.currentScale.toFixed(4)}, ${s.currentScale.toFixed(4)})`
      });

      if (glare) {
        setGlareStyle({
          opacity: s.isHovered ? 1 : 0,
          background: `radial-gradient(circle at ${s.currentGlareX.toFixed(1)}% ${s.currentGlareY.toFixed(1)}%, rgba(168, 196, 236, 0.42) 0%, rgba(4, 116, 196, 0.16) 38%, transparent 70%)`
        });
      }

      const isSettled = !s.isHovered && 
        Math.abs(s.currentTiltX) < 0.02 && 
        Math.abs(s.currentTiltY) < 0.02 && 
        Math.abs(s.currentScale - 1) < 0.001;

      if (!isSettled) {
        s.animId = requestAnimationFrame(loop);
      } else {
        setStyle({
          transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
        });
        s.animId = null;
      }
    };
    state.current.animId = requestAnimationFrame(loop);
  };

  const handlePointerEnter = () => {
    state.current.isHovered = true;
    state.current.targetScale = scale;
    startLoop();
  };

  const handlePointerMove = e => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    state.current.targetTiltX = (0.5 - y) * maxTilt;
    state.current.targetTiltY = (x - 0.5) * maxTilt;
    state.current.targetGlareX = x * 100;
    state.current.targetGlareY = y * 100;

    startLoop();
  };

  const handlePointerLeave = () => {
    state.current.isHovered = false;
    state.current.targetTiltX = 0;
    state.current.targetTiltY = 0;
    state.current.targetScale = 1;
    startLoop();
  };

  return (
    <div className={`tilted-card-wrapper ${className}`}>
      <div
        ref={cardRef}
        className="tilted-card-inner"
        style={style}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {children}
        {glare && <div className="tilted-card-glare" style={glareStyle} />}
      </div>
    </div>
  );
}
