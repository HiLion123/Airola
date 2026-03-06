
import React, { useState, useEffect } from 'react';
import { Page, User, QuoteData, UserRole, AirolaNotification } from './types';
import { db } from './db';
import LandingPage from './pages/LandingPage';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StaffManagementPage from './pages/StaffManagementPage';
import QuotePage from './pages/QuotePage';
import AddPropertyPage from './pages/AddPropertyPage';
import PricingPage from './pages/PricingPage';
import QuoteReview from './pages/QuoteReview';
import { GiveawayPage } from './pages/GiveawayPage';
import { ThanksPage } from './pages/ThanksPage';
import { BonusPage } from './pages/BonusPage';
import AboutUs from './pages/AboutUs';
import ContactPage from './pages/ContactPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppFAB from './components/WhatsAppFAB';
import NotificationCenter from './components/NotificationCenter';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LANDING);
  const [history, setHistory] = useState<Page[]>([]);
  const [user, setUser] = useState<User>({ name: '', email: '', isLoggedIn: false, role: 'owner' });
  const [notifications, setNotifications] = useState<AirolaNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [currentQuote, setCurrentQuote] = useState<QuoteData>({
    propertyName: '',
    address: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    beds: 1,
    baths: 1,
    cleaningType: 'standard',
    laundry: false,
    toiletries: [],
    frequency: 'one-time',
    basePrice: 49,
    totalPrice: 49,
    notes: ''
  });

  // Load Database Data
  const refreshData = async () => {
    const session = await db.getSession();
    if (session) {
      setUser(session);
      const notes = await db.getNotifications(session.role);
      setNotifications(notes);
    } else {
      setNotifications([]);
    }
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('storage_update', refreshData);
    return () => window.removeEventListener('storage_update', refreshData);
  }, []);

  // Sync currentQuote with logged in user
  useEffect(() => {
    if (user.isLoggedIn && !currentQuote.ownerName) {
      setCurrentQuote(prev => ({
        ...prev,
        ownerName: user.name,
        ownerPhone: prev.ownerPhone || '+44 7700 900000'
      }));
    }
  }, [user]);

  // Handle Browser Back Button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
      } else {
        setCurrentPage(Page.LANDING);
      }
    };

    window.addEventListener('popstate', handlePopState);
    // Initialize state with current page
    window.history.replaceState({ page: currentPage }, '');

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (page: Page) => {
    if (page !== currentPage) {
      setHistory(prev => [...prev, currentPage]);
      setCurrentPage(page);
      window.history.pushState({ page }, '');
      window.scrollTo(0, 0);
    }
  };

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else if (history.length > 0) {
      const prevPage = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentPage(prevPage);
      window.scrollTo(0, 0);
    } else {
      navigate(Page.LANDING);
    }
  };

  const handleLogout = async () => {
    const resetUser: User = { name: '', email: '', isLoggedIn: false, role: 'owner' };
    setUser(resetUser);
    await db.clearSession();
    navigate(Page.LANDING);
  };

  const markNotificationRead = async (id: string) => {
    await db.markNotificationRead(id);
    setNotifications(await db.getNotifications(user.role));
  };

  const deleteNotification = async (id: string) => {
    await db.deleteNotification(id);
    setNotifications(await db.getNotifications(user.role));
  };

  const withAuth = (component: React.ReactNode, requiredRole?: UserRole) => {
    return component;
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.LANDING: return <LandingPage onNavigate={navigate} user={user} />;
      case Page.DASHBOARD: return withAuth(<OwnerDashboard user={user} onNavigate={navigate} onSelectQuote={setCurrentQuote} />, 'owner');
      case Page.ADMIN_DASHBOARD: return withAuth(<AdminDashboard onNavigate={navigate} />, 'admin');
      case Page.STAFF_MANAGEMENT: return withAuth(<StaffManagementPage onNavigate={navigate} />, 'admin');
      case Page.QUOTE: return <QuotePage quote={currentQuote} setQuote={setCurrentQuote} onNavigate={navigate} user={user} />;
      case Page.ADD_PROPERTY: return withAuth(<AddPropertyPage onNavigate={navigate} user={user} />, 'owner');
      case Page.PRICING: return <PricingPage onNavigate={navigate} user={user} />;
      case Page.REVIEW: return <QuoteReview quote={currentQuote} setQuote={setCurrentQuote} onNavigate={navigate} user={user} />;
      case Page.GIVEAWAY: return <GiveawayPage onNavigate={navigate} />;
      case Page.THANKS: return <ThanksPage onNavigate={navigate} />;
      case Page.BONUS: return <BonusPage onNavigate={navigate} />;
      case Page.ABOUT_US: return <AboutUs onNavigate={navigate} />;
      case Page.CONTACT: return <ContactPage />;
      default: return <LandingPage onNavigate={navigate} user={user} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        currentPage={currentPage} 
        user={user} 
        onNavigate={navigate} 
        onLogout={handleLogout} 
        onGoBack={goBack}
        notifications={notifications}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
      />
      <main className="flex-grow pt-[90px]">
        {renderPage()}
      </main>
      <Footer onNavigate={navigate} />
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        userRole={user.role}
        user={user}
        onMarkRead={markNotificationRead}
        onDelete={deleteNotification}
      />
      <WhatsAppFAB />
    </div>
  );
};

export default App;
