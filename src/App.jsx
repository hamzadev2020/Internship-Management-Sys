import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import heroImg from './assets/hero.png'
import maika from './assets/image.png'
import hi from './assets/image1.png'
import hi2 from './assets/image2.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import { Login } from './Auth/Login.jsx'
import { AdminDashboard } from './pages/AdminDashboard/AdminDashboard.jsx';
import { InternDashboard } from './pages/InternDashboard/InternDashboard.jsx';
import { ProtectedRoute } from './Routes/ProtectedRoute.jsx';
import { Unauthorized } from './pages/unauthorized.jsx';
import { AdminTaskmanager } from './pages/AdminDashboard/Taskmanager.jsx';
import { AllIntern } from './pages/AdminDashboard/AllIntern.jsx';

function App() {


  return (
    <>

      <BrowserRouter>
        <Routes>


          <Route path="/" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/taskmanager" element={<AdminTaskmanager />} />
          <Route path="/allintern" element={<AllIntern />} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]} ><AdminDashboard /></ProtectedRoute>} />
          <Route path="intern" element={<ProtectedRoute allowedRoles={["Intern"]}><InternDashboard /></ProtectedRoute>} />



        </Routes>

      </BrowserRouter>
      <div>
      </div>
    </>
  )
}

export default App
