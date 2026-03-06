
import React from 'react';
import { Page, User, AirolaNotification } from '../types';
import { ShieldCheck, User as UserIcon, LogOut, Menu, LayoutDashboard, Briefcase, Bell, ArrowLeft } from 'lucide-react';

interface NavbarProps {
  currentPage: Page;
  user: User;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onGoBack: () => void;
  notifications: AirolaNotification[];
  onToggleNotifications: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, user, onNavigate, onLogout, onGoBack, notifications, onToggleNotifications }) => {
  const unreadCount = notifications.filter(n => !n.read && n.recipientRole === user.role).length;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 h-[100px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center">
            {currentPage !== Page.LANDING && (
              <button 
                onClick={onGoBack}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors group hover:shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-[rgb(61,141,122)]" />
              </button>
            )}
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => onNavigate(Page.LANDING)}
            >
              <img 
                src="/Final_logo-removebg-preview.png" 
                alt="Airola Logo" 
                className="w-[110px] md:w-[160px] h-auto transition-transform duration-300 ease-in-out hover:scale-105 p-3"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => onNavigate(Page.LANDING)}
              className={`${currentPage === Page.LANDING ? 'text-[rgb(61,141,122)]' : 'text-slate-600'} hover:text-[rgb(61,141,122)] font-medium transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 hover:drop-shadow-[0_0_5px_rgba(172,216,206,0.7)]`}
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate(Page.PRICING)}
              className={`${currentPage === Page.PRICING ? 'text-[rgb(61,141,122)]' : 'text-slate-600'} hover:text-[rgb(61,141,122)] font-medium transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 hover:drop-shadow-[0_0_5px_rgba(172,216,206,0.7)]`}
            >
              Packages
            </button>
            <button 
              onClick={() => {
                if (currentPage === Page.LANDING) {
                  document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  onNavigate(Page.LANDING);
                  setTimeout(() => {
                    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className={`text-slate-600 hover:text-[rgb(61,141,122)] font-medium transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 hover:drop-shadow-[0_0_5px_rgba(172,216,206,0.7)]`}
            >
              Services
            </button>
            <button 
              onClick={() => onNavigate(Page.GIVEAWAY)}
              className={`${currentPage === Page.GIVEAWAY ? 'text-[rgb(61,141,122)]' : 'text-slate-600'} hover:text-[rgb(61,141,122)] font-medium transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 hover:drop-shadow-[0_0_5px_rgba(172,216,206,0.7)]`}
            >
              Giveaway
            </button>
            <button 
              onClick={() => onNavigate(Page.ABOUT_US)}
              className={`${currentPage === Page.ABOUT_US ? 'text-[rgb(61,141,122)]' : 'text-slate-600'} hover:text-[rgb(61,141,122)] font-medium transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 hover:drop-shadow-[0_0_5px_rgba(172,216,206,0.7)]`}
            >
              About Us
            </button>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => onNavigate(Page.QUOTE)}
                className="bg-[rgb(61,141,122)] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[rgb(45,110,95)] transition-all shadow-lg shadow-[rgb(61,141,122)]/20 hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(172,216,206,0.7)]"
              >
                Check Availability
              </button>
            </div>
          </div>

          <div className="md:hidden">
            <button className="text-slate-600 p-2 rounded-full hover:bg-slate-100 hover:shadow-[0_0_10px_rgba(0,0,0,0.1)]" onClick={onToggleNotifications}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
