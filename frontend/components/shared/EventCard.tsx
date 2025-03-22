"use client"; // Mark this as a client component

interface Event {
    startDateTime: string;
    endDateTime: string;
    title: string;
    location: string;
    description: string;
}

export default function EventCard({ event }: { event: Event }) {
    const addToCalendar = () => {
        const formatDateTimeForCalendar = (dateTime: string | number | Date) => {
            return new Date(dateTime).toISOString().replace(/[-:.]/g, "").slice(0, -1);
        };

        const startTime = formatDateTimeForCalendar(event.startDateTime);
        const endTime = formatDateTimeForCalendar(event.endDateTime);
        const title = encodeURIComponent(event.title);
        const location = encodeURIComponent(event.location);
        const description = encodeURIComponent(event.description);

        const googleCalendarUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${title}&dates=${startTime}/${endTime}&details=${description}&location=${location}`;
        window.open(googleCalendarUrl, "_blank");
    };

    return (
        <div className="event-card">
            {/* Event content can go here */}
            <div className="flex items-center ml-4">
                <p
                    className="text-primary-500 text-sm font-semibold cursor-pointer"
                    onClick={addToCalendar}
                >
                    Add to Calendar
                </p>
            </div>
        </div>
    );
}