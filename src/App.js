import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { StoreProvider } from './storeContext';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import SalesHistory from './pages/SalesHistory';
import Suppliers from './pages/Suppliers';
import Analytics from './pages/Analytics';
import Categories from './pages/Categories';
import Reorder from './pages/Reorder';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return <div style={{ padding: '20px', fontFamily: 'Arial' }}>Loading...</div>;

  return (
    <Router>
      {user ? (
        <StoreProvider user={user}>
          <Navbar onLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/history" element={<SalesHistory />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </StoreProvider>
      ) : (
        <Routes>
          <Route path="/" element={<Login onLogin={setUser} />} />
          <Route path="/signup" element={<Signup onLogin={setUser} />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/reorder" element={<Reorder />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;