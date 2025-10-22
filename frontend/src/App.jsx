import React from 'react'
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Home from './pages/Nav_Tabs/Home';
import Request_Form from './pages/Nav_Tabs/Request_Form';
import Data_List from './pages/Nav_Tabs/Data_List';
import Forecasting from './pages/Nav_Tabs/Forecasting';
import NotFound from './pages/NotFound';
import University from './pages/Nav_Tabs/University';
import ProtectedRoute from './components/ProtectedRoute';

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/" element={<Dashboard />}>
          <Route path="home" element={<Home />} />
          <Route path="request" element={<Request_Form />} />
          <Route path="datalist" element={<Data_List />} />
          <Route path="forecasting" element={<Forecasting />} />
          <Route path="university" element={<University />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="*" element={<NotFound/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
