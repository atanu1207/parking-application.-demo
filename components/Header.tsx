
import React from 'react';

interface HeaderProps {
  availableSpots: number;
  totalSpots: number;
}

const Header: React.FC<HeaderProps> = ({ availableSpots, totalSpots }) => {
  const occupancyPercentage = totalSpots > 0 ? ((totalSpots - availableSpots) / totalSpots) * 100 : 0;

  const getStatusColor = () => {
    if (occupancyPercentage > 85) return 'bg-red-500';
    if (occupancyPercentage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm p-4 sticky top-0 z-10 border-b border-gray-700">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">
          ParkWise AI
        </h1>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="font-semibold text-lg">{availableSpots} / {totalSpots}</p>
            <p className="text-sm text-gray-400">Available Spots</p>
          </div>
          <div className="w-24 h-4 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getStatusColor()}`}
              style={{ width: `${occupancyPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
