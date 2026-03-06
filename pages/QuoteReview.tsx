
import React, { useState } from 'react';
import { Page, QuoteData, CleaningTask, AirolaNotification, Property, User } from '../types';
import { db } from '../db';
import { appendToSheet } from '../sheets';
import { CheckCircle2, ChevronLeft, Send, MessageSquare, ShieldCheck, User as UserIcon, Phone } from 'lucide-react';

interface QuoteReviewProps {
  quote: QuoteData;
  setQuote: React.Dispatch<React.SetStateAction<QuoteData>>;
  onNavigate: (page: Page) => void;
  user: User;
}

const QuoteReview: React.FC<QuoteReviewProps> = ({ quote, setQuote, onNavigate, user }) => {
  const [isSent, setIsSent] = useState(false);

  const addOns = [
    { id: 'essentials', name: 'Essentials Restocking' },
    { id: 'linen', name: 'Linen Change' },
    { id: 'dishwashing', name: 'Dishwashing' },
    { id: 'appliance', name: 'Fridge & Microwave' }
  ];

  const getAddonName = (id: string) => {
    return addOns.find(a => a.id === id)?.name || id;
  };

  const handleSend = async () => {
    const taskId = `REQ-${Math.floor(10000 + Math.random() * 90000)}`;
    const effectiveEmail = user.isLoggedIn ? user.email : quote.ownerEmail || 'guest@airola.co.uk';
    const effectiveName = user.isLoggedIn ? user.name : quote.ownerName || 'Guest';
    const effectivePhone = user.isLoggedIn ? (user.phone || quote.ownerPhone) : quote.ownerPhone;
    
    // Use totalPrice for the actual task price
    const finalPrice = quote.totalPrice || quote.basePrice;

    // Only save to local database if user is logged in
    if (user.isLoggedIn) {
      // Check if property exists
      const properties = await db.getProperties(effectiveEmail);
      let currentProp = properties.find(p => p.id === quote.propertyId || (p.name === quote.propertyName && p.address === quote.address));
      
      if (!currentProp) {
        currentProp = {
          id: `PROP-${Date.now()}`,
          name: quote.propertyName || 'New Listing',
          address: quote.address || '',
          beds: quote.beds,
          baths: quote.baths,
          ownerName: effectiveName,
          ownerPhone: effectivePhone,
          ownerEmail: effectiveEmail,
          listingDocUrl: quote.listingDocUrl,
          verificationStatus: 'unverified'
        };
        await db.saveProperty(currentProp);
      }

      // Create and save new cleaning task
      const newTask: CleaningTask = {
        id: taskId,
        propertyId: currentProp.id,
        propertyName: currentProp.name,
        propertyAddress: currentProp.address,
        ownerName: effectiveName,
        ownerPhone: effectivePhone || 'No Phone',
        ownerEmail: effectiveEmail,
        beds: currentProp.beds,
        baths: currentProp.baths,
        type: quote.cleaningType as any,
        status: 'pending',
        scheduledAt: 'ASAP / Quote Requested',
        cleanerName: 'Unassigned',
        price: finalPrice,
        notes: quote.notes,
        listingDocUrl: currentProp.listingDocUrl,
        verificationStatus: currentProp.verificationStatus
      };
      await db.saveTask(newTask);
    }

    // Trigger Database Notification to Admin (always do this)
    const adminNotification: AirolaNotification = {
      id: `EMAIL-${Date.now()}-A`,
      type: 'quote_request',
      title: 'Action Required: New Quote',
      subject: `New ${user.isLoggedIn ? 'Property Registration' : 'Quote Request'}: ${quote.propertyName}`,
      body: `Hello Team,\n\nA new ${user.isLoggedIn ? 'property registration' : 'quote request'} has been received.\n\nHost: ${effectiveName} (${effectiveEmail})\nPhone: ${effectivePhone}\nProperty: ${quote.propertyName}\nAddress: ${quote.address}\nTotal Price: £${finalPrice}\n\n${user.isLoggedIn ? `Please review database entry ${taskId}.` : 'This is a guest request.'}`,
      timestamp: new Date().toISOString(),
      read: false,
      recipientRole: 'admin'
    };
    await db.addNotification(adminNotification);

    // Append to Google Sheet (always do this)
    const mobileNumber = effectivePhone || 'Not specified';
    const sheetData = [
      new Date().toISOString(),
      effectiveName,
      effectiveEmail,
      // Adding a single quote prefix (') tells Google Sheets to treat the value as text
      // and prevents it from trying to interpret phone numbers starting with + as formulas.
      mobileNumber.startsWith('+') ? `'${mobileNumber}` : mobileNumber,
      quote.propertyName,
      quote.address,
      quote.beds,
      quote.baths,
      quote.cleaningType,
      quote.isPriorityHost ? 'Yes' : 'No',
      quote.frequency,
      finalPrice,
      quote.notes,
      taskId, // Add taskId to the sheet
    ];
    await appendToSheet('Sheet1', sheetData);

    setIsSent(true);
    if (user.isLoggedIn) {
      setTimeout(() => onNavigate(Page.DASHBOARD), 3000);
    }
  };

  if (isSent) {
    return (
      <div className="max-w-md mx-auto py-32 text-center">
        <div className="w-24 h-24 bg-[rgb(204,236,229)] text-[rgb(61,141,122)] rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-16 h-16" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">{user.isLoggedIn ? 'Database Committed!' : 'Quote Sent!'}</h1>
        <p className="text-xl text-slate-500 mb-8">
          {user.isLoggedIn 
            ? "Your property has been registered and your first clean is being scheduled." 
            : "Your quote has been sent to our team. We'll be in touch with you shortly."}
        </p>
        
        {user.isLoggedIn ? (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 mr-3 text-[rgb(61,141,122)]" />
            Secured for Host: {user.name}
          </div>
        ) : (
          <div className="space-y-4">
            <button 
              onClick={() => onNavigate(Page.QUOTE)}
              className="w-full py-4 bg-[rgb(61,141,122)] text-white rounded-2xl font-bold hover:bg-[rgb(45,110,95)] transition-all shadow-lg hover:shadow-[0_0_20px_rgba(172,216,206,0.7)]"
            >
              Continue to Availability
            </button>
            <button 
              onClick={() => onNavigate(Page.LANDING)}
              className="w-full py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    );
  }

  const effectiveEmail = user.isLoggedIn ? user.email : quote.ownerEmail || 'Not specified';
  const effectiveName = user.isLoggedIn ? user.name : quote.ownerName || 'Guest';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Final Confirmation</h1>
        <p className="text-slate-500">Review the configuration before {user.isLoggedIn ? 'writing to the Airola database' : 'sending your quote'}.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl">
        <div className="bg-[rgb(61,141,122)] p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-[rgb(204,236,229)] text-sm font-bold uppercase tracking-widest mb-1">Quote Total</p>
              <h2 className="text-5xl font-black">£{quote.totalPrice || quote.basePrice}<span className="text-xl text-[rgb(172,216,206)] font-medium ml-1">/ clean</span></h2>
            </div>
            <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-2xl">
              <span className="font-bold">{quote.frequency === 'one-time' ? 'One-time' : 'Recurring Service'}</span>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="mb-12">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Contact Information</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center p-4 bg-[rgb(235,247,244)]/50 rounded-2xl border border-[rgb(204,236,229)]">
                   <UserIcon className="w-5 h-5 mr-3 text-[rgb(61,141,122)]" />
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{user.isLoggedIn ? 'Authenticated Host' : 'Full Name'}</p>
                      <p className="font-bold text-slate-900 truncate max-w-[120px]">{effectiveName}</p>
                   </div>
                </div>
                <div className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <MessageSquare className="w-5 h-5 mr-3 text-[rgb(61,141,122)]" />
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Address</p>
                      <p className="font-bold text-slate-900 truncate max-w-[120px]">{effectiveEmail}</p>
                   </div>
                </div>
                <div className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <Phone className="w-5 h-5 mr-3 text-[rgb(61,141,122)]" />
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Contact Number</p>
                      <p className="font-bold text-slate-900">{quote.ownerPhone || 'Not specified'}</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Service Details</h3>
              <ul className="space-y-4">
                <li className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <span className="text-slate-600">Property Nickname</span>
                  <span className="font-bold text-slate-900 truncate max-w-[150px]">{quote.propertyName}</span>
                </li>
                <li className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <span className="text-slate-600">Property Size</span>
                  <span className="font-bold text-slate-900">{quote.beds} Bed, {quote.baths} Bath</span>
                </li>
                {quote.isPriorityHost && (
                  <li className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <span className="text-slate-600">Service Plan</span>
                    <span className="font-bold text-slate-900">Priority Host</span>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Database Extras</h3>
              <div className="flex flex-wrap gap-2">
                {quote.toiletries.length > 0 ? quote.toiletries.map(item => (
                  <span key={item} className="px-4 py-2 bg-[rgb(235,247,244)] text-[rgb(45,110,95)] rounded-full text-sm font-bold border border-[rgb(204,236,229)]">
                    {getAddonName(item)}
                  </span>
                )) : <p className="text-slate-400 italic">No extras selected.</p>}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-100">
            <button onClick={() => onNavigate(Page.QUOTE)} className="w-full sm:w-auto px-8 py-4 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-colors hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]">
              Edit Configuration
            </button>
            <button onClick={handleSend} className="w-full sm:w-auto px-12 py-5 bg-[rgb(61,141,122)] text-white rounded-2xl font-extrabold text-xl hover:bg-[rgb(45,110,95)] transition-all shadow-xl flex items-center justify-center hover:shadow-[0_0_20px_rgba(172,216,206,0.7)]">
              {user.isLoggedIn ? 'Commit to Database' : 'Send Quote'} <Send className="ml-3 w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteReview;
