import Approuter from './routes/Approuter';
import "./App.css"
import { useEffect } from 'react';
import Aos from 'aos';
import 'aos/dist/aos.css'; 

function App() {

    
  useEffect(() => {
  Aos.init({ duration: 1000 });
}, []);

    return (
        <>
            <Approuter />
        </>
    );
}

export default App;
