import Approuter from './routes/Approuter';
import './App.css';
import { useEffect } from 'react';
import Aos from 'aos';
import 'aos/dist/aos.css';
import { UserProvider } from './contexts/UserContext';

function App() {
    useEffect(() => {
        Aos.init({ duration: 1000 });
    }, []);

    useEffect(() => {
        console.log('🌐 환경변수 확인:', import.meta.env);
    }, []);

    return (
        <UserProvider>
            <Approuter />
        </UserProvider>
    );
}

export default App;
