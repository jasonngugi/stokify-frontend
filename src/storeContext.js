import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const StoreContext = createContext();
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export function StoreProvider({ children, user }) {
  const [storeId, setStoreId] = useState(null);
  const [role, setRole] = useState(null);
  const [businessType, setBusinessType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrCreateStore();
    }
  }, [user]);

  const fetchOrCreateStore = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/stores/user/${user.id}`);
      setStoreId(res.data.store_id);
      setRole(res.data.role);
      setBusinessType(res.data.business_type || 'general');
    } catch (err) {
      console.error('Error fetching store:', err);
    }
    setLoading(false);
  };

  return (
    <StoreContext.Provider value={{ storeId, role, businessType, loading }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}