import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import SWG from './SWG.js'
import EWG from './EWG.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <App />  

  </StrictMode>,
)
