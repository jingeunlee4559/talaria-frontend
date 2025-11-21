// src/components/Culture/LiveView/virtualBgPresets.js

// 🔹 가상 배경 카테고리
export const VIRTUAL_BG_CATEGORIES = [
    { id: 'basic', label: '기본' },
    { id: 'culture', label: '문화' },
    { id: 'special', label: '특별' },
    { id: 'season', label: '계절' },
];

// 🔹 가상 배경 프리셋 정의
export const VIRTUAL_BG_PRESETS = [
    // ==================== 기본 ====================
    {
        id: 'none',
        type: 'none',
        category: 'basic',
        label: '원본 그대로',
        description: '카메라 원본 영상 사용',
        thumb: null,
    },
    {
        id: 'soft-blur',
        type: 'blur',
        category: 'basic',
        label: '소프트 블러',
        description: '배경만 자연스럽게 흐림 처리',
        blurRadius: 18,
        thumb: null,
    },
    {
        id: 'medium-blur',
        type: 'blur',
        category: 'basic',
        label: '미디엄 블러',
        description: '배경을 적당히 흐리게 처리',
        blurRadius: 30,
        thumb: null,
    },
    {
        id: 'strong-blur',
        type: 'blur',
        category: 'basic',
        label: '강한 블러',
        description: '배경을 강하게 흐리게 처리',
        blurRadius: 45,
        thumb: null,
    },
    {
        id: 'studio',
        type: 'image',
        category: 'basic',
        label: '스튜디오',
        description: '깔끔한 촬영 스튜디오 배경',
        imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&q=80',
        thumb: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=60',
    },
    {
        id: 'white-minimal',
        type: 'image',
        category: 'basic',
        label: '화이트 미니멀',
        description: '깔끔한 흰색 배경',
        imageUrl: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1200&q=80',
        thumb: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&q=60',
    },
    {
        id: 'modern-office',
        type: 'image',
        category: 'basic',
        label: '모던 오피스',
        description: '세련된 현대식 사무실',
        imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80',
        thumb: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=60',
    },
    {
        id: 'cozy-room',
        type: 'image',
        category: 'basic',
        label: '아늑한 방',
        description: '편안한 분위기의 실내',
        imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80',
        thumb: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=60',
    },
    {
        id: 'bookshelf',
        type: 'image',
        category: 'basic',
        label: '책장 배경',
        description: '지적인 느낌의 책장',
        imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&q=80',
        thumb: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&q=60',
    },

    // ==================== 문화 ====================
    // {
    //     id: 'korean-room',
    //     type: 'image',
    //     category: 'culture',
    //     label: '한옥 감성',
    //     description: '은은한 한옥 실내 배경',
    //     imageUrl: '/virtual-bg/korean-room.jpg',
    //     thumb: '/virtual-bg/korean-room.jpg',
    // },
    {
        id: 'hanok-garden',
        type: 'image',
        category: 'culture',
        label: '한옥 정원',
        description: '전통 한옥과 아름다운 정원',
        imageUrl: '/virtual-bg/culture/hanokgarden.jpg',
        thumb: '/virtual-bg/culture/hanokgarden.jpg',
    },
    {
        id: 'gyeongbokgung',
        type: 'image',
        category: 'culture',
        label: '경복궁',
        description: '대한민국의 아름다운 궁궐',
        imageUrl: '/virtual-bg/culture/kbg.png',
        thumb: '/virtual-bg/culture/kbg.png',
    },
    {
        id: 'neon-city',
        type: 'image',
        category: 'culture',
        label: '네온 시티',
        description: 'K-POP MV 느낌의 네온 도시',
        imageUrl: '/virtual-bg/culture/neon.jpg',
        thumb: '/virtual-bg/culture/neon.jpg',
    },
    {
        id: 'seoul-night',
        type: 'image',
        category: 'culture',
        label: '서울 야경',
        description: '화려한 서울의 밤',
        imageUrl: '/virtual-bg/culture/seolul.jpg',
        thumb: '/virtual-bg/culture/seolul.jpg',
    },
    // {
    //     id: 'hanbok-gallery',
    //     type: 'image',
    //     category: 'culture',
    //     label: '한복 갤러리',
    //     description: '전통과 현대가 어우러진 공간',
    //     imageUrl: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=1200&q=80',
    //     thumb: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=400&q=60',
    // },
    {
        id: 'traditional-temple',
        type: 'image',
        category: 'culture',
        label: '전통시장',
        description: '고요하고 평화로운 시장',
        imageUrl: '/virtual-bg/culture/korean-food.jpg',
        thumb: '/virtual-bg/culture/korean-food.jpg',
    },

    // 일본
    {
        id: 'tokyo-night',
        type: 'image',
        category: 'culture',
        label: '도쿄 야경',
        description: '화려한 네온빛의 도쿄 시부야',
        imageUrl: '/virtual-bg/culture/dokyo.jpg',
        thumb: '/virtual-bg/culture/dokyo.jpg',
    },

    // 미국
    {
        id: 'newyork-night',
        type: 'image',
        category: 'culture',
        label: '뉴욕 야경',
        description: '잠들지 않는 도시 뉴욕의 밤',
        imageUrl: '/virtual-bg/culture/newyork.jpg',
        thumb: '/virtual-bg/culture/newyork.jpg',
    },

    // 유럽
    {
        id: 'paris-night',
        type: 'image',
        category: 'culture',
        label: '파리 야경',
        description: '낭만의 도시 파리와 에펠탑의 밤',
        imageUrl: '/virtual-bg/culture/parycity.jpg',
        thumb: '/virtual-bg/culture/parycity.jpg',
    },

    // ==================== 특별 ====================
    {
        id: 'concert-stage',
        type: 'image',
        category: 'special',
        label: '콘서트 스테이지',
        description: '화려한 조명과 스테이지 배경',
        imageUrl: '/virtual-bg/special/concert.jpg',
        thumb: '/virtual-bg/special/concert.jpg',
    },

    {
        id: 'pokemonfriends',
        type: 'image',
        category: 'special',
        label: '포켓몬 워터 파크',
        description: '신나게 물놀이하는 귀여운 포켓몬들',
        imageUrl: '/virtual-bg/special/pokemonfriends.jpg',
        thumb: '/virtual-bg/special/pokemonfriends.jpg',
    },

    {
        id: 'jammanbo',
        type: 'image',
        category: 'special',
        label: '잠자는 잠만보',
        description: '공원에서 평화롭게 꿀잠 자는 귀여운 포켓몬',
        imageUrl: '/virtual-bg/special/jammanbo.jpg',
        thumb: '/virtual-bg/special/jammanbo.jpg',
    },

    {
        id: 'birthday-party',
        type: 'image',
        category: 'special',
        label: '생일 파티',
        description: '축하 분위기의 파티 배경',
        imageUrl: '/virtual-bg/special/birthday-party.jpg',
        thumb: '/virtual-bg/special/birthday-party.jpg',
    },

    {
        id: 'fireworks',
        type: 'image',
        category: 'special',
        label: '불꽃놀이',
        description: '화려한 불꽃이 터지는 밤',
        imageUrl: '/virtual-bg/special/fireflower.jpg',
        thumb: '/virtual-bg/special/fireflower.jpg',
    },
    {
        id: 'red-carpet',
        type: 'image',
        category: 'special',
        label: '레드 카펫',
        description: 'VIP 행사 분위기',
        imageUrl: '/virtual-bg/special/redcafet.jpg',
        thumb: '/virtual-bg/special/redcafet.jpg',
    },

    // ==================== 계절 - 봄 ====================
    {
        id: 'spring-garden',
        type: 'image',
        category: 'season',
        label: '봄 정원',
        description: '벚꽃이 피어있는 따뜻한 봄 정원',
        imageUrl: '/virtual-bg/season/springgarden.jpg',
        thumb: '/virtual-bg/season/springgarden.jpg',
    },
    {
        id: 'cherry-blossom',
        type: 'image',
        category: 'season',
        label: '벚꽃 터널',
        description: '만개한 벚꽃이 만드는 로맨틱한 터널',
        imageUrl: '/virtual-bg/season/cheeryblossom.jpg',
        thumb: '/virtual-bg/season/cheeryblossom.jpg',
    },
    {
        id: 'spring-field',
        type: 'image',
        category: 'season',
        label: '봄 공원',
        description: '신록이 가득한 싱그러운 공원',
        imageUrl: '/virtual-bg/season/springfield.jpg',
        thumb: '/virtual-bg/season/springfield.jpg',
    },

    // ==================== 계절 - 여름 ====================
    {
        id: 'summer-beach',
        type: 'image',
        category: 'season',
        label: '여름 해변',
        description: '시원한 파도가 밀려오는 해변',
        imageUrl: '/virtual-bg/season/summerbeach.jpg',
        thumb: '/virtual-bg/season/summerbeach.jpg',
    },

    {
        id: 'summer-sunset',
        type: 'image',
        category: 'season',
        label: '여름 노을',
        description: '따뜻한 색감의 여름 석양',
        imageUrl: '/virtual-bg/season/summersunset.jpg',
        thumb: '/virtual-bg/season/summersunset.jpg',
    },

    // ==================== 계절 - 가을 ====================
    {
        id: 'autumn-forest',
        type: 'image',
        category: 'season',
        label: '가을 숲',
        description: '단풍으로 물든 아름다운 숲',
        imageUrl: '/virtual-bg/season/autumnforest.jpg',
        thumb: '/virtual-bg/season/autumnforest.jpg',
    },

    {
        id: 'autumn-park',
        type: 'image',
        category: 'season',
        label: '가을 공원',
        description: '노란 은행잎이 가득한 공원',
        imageUrl: '/virtual-bg/season/autompark.avif',
        thumb: '/virtual-bg/season/autompark.avif',
    },

    // ==================== 계절 - 겨울 ====================
    {
        id: 'winter-village',
        type: 'image',
        category: 'season',
        label: '겨울 마을',
        description: '눈 내리는 아늑한 겨울 마을',
        imageUrl: '/virtual-bg/season/wintervilige.webp',
        thumb: '/virtual-bg/season/wintervilige.webp',
    },
    {
        id: 'snowy-forest',
        type: 'image',
        category: 'season',
        label: '눈 덮인 숲',
        description: '하얀 눈으로 덮인 고요한 숲',
        imageUrl: '/virtual-bg/season/winterforest.avif',
        thumb: '/virtual-bg/season/winterforest.avif',
    },
    {
        id: 'winter-night',
        type: 'image',
        category: 'season',
        label: '겨울 밤',
        description: '별빛과 눈이 빛나는 겨울밤',
        imageUrl: '/virtual-bg/season/winternight.avif',
        thumb: '/virtual-bg/season/winternight.avif',
    },
    {
        id: 'winter-city',
        type: 'image',
        category: 'season',
        label: '겨울 도시',
        description: '크리스마스 조명이 반짝이는 도시',
        imageUrl: '/virtual-bg/season/wintercity.jpg',
        thumb: '/virtual-bg/season/wintercity.jpg',
    },
    {
        id: 'frozen-lake',
        type: 'image',
        category: 'season',
        label: '얼어붙은 호수',
        description: '신비로운 겨울 호수',
        imageUrl: '/virtual-bg/season/winterlake.avif',
        thumb: '/virtual-bg/season/winterlake.avif',
    },
];

// 기본값 id
export const DEFAULT_VIRTUAL_BG_ID = 'none';

// id로 프리셋 찾는 헬퍼
export const findVirtualBgPreset = (id) => VIRTUAL_BG_PRESETS.find((p) => p.id === id) || VIRTUAL_BG_PRESETS[0];
