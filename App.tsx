
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import ParkingGrid from './components/ParkingGrid';
import Chatbot from './components/Chatbot';
import { ParkingSpot, ParkingSpotStatus, ChatMessage, MessageSender, ActiveBooking } from './types';
import { getChatbotResponse } from './services/geminiService';
import { ClockIcon, DollarSignIcon } from './components/Icons';

const TOTAL_SPOTS = 50;

// Generate initial mock data for the parking lot
const generateInitialSpots = (): ParkingSpot[] => {
  return Array.from({ length: TOTAL_SPOTS }, (_, i) => {
    const section = String.fromCharCode(65 + Math.floor(i / 10)); // A, B, C...
    const number = (i % 10) + 1;
    return {
      id: `${section}${number}`,
      status: Math.random() < 0.7 ? ParkingSpotStatus.Available : ParkingSpotStatus.Occupied,
    };
  });
};


// --- Inlined BookingModal component ---
const BookingModal: React.FC<{
  spot: ParkingSpot;
  onConfirm: (spotId: string, duration: number, cost: number) => void;
  onCancel: () => void;
}> = ({ spot, onConfirm, onCancel }) => {
  const HOURLY_RATE = 5; // $5 per hour
  const [duration, setDuration] = useState(1); // Default to 1 hour
  const totalCost = duration * HOURLY_RATE;

  const handleConfirm = () => {
    onConfirm(spot.id, duration, totalCost);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 text-white border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-cyan-400">Book Parking Spot</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
        </div>
        <p className="text-lg mb-6">You are booking spot: <span className="font-bold text-xl text-yellow-400">{spot.id}</span></p>
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-3 text-gray-300">Select Duration:</h3>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="120" // Updated to allow up to 120 hours (5 days)
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="bg-gray-700 text-white font-semibold py-2 px-3 rounded-lg w-28 text-center tabular-nums">
              {duration} Hour{duration > 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg flex justify-between items-center mb-6">
            <span className="text-gray-400 text-lg">Total Cost:</span>
            <div className="flex items-center">
                <DollarSignIcon className="w-6 h-6 text-green-400 mr-1" />
                <span className="text-2xl font-bold text-green-400">${totalCost.toFixed(2)}</span>
            </div>
        </div>
        <div className="flex justify-end space-x-4">
          <button onClick={onCancel} className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
          <button onClick={handleConfirm} className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-500 transition-colors font-semibold">Confirm & Pay</button>
        </div>
      </div>
    </div>
  );
};

// --- Inlined BookingStatus component ---
const BookingStatus: React.FC<{
  booking: ActiveBooking;
  onEndParking: (penalty: number) => void;
}> = ({ booking, onEndParking }) => {
    const OVERSTAY_PENALTY_RATE = 10; // $10 per hour penalty
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    
    const formatTime = (totalSeconds: number): string => {
        if (totalSeconds < 0) totalSeconds = 0;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    const timeRemainingSeconds = Math.floor((booking.endTime.getTime() - currentTime.getTime()) / 1000);
    const isOverstaying = timeRemainingSeconds < 0;
    const overstaySeconds = isOverstaying ? -timeRemainingSeconds : 0;
    const penalty = isOverstaying ? Math.ceil(overstaySeconds / 3600) * OVERSTAY_PENALTY_RATE : 0;

    const handleEndParking = () => onEndParking(penalty);
  
    return (
        <div className="h-full w-full flex flex-col bg-gray-800">
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900"><h2 className="text-lg font-semibold text-cyan-400">My Booking</h2></div>
            <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                    <div className="bg-gray-700/50 p-4 rounded-lg text-center mb-6">
                        <p className="text-gray-400">You are parked at</p>
                        <p className="text-4xl font-bold text-yellow-400 tracking-wider">{booking.spotId}</p>
                    </div>
                    <div className="text-center mb-6">
                        <p className="text-gray-400 mb-2">Time Remaining</p>
                        <div className={`flex items-center justify-center text-5xl font-mono p-3 rounded-lg ${isOverstaying ? 'text-red-400 bg-red-900/50' : 'text-green-400 bg-green-900/50'}`}>
                           <ClockIcon className="w-10 h-10 mr-4" />
                           <span>{formatTime(timeRemainingSeconds)}</span>
                        </div>
                    </div>
                    {isOverstaying && (
                        <div className="text-center bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg animate-pulse">
                            <p className="font-semibold">You are overstaying!</p>
                            <p>Penalty applies: ${penalty.toFixed(2)}</p>
                        </div>
                    )}
                </div>
                <div className="mt-6">
                    <button onClick={handleEndParking} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-500 transition-colors">End Parking & Vacate</button>
                    <p className="text-xs text-center text-gray-500 mt-2">Any applicable penalty will be charged.</p>
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [spots, setSpots] = useState<ParkingSpot[]>(generateInitialSpots);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, text: "Welcome to ParkWise AI! Find and book your parking spot with ease. How can I help?", sender: MessageSender.AI }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleSpotClick = (spot: ParkingSpot) => {
    if (spot.status === ParkingSpotStatus.Available && !activeBooking) {
      setSelectedSpot(spot);
    } else if (activeBooking) {
        alert("You already have an active booking. Please end your current session before booking a new spot.");
    }
  };
  
  const handleConfirmBooking = (spotId: string, durationHours: number, cost: number) => {
    const endTime = new Date(new Date().getTime() + durationHours * 60 * 60 * 1000);
    setActiveBooking({ spotId, endTime, cost });
    setSpots(prevSpots => prevSpots.map(s => s.id === spotId ? { ...s, status: ParkingSpotStatus.Booked } : s));
    setSelectedSpot(null);
  };
  
  const handleCancelBooking = () => setSelectedSpot(null);

  const handleEndParking = (penalty: number) => {
    if (activeBooking) {
        let finalMessage = `Parking session for spot ${activeBooking.spotId} has ended.`;
        if (penalty > 0) {
            finalMessage += ` An overstay penalty of $${penalty.toFixed(2)} was applied.`
        }
        alert(finalMessage);
        setSpots(prevSpots => prevSpots.map(s => s.id === activeBooking.spotId ? { ...s, status: ParkingSpotStatus.Available } : s));
        setActiveBooking(null);
    }
  };

  const occupiedSpotsCount = useMemo(() => {
    return spots.filter((spot) => spot.status === ParkingSpotStatus.Occupied || spot.status === ParkingSpotStatus.Booked).length;
  }, [spots]);
  const availableSpotsCount = TOTAL_SPOTS - occupiedSpotsCount;

  const handleSendMessage = async (messageText: string) => {
    const newUserMessage: ChatMessage = { id: Date.now(), text: messageText, sender: MessageSender.User };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsChatLoading(true);

    try {
        const parkingStats = { available: availableSpotsCount, occupied: occupiedSpotsCount, total: TOTAL_SPOTS };
        const aiResponseText = await getChatbotResponse(messageText, messages, parkingStats, activeBooking);
        const newAiMessage: ChatMessage = { id: Date.now() + 1, text: aiResponseText, sender: MessageSender.AI };
        setMessages((prev) => [...prev, newAiMessage]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorAiMessage: ChatMessage = { id: Date.now() + 1, text: "Sorry, I encountered an error. Please try again.", sender: MessageSender.AI };
      setMessages((prev) => [...prev, errorAiMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Header availableSpots={availableSpotsCount} totalSpots={TOTAL_SPOTS} />
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {/* FIX: No code change needed here, but the 'handleSpotClick' function now correctly matches the expected 'onSpotClick' prop type of ParkingGrid. */}
          <ParkingGrid spots={spots} onSpotClick={handleSpotClick} />
        </div>
        <aside className="w-full lg:w-auto">
            {activeBooking ? (
                <BookingStatus booking={activeBooking} onEndParking={handleEndParking} />
            ) : (
                <Chatbot messages={messages} onSendMessage={handleSendMessage} isLoading={isChatLoading} />
            )}
        </aside>
      </main>
      {selectedSpot && <BookingModal spot={selectedSpot} onConfirm={handleConfirmBooking} onCancel={handleCancelBooking} />}
    </div>
  );
};

export default App;
