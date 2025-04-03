import { createRoot } from 'react-dom/client'
import App from './App'
import { Toaster } from 'react-hot-toast'
import { StateProvider } from './context/StateManage'
import "../App.css";
createRoot(document.getElementById('root')!).render(
    <>
        <StateProvider>
        <Toaster />
        <App />
        </StateProvider>
    </>
)