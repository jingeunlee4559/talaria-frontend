// src/components/Culture/contents/backgroundThemes.js

// ⚙️ 모든 imageUrl을 실제 존재하는 images.unsplash.com 정적 링크로 교체
//  - 형식: https://images.unsplash.com/photo-XXXXXXXX...?auto=format&fit=crop&w=1920&q=80
//  - Heroku 기반 source.unsplash.com 은 전부 제거

export const BACKGROUND_THEMES = {
    // 🎨 기본 테마
    default: {
        id: 'default',
        name: '✨ 매직 그라데이션',
        category: 'basic',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        effects: ['stars', 'sparkles'],
        imageUrl: 'https://images.unsplash.com/photo-1691200099282-16fd34790ade?auto=format&fit=crop&w=1920&q=80',
    },
    sunset: {
        id: 'sunset',
        name: '🌅 선셋 비치',
        category: 'basic',
        gradient: 'linear-gradient(180deg, #ff6b6b 0%, #ff8e53 30%, #ffd93d 60%, #00b4d8 100%)',
        effects: ['sun', 'waves', 'clouds', 'beach'],
        imageUrl: 'https://images.unsplash.com/photo-1563836728031-53a374d2d2e1?auto=format&fit=crop&w=1920&q=80',
    },
    galaxy: {
        id: 'galaxy',
        name: '🌌 우주 갤럭시',
        category: 'basic',
        gradient: 'linear-gradient(135deg, #020024 0%, #090979 35%, #4b0082 100%)',
        effects: ['stars', 'nebula'],
        imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1920&q=80',
    },
    aurora: {
        id: 'aurora',
        name: '🌌 오로라',
        category: 'basic',
        gradient: 'linear-gradient(180deg, #020817 0%, #0b1120 50%, #1d3557 100%)',
        effects: ['aurora', 'stars'],
        imageUrl: 'https://images.unsplash.com/photo-1573098398234-fd4233487e53?auto=format&fit=crop&w=1920&q=80',
    },

    // 🯰 한국 테마
    korean: {
        id: 'korean',
        name: '🯰 한국 전통 궁궐',
        category: 'culture',
        gradient: 'linear-gradient(180deg, #87ceeb 0%, #e8dcc4 50%, #d4a574 100%)',
        effects: ['hanok', 'sakura', 'mountains', 'traditionalPattern'],
        imageUrl: 'https://cdn.designhouse.co.kr/cms/img/2017/06/M.1497402287.6002.4.jpg',
    },
    hanbok: {
        id: 'hanbok',
        name: '👘 한복 패턴',
        category: 'culture',
        gradient: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 40%, #f8b500 100%)',
        effects: ['koreanPattern', 'flowers'],
        imageUrl: 'https://t3.ftcdn.net/jpg/03/65/12/98/360_F_365129897_HbSqEw8F8GOFlsLNJMLO1ec80TdaZlEh.jpg',
    },

    // 🗾 일본 테마
    japanese: {
        id: 'japanese',
        name: '🗾 일본 벚꽃',
        category: 'culture',
        gradient: 'linear-gradient(180deg, #87ceeb 0%, #ffc0cb 50%, #ffe4e1 100%)',
        effects: ['sakuraFall', 'torii', 'mountFuji'],
        imageUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1920&q=80',
    },
    tokyo: {
        id: 'tokyo',
        name: '🗼 도쿄 네온',
        category: 'culture',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #4c1d95 100%)',
        effects: ['neon', 'cityscape', 'lights'],
        imageUrl: 'https://images.unsplash.com/photo-1501769752-a59efa2298ce?auto=format&fit=crop&w=1920&q=80',
    },

    // 🮮 중국 테마
    chinese: {
        id: 'chinese',
        name: '🮮 중국 랜턴',
        category: 'culture',
        gradient: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 40%, #facc15 100%)',
        effects: ['lanterns', 'dragon', 'fireworks'],
        imageUrl: 'https://images.unsplash.com/photo-1675610682384-aaa76115742d?auto=format&fit=crop&w=1920&q=80',
    },
    forbidden: {
        id: 'forbidden',
        name: '🛏️ 자금성',
        category: 'culture',
        gradient: 'linear-gradient(180deg, #7f1d1d 0%, #b45309 50%, #facc15 100%)',
        effects: ['chineseRoof', 'clouds', 'goldPattern'],
        imageUrl: 'https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/depositphotos136823022xl-1719201008706.jpg',
    },

    // 🗽 서양 테마
    western: {
        id: 'western',
        name: '🗽 뉴욕 시티',
        category: 'culture',
        gradient: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
        effects: ['cityscape', 'lights', 'stars'],
        imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1920&q=80',
    },
    hollywood: {
        id: 'hollywood',
        name: '🎬 할리우드',
        category: 'culture',
        gradient: 'linear-gradient(135deg, #4b0b0b 0%, #fb923c 50%, #facc15 100%)',
        effects: ['spotlight', 'stars'],
        imageUrl: 'https://www.cts.tv/plugin/editor/summernote/upload/1a27ea7081186c58bd2a7aa48d2f1924_thumb.jpg',
    },

    // 🌴 열대 테마
    tropical: {
        id: 'tropical',
        name: '🌴 트로피컬',
        category: 'culture',
        gradient: 'linear-gradient(180deg, #00d2ff 0%, #3a7bd5 30%, #00bfff 60%, #98fb98 100%)',
        effects: ['palms', 'beach', 'ocean', 'birds'],
        imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1920&q=80',
    },

    // ⭐ 특별 테마
    anime: {
        id: 'anime',
        name: '🎌 애니메이션',
        category: 'special',
        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #ffdde1 100%)',
        effects: ['neon', 'sparkles', 'cityscape'],
        imageUrl: 'https://images.unsplash.com/photo-1501769752-a59efa2298ce?auto=format&fit=crop&w=1920&q=80',
    },
    minecraft: {
        id: 'minecraft',
        name: '🎮 마인크래프트',
        category: 'special',
        gradient: 'linear-gradient(180deg, #4ade80 0%, #22c55e 40%, #16a34a 70%, #166534 100%)',
        effects: ['clouds', 'mountains'],
        imageUrl:
            'https://mblogthumb-phinf.pstatic.net/MjAyMjA4MDlfMjk4/MDAxNjYwMDU3MDc1MzEz.H7c3uZA3rOQ5uwWWl75fUgNc8ElS4MYbVuKw85Ev_vsg.1-zvMuJ_qtVYVZpXnAgttZgEmBSCB30SscicgKuZ02Mg.JPEG.voodoo7/IMG_7338.JPG?type=w800',
    },
    pokemon: {
        id: 'pokemon',
        name: '⚡ 포켓몬',
        category: 'special',
        gradient: 'linear-gradient(135deg, #ffcb05 0%, #3d7dca 50%, #ee1515 100%)',
        effects: ['pokeball', 'sparkles', 'stars'],
        // ⚠️ 실제 포켓몬/포켓볼 이미지는 로컬 에셋 사용 (직접 준비한 이미지)
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwVsK_nvBxqGdTGh0k0Zvys3a8Q7qJXuIGFg&s',
    },
    fantasy: {
        id: 'fantasy',
        name: '🰰 판타지 캐슬',
        category: 'special',
        gradient: 'linear-gradient(135deg, #312e81 0%, #6d28d9 50%, #f472b6 100%)',
        effects: ['castle', 'magic', 'stars'],
        imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80',
    },
    underwater: {
        id: 'underwater',
        name: '🠠 해저 세계',
        category: 'special',
        gradient: 'linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 40%, #2563eb 70%, #7e22ce 100%)',
        effects: ['bubbles', 'fish', 'coral'],
        imageUrl: 'https://images.unsplash.com/photo-1682687982501-1e58ab814714?auto=format&fit=crop&w=1920&q=80',
    },

    // 🎤 K-POP 데몬 헌터스 테마 (KPDH)
    kpdh_huntrix: {
        id: 'kpdh_huntrix',
        name: '💜 HUNTR/X 스테이지',
        category: 'kpop',
        gradient: 'linear-gradient(135deg, #6b21a8 0%, #a855f7 30%, #ec4899 60%, #f472b6 100%)',
        effects: ['kpdh_stage', 'kpdh_sparkles', 'kpdh_neon', 'spotlight', 'stars'],
        imageUrl: '/mnt/user-data/uploads/1763998599754_image.png',
    },
    kpdh_demon: {
        id: 'kpdh_demon',
        name: '👹 데몬 헌터 모드',
        category: 'kpop',
        gradient: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 30%, #7c3aed 60%, #c026d3 100%)',
        effects: ['kpdh_energy', 'kpdh_sword', 'kpdh_portal', 'stars'],
        imageUrl: '/mnt/user-data/uploads/1763998599754_image.png',
    },
    kpdh_derpy: {
        id: 'kpdh_derpy',
        name: '🐯 더피 타이거',
        category: 'kpop',
        gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 30%, #22d3ee 60%, #67e8f9 100%)',
        effects: ['kpdh_derpy', 'kpdh_clouds', 'sparkles'],
        imageUrl: '/mnt/user-data/uploads/1763998638481_image.png',
    },
    kpdh_concert: {
        id: 'kpdh_concert',
        name: '🎵 콘서트 라이브',
        category: 'kpop',
        gradient: 'linear-gradient(135deg, #9333ea 0%, #c026d3 25%, #ec4899 50%, #f97316 75%, #fbbf24 100%)',
        effects: ['kpdh_concert_lights', 'kpdh_cheering', 'spotlight', 'neon'],
        imageUrl: '/mnt/user-data/uploads/1763998599754_image.png',
    },
    kpdh_golden: {
        id: 'kpdh_golden',
        name: '✨ 골든 혼문',
        category: 'kpop',
        gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 30%, #facc15 60%, #fde047 100%)',
        effects: ['kpdh_golden_seal', 'kpdh_runes', 'magic', 'sparkles'],
        imageUrl: '/mnt/user-data/uploads/1763998599754_image.png',
    },

    // 🃏 계절 테마
    spring: {
        id: 'spring',
        name: '🌸 봄',
        category: 'season',
        gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9a9e 100%)',
        effects: ['flowers', 'butterflies'],
        imageUrl: 'https://img.lovepik.com/background/20211021/large/lovepik-spring-floral-background-image_401686078.jpg',
    },
    summer: {
        id: 'summer',
        name: '☀️ 여름',
        category: 'season',
        gradient: 'linear-gradient(180deg, #56ccf2 0%, #2f80ed 50%, #f97316 100%)',
        effects: ['sun', 'beach', 'waves'],
        imageUrl: 'https://image.idus.com/image/files/a0cf31545c8e4f91b3a3298b015b003f_720.jpg',
    },
    autumn: {
        id: 'autumn',
        name: '🂂 가을',
        category: 'season',
        gradient: 'linear-gradient(135deg, #ff9068 0%, #fd746c 50%, #f59e0b 100%)',
        effects: ['leaves', 'wind'],
        imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=80',
    },
    winter: {
        id: 'winter',
        name: '❄️ 겨울',
        category: 'season',
        gradient: 'linear-gradient(180deg, #e0f2fe 0%, #bfdbfe 40%, #93c5fd 70%, #0f172a 100%)',
        effects: ['snow', 'frost', 'stars'],
        imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1920&q=80',
    },
};

// 🎨 테마 카테고리
export const THEME_CATEGORIES = {
    basic: { name: '기본 테마', icon: '🎨' },
    culture: { name: '문화 테마', icon: '🌏' },
    special: { name: '특별 테마', icon: '⭐' },
    season: { name: '계절 테마', icon: '🃏' },
    kpop: { name: 'K-POP 데몬 헌터스', icon: '🎤' },
};

// 🎬 애니메이션 스타일 + 유틸 클래스 (그대로 사용)
export const getAnimationStyles = () => `
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }

  @keyframes twinkle {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.3); }
  }

  @keyframes aurora-1 {
    0%, 100% { transform: translateX(0) scale(1); opacity: 0.6; }
    50% { transform: translateX(20%) scale(1.2); opacity: 0.8; }
  }

  @keyframes aurora-2 {
    0%, 100% { transform: translateX(0) scale(1.1); opacity: 0.5; }
    50% { transform: translateX(-15%) scale(1); opacity: 0.7; }
  }

  @keyframes aurora-3 {
    0%, 100% { transform: translateX(0) scale(0.9); opacity: 0.6; }
    50% { transform: translateX(10%) scale(1.3); opacity: 0.9; }
  }

  @keyframes fall {
    0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
  }

  @keyframes fall-rotate {
    0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(110vh) rotate(1080deg); opacity: 0; }
  }

  @keyframes swing {
    0%, 100% { transform: rotate(-8deg); }
    50% { transform: rotate(8deg); }
  }

  @keyframes dragon-fly {
    0% { transform: translate(-20vw, 50vh) scale(1); }
    25% { transform: translate(30vw, 30vh) scale(1.3) rotateY(0deg); }
    50% { transform: translate(70vw, 40vh) scale(1.2) rotateY(180deg); }
    75% { transform: translate(50vw, 60vh) scale(1.1) rotateY(180deg); }
    100% { transform: translate(120vw, 50vh) scale(1); }
  }

  @keyframes firework {
    0% { transform: scale(0); opacity: 1; }
    50% { transform: scale(1.5); opacity: 1; }
    100% { transform: scale(2); opacity: 0; }
  }

  @keyframes wave {
    0%, 100% { transform: translateX(0) translateY(0); }
    50% { transform: translateX(20px) translateY(-5px); }
  }

  @keyframes cloud-move {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(calc(100vw + 100px)); }
  }

  @keyframes palm-sway {
    0%, 100% { transform: rotate(-3deg); }
    50% { transform: rotate(3deg); }
  }

  @keyframes tide {
    0%, 100% { transform: scaleX(1) translateY(0); }
    50% { transform: scaleX(1.05) translateY(-10px); }
  }

  @keyframes bird-fly {
    0% { transform: translateX(-100px) translateY(0); }
    50% { transform: translateX(50vw) translateY(-30px); }
    100% { transform: translateX(calc(100vw + 100px)) translateY(0); }
  }

  @keyframes neon-glow {
    0%, 100% { 
      box-shadow: 0 0 5px currentColor, 0 0 10px currentColor;
    }
    50% { 
      box-shadow: 0 0 15px currentColor, 0 0 30px currentColor;
    }
  }

  @keyframes bubble-rise {
    0% { transform: translateY(0) scale(1); opacity: 0; }
    10% { opacity: 0.8; }
    90% { opacity: 0.8; }
    100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
  }

  @keyframes swim {
    0% { transform: translateX(-100px) scaleX(1); }
    50% { transform: translateX(50vw) scaleX(-1); }
    100% { transform: translateX(calc(100vw + 100px)) scaleX(1); }
  }

  @keyframes butterfly {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(50px, -30px) rotate(10deg); }
    50% { transform: translate(100px, 0) rotate(-10deg); }
    75% { transform: translate(50px, 30px) rotate(5deg); }
  }

  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes magic-sparkle {
    0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
    50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
  }

  @keyframes kpdh-pulse {
    0%, 100% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.1); opacity: 1; }
  }

  @keyframes kpdh-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes kpdh-beam {
    0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateY(-100vh) scale(1.2); opacity: 0; }
  }

  @keyframes kpdh-float {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-30px) scale(1.05); }
  }

  @keyframes kpdh-swing {
    0%, 100% { transform: rotate(-5deg); }
    50% { transform: rotate(5deg); }
  }

  @keyframes kpdh-portal {
    0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.3; }
    50% { transform: scale(1.2) rotate(180deg); opacity: 0.6; }
  }

  @keyframes kpdh-cheer {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  /* 🔧 유틸 클래스 */
  .animate-aurora-1 { animation: aurora-1 18s ease-in-out infinite alternate; }
  .animate-aurora-2 { animation: aurora-2 22s ease-in-out infinite alternate; }
  .animate-aurora-3 { animation: aurora-3 26s ease-in-out infinite alternate; }

  .animate-dragon-fly { animation: dragon-fly 30s linear infinite; }
  .animate-firework { animation: firework 2s ease-out forwards; }
  .animate-palm-sway { animation: palm-sway 4s ease-in-out infinite; }
  .animate-tide { animation: tide 8s ease-in-out infinite; }
  .animate-bubble-rise { animation: bubble-rise 10s ease-in infinite; }
  .animate-swim { animation: swim 18s linear infinite; }
  .animate-butterfly { animation: butterfly 16s ease-in-out infinite; }
  .animate-spin-slow { animation: spin-slow 12s linear infinite; }
  .animate-magic-sparkle { animation: magic-sparkle 4s ease-in-out infinite; }
  .animate-neon-glow { animation: neon-glow 3s ease-in-out infinite; }
  .animate-cloud-move { animation: cloud-move 40s linear infinite; }
  .animate-kpdh-pulse { animation: kpdh-pulse 3s ease-in-out infinite; }
  .animate-kpdh-rotate { animation: kpdh-rotate 20s linear infinite; }
  .animate-kpdh-beam { animation: kpdh-beam 4s ease-out infinite; }
  .animate-kpdh-float { animation: kpdh-float 6s ease-in-out infinite; }
  .animate-kpdh-swing { animation: kpdh-swing 3s ease-in-out infinite; }
  .animate-kpdh-portal { animation: kpdh-portal 8s ease-in-out infinite; }
  .animate-kpdh-cheer { animation: kpdh-cheer 0.6s ease-in-out infinite; }
`;