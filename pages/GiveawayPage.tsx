
import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { appendToSheet } from '../sheets';

interface GiveawayPageProps {
  onNavigate: (page: Page) => void;
}

export const GiveawayPage: React.FC<GiveawayPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [experience, setExperience] = useState('');
  const [exclusiveOffers, setExclusiveOffers] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const countdownDate = new Date();
    countdownDate.setDate(countdownDate.getDate() + 7);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = countdownDate.getTime() - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("EXPIRED");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone && !email) {
      alert('Please enter either a phone number or an email address.');
      return;
    }
    
    const sheetData = [
      new Date().toISOString(),
      name,
      phone,
      email,
      experience,
      exclusiveOffers ? 'Yes' : 'No'
    ];

    await appendToSheet('Sheet2', sheetData);

    alert("Thanks for entering the giveaway!");
    onNavigate(Page.BONUS);
  };

  return (
    <div className="bg-[rgb(249,239,239)] text-gray-900 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => onNavigate(Page.LANDING)} className="text-gray-900 mb-8 hover:text-[rgb(61,141,122)] transition-colors hover:drop-shadow-[0_0_5px_rgba(172,216,206,0.7)]">&larr; Back</button>
        <h1 className="text-5xl font-bold mb-4">Win a £1 Guest-Ready Turnover</h1>
        <p className="text-xl mb-8">Exclusively for Airbnb & Short-Let Hosts. Tell us about your worst turnover experience — we’ll make sure it never happens again.</p>
        
        <div className="text-right mb-8">
          <p className="text-lg font-bold text-red-500">{timeLeft}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12 text-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold">£1 Full Guest-Ready Turnover (Worth £59)</h2>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold">£25 Cleaning Credit</h2>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold">£15 cleaning Credit</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white text-[rgb(61,141,122)] p-8 rounded-lg shadow-lg">
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-bold mb-2">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 bg-gray-100 rounded text-gray-900 placeholder:text-gray-500"
              required
              placeholder="Your Name"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-bold mb-2">Phone</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 bg-gray-100 rounded text-gray-900 placeholder:text-gray-500"
              placeholder="Your Phone Number"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-gray-100 rounded text-gray-900 placeholder:text-gray-500"
              placeholder="Your Email Address"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="experience" className="block text-sm font-bold mb-2">Your Experience</label>
            <textarea
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full p-2 bg-gray-100 rounded text-gray-900 placeholder:text-gray-500"
              placeholder="Tell us about your best or worst turnover experience..."
              rows={4}
            />
          </div>
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exclusiveOffers}
                onChange={(e) => setExclusiveOffers(e.target.checked)}
                className="mr-2"
              />
              I want exclusive host offers
            </label>
          </div>
          <button type="submit" className="w-full bg-[rgb(61,141,122)] text-white font-bold py-3 px-4 rounded hover:bg-[rgb(45,110,95)] transition-all hover:shadow-[0_0_20px_rgba(172,216,206,0.7)]">
            Enter Giveaway
          </button>
        </form>
        <p className="text-sm text-gray-500 text-center mt-8">Entries close in 7 days • Limited to local hosts only</p>
      </div>
    </div>
  );
};
