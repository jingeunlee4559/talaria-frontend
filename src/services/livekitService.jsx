import api from '../axios'; // 설정해둔 axios 인스턴스

/**
 * 백엔드 서버에 LiveKit 토큰을 요청하는 함수
 * @param {object} params
 * @param {string} params.room - 참여할 방 이름
 * @param {string} params.identity - 참여자 고유 ID
 * @param {string} params.name - 참여자 닉네임
 * @returns {Promise<{wsUrl: string, token: string}>} - 발급받은 wsUrl과 토큰
 */
export const getLiveKitToken = async ({ room, identity, name }) => {
  try {
    // 백엔드의 /livekit/token 으로 POST 요청을 보냅니다.
    const { data } = await api.post('/livekit/token', {
      room,
      identity,
      name,
    });
    // 백엔드 응답 { wsUrl, token, ... } 전체를 반환합니다.
    return data;
  } catch (error) {
    console.error('Failed to get LiveKit token:', error);
    throw new Error('회의 참여 토큰을 받아오는 데 실패했습니다.');
  }
};