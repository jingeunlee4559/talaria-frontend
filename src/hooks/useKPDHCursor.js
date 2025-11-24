// src/hooks/useKPDHCursor.js
import { useEffect, useCallback } from 'react';

/**
 * K-POP 데몬 헌터스 테마별 커스텀 마우스 커서 Hook
 * @param {string} themeId - 현재 테마 ID
 * @param {boolean} enabled - 커서 효과 활성화 여부
 */
export const useKPDHCursor = (themeId, enabled = true) => {
    // 테마별 커서 클래스 매핑
    const getCursorClass = useCallback((theme) => {
        const kpdhCursorMap = {
            kpdh_huntrix: 'cursor-kpdh-huntrix',
            kpdh_demon: 'cursor-kpdh-demon',
            kpdh_derpy: 'cursor-kpdh-derpy',
            kpdh_concert: 'cursor-kpdh-concert',
            kpdh_golden: 'cursor-kpdh-golden',
        };
        return kpdhCursorMap[theme] || '';
    }, []);

    // 클릭 이펙트 생성
    const createClickEffect = useCallback((x, y, color = '#a855f7') => {
        const effect = document.createElement('div');
        effect.className = 'cursor-click-effect';
        effect.style.left = `${x - 20}px`;
        effect.style.top = `${y - 20}px`;
        effect.style.borderColor = color;
        document.body.appendChild(effect);

        setTimeout(() => {
            effect.remove();
        }, 600);
    }, []);

    // 하트 플로팅 이펙트 생성
    const createHeartEffect = useCallback((x, y) => {
        const hearts = ['💜', '💖', '💗', '✨'];
        const heart = document.createElement('div');
        heart.className = 'heart-float-effect';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = `${x - 15}px`;
        heart.style.top = `${y - 15}px`;
        document.body.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 1500);
    }, []);

    // 커서 이펙트 적용
    useEffect(() => {
        if (!enabled) {
            document.body.className = document.body.className.replace(/cursor-kpdh-\w+/g, '');
            return;
        }

        const cursorClass = getCursorClass(themeId);

        // K-POP 테마인 경우에만 커스텀 커서 적용
        if (cursorClass && themeId.startsWith('kpdh_')) {
            // 기존 커서 클래스 제거
            document.body.className = document.body.className.replace(/cursor-kpdh-\w+/g, '');
            // 새 커서 클래스 추가
            document.body.classList.add(cursorClass);

            // 클릭 이벤트 리스너
            const handleClick = (e) => {
                // 테마별 색상
                const themeColors = {
                    kpdh_huntrix: '#a855f7',
                    kpdh_demon: '#7c3aed',
                    kpdh_derpy: '#06b6d4',
                    kpdh_concert: '#9333ea',
                    kpdh_golden: '#fbbf24',
                };

                const color = themeColors[themeId] || '#a855f7';
                createClickEffect(e.clientX, e.clientY, color);

                // 좋아요 버튼이나 특정 요소 클릭시 하트 이펙트
                const target = e.target;
                if (
                    target.closest('[data-kpdh-heart]') ||
                    target.closest('button[aria-label*="like"]') ||
                    target.closest('button[aria-label*="좋아요"]')
                ) {
                    createHeartEffect(e.clientX, e.clientY);
                }
            };

            document.addEventListener('click', handleClick);

            return () => {
                document.body.classList.remove(cursorClass);
                document.removeEventListener('click', handleClick);
            };
        } else {
            // K-POP 테마가 아니면 일반 커서
            document.body.className = document.body.className.replace(/cursor-kpdh-\w+/g, '');
        }
    }, [themeId, enabled, getCursorClass, createClickEffect, createHeartEffect]);

    return {
        createClickEffect,
        createHeartEffect,
    };
};

export default useKPDHCursor;