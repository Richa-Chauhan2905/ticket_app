declare class SeatService {
    createSeatsForShow(showId: string, totalSeats: number): Promise<void>;
    lockSeats(userId: string, seatIds: string[]): Promise<boolean>;
    confirmBooking(userId: string, seatIds: string[]): Promise<boolean>;
    releaseExpiryLocks(): Promise<void>;
    getSeatsByShow(showId: string): Promise<{
        id: string;
        showId: string;
        seatNumber: string;
        status: "available" | "locked" | "booked" | null;
        lockedBy: string | null;
        lockedAt: Date | null;
        bookedBy: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
}
export default SeatService;
//# sourceMappingURL=seat.services.d.ts.map