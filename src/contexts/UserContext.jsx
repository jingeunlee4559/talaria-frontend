import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // ✅ 로딩 상태 추가

    useEffect(() => {
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false); // ✅ 항상 로딩 종료
    }, []);

    console.log(user, 'context123');

    return <UserContext.Provider value={{ user, setUser, loading }}>{children}</UserContext.Provider>;
};
