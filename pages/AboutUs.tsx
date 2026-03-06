import React from 'react';
import { Bed, Utensils, Paperclip, Zap, Siren, Hand } from 'lucide-react';
import { Page } from '../types';

interface AboutUsProps {
  onNavigate: (page: Page) => void;
}

const AboutUs: React.FC<AboutUsProps> = ({ onNavigate }) => {
  return (
    <>
      <main className="bg-[rgb(249,239,239)]">
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="relative rounded-lg shadow-lg">
              <img src="/young-housewife-is-wearing-yello.jpg" alt="Airola cleaning professional" className="w-full h-auto rounded-lg" />
              <div className="absolute inset-0 flex items-center justify-end">
                <div className="w-full md:w-1/2 lg:w-2/5 p-8 text-left">
                  <h1 className="text-5xl font-semibold text-slate-600 mb-2">About Us</h1>
                  <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                    Built for Hosts Who Value Peace of Mind
                  </h2>
                  <p className="text-base text-slate-600 leading-relaxed font-medium mb-8">
                    AIROLA was created to remove the stress from short-let turnovers. We focus on reliability, speed, clear pricing, and a host-first service. Whether you host one property or many — we make turnovers easy.
                  </p>
                  <button onClick={() => onNavigate(Page.CONTACT)} className="bg-slate-900 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-slate-800 transition-all duration-300">
                    Contact Us
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="pb-24 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[rgb(61,141,122)] mb-12 leading-tight text-center">
              <br></br>
              Feature Highlights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="flex items-start p-6 bg-white rounded-lg shadow-md transition-all duration-300 hover:scale-110">
                <Hand className="text-2xl mr-4" />
                <div>
                  <h3 className="text-xl font-bold text-[rgb(61,141,122)]">Professional Turnover Cleaning</h3>
                </div>
              </div>
              <div className="flex items-start p-6 bg-white rounded-lg shadow-md transition-all duration-300 hover:scale-110">
                <Bed className="text-2xl mr-4" />
                <div>
                  <h3 className="text-xl font-bold text-[rgb(61,141,122)]">Linen Change & Laundry Coordination</h3>
                </div>
              </div>
              <div className="flex items-start p-6 bg-white rounded-lg shadow-md transition-all duration-300 hover:scale-110">
                <Utensils className="text-2xl mr-4" />
                <div>
                  <h3 className="text-xl font-bold text-[rgb(61,141,122)]">Dishwashing & Kitchen Reset</h3>
                </div>
              </div>
              <div className="flex items-start p-6 bg-white rounded-lg shadow-md transition-all duration-300 hover:scale-110">
                <Paperclip className="text-2xl mr-4" />
                <div>
                  <h3 className="text-xl font-bold text-[rgb(61,141,122)]">Essentials Restocking (optional)</h3>
                </div>
              </div>
              <div className="flex items-start p-6 bg-white rounded-lg shadow-md transition-all duration-300 hover:scale-110">
                <Zap className="text-2xl mr-4" />
                <div>
                  <h3 className="text-xl font-bold text-[rgb(61,141,122)]">Priority Booking for Hosts</h3>
                </div>
              </div>
              <div className="flex items-start p-6 bg-white rounded-lg shadow-md transition-all duration-300 hover:scale-110">
                <Siren className="text-2xl mr-4" />
                <div>
                  <h3 className="text-xl font-bold text-[rgb(61,141,122)]">Emergency Cleans (subscription only)</h3>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default AboutUs;
