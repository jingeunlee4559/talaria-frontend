import React, { useState } from 'react';
import CommunityListPage from './CommunityListPage';
import CommunityDetailPage from './CommunityDetailPage';

const CommunityMain = () => {
    const [selectedPost, setSelectedPost] = useState(null);
    const [likedPosts, setLikedPosts] = useState({});
    const [bookmarkedPosts, setBookmarkedPosts] = useState({});

    // 가상 댓글 데이터
    const [comments, setComments] = useState({
        1: [
            {
                id: 1001,
                author: '밈러버',
                avatar: '😎',
                text: '와 정리 너무 잘해주셨네요! 특히 눈치 게임 밈은 정말 한국 특유의 문화죠 ㅋㅋ',
                time: '30분 전',
                likes: 12,
                replies: [
                    {
                        id: 10011,
                        author: '밈마스터',
                        avatar: '🎭',
                        text: '감사합니다! 더 많은 정보도 계속 올려볼게요~',
                        time: '20분 전',
                        likes: 5,
                    },
                ],
            },
            {
                id: 1002,
                author: '문화탐험가',
                avatar: '🗾',
                text: '해외 친구들한테 설명하기 정말 어려웠는데 이 글 공유해야겠어요!',
                time: '1시간 전',
                likes: 8,
                replies: [],
            },
        ],
        2: [
            {
                id: 2001,
                author: '영국통',
                avatar: '🇬🇧',
                text: 'Biscuit은 그냥 쿠키를 의미하는데, 미국식 영어의 비스킷(빵 같은 것)과 달라서 혼동이 생기는 것 같아요!',
                time: '2시간 전',
                likes: 15,
                replies: [],
            },
        ],
        3: [
            {
                id: 3001,
                author: '일본문화팬',
                avatar: '🎌',
                text: '草 진짜 처음에 이해 안됐는데 설명 듣고 나니까 너무 재밌네요 wwww',
                time: '3시간 전',
                likes: 20,
                replies: [
                    {
                        id: 30011,
                        author: '문화탐험가',
                        avatar: '🗾',
                        text: '각 나라마다 이런 독특한 표현들이 있어서 재밌죠!',
                        time: '2시간 전',
                        likes: 7,
                    },
                ],
            },
        ],
    });

    // 가상 데이터 (10개)
    const [posts, setPosts] = useState([
        {
            id: 1,
            category: '밈 공유',
            title: '이번주 최고의 K-밈 모음 🔥',
            preview: '요즘 핫한 밈들 정리해봤습니다. 다들 아시나요?',
            content: `안녕하세요 여러분! 이번주 가장 핫했던 K-밈들을 정리해봤습니다.

1. "빵 터진다" 밈
최근 한 예능에서 나온 이 표현이 해외에서도 인기를 끌고 있어요. 영어로는 "I'm dying of laughter"로 번역되는데, 한국 특유의 표현이 재밌다고 하더라구요.

2. "ㄱㅡㅡㄱ" vs "lol"
한국의 웃음 표현 "ㄱㅡㅡㄱ"이 해외 커뮤니티에서 화제가 되고 있습니다. 키보드 자판으로만 보면 이해하기 어렵지만, 발음을 들으면 웃음소리처럼 들린다는 반응!

3. 눈치 게임 밈
한국 특유의 '눈치' 문화를 설명하는 밈들이 유행하고 있어요. 이건 정말 한국에서만 이해할 수 있는 독특한 문화죠.

여러분은 어떤 밈이 가장 재밌으셨나요? 댓글로 의견 남겨주세요!`,
            tags: ['#K-밈', '#모음집', '#트렌드'],
            author: '밈마스터',
            avatar: '🎭',
            date: '2024년 11월 13일',
            views: 1234,
            likes: 89,
            commentCount: 2,
            isHot: true,
        },
        {
            id: 2,
            category: '해외 밈 질문',
            title: '영국 밈 "biscuit" 관련 질문있어요',
            preview: '영국에서 biscuit이 왜 웃긴건가요? 설명 부탁드려요!',
            content: `영국 친구들이 "biscuit"이라는 단어만 들어도 웃는데 무슨 뜻인가요?

저는 그냥 비스킷이라고 생각했는데, 친구들이 계속 웃더라구요. 

혹시 아시는 분 계실까요? 댓글로 알려주세요!`,
            tags: ['#영국', '#질문'],
            author: '밍초보',
            avatar: '🌍',
            date: '2024년 11월 13일',
            views: 567,
            likes: 34,
            commentCount: 1,
            isHot: false,
        },
        {
            id: 3,
            category: '문화 공유',
            title: '일본의 독특한 인터넷 문화 "草"',
            preview: '일본에서 웃음을 표현하는 방법이 독특해요!',
            content: `일본 인터넷에서는 웃음을 "草(쿠사)"로 표현합니다!

왜 풀 초(草)일까요?

1. 일본어로 웃음은 "笑い(warai)"
2. 인터넷 슬랭으로 "w"를 붙여서 표현
3. wwwww 이렇게 많이 쓰면 풀이 자란 것처럼 보여서 "草"가 됨!

정말 재밌는 문화죠? 한국의 "ㅋㅋㅋ"처럼 각 나라마다 독특한 웃음 표현이 있어요.`,
            tags: ['#일본', '#문화', '#인터넷'],
            author: '문화탐험가',
            avatar: '🗾',
            date: '2024년 11월 12일',
            views: 892,
            likes: 67,
            commentCount: 1,
            isHot: true,
        },
        {
            id: 4,
            category: '밈 공유',
            title: '프랑스 밈 "Omelette du fromage" 😂',
            preview: '덱스터 실험실에서 시작된 프랑스 밈',
            content: `"Omelette du fromage"는 미국 애니메이션 덱스터의 실험실에서 나온 유명한 밈입니다!

에피소드에서 덱스터가 자면서 프랑스어를 배우는데, 레코드가 고장나서 "Omelette du fromage"만 반복하게 됩니다.

재밌는 점은 이게 실제로는 틀린 프랑스어라는 것! 
정확한 표현은 "Omelette AU fromage"입니다.

그런데도 이 밈은 지금까지도 인터넷에서 사용되고 있어요!`,
            tags: ['#프랑스', '#애니메이션', '#클래식밈'],
            author: '밈역사학자',
            avatar: '📚',
            date: '2024년 11월 12일',
            views: 643,
            likes: 52,
            commentCount: 15,
            isHot: false,
        },
        {
            id: 5,
            category: '공지',
            title: '커뮤니티 이용 규칙 안내',
            preview: '모두가 즐거운 커뮤니티를 위한 규칙',
            content: `안녕하세요, 운영자입니다.

더 나은 커뮤니티를 위한 규칙을 안내드립니다:

1. 서로 존중하기
   - 다양한 문화와 의견을 존중해주세요
   - 비방이나 욕설은 금지됩니다

2. 정확한 정보 공유
   - 밈의 출처나 배경을 정확히 알려주세요
   - 잘못된 정보는 정정해주세요

3. 저작권 준수
   - 타인의 콘텐츠를 무단 도용하지 마세요
   - 출처를 명확히 표기해주세요

함께 만드는 즐거운 커뮤니티! 감사합니다.`,
            tags: ['#공지', '#규칙'],
            author: '운영자',
            avatar: '⚙️',
            date: '2024년 11월 11일',
            views: 2341,
            likes: 145,
            commentCount: 8,
            isHot: true,
        },
        {
            id: 6,
            category: '문화 공유',
            title: '미국 밈 문화의 역사: Doge부터 현재까지',
            preview: 'Doge, Pepe, Wojak... 밈의 진화 과정',
            content: `미국 인터넷 밈의 역사를 정리해봤습니다!

2010년대 초반: Doge의 시대
- "Such wow, much amaze" 구문
- Shiba Inu 이미지로 큰 인기

2010년대 중반: Pepe & Wojak
- 다양한 감정 표현
- 전세계로 확산

2020년대: 숏폼 콘텐츠 밈
- TikTok의 영향
- 빠르게 변화하는 트렌드

밈은 계속 진화하고 있습니다!`,
            tags: ['#미국', '#밈역사', '#문화'],
            author: '밈연구소',
            avatar: '🔬',
            date: '2024년 11월 11일',
            views: 1156,
            likes: 78,
            commentCount: 21,
            isHot: false,
        },
        {
            id: 7,
            category: '밈 공유',
            title: '중국 인터넷 슬랭 "6666" 무슨 뜻일까요?',
            preview: '숫자로 표현하는 중국의 독특한 문화',
            content: `중국에서 "6666"을 많이 보셨나요?

이건 "厉害(리하이)"의 발음과 비슷한 "溜(리우)"에서 나온 표현입니다!

6의 중국어 발음이 "liù(리우)"인데, 이게 "잘한다, 멋지다"는 뜻의 "溜"와 발음이 같아요.

그래서 게임에서 누군가 잘하면:
"6666666"
"溜溜溜溜"

이렇게 표현합니다! 한국의 "ㅇㅈ(인정)" 같은 느낌이죠!`,
            tags: ['#중국', '#숫자밈', '#게임'],
            author: '차이나워처',
            avatar: '🐼',
            date: '2024년 11월 10일',
            views: 789,
            likes: 61,
            commentCount: 14,
            isHot: false,
        },
        {
            id: 8,
            category: '문화 공유',
            title: '각 나라별 웃음 표현 모음집',
            preview: 'ㅋㅋㅋ, lol, www, 哈哈... 웃음도 다양해요!',
            content: `전 세계 웃음 표현을 모아봤습니다!

🇰🇷 한국: ㅋㅋㅋ, ㅎㅎㅎ
🇺🇸 미국/영국: lol, haha, lmao
🇯🇵 일본: www, 草
🇨🇳 중국: 哈哈哈(하하하), 233
🇹🇭 태국: 555 (5의 발음이 "하"라서)
🇧🇷 브라질: kkkkkk, rsrsrs
🇪🇸 스페인: jajaja
🇫🇷 프랑스: mdr (mort de rire)

문화마다 이렇게 다르다니 신기하죠?`,
            tags: ['#웃음', '#문화비교', '#전세계'],
            author: '글로벌민',
            avatar: '🌍',
            date: '2024년 11월 10일',
            views: 1523,
            likes: 98,
            commentCount: 27,
            isHot: true,
        },
        {
            id: 9,
            category: '밈 공유',
            title: '요즘 핫한 "ㅇㅈ?" 밈의 모든 것',
            preview: '인정? 어쩔티비? 다양한 변형들',
            content: `"ㅇㅈ?" 밈과 그 변형들을 정리해봤습니다!

기본형: ㅇㅈ? (인정?)
- 동의를 구할 때 사용

변형 1: ㅇㅈ ㄱㅈ (인정 감사)
- 동의해줘서 고마울 때

변형 2: ㄴㅇㅈ (노인정)
- 동의하지 않을 때

이 밈은 특히 게임 커뮤니티에서 시작되어 전체 인터넷으로 퍼졌어요!

여러분은 어떤 변형을 가장 많이 쓰시나요?`,
            tags: ['#한국밈', '#인정', '#게임'],
            author: '밈트래커',
            avatar: '📊',
            date: '2024년 11월 9일',
            views: 934,
            likes: 72,
            commentCount: 19,
            isHot: false,
        },
        {
            id: 10,
            category: '문화 공유',
            title: '인도 인터넷 문화: Bollywood 밈의 세계',
            preview: '독특하고 과장된 연출이 밈이 되다',
            content: `인도 발리우드 영화의 과장된 장면들이 전세계 밈이 되고 있습니다!

특징:
1. 과장된 액션 장면
   - 물리법칙을 무시하는 연출
   - 한 장면이 여러 밈으로 재생산

2. 드라마틱한 반응
   - 과도한 감정 표현
   - 밈으로 활용하기 좋은 소재

3. 다양한 댄스 장면
   - 화려한 단체 댄스
   - 패러디 소재로 인기

발리우드 밈은 유튜브와 틱톡에서 특히 인기가 많아요!

재밌는 발리우드 밈 추천해주세요!`,
            tags: ['#인도', '#발리우드', '#영화'],
            author: '볼리우드러버',
            avatar: '🎬',
            date: '2024년 11월 9일',
            views: 678,
            likes: 45,
            commentCount: 11,
            isHot: false,
        },
    ]);

    const handlePostClick = (post) => {
        setSelectedPost(post);
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        setSelectedPost(null);
    };

    const handleUpdatePosts = (updatedPosts) => {
        setPosts(updatedPosts);
    };

    const handleUpdateSelectedPost = (updatedPost) => {
        setSelectedPost(updatedPost);
        setPosts((prevPosts) => prevPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
    };

    return (
        <div>
            {selectedPost ? (
                <CommunityDetailPage
                    post={selectedPost}
                    onBack={handleBack}
                    likedPosts={likedPosts}
                    setLikedPosts={setLikedPosts}
                    bookmarkedPosts={bookmarkedPosts}
                    setBookmarkedPosts={setBookmarkedPosts}
                    comments={comments}
                    setComments={setComments}
                    onUpdatePost={handleUpdateSelectedPost}
                />
            ) : (
                <CommunityListPage posts={posts} onPostClick={handlePostClick} likedPosts={likedPosts} setLikedPosts={setLikedPosts} onUpdatePosts={handleUpdatePosts} />
            )}
        </div>
    );
};

export default CommunityMain;
