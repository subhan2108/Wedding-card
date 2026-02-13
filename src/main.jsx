import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { adminService } from './services/adminService';
import { templates } from './data/templates';

// Initialize templates in localStorage if empty
adminService.initializeDefaultTemplates(templates);

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
