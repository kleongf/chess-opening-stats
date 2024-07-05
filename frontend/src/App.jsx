import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import LoadProfile from './pages/LoadProfile'

function App() {

  return (
    <Routes>
      <Route path='/' element={<LoadProfile />} />
    </Routes>
  )
}

export default App
