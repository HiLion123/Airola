
import React, { useState, useEffect } from 'react';
import { Page, QuoteData, User as UserType } from '../types';
import { ChevronRight, ChevronLeft, Sparkles, CheckCircle, Info, Calendar as CalendarIcon, Link as LinkIcon, Home, MapPin, ClipboardList, User, Phone, Mail, Shield, Star, Check } from 'lucide-react';

interface QuotePageProps {
  quote: QuoteData;
  setQuote: React.Dispatch<React.SetStateAction<QuoteData>>;
  onNavigate: (page: Page) => void;
  user: UserType;
}

const QuotePage: React.FC<QuotePageProps> = ({ quote, setQuote, onNavigate, user }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const addOns = [
    {
      id: 'essentials',
      icon: '🧻',
      name: 'Essentials Restocking',
      priceText: '£10',
      price: 10,
      description: 'TP · Hand soap · Dish soap · Bin liners'
    },
    {
      id: 'linen',
      icon: '🛏',
      name: 'Linen Change',
      priceText: 'From £15',
      price: 15,
      description: 'Price depends on beds'
    },
    {
      id: 'dishwashing',
      icon: '🍽',
      name: 'Dishwashing',
      priceText: '£10',
      price: 10,
      description: 'Complete kitchenware reset'
    },
    {
      id: 'appliance',
      icon: '🧊',
      name: 'Fridge & Microwave',
      priceText: '£10',
      price: 10,
      description: 'Deep interior disinfection'
    }
  ];

  // Initialize or Sync Host Info
  useEffect(() => {
    if (user.isLoggedIn) {
      setQuote(prev => ({
        ...prev,
        ownerName: prev.ownerName || user.name || '',
        ownerEmail: prev.ownerEmail || user.email || '',
        ownerPhone: prev.ownerPhone || user.phone || ''
      }));
    }
  }, [user.isLoggedIn, user.name, user.email, user.phone]);

  useEffect(() => {
    let price;
    if (quote.isPriorityHost) {
      // Priority Host pricing
      if (quote.cleaningType === 'starter') price = 39;
      else if (quote.cleaningType === 'premium') price = 89;
      else price = 49; // Default to Standard
    } else {
      // One-Off Booking pricing
      if (quote.cleaningType === 'starter') price = 49;
      else if (quote.cleaningType === 'premium') price = 99;
      else price = 59; // Default to Standard
    }
    
    // Calculate Add-ons total - Linen depends on bed count
    const addOnsTotal = quote.toiletries.reduce((total, addonId) => {
      const addon = addOns.find(a => a.id === addonId);
      if (addonId === 'linen' && addon) {
        return total + (addon.price * (quote.beds || 1));
      }
      return total + (addon ? addon.price : 0);
    }, 0);

    const priorityHostFee = quote.isPriorityHost ? 25 : 0;

    setQuote(prev => ({ 
      ...prev, 
      basePrice: price,
      totalPrice: price + addOnsTotal + priorityHostFee
    }));
  }, [quote.cleaningType, quote.toiletries, quote.beds, quote.isPriorityHost]);

  const toggleToiletry = (id: string) => {
    setQuote(prev => ({
      ...prev,
      toiletries: prev.toiletries.includes(id)
        ? prev.toiletries.filter(i => i !== id)
        : [...prev.toiletries, id]
    }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!quote.address || !quote.ownerName || !quote.ownerPhone || !quote.ownerEmail) {
        alert("Please complete all property and contact details to continue.");
        return;
      }
    }
    
    if (step < totalSteps) setStep(step + 1);
    else onNavigate(Page.REVIEW);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
    else onNavigate(Page.DASHBOARD);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-grow">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 mb-2">Register Property</h1>
            <p className="text-slate-500 font-medium tracking-wide">Step {step} of {totalSteps}: {
              step === 1 ? 'Contact & Location' : 
              step === 2 ? 'Property Size' : 
              step === 3 ? 'Cleaning Type' : 
              step === 4 ? 'Laundry & Extras' : 
              step === 5 ? 'Calendar Sync' : 'Service Plan'
            }</p>
            
            <div className="w-full bg-slate-100 h-3 mt-6 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[rgb(61,141,122)] transition-all duration-700 ease-out"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-2xl min-h-[500px]">
            {step === 1 && (
              <div>
                <h3 className="text-2xl font-bold mb-8 text-slate-900">Contact & Location Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Your Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="text" 
                          value={quote.ownerName || ''}
                          onChange={(e) => setQuote({ ...quote, ownerName: e.target.value })}
                          placeholder="e.g. John Doe"
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(235,247,244)]0/10 focus:border-[rgb(235,247,244)]0 transition-all font-medium text-slate-900"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="email" 
                          value={quote.ownerEmail || ''}
                          onChange={(e) => setQuote({ ...quote, ownerEmail: e.target.value })}
                          placeholder="e.g. john@example.com"
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(235,247,244)]0/10 focus:border-[rgb(235,247,244)]0 transition-all font-medium text-slate-900"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Mobile Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="tel" 
                          value={quote.ownerPhone || ''}
                          onChange={(e) => setQuote({ ...quote, ownerPhone: e.target.value })}
                          placeholder="+44 7700 900000"
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(235,247,244)]0/10 focus:border-[rgb(235,247,244)]0 transition-all font-medium text-slate-900"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]"> </label>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Property Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                        <textarea 
                          value={quote.address || ''}
                          onChange={(e) => setQuote({ ...quote, address: e.target.value })}
                          placeholder="Full street address and postcode..."
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(235,247,244)]0/10 focus:border-[rgb(235,247,244)]0 transition-all font-medium text-slate-900 min-h-[100px]"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Special Notes or Requirements</label>
                      <div className="relative">
                        <ClipboardList className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                        <textarea 
                          value={quote.notes || ''}
                          onChange={(e) => setQuote({ ...quote, notes: e.target.value })}
                          placeholder="e.g. Key is in the lockbox (code 1234), specific entry instructions, or pet alerts..."
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(235,247,244)]0/10 focus:border-[rgb(235,247,244)]0 transition-all font-medium text-slate-900 min-h-[315px]"
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-400">These notes will be shared with the cleaning team.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="text-2xl font-bold mb-8 text-slate-900">Property Dimensions</h3>
                <div className="space-y-10">
                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Bedrooms</label>
                    <div className="flex flex-wrap gap-4">
                      {[1, 2, 3, 4, 5, 6].map(n => (
                        <button 
                          key={n}
                          onClick={() => setQuote({ ...quote, beds: n })}
                          className={`w-16 h-16 rounded-2xl border-2 font-black text-lg transition-all ${
                            quote.beds === n ? 'border-[rgb(61,141,122)] bg-[rgb(235,247,244)] text-[rgb(61,141,122)] shadow-md' : 'border-slate-50 text-slate-400 hover:border-slate-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Bathrooms</label>
                    <div className="flex flex-wrap gap-4">
                      {[1, 2, 3, 4].map(n => (
                        <button 
                          key={n}
                          onClick={() => setQuote({ ...quote, baths: n })}
                          className={`w-16 h-16 rounded-2xl border-2 font-black text-lg transition-all ${
                            quote.baths === n ? 'border-[rgb(61,141,122)] bg-[rgb(235,247,244)] text-[rgb(61,141,122)] shadow-md' : 'border-slate-50 text-slate-400 hover:border-slate-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 className="text-2xl font-bold mb-8 text-slate-900">Maintenance Standard</h3>
                <div className="flex justify-center items-center space-x-4 mb-8">
                  <span className={`font-medium ${!quote.isPriorityHost ? 'text-slate-900' : 'text-slate-500'}`}>One-Off Booking</span>
                  <label htmlFor="pricing-toggle" className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="pricing-toggle" className="sr-only peer" checked={quote.isPriorityHost} onChange={(e) => setQuote({ ...quote, isPriorityHost: e.target.checked })} />
                    <div className="w-14 h-8 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[rgb(61,141,122)] hover:shadow-[0_0_10px_rgba(61,141,122,0.3)]"></div>
                  </label>
                  <span className={`font-medium ${quote.isPriorityHost ? 'text-slate-900' : 'text-slate-500'}`}>Priority Host (Save £10 per clean)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      id: 'starter',
                      name: 'Starter Clean',
                      price: quote.isPriorityHost ? '£39' : '£49',
                      icon: <Shield className="w-6 h-6" />,
                      desc: 'A thorough clean for smaller spaces, designed for quick turnovers.'
                    },
                    {
                      id: 'standard',
                      name: 'Standard Turnover',
                      price: quote.isPriorityHost ? '£49' : '£59',
                      icon: <Sparkles className="w-6 h-6" />,
                      desc: 'The perfect balance of speed and detail for most properties.'
                    },
                    {
                      id: 'premium',
                      name: 'Guest-Ready Plus',
                      price: quote.isPriorityHost ? '£89' : '£99',
                      icon: <Star className="w-6 h-6" />,
                      desc: 'A comprehensive clean for a truly hands-off experience.'
                    }
                  ].map((pkg) => (
                    <button 
                      key={pkg.id}
                      onClick={() => setQuote({ ...quote, cleaningType: pkg.id as any })}
                      className={`p-8 rounded-[2.5rem] border-2 text-left transition-all relative overflow-hidden group ${
                        quote.cleaningType === pkg.id 
                          ? 'border-[rgb(61,141,122)] bg-[rgb(235,247,244)] shadow-xl' 
                          : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                        quote.cleaningType === pkg.id ? 'bg-[rgb(61,141,122)] text-white' : 'bg-white text-slate-400 shadow-sm'
                      }`}>
                        {pkg.icon}
                      </div>
                      <h4 className="text-xl font-black text-slate-900 mb-2">{pkg.name}</h4>
                      <p className="text-2xl font-black text-[rgb(235,247,244)]0 mb-3">{pkg.price}</p>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{pkg.desc}</p>
                      
                      {quote.cleaningType === pkg.id && (
                        <div className="absolute top-6 right-6">
                          <div className="bg-[rgb(61,141,122)] text-white p-1 rounded-full">
                            <Check className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h3 className="text-2xl font-bold mb-8 text-slate-900">Optional Add-Ons</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addOns.map(addon => (
                    <div 
                      key={addon.id}
                      className={`p-6 rounded-[2rem] border transition-all flex flex-col justify-between group ${
                        quote.toiletries.includes(addon.id) ? 'bg-[rgb(235,247,244)] border-[rgb(61,141,122)] shadow-xl' : 'bg-white border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            {addon.icon}
                          </div>
                          <div>
                            <h4 className={`font-bold text-lg ${quote.toiletries.includes(addon.id) ? 'text-[rgb(45,110,95)]' : 'text-slate-900'}`}>
                              {addon.name}
                            </h4>
                            <p className="text-xs font-black text-[rgb(61,141,122)] tracking-wider">{addon.priceText}</p>
                          </div>
                        </div>
                        {quote.toiletries.includes(addon.id) && (
                          <div className="bg-[rgb(61,141,122)] text-white p-1 rounded-full">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      
                      <p className="text-slate-500 text-sm mb-6 leading-relaxed font-medium">
                        {addon.description}
                      </p>

                      <button 
                        onClick={() => toggleToiletry(addon.id)}
                        className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center ${
                          quote.toiletries.includes(addon.id) 
                            ? 'bg-[rgb(61,141,122)] text-white hover:shadow-[0_0_20px_rgba(172,216,206,0.7)]' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]'
                        }`}
                      >
                        {quote.toiletries.includes(addon.id) ? (
                          <><CheckCircle className="w-4 h-4 mr-2" /> Added</>
                        ) : (
                          <>➕ Add to Booking</>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <div className="flex items-center space-x-4 mb-8">
                  <div className="p-4 bg-[rgb(204,236,229)] text-[rgb(61,141,122)] rounded-2xl">
                    <CalendarIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Automated Scheduling</h3>
                </div>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  Connect your Airbnb or VRBO calendar via iCal. We'll automatically schedule turnover cleaning the moment a guest checks out.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">iCal Import Link</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="url" 
                        value={quote.calendarUrl || ''}
                        onChange={(e) => setQuote({ ...quote, calendarUrl: e.target.value })}
                        placeholder="https://www.airbnb.com/calendar/export/..."
                        className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[rgb(235,247,244)]0/10 focus:border-[rgb(235,247,244)]0 transition-all font-medium text-slate-900"
                      />
                    </div>
                  </div>
                  <div className="bg-[rgb(235,247,244)] p-6 rounded-2xl border border-[rgb(204,236,229)] text-sm text-[rgb(30,80,68)] flex items-start space-x-3">
                    <Info className="w-5 h-5 shrink-0" />
                    <p>Don't worry, we only read check-out dates. Guest data and pricing remain private.</p>
                  </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div>
                <h3 className="text-2xl font-bold mb-8 text-slate-900">Service Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <button 
                    onClick={() => setQuote({ ...quote, frequency: 'one-time' })}
                    className={`p-10 rounded-[2.5rem] border-2 text-center transition-all ${
                      quote.frequency === 'one-time' ? 'border-[rgb(61,141,122)] bg-[rgb(235,247,244)] shadow-xl' : 'border-slate-100 bg-white'
                    }`}
                  >
                    <h4 className="text-3xl font-black mb-4 text-slate-900">Ad-Hoc</h4>
                    <p className="text-slate-500 font-medium">Pay as you go. Perfect for occasional hosts.</p>
                  </button>
                  <button 
                    onClick={() => setQuote({ ...quote, frequency: 'recurring' })}
                    className={`p-10 rounded-[2.5rem] border-2 text-center transition-all ${
                      quote.frequency === 'recurring' ? 'border-[rgb(61,141,122)] bg-[rgb(235,247,244)] shadow-xl' : 'border-slate-100 bg-white'
                    }`}
                  >
                    <div className="inline-block px-4 py-1 bg-[rgb(61,141,122)] text-white text-[10px] font-black rounded-full mb-4 uppercase tracking-widest">Host Favorite</div>
                    <h4 className="text-3xl font-black mb-4 text-slate-900">Subscription</h4>
                    <p className="text-slate-500 font-medium">Automatic turnovers with 10% monthly discount.</p>
                  </button>
                </div>
              </div>
            )}

            <div className="mt-12 pt-12 border-t border-slate-50 flex justify-between">
              <button 
                onClick={prevStep}
                className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-900 transition-colors flex items-center hover:drop-shadow-[0_0_5px_rgba(0,0,0,0.2)]"
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Previous Step
              </button>
              <button 
                onClick={nextStep}
                className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl flex items-center hover:shadow-[0_0_20px_rgba(172,216,206,0.7)]"
              >
                {step === totalSteps ? 'Final Review' : 'Save & Continue'} <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96">
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white sticky top-24 shadow-2xl">
            <h3 className="text-xl font-bold mb-8 border-b border-white/10 pb-6">Estimate Summary</h3>
            <div className="space-y-5 mb-10">
              <div className="mb-4">
                 <p className="text-[10px] font-black uppercase text-[rgb(235,247,244)]0 tracking-widest mb-1">Authenticated Host</p>
                 <p className="text-sm font-bold truncate">{user.name}</p>
                 <p className="text-xs text-slate-400 font-medium">{user.email}</p>
              </div>
              {quote.propertyName && (
                <div className="mb-4">
                   <p className="text-[10px] font-black uppercase text-[rgb(235,247,244)]0 tracking-widest mb-1">Target Property</p>
                   <p className="text-sm font-bold truncate">{quote.propertyName}</p>
                </div>
              )}
              
              {step < 3 ? (
                <div className="py-8 text-center border-t border-white/5 mt-6">
                  <div className="bg-white/5 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-[rgb(235,247,244)]0/50" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium px-4">Complete property details to see your custom estimate.</p>
                </div>
              ) : (
                <div className="space-y-4 border-t border-white/5 pt-6 mt-4">
                  <div className="flex justify-between text-slate-400 font-medium text-sm">
                    <span>
                      {quote.cleaningType === 'starter' ? 'Starter Clean' : 
                       quote.cleaningType === 'premium' ? 'Guest-Ready Plus' : 
                       'Standard Turnover'}
                    </span>
                    <span className="text-white">£{quote.basePrice}</span>
                  </div>

                  {quote.isPriorityHost && (
                    <div className="flex justify-between text-slate-400 font-medium text-sm">
                      <span>Priority Host Fee</span>
                      <span className="text-white">£25</span>
                    </div>
                  )}

                  {quote.toiletries.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <p className="text-[10px] font-black text-[rgb(235,247,244)]0 uppercase tracking-widest">Selected Add-Ons</p>
                      {quote.toiletries.map(addonId => {
                        const addon = addOns.find(a => a.id === addonId);
                        if (!addon) return null;
                        const actualPrice = addon.id === 'linen' ? addon.price * (quote.beds || 1) : addon.price;
                        return (
                          <div key={addonId} className="flex justify-between text-slate-400 font-medium text-xs">
                            <span className="flex items-center">
                              <span className="mr-2">{addon.icon}</span>
                              {addon.name} {addon.id === 'linen' && `(${quote.beds} bed${quote.beds > 1 ? 's' : ''})`}
                            </span>
                            <span className="text-white">£{actualPrice}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                    <p className="text-[10px] font-black text-[rgb(235,247,244)]0 uppercase tracking-widest">Next Steps</p>
                    <div className="flex items-start space-x-3 text-slate-400">
                      <Phone className="w-4 h-4 mt-0.5 text-[rgb(235,247,244)]0" />
                      <p className="text-xs leading-relaxed font-medium">
                        Our admin team will contact you via call to discuss your property size ({quote.beds} bed, {quote.baths} bath) and any extras to finalize the quote.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {step >= 3 && (
              <div className="border-t border-white/10 pt-8 mb-10">
                <div className="flex justify-between items-end">
                  <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Per Turnover</span>
                  <span className="text-5xl font-black text-[rgb(235,247,244)]0">£{quote.totalPrice}</span>
                </div>
              </div>
            )}

            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
              <div className="flex items-center space-x-3 text-sm font-bold text-[rgb(235,247,244)]0">
                 <CheckCircle className="w-4 h-4" /> <span>5-Star Guarantee</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">Availability and pricing are finalized after our initial quality walkthrough.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotePage;
