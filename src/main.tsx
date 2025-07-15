import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Optimize React strict mode for development
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
