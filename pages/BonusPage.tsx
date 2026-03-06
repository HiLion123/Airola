import React from 'react';
import { Page } from '../types';

interface BonusPageProps {
  onNavigate: (page: Page) => void;
}

export const BonusPage: React.FC<BonusPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-[rgb(249,239,239)] text-gray-900 min-h-screen flex items-center justify-center text-center">
      <div>
        <h1 className="text-5xl font-bold mb-4">Unlock Your £25 Rebooking Bonus</h1>
        <p className="text-xl">Rebook within 10 days → get £25 credit</p>
      </div>
    </div>
  );
};
