// ==================== Utils ====================
export const normalizeLocale = (locale) => {
    if (!locale) return 'ko-KR';
    const l = String(locale).toLowerCase();
    if (l.includes('-')) return locale;
    const map = { 'ko': 'ko-KR', 'en': 'en-US', 'ja': 'ja-JP', 'zh': 'zh-CN' };
    return map[l] || locale;
};

export const getParticipantNickname = (participant, room = null) => {
    if (!participant) return 'Unknown';
    try {
        const metadata = JSON.parse(participant.metadata || '{}');
        if (metadata?.username) return metadata.username;
    } catch (error) {
        console.error('메타데이터 파싱 오류:', error);
    }
    if (participant.name && participant.name !== participant.identity) {
        return participant.name;
    }
    const identity = participant.identity || 'Unknown';
    if (identity.startsWith('user-')) {
        const parts = identity.split('-');
        if (parts.length >= 3) {
            return `Guest-${parts[parts.length - 1].substring(0, 4)}`;
        }
    }
    return identity;
};

export const findTranslation = (translations, targetLocale) => {
    if (!translations || typeof translations !== 'object') return null;
    if (translations[targetLocale]) return translations[targetLocale];
    if (targetLocale.includes('-')) {
        const langCode = targetLocale.split('-')[0];
        if (translations[langCode]) return translations[langCode];
    }
    return null;
};