export enum ParkingSpotStatus {
  Available = 'available',
  Occupied = 'occupied',
  Booked = 'booked', // Booked by the current user
}

export interface ParkingSpot {
  id: string;
  status: ParkingSpotStatus;
}

export enum MessageSender {
    User = 'user',
    AI = 'ai',
}

export interface ChatMessage {
    id: number;
    text: string;
    sender: MessageSender;
}

export interface ActiveBooking {
    spotId: string;
    endTime: Date;
    cost: number;
}
