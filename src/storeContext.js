import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const StoreContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export function StoreProvider({ children, user }) {
  const [storeId, setStoreId] = useState(null);
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStore();
    }
  }, [user]);

  const fetchStore = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/stores/user/${user.id}`);
      setStoreId(res.data.store_id);
      setStoreName(res.data.store?.name || '');
    } catch (err) {
      console.error('Error fetching store:', err);
    }
    setLoading(false);
  };

  return (
    <StoreContext.Provider value={{ storeId, storeName, loading }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}