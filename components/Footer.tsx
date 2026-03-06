import React from 'react';
import { Page } from '../types';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[rgb(61,141,122)] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Airola Info */}
          <div className="col-span-1">
            <h3 className="text-2xl font-bold mb-4">Airola</h3>
            <p className="text-[rgb(172,216,206)] mb-4">
              Premium turnover cleaning for short-let and Airbnb hosts in London.
            </p>
            <p className="text-[rgb(172,216,206)] text-sm">
              • Fully insured 
            </p>
            <p className="text-[rgb(172,216,206)] text-sm">
              • Structured Systems
            </p>
            <p className="text-[rgb(172,216,206)] text-sm">
              • Host-first Service
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate(Page.LANDING); }} className="hover:text-gray-300">Home</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate(Page.PRICING); }} className="hover:text-gray-300">Packages</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate(Page.LANDING); }} className="hover:text-gray-300">Services</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate(Page.GIVEAWAY); }} className="hover:text-gray-300">Giveaway</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate(Page.ABOUT_US); }} className="hover:text-gray-300">About</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate(Page.CONTACT); }} className="hover:text-gray-300">Contact</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li><a href="mailto:hello@airola.co.uk" className="hover:text-gray-300">Contact@airola.co.uk</a></li>
              <li><a href="tel:+442079460123" className="hover:text-gray-300">+44 7925123219</a></li>
              <li>London, UK</li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-300">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-gray-300">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-gray-300">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center rgb(172,216,206)">
          <p>© 2025 Airola. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
