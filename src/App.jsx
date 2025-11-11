import Approuter from './routes/Approuter';
import './App.css';
import { useEffect } from 'react';
import Aos from 'aos';
import 'aos/dist/aos.css';
import { UserProvider } from './contexts/UserContext';
import { TranslationProvider } from './contexts/TranslationProvider';
import GlobalTranslatorHUD from './components/dashboard/dashDoc/translation/GlobalTranslatorHUD';

function App() {
    useEffect(() => {
        Aos.init({ duration: 1000 });
    }, []);

    useEffect(() => {
        console.log('🌐 환경변수 확인:', import.meta.env);
    }, []);

    return (
        <UserProvider>
            <TranslationProvider>
                <Approuter />
                <GlobalTranslatorHUD />
            </TranslationProvider>
        </UserProvider>
    );
}

export default App;
