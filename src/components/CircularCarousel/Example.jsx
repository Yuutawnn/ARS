import React from 'react';
import CircularCarousel from './CircularCarousel';

const clanShowcaseItems = [
  {
    src: 'assets/images/banner.jpg',
    alt: 'ARS PAULINE Official Artwork & Clan Banner',
    title: 'ARS PAULINE',
    subtitle: 'Official Clan Banner • The Strongest Battlegrounds'
  },
  {
    src: 'assets/images/avatar.webp',
    alt: 'ARS PAULINE Clan Avatar Emblem',
    title: 'Emblem of Pauline',
    subtitle: 'Survivor of Riots Legacy • Est. 03/2024'
  },
  {
    src: 'assets/images/partners/eraidontop.webp',
    alt: 'Eternal Raid ERA',
    title: 'Eternal Raid | ERA',
    subtitle: 'Đồng Minh Chiến Lược • The Best Raid Clan in VN'
  },
  {
    src: 'assets/images/partners/truekings.webp',
    alt: 'True Kings Community',
    title: 'True Kings | Community',
    subtitle: 'Đối Tác Thân Thiết • Anyone Can Become The King'
  },
  {
    src: 'assets/images/partners/gS6zc7Vcss.webp',
    alt: 'PROSPER Partner',
    title: 'PROSPER',
    subtitle: 'Đối Tác Cộng Đồng • Roblox Strategic Network'
  },
  {
    src: 'assets/images/partners/HMWgAAbKGH.webp',
    alt: '/nini garden Partner',
    title: '/nini ― garden',
    subtitle: 'Đối Tác Giao Lưu • Social & Events Community'
  }
];

export default function CircularCarouselExample() {
  return (
    <div style={{ width: '100%', height: '560px', position: 'relative' }}>
      <CircularCarousel
        items={clanShowcaseItems}
        preset="cylinder"
        intro="spin"
        cardWidth={220}
        aspectRatio={1}
        speed={14}
        captions
      />
    </div>
  );
}
