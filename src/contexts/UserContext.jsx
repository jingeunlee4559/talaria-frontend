import { createContext, useState, useEffect } from 'react';

// 1. Context 생성
export const UserContext = createContext(null);

// 2. Provider 생성
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // 예시: 로컬스토리지에서 로그인 정보 가져오기
    useEffect(() => {
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);
    console.log(user, 'context123');

    return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};
