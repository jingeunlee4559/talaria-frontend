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
        imageUrl: 'https://cdn.travie.com/news/photo/202106/21877_11355_4237.jpg',
        thumb: 'https://cdn.travie.com/news/photo/202106/21877_11355_4237.jpg',
    },
    {
        id: 'gyeongbokgung',
        type: 'image',
        category: 'culture',
        label: '경복궁',
        description: '대한민국의 아름다운 궁궐',
        imageUrl: 'https://hotellemong.com/storage/97c92b9b462f3.png',
        thumb: 'https://hotellemong.com/storage/97c92b9b462f3.png',
    },
    {
        id: 'neon-city',
        type: 'image',
        category: 'culture',
        label: '네온 시티',
        description: 'K-POP MV 느낌의 네온 도시',
        imageUrl: 'https://p.turbosquid.com/ts-thumb/13/R2IFI6/zUu1kdr0/1/png/1603141071/1920x1080/fit_q87/ee45c39bfab7587133be46388942d8f587993a55/1.jpg',
        thumb: 'https://p.turbosquid.com/ts-thumb/13/R2IFI6/zUu1kdr0/1/png/1603141071/1920x1080/fit_q87/ee45c39bfab7587133be46388942d8f587993a55/1.jpg',
    },
    {
        id: 'seoul-night',
        type: 'image',
        category: 'culture',
        label: '서울 야경',
        description: '화려한 서울의 밤',
        imageUrl: 'https://img.hani.co.kr/imgdb/resize/2022/0121/164266180737_20220121.JPG',
        thumb: 'https://img.hani.co.kr/imgdb/resize/2022/0121/164266180737_20220121.JPG',
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
        label: '전통 사찰',
        description: '고요하고 평화로운 사찰',
        imageUrl: 'https://www.ynnews.kr/news/photo/202203/183164_121400_191.jpg',
        thumb: 'https://www.ynnews.kr/news/photo/202203/183164_121400_191.jpg',
    },

    // 일본
    {
        id: 'tokyo-night',
        type: 'image',
        category: 'culture',
        label: '도쿄 야경',
        description: '화려한 네온빛의 도쿄 시부야',
        imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80',
        thumb: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=60',
    },

    // 미국
    {
        id: 'newyork-night',
        type: 'image',
        category: 'culture',
        label: '뉴욕 야경',
        description: '잠들지 않는 도시 맨해튼의 밤',
        imageUrl: 'https://tourimage.interpark.com/BBS/Tour/FckUpload/201404/6353433153040709340.jpg',
        thumb: 'https://tourimage.interpark.com/BBS/Tour/FckUpload/201404/6353433153040709340.jpg',
    },

    // 유럽
    {
        id: 'paris-night',
        type: 'image',
        category: 'culture',
        label: '파리 야경',
        description: '낭만의 도시 파리와 에펠탑의 밤',
        imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
        thumb: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=60',
    },

    // ==================== 특별 ====================
    {
        id: 'concert-stage',
        type: 'image',
        category: 'special',
        label: '콘서트 스테이지',
        description: '화려한 조명과 스테이지 배경',
        imageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80',
        thumb: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&q=60',
    },

    {
        id: 'pokemonfriends',
        type: 'image',
        category: 'special',
        label: '포켓몬 워터 파크',
        description: '신나게 물놀이하는 귀여운 포켓몬들',
        imageUrl: 'https://p4.wallpaperbetter.com/wallpaper/451/804/949/pokemon-bulbasaur-pokemon-marill-pokemon-pikachu-wallpaper-preview.jpg',
        thumb: 'https://p4.wallpaperbetter.com/wallpaper/451/804/949/pokemon-bulbasaur-pokemon-marill-pokemon-pikachu-wallpaper-preview.jpg',
    },

    {
        id: 'jammanbo',
        type: 'image',
        category: 'special',
        label: '잠자는 잠만보',
        description: '공원에서 평화롭게 꿀잠 자는 귀여운 포켓몬',
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD4dW84DrC-RN-7XQ5-VlzZ9g6v_Tn1u4lFQ&s',
        thumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD4dW84DrC-RN-7XQ5-VlzZ9g6v_Tn1u4lFQ&s',
    },

    {
        id: 'birthday-party',
        type: 'image',
        category: 'special',
        label: '생일 파티',
        description: '축하 분위기의 파티 배경',
        imageUrl: 'https://img.pikbest.com/backgrounds/20250319/happy-birthday-party-backgrounds-beautiful-designs-for-every_11609675.jpg!w700wp',
        thumb: 'https://img.pikbest.com/backgrounds/20250319/happy-birthday-party-backgrounds-beautiful-designs-for-every_11609675.jpg!w700wp',
    },

    {
        id: 'fireworks',
        type: 'image',
        category: 'special',
        label: '불꽃놀이',
        description: '화려한 불꽃이 터지는 밤',
        imageUrl: 'https://www.hanwha.co.kr/upload/news/press/2025/08/28/1756346155963_58.jpg',
        thumb: 'https://www.hanwha.co.kr/upload/news/press/2025/08/28/1756346155963_58.jpg',
    },
    {
        id: 'red-carpet',
        type: 'image',
        category: 'special',
        label: '레드 카펫',
        description: 'VIP 행사 분위기',
        imageUrl: 'https://png.pngtree.com/thumb_back/fw800/background/20230520/pngtree-red-carpet-for-red-carpet-awards-ceremony-image_2659882.jpg',
        thumb: 'https://png.pngtree.com/thumb_back/fw800/background/20230520/pngtree-red-carpet-for-red-carpet-awards-ceremony-image_2659882.jpg',
    },

    // ==================== 계절 - 봄 ====================
    {
        id: 'spring-garden',
        type: 'image',
        category: 'season',
        label: '봄 정원',
        description: '벚꽃이 피어있는 따뜻한 봄 정원',
        imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=80',
        thumb: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&q=60',
    },
    {
        id: 'cherry-blossom',
        type: 'image',
        category: 'season',
        label: '벚꽃 터널',
        description: '만개한 벚꽃이 만드는 로맨틱한 터널',
        imageUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1200&q=80',
        thumb: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&q=60',
    },
    {
        id: 'spring-field',
        type: 'image',
        category: 'season',
        label: '봄 공원',
        description: '신록이 가득한 싱그러운 공원',
        imageUrl: 'https://vrthumb.clipartkorea.co.kr/2020/11/09/cm080926648.jpg',
        thumb: 'https://vrthumb.clipartkorea.co.kr/2020/11/09/cm080926648.jpg',
    },

    // ==================== 계절 - 여름 ====================
    {
        id: 'summer-beach',
        type: 'image',
        category: 'season',
        label: '여름 해변',
        description: '시원한 파도가 밀려오는 해변',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
        thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=60',
    },

    {
        id: 'summer-sunset',
        type: 'image',
        category: 'season',
        label: '여름 노을',
        description: '따뜻한 색감의 여름 석양',
        imageUrl: 'https://kkoma.net/web/product/big/202007/7a3565996cb085fcd4cf7e56f7a422b7.jpg',
        thumb: 'https://kkoma.net/web/product/big/202007/7a3565996cb085fcd4cf7e56f7a422b7.jpg',
    },

    // ==================== 계절 - 가을 ====================
    {
        id: 'autumn-forest',
        type: 'image',
        category: 'season',
        label: '가을 숲',
        description: '단풍으로 물든 아름다운 숲',
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSS6JkoKVdn1NyvxZMlLNyg1RXrlzvGLiIGLg&s',
        thumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSS6JkoKVdn1NyvxZMlLNyg1RXrlzvGLiIGLg&s',
    },

    {
        id: 'autumn-park',
        type: 'image',
        category: 'season',
        label: '가을 공원',
        description: '노란 은행잎이 가득한 공원',
        imageUrl: 'https://img.freepik.com/free-photo/autumn-scenery_1204-343.jpg?semt=ais_incoming&w=740&q=80',
        thumb: 'https://img.freepik.com/free-photo/autumn-scenery_1204-343.jpg?semt=ais_incoming&w=740&q=80',
    },

    // ==================== 계절 - 겨울 ====================
    {
        id: 'winter-village',
        type: 'image',
        category: 'season',
        label: '겨울 마을',
        description: '눈 내리는 아늑한 겨울 마을',
        imageUrl: 'https://rimage.gnst.jp/livejapan.com/public/article/detail/a/30/00/a3000252/img/ko/a3000252_main.jpg',
        thumb: 'https://rimage.gnst.jp/livejapan.com/public/article/detail/a/30/00/a3000252/img/ko/a3000252_main.jpg',
    },
    {
        id: 'snowy-forest',
        type: 'image',
        category: 'season',
        label: '눈 덮인 숲',
        description: '하얀 눈으로 덮인 고요한 숲',
        imageUrl: 'https://img.freepik.com/premium-photo/christmas-snowy-landscape-background-with-snow-drifts-hills-snowcovered-blurred-forest_434420-2226.jpg',
        thumb: 'https://img.freepik.com/premium-photo/christmas-snowy-landscape-background-with-snow-drifts-hills-snowcovered-blurred-forest_434420-2226.jpg',
    },
    {
        id: 'winter-night',
        type: 'image',
        category: 'season',
        label: '겨울 밤',
        description: '별빛과 눈이 빛나는 겨울밤',
        imageUrl: 'https://img.freepik.com/premium-photo/winter-landscape-with-snow-mountains_146671-11736.jpg?semt=ais_incoming&w=740&q=80',
        thumb: 'https://img.freepik.com/premium-photo/winter-landscape-with-snow-mountains_146671-11736.jpg?semt=ais_incoming&w=740&q=80',
    },
    {
        id: 'winter-city',
        type: 'image',
        category: 'season',
        label: '겨울 도시',
        description: '크리스마스 조명이 반짝이는 도시',
        imageUrl: 'https://img4.daumcdn.net/thumb/R658x0.q70/?fname=https://t1.daumcdn.net/news/202312/05/flybemagazine/20231205165213244npul.jpg',
        thumb: 'https://img4.daumcdn.net/thumb/R658x0.q70/?fname=https://t1.daumcdn.net/news/202312/05/flybemagazine/20231205165213244npul.jpg',
    },
    {
        id: 'frozen-lake',
        type: 'image',
        category: 'season',
        label: '얼어붙은 호수',
        description: '신비로운 겨울 호수',
        imageUrl: 'https://st3.depositphotos.com/13400056/17949/i/450/depositphotos_179494834-stock-photo-frozen-lake-in-snowy-forest.jpg',
        thumb: 'https://st3.depositphotos.com/13400056/17949/i/450/depositphotos_179494834-stock-photo-frozen-lake-in-snowy-forest.jpg',
    },
];

// 기본값 id
export const DEFAULT_VIRTUAL_BG_ID = 'none';

// id로 프리셋 찾는 헬퍼
export const findVirtualBgPreset = (id) => VIRTUAL_BG_PRESETS.find((p) => p.id === id) || VIRTUAL_BG_PRESETS[0];
