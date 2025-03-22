'use client';

import React, { useState } from 'react';
import EventPass from './EventPass';
import { formatDateTime } from '@/lib/utils';

interface TicketModalProps {
  event: any;
  currentUser: any;
}

export default function TicketModal({ event, currentUser }: TicketModalProps) {
  const [showTicket, setShowTicket] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowTicket(true)}
        className="w-full rounded-full bg-primary-500 px-5 py-2 text-white hover:bg-primary-600 mt-4"
      >
        View Ticket
      </button>

      {showTicket && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl max-w-lg w-full mx-4">
            <EventPass
              eventId={event._id}
              eventName={event.title}
              user={currentUser}
              eventDate={formatDateTime(event.startDateTime).dateOnly}
            />
            <button
              onClick={() => setShowTicket(false)}
              className="mt-4 w-full rounded-full bg-gray-200 px-5 py-2 text-gray-700 hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
} 