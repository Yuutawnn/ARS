import React from 'react';
import BorderGlow from './BorderGlow';

export default function BorderGlowExample() {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', background: '#000000', minHeight: '100vh', color: '#fff' }}>
      {/* 1. Mẫu mặc định theo tài liệu React Bits */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: '#A8C4EC', fontFamily: 'monospace' }}>React Bits Default Preset:</h3>
        <BorderGlow
          edgeSensitivity={30}
          glowColor="40 80 80"
          backgroundColor="#120F17"
          borderRadius={28}
          glowRadius={40}
          glowIntensity={1.0}
          coneSpread={25}
          animated={false}
          colors={['#c084fc', '#f472b6', '#38bdf8']}
        >
          <div style={{ padding: '2em' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Your Content Here</h2>
            <p style={{ marginTop: '0.5rem', color: '#94a3b8' }}>Hover near the edges to see the glow.</p>
          </div>
        </BorderGlow>
      </div>

      {/* 2. Mẫu phối màu chuẩn ARS Pauline Sapphire Theme */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: '#0474C4', fontFamily: 'monospace' }}>ARS Pauline Sapphire Palette Preset:</h3>
        <BorderGlow
          edgeSensitivity={32}
          glowColor="205 96 40" // HSL cho Sapphire #0474C4
          backgroundColor="#000000"
          borderRadius={24}
          glowRadius={42}
          glowIntensity={1.2}
          coneSpread={28}
          animated={true}
          colors={['#0474C4', '#5379AE', '#A8C4EC']}
          fillOpacity={0.4}
        >
          <div style={{ padding: '2em' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#A8C4EC', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Former #1 VN • Former #3 Asia
            </span>
            <h2 style={{ margin: '0.5rem 0', fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
              ARS PAULINE
            </h2>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.6' }}>
              Thời Khắc Đăng Quang, Là Lúc Khởi Đầu Vạn Sự. Rê chuột vào các cạnh để cảm nhận viền phát quang động.
            </p>
          </div>
        </BorderGlow>
      </div>
    </div>
  );
}
