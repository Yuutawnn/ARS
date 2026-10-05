import React from 'react';
import CircularCarousel from './CircularCarousel';

const partnerItems = [
  {
    src: 'assets/images/partners/truekings.webp',
    alt: 'True Kings Community',
    title: 'True Kings | Community',
    subtitle: 'Đối Tác • 1,355 Members • Anyone Can Become The King',
    inviteUrl: 'https://discord.gg/truekings'
  },
  {
    src: 'assets/images/partners/HMWgAAbKGH.webp',
    alt: '/nini garden Partner',
    title: '/nini ― garden',
    subtitle: 'Đối Tác • 104 Members • Events & Creative Community',
    inviteUrl: 'https://discord.gg/HMWgAAbKGH'
  },
  {
    src: 'assets/images/partners/gS6zc7Vcss.webp',
    alt: 'PROSPER Partner',
    title: 'PROSPER',
    subtitle: 'Đối Tác • 2,666 Members • Strategic Network',
    inviteUrl: 'https://discord.gg/gS6zc7Vcss'
  }
];

export default function CircularCarouselExample() {
  return (
    <div style={{ width: '100%', height: '540px', position: 'relative' }}>
      <CircularCarousel
        items={partnerItems}
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
