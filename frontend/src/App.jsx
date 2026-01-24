import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';

import { useAuthStore } from './stores/authStore';

import Navbar from './components/Navbar';

import Home from './pages/Home';
import Auctions from './pages/Auctions';
import AuctionDetails from './pages/AuctionDetails';

import Login from './pages/Login';
import Register from './pages/Register';

import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Admin from './pages/Admin';

function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <BrowserRouter>
      <div className='min-h-screen flex flex-col'>
        <Navbar />

        <main className='flex-1 bg-gradient-to-br from-purple-50 via-white to-indigo-50'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/auctions' element={<Auctions />} />
            <Route path='/auctions/:id' element={<AuctionDetails />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/admin' element={<Admin />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;