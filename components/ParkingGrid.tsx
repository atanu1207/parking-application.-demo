

import React from 'react';
import { ParkingSpot as ParkingSpotType } from '../types';
import ParkingSpot from './ParkingSpot';

interface ParkingGridProps {
  spots: ParkingSpotType[];
  // FIX: Changed onSpotClick parameter from 'id: string' to 'spot: ParkingSpotType' to match the expected type from the parent component and child component's callback.
  onSpotClick: (spot: ParkingSpotType) => void;
}

const ParkingGrid: React.FC<ParkingGridProps> = ({ spots, onSpotClick }) => {
  return (
    <div className="p-4 md:p-8">
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 md:gap-4">
        {spots.map((spot) => (
          <ParkingSpot key={spot.id} spot={spot} onClick={onSpotClick} />
        ))}
      </div>
    </div>
  );
};

export default ParkingGrid;
