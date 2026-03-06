
import React from 'react';
import { Page, User, Property, QuoteData, InventoryItem } from '../types';
import { Plus, Home, MapPin, Bath, Bed, ExternalLink, Settings, Clock, Sparkles, TrendingUp, Package, Eye } from 'lucide-react';

interface DashboardProps {
  user: User;
  onNavigate: (page: Page) => void;
  onSelectQuote: (quote: QuoteData) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, onSelectQuote }) => {
  const properties: Property[] = [
    { 
      id: '1', 
      name: 'Westminster Penthouse', 
      address: '12 Victoria St, London SW1', 
      beds: 2, 
      baths: 2,
      // Fix: added missing ownerEmail to satisfy Property interface
      ownerEmail: 'alexander@host.com',
      // Fix: added missing verificationStatus to satisfy Property interface
      verificationStatus: 'verified',
      inventory: [
        { name: 'Luxury Shampoo', level: 85, status: 'optimal' },
        { name: 'Toilet Paper (Bamboo)', level: 20, status: 'low' },
        { name: 'Ground Coffee', level: 50, status: 'optimal' }
      ]
    },
    { 
      id: '2', 
      name: 'Shoreditch Studio', 
      address: '88 Shoreditch High St, London E1', 
      beds: 1, 
      baths: 1,
      // Fix: added missing ownerEmail to satisfy Property interface
      ownerEmail: 'alexander@host.com',
      // Fix: added missing verificationStatus to satisfy Property interface
      verificationStatus: 'unverified',
      inventory: [
        { name: 'Linen Sets', level: 100, status: 'optimal' },
        { name: 'Hand Soap', level: 10, status: 'critical' }
      ]
    },
  ];

  const handleRequestCleaning = (prop: Property) => {
    onSelectQuote({
      propertyId: prop.id,
      propertyName: prop.name,
      address: prop.address,
      beds: prop.beds,
      baths: prop.baths,
      cleaningType: 'standard',
      laundry: true,
      toiletries: [],
      frequency: 'one-time',
      basePrice: 49,
      totalPrice: 49
    });
    onNavigate(Page.QUOTE);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Portfolio Overview</h1>
          <p className="text-slate-500 font-medium">Monitoring {properties.length} high-yield properties.</p>
        </div>
        <button 
          onClick={() => onNavigate(Page.QUOTE)}
          className="bg-[rgb(61,141,122)] text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-[rgb(172,216,206)]/50 hover:bg-[rgb(45,110,95)] transition-all flex items-center hover:shadow-[0_0_20px_rgba(172,216,206,0.7)]"
        >
          <Plus className="w-5 h-5 mr-2" /> Register New Property
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Statistics and Inventory Summary */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-[rgb(235,247,244)] rounded-2xl text-[rgb(61,141,122)]">
                <Clock className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 bg-[rgb(204,236,229)] text-[rgb(45,110,95)] text-xs font-bold rounded-full uppercase">Scheduled</span>
            </div>
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Upcoming Turnover</p>
              <h3 className="text-3xl font-black text-slate-900">Tomorrow, 10:00</h3>
              <p className="text-slate-500 font-medium mt-1">Westminster Penthouse (2 Check-outs)</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-[rgb(235,247,244)] rounded-2xl text-[rgb(61,141,122)]">
                  <Package className="w-7 h-7" />
                </div>
                <button className="text-[rgb(61,141,122)] text-xs font-bold hover:underline hover:drop-shadow-[0_0_5px_rgba(172,216,206,0.7)]">Restock All</button>
             </div>
             <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">Inventory Alerts</p>
             <div className="space-y-4">
                {properties[0].inventory?.slice(0, 2).map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">{item.name}</span>
                      <span className={item.level < 30 ? 'text-red-500' : 'text-slate-400'}>{item.level}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${item.level < 30 ? 'bg-red-500' : 'bg-[rgb(235,247,244)]0'}`}
                        style={{ width: `${item.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-3 text-[rgb(235,247,244)]0" /> Live Feed
          </h3>
          <div className="space-y-6">
            <div className="flex space-x-4">
              <div className="w-1 bg-[rgb(235,247,244)]0 rounded-full h-12 mt-1"></div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Just Now</p>
                <p className="text-sm font-bold text-white">Cleaning Started</p>
                <p className="text-xs text-slate-400">Shoreditch Studio - Team Alpha</p>
              </div>
            </div>
            <div className="flex space-x-4 opacity-60">
              <div className="w-1 bg-slate-700 rounded-full h-12 mt-1"></div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">2 Hours Ago</p>
                <p className="text-sm font-bold text-white">Linen Pick-up</p>
                <p className="text-xs text-slate-400">Westminster Penthouse</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Manage Properties</h2>
        <div className="flex space-x-2">
           <button className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]">
             <Settings className="w-5 h-5 text-slate-500" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((prop) => (
          <div key={prop.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl hover:shadow-2xl transition-all group">
            <div className="h-56 overflow-hidden relative">
              <img src={`https://picsum.photos/seed/${prop.id}host/600/400`} alt={prop.name} className="w-full h-full object-cover transition-transform duration-1000" />
              <div className="absolute top-4 right-4 flex space-x-2">
                 <div className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold text-slate-900 shadow-sm flex items-center">
                   <div className="w-2 h-2 bg-[rgb(235,247,244)]0 rounded-full mr-2"></div> Synced
                 </div>
              </div>
              <div className="absolute bottom-4 left-4">
                 <button className="bg-white/80 hover:bg-white backdrop-blur text-slate-900 p-3 rounded-2xl shadow-lg transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.7)]">
                    <Eye className="w-5 h-5" />
                 </button>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{prop.name}</h3>
              <div className="flex items-center text-slate-500 text-sm mb-6">
                <MapPin className="w-4 h-4 mr-1 text-[rgb(235,247,244)]0" /> {prop.address}
              </div>
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-50">
                <div className="text-center">
                   <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Beds</p>
                   <p className="text-slate-900 font-bold">{prop.beds}</p>
                </div>
                <div className="w-px h-8 bg-slate-100"></div>
                <div className="text-center">
                   <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Baths</p>
                   <p className="text-slate-900 font-bold">{prop.baths}</p>
                </div>
                <div className="w-px h-8 bg-slate-100"></div>
                <div className="text-center">
                   <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Health</p>
                   <p className="text-[rgb(61,141,122)] font-bold">98%</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleRequestCleaning(prop)}
                  className="bg-[rgb(61,141,122)] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[rgb(45,110,95)] transition-all shadow-lg shadow-[rgb(172,216,206)]/50 hover:shadow-[0_0_20px_rgba(172,216,206,0.7)]"
                >
                  Manual Clean
                </button>
                <button 
                  onClick={() => onNavigate(Page.PRICING)}
                  className="bg-slate-50 text-slate-900 py-4 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors border border-slate-100 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]"
                >
                  History
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
