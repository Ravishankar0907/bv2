import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthState, Order, OrderStatus, Product, Role, User, SavedLocation, VerificationStatus, AddonSettings, GlobalFinancials, OrderExpense } from '../types';
import { MOCK_ADMIN, MOCK_PRODUCTS, MOCK_USER, MOCK_ADDON_SETTINGS, API_BASE_URL } from '../constants';

interface StoreContextType {
  auth: AuthState;
  allUsers: User[];
  login: (email: string, role: Role, socialProvider?: string, password?: string) => Promise<User | null>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  addLocation: (location: SavedLocation) => void;
  verifyUserId: (userId: string) => void;
  updateUserNotes: (userId: string, notes: string) => void;
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addonSettings: AddonSettings;
  updateAddonSettings: (settings: AddonSettings) => Promise<void>;
  orders: Order[];
  placeOrder: (order: Omit<Order, 'id' | 'status' | 'createdAt' | 'expenses'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => Promise<void>;
  globalFinancials: GlobalFinancials;
  updateGlobalFinancials: (updates: Partial<GlobalFinancials>) => void;
  addOrderExpense: (orderId: string, expense: Omit<OrderExpense, 'id' | 'date'>) => void;
  removeOrderExpense: (orderId: string, expenseId: string) => void;
  createAdmin: (user: User) => void;
  deleteUser: (userId: string) => void;
  transferPrimaryStatus: (targetUserId: string) => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- State ---
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('luxe_auth');
    return saved ? JSON.parse(saved) : { user: null, isAuthenticated: false };
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [addonSettings, setAddonSettings] = useState<AddonSettings>({
    psPlusPriceWeek: 0, psPlusPriceMonth: 0, psPlusStock: 0,
    controllerPriceWeek: 0, controllerPriceMonth: 0, controllerStock: 0
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('luxe_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [globalFinancials, setGlobalFinancials] = useState<GlobalFinancials>({
    salary: 50000, emi: 20000, subscriptions: 5000, ads: 10000, other: 0
  });

  // --- Effects ---

  // Initial Fetch of Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (res.ok) {
          const data = await res.json();
          // Seed Mock Products if API returns empty list
          if (Array.isArray(data) && data.length === 0) {
            console.log("Seeding initial products...");
            for (const p of MOCK_PRODUCTS) {
              const { id, ...productData } = p; // Remove ID to let Mongo generate it? Or keep?
              // Constants have string IDs (p1, p2...). MongoDB creates ObjectIds. 
              // We will send without ID to let Mongo create a fresh one, or use specific seeding logic?
              // Let's just post the data.
              await fetch(`${API_BASE_URL}/api/products`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(productData)
              });
            }
            // Re-fetch after seeding
            const seedRes = await fetch(`${API_BASE_URL}/api/products`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
            const seedData = await seedRes.json();
            setProducts(seedData.map((p: any) => ({ ...p, id: p.id || p._id })));
          } else {
            const normalized = data.map((p: any) => ({ ...p, id: p.id || p._id }));
            setProducts(normalized);
          }
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    const fetchSettings = async () => {
      try {
        // Addons
        const res = await fetch(`${API_BASE_URL}/api/settings/addons`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
        if (res.ok) setAddonSettings(await res.json());

        // Financials
        const resFin = await fetch(`${API_BASE_URL}/api/settings/financials`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
        if (resFin.ok) setGlobalFinancials(await resFin.json());
      } catch (e) { console.error("Failed to fetch settings", e); }
    };

    fetchProducts();
    fetchSettings();
  }, []);

  // Fetch Users and Orders if Admin
  useEffect(() => {
    if (auth.isAuthenticated && (auth.user?.role === Role.ADMIN || auth.user?.role === Role.USER)) {
      // Fetch Orders (For Admin: All, For User: Filtered usually, but here fetching all for simplicity or user-specific logic)
      // In a real app we'd have /api/orders?userId=...
      const fetchOrders = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/orders`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
          if (res.ok) {
            const data = await res.json();
            const normalized = data.map((o: any) => ({ ...o, id: o.id || o._id }));

            // If regular user, filter locally for now since backend returns all
            if (auth.user?.role === Role.USER) {
              setOrders(normalized.filter((o: any) => o.userId === auth.user?.id));
            } else {
              setOrders(normalized);
            }
          }
        } catch (err) {
          console.error("Error fetching orders:", err);
        }
      };

      fetchOrders();
    }

    if (auth.isAuthenticated && auth.user?.role === Role.ADMIN) {
      const fetchUsers = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/users/details`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
          if (res.ok) {
            const data = await res.json();
            const normalizedUsers = data.map((u: any) => ({
              ...u,
              id: u.id || u._id,
              savedLocations: u.savedLocations || [],
              idVerificationStatus: u.idVerificationStatus || VerificationStatus.NONE
            }));
            setAllUsers(normalizedUsers);
          }
        } catch (err) {
          console.error("Error fetching users:", err);
        }
      };
      fetchUsers();
    }
  }, [auth.isAuthenticated, auth.user?.role, auth.user?.id]);

  // Persistence (Partial - Auth only, others managed by API mostly)
  useEffect(() => { localStorage.setItem('luxe_auth', JSON.stringify(auth)); }, [auth]);

  // --- Actions ---

  const login = async (email: string, role: Role, socialProvider?: string, password?: string): Promise<User | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ email, password, role })
      });

      if (res.ok) {
        const data = await res.json();
        const user = data.user;
        const completeUser: User = {
          id: user.id || user._id,
          email: user.email,
          name: user.name || (role === Role.ADMIN ? 'Admin' : 'User'),
          role: user.role,
          savedLocations: user.savedLocations || [],
          idVerificationStatus: user.idVerificationStatus || VerificationStatus.NONE,
          isPrimary: user.isPrimary,
          phone: user.phone,
          idProofUrl: user.idProofUrl
        };

        setAuth({ user: completeUser, isAuthenticated: true });
        return completeUser;
      } else {
        const err = await res.json();

        // Handle Social Login "User not found" -> Auto Register
        if (res.status === 401 && err.error === 'User not found' && socialProvider) {
          console.log(`User ${email} not found during ${socialProvider} login. Auto-registering...`);
          const name = email.split('@')[0];
          const registered = await register(name, email, "social-login-placeholder-pass");
          if (registered) {
            // If registration worked, retry login silently (recursive but single depth due to flow)
            // Actually register calls login, so we just need return value of register?
            // Register currently returns boolean. We should update register or handle here.
            // Wait, register calls login. So register will return User | null if we update it?
            // Let's assume register is updated to return boolean for now, but it calls login internally which sets auth.
            // So we just return "something" or retry?
            return login(email, role, undefined, "social-login-placeholder-pass");
          }
        }

        alert(err.error || "Login failed");
        return null;
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Network error during login");
      return null;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ name, email, password, role: Role.USER })
      });

      if (res.ok) {
        // Since we are calling login inside register, passing 'undefined' for socialProvider prevents infinite loop
        const user = await login(email, Role.USER, undefined, password);
        return !!user;
      } else {
        const err = await res.json();
        alert(err.error || "Registration failed");
        return false;
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Network error during registration");
      return false;
    }
  };

  const logout = () => {
    setAuth({ user: null, isAuthenticated: false });
    localStorage.removeItem('luxe_auth');
  };

  // --- User Management ---

  const updateProfile = async (updates: Partial<User>) => {
    if (!auth.user) return;
    const updatedUser = { ...auth.user, ...updates };

    // Optimistic Update
    setAuth({ ...auth, user: updatedUser });
    setAllUsers(prev => prev.map(u => u.id === auth.user!.id ? updatedUser : u));

    try {
      await fetch(`${API_BASE_URL}/api/users/${auth.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.error("Failed to update profile remotely", e);
    }
  };

  const addLocation = async (location: SavedLocation) => {
    if (!auth.user) return;
    const newLocations = [...auth.user.savedLocations, location];
    const updatedUser = { ...auth.user, savedLocations: newLocations };

    setAuth({ ...auth, user: updatedUser });
    setAllUsers(prev => prev.map(u => u.id === auth.user!.id ? updatedUser : u));

    try {
      await fetch(`${API_BASE_URL}/api/users/${auth.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ savedLocations: newLocations })
      });
    } catch (e) {
      console.error("Failed to add location remotely", e);
    }
  };

  const verifyUserId = async (userId: string) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, idVerificationStatus: VerificationStatus.VERIFIED } : u));
    if (auth.user?.id === userId) {
      setAuth(prev => prev.user ? ({ ...prev, user: { ...prev.user, idVerificationStatus: VerificationStatus.VERIFIED } }) : prev);
    }

    try {
      await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ idVerificationStatus: VerificationStatus.VERIFIED })
      });
    } catch (e) { console.error("Verify API failed", e); }
  };

  const updateUserNotes = async (userId: string, notes: string) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, notes } : u));
    try {
      await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ notes })
      });
    } catch (e) { console.error("Note update failed", e); }
  };

  const deleteUser = async (userId: string) => {
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    if (auth.user?.id === userId) logout();

    try {
      await fetch(`${API_BASE_URL}/api/users/${userId}`, { method: 'DELETE' });
    } catch (e) { console.error("Delete user failed", e); }
  };

  const createAdmin = async (user: User) => {
    // Calls register but with admin logic or specific endpoint if needed. 
    // For now using register endpoint usually doesn't allow role setting for security, 
    // but our /api/users does allow role if we just use it.
    // But typically admin creation should be protected.
    // We will blindly call /api/users with role=admin and expect server to handle or separate route.
    // Our server create_user allows role.
    try {
      await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          password: user.password,
          role: Role.ADMIN
        })
      });
      // Refresh users
      if (auth.user?.role === Role.ADMIN) {
        const res = await fetch(`${API_BASE_URL}/api/users/details`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
        if (res.ok) {
          const data = await res.json();
          setAllUsers(data.map((u: any) => ({ ...u, id: u.id || u._id })));
        }
      }
    } catch (e) { console.error("Create admin failed", e); }
  };

  const transferPrimaryStatus = async (targetUserId: string) => {
    // Logic to switch primary status. Currently server update_user supports isPrimary.
    if (!auth.user?.isPrimary) return;

    // 1. Demote self
    await fetch(`${API_BASE_URL}/api/users/${auth.user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ isPrimary: false })
    });

    // 2. Promote target
    await fetch(`${API_BASE_URL}/api/users/${targetUserId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ isPrimary: true })
    });

    // Refresh local state or force logout/reload
    window.location.reload();
  };

  // --- Orders & Product ---

  const addProduct = async (product: Product) => {
    // Optimistic add with client-side ID
    setProducts(prev => [...prev, product]);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        const data = await res.json();
        const serverId = data.id;
        // Update the local product to have the real server ID to ensure future edits work without refresh
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, id: serverId } : p));
      }
    } catch (e) {
      console.error("Failed to add product", e);
      // Revert on failure? For now just log.
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    try {
      await fetch(`${API_BASE_URL}/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(updatedProduct)
      });
    } catch (e) { console.error("Failed to update product", e); }
  };

  const deleteProduct = async (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    try {
      await fetch(`${API_BASE_URL}/api/products/${productId}`, { method: 'DELETE' });
    } catch (e) { console.error("Failed to delete product", e); }
  };

  // Other contextual methods remain largely separate from backend for this iteration 
  // or are strictly local UI state for now (like orders which are complex to sync fully without a robust backend order model)

  const updateAddonSettings = async (settings: AddonSettings) => {
    setAddonSettings(settings);
    try {
      await fetch(`${API_BASE_URL}/api/settings/addons`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(settings)
      });
    } catch (e) { console.error("Failed to save settings", e); }
  };

  const placeOrder = async (orderData: Omit<Order, 'id' | 'status' | 'createdAt' | 'expenses'>) => {
    const newOrder: Order = {
      ...orderData,
      id: "temp-" + Date.now(), // Temp ID until server response
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      expenses: []
    };

    setOrders(prev => [newOrder, ...prev]);

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          ...orderData,
          status: OrderStatus.PENDING,
          createdAt: new Date().toISOString()
        })
      });
      if (res.ok) {
        const data = await res.json();
        // Update temp ID with real ID
        setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, id: data.id } : o));
      }
    } catch (e) {
      console.error("Place order failed", e);
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    // Ideally sync status to backend too via PUT /api/orders/<id> (not implemented in this plan iteration but logic is similar)
    // Actually, for "REJECTED" the user now wants to DELETE. But for other status updates (CONFIRMED etc), we should probably implement the PUT call here too to be safe,
    // but the task is just about DELETING rejected ones. I'll add the delete function.

    // Quick fix: Sync status update to backend for "CONFIRMED" etc so they persist
    if (status !== OrderStatus.REJECTED) { // Rejected handled via deleteOrder usually, but if called here...
      fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ status })
      }).catch(e => console.error(e));
    }
  };

  const deleteOrder = async (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    try {
      await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
    } catch (e) { console.error("Failed to delete order", e); }
  };

  const updateGlobalFinancials = async (updates: Partial<GlobalFinancials>) => {
    const newStats = { ...globalFinancials, ...updates };
    setGlobalFinancials(newStats);
    try {
      await fetch(`${API_BASE_URL}/api/settings/financials`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(newStats)
      });
    } catch (e) { console.error("Failed to save financials", e); }
  };

  const addOrderExpense = async (orderId: string, expense: Omit<OrderExpense, 'id' | 'date'>) => {
    const newExpense = { ...expense, id: Math.random().toString(), date: new Date().toISOString() };

    // Find current order to get existing expenses
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedExpenses = [...(order.expenses || []), newExpense];

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, expenses: updatedExpenses } : o));

    try {
      await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ expenses: updatedExpenses })
      });
    } catch (e) { console.error("Failed to save expense", e); }
  };

  const removeOrderExpense = (orderId: string, expenseId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, expenses: o.expenses.filter(e => e.id !== expenseId) } : o));
  };

  return (
    <StoreContext.Provider value={{
      auth, allUsers, login, logout, updateProfile, addLocation, verifyUserId, updateUserNotes,
      products, addProduct, updateProduct, deleteProduct,
      addonSettings, updateAddonSettings,
      orders, placeOrder, updateOrderStatus, deleteOrder,
      globalFinancials, updateGlobalFinancials, addOrderExpense, removeOrderExpense,
      createAdmin, deleteUser, transferPrimaryStatus, register
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};