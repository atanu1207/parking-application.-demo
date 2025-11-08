import React from 'react';
import { ParkingSpot as ParkingSpotType, ParkingSpotStatus } from '../types';
import { CarIcon } from './Icons';

interface ParkingSpotProps {
  spot: ParkingSpotType;
  onClick: (spot: ParkingSpotType) => void;
}

const ParkingSpot: React.FC<ParkingSpotProps> = ({ spot, onClick }) => {
  const isAvailable = spot.status === ParkingSpotStatus.Available;
  const isOccupied = spot.status === ParkingSpotStatus.Occupied;
  const isBooked = spot.status === ParkingSpotStatus.Booked;

  const baseClasses = 'relative aspect-video rounded-lg flex flex-col items-center justify-center transition-all duration-300 transform shadow-lg border-2';
  
  let statusClasses = '';
  let statusText = '';
  
  if (isAvailable) {
    statusClasses = 'bg-green-500/20 border-green-500 hover:bg-green-500/40 cursor-pointer hover:scale-105';
    statusText = 'Free';
  } else if (isOccupied) {
    statusClasses = 'bg-red-500/30 border-red-500 cursor-not-allowed opacity-60';
    statusText = 'Taken';
  } else if (isBooked) {
    statusClasses = 'bg-cyan-500/30 border-cyan-400 ring-2 ring-offset-2 ring-offset-gray-900 ring-cyan-400 cursor-default';
    statusText = 'My Spot';
  }

  return (
    <div
      className={`${baseClasses} ${statusClasses}`}
      onClick={() => isAvailable && onClick(spot)}
      aria-disabled={!isAvailable}
    >
      <span className="font-bold text-lg md:text-xl text-gray-300">
        {spot.id}
      </span>
      {(isOccupied || isBooked) && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white">
          <CarIcon className={`w-8 h-8 md:w-12 md:h-12 ${isBooked ? 'opacity-90' : 'opacity-60'}`} />
        </div>
      )}
       <div className={`absolute bottom-2 text-xs font-semibold px-2 py-0.5 rounded-full text-white ${isAvailable ? 'bg-green-500/80' : isOccupied ? 'bg-red-500/80' : 'bg-cyan-500/80'}`}>
        {statusText}
      </div>
    </div>
  );
};

export default ParkingSpot;
