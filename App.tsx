import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Role } from './types';
import { ShoppingBag, User, LayoutDashboard, Menu, X, LogOut, Package, ListChecks, Users, Truck, RotateCcw, Archive } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Pages
import Landing from './pages/user/Landing';
import Catalog from './pages/user/Catalog';
import ProductDetail from './pages/user/ProductDetail';
import Profile from './pages/user/Profile';
import UserOrders from './pages/user/Orders';
import AdminDashboard from './pages/admin/Dashboard';
import Inventory from './pages/admin/Inventory';
import Requests from './pages/admin/Requests';
import Fulfillment from './pages/admin/Fulfillment';
import Returns from './pages/admin/Returns';
import AdminHistory from './pages/admin/History';
import AdminUsers from './pages/admin/Users';
import Login from './pages/Auth';
import { ChatBot } from './components/ChatBot';

const Navigation: React.FC<{ currentView: string, setView: (v: string) => void }> = ({ currentView, setView }) => {
  const { auth, logout } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const NavLink = ({ view, icon: Icon, label }: any) => (
    <button
      onClick={() => { setView(view); setIsOpen(false); }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentView === view ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <nav className="fixed top-0 w-full bg-dark-bg/80 backdrop-blur-md border-b border-slate-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
            <div className="w-8 h-8 bg-gradient-to-tr from-brand-500 to-violet-500 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              BattleVault
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {auth.isAuthenticated ? (
              auth.user?.role === Role.ADMIN ? (
                <>
                  <NavLink view="admin-dashboard" icon={LayoutDashboard} label="Dashboard" />
                  <NavLink view="admin-requests" icon={ListChecks} label="Requests" />
                  <NavLink view="admin-fulfillment" icon={Truck} label="Fulfillment" />
                  <NavLink view="admin-returns" icon={RotateCcw} label="Returns" />
                  <NavLink view="admin-history" icon={Archive} label="History" />
                  <NavLink view="admin-inventory" icon={Package} label="Inventory" />
                  <NavLink view="admin-users" icon={Users} label="Users" />
                </>
              ) : (
                <>
                  <NavLink view="catalog" icon={ShoppingBag} label="Catalog" />
                  <NavLink view="orders" icon={ListChecks} label="My Orders" />
                  <NavLink view="profile" icon={User} label="Profile" />
                </>
              )
            ) : (
              <NavLink view="landing" icon={ShoppingBag} label="Home" />
            )}

            {auth.isAuthenticated ? (
              <button onClick={logout} className="text-slate-400 hover:text-red-400 transition-colors">
                <LogOut size={20} />
              </button>
            ) : (
              <button onClick={() => setView('login')} className="bg-white text-dark-bg px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors">
                Sign In
              </button>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-card border-b border-slate-800"
          >
            <div className="px-4 pt-2 pb-4 space-y-2 flex flex-col">
              {auth.isAuthenticated ? (
                auth.user?.role === Role.ADMIN ? (
                  <>
                    <NavLink view="admin-dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <NavLink view="admin-requests" icon={ListChecks} label="Requests" />
                    <NavLink view="admin-fulfillment" icon={Truck} label="Fulfillment" />
                    <NavLink view="admin-returns" icon={RotateCcw} label="Returns" />
                    <NavLink view="admin-history" icon={Archive} label="History" />
                    <NavLink view="admin-inventory" icon={Package} label="Inventory" />
                    <NavLink view="admin-users" icon={Users} label="Users" />
                  </>
                ) : (
                  <>
                    <NavLink view="catalog" icon={ShoppingBag} label="Catalog" />
                    <NavLink view="orders" icon={ListChecks} label="My Orders" />
                    <NavLink view="profile" icon={User} label="Profile" />
                  </>
                )
              ) : (
                <>
                  <NavLink view="landing" icon={ShoppingBag} label="Home" />
                  <button onClick={() => { setView('login'); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-brand-400">Sign In</button>
                </>
              )}
              {auth.isAuthenticated && (
                <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-red-400">
                  <LogOut size={18} /> Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const MainContent: React.FC = () => {
  const { auth } = useStore();
  const [currentView, setCurrentView] = useState('landing');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const handleLoginSuccess = (role?: Role) => {
    // Check role either from argument or current auth state
    const currentRole = role || auth.user?.role;

    if (currentRole === Role.ADMIN) {
      setCurrentView('admin-dashboard');
    } else {
      setCurrentView('catalog');
    }
  };

  // Router logic replacement for SPA without react-router
  const renderView = () => {
    if (!auth.isAuthenticated) {
      if (currentView === 'login') return <Login onLoginSuccess={handleLoginSuccess} />;
      return <Landing onExplore={() => setCurrentView('login')} />;
    }

    // Role Guard
    if (auth.user?.role === Role.ADMIN) {
      switch (currentView) {
        case 'admin-dashboard': return <AdminDashboard />;
        case 'admin-inventory': return <Inventory />;
        case 'admin-requests': return <Requests />;
        case 'admin-fulfillment': return <Fulfillment />;
        case 'admin-returns': return <Returns />;
        case 'admin-history': return <AdminHistory />;
        case 'admin-users': return <AdminUsers />;
        default: return <AdminDashboard />;
      }
    }

    // User Views
    switch (currentView) {
      case 'landing': return <Landing onExplore={() => setCurrentView('catalog')} />;
      case 'catalog': return <Catalog onProductSelect={(id) => { setSelectedProductId(id); setCurrentView('product-detail'); }} />;
      case 'product-detail': return <ProductDetail productId={selectedProductId!} onBack={() => setCurrentView('catalog')} onOrderSuccess={() => setCurrentView('orders')} />;
      case 'profile': return <Profile />;
      case 'orders': return <UserOrders />;
      default: return <Catalog onProductSelect={(id) => { setSelectedProductId(id); setCurrentView('product-detail'); }} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 font-sans selection:bg-brand-500/30">
      <Navigation currentView={currentView} setView={setCurrentView} />
      <main className="pt-20 pb-10 px-4 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <StoreProvider>
      <MainContent />
      <ChatBot />
    </StoreProvider>
  );
};

export default App;