"use client";
import { useState } from "react";
import axios from "axios";

interface Event {
    startDateTime: string;
    endDateTime: string;
    title: string;
    location: string;
    description: string;
}

export default function EventLocation({ event }: { event: Event }) {
    const [loading, setLoading] = useState(false);

    const goToMaps = async () => {
        if (event.location === "Online") return;

        setLoading(true);
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/search`,
                {
                    params: {
                        q: event.location,
                        format: "json",
                        limit: 1,
                    },
                }
            );

            if (response.data.length > 0) {
                const { lat, lon } = response.data[0];
                const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
                window.open(googleMapsUrl, "_blank");
            } else {
                alert("Location not found.");
            }
        } catch (error) {
            console.error("Error fetching location:", error);
            alert("Failed to get location.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="event-card">
            <div className="flex items-center ml-4">
                {event.location === "Online" ? (
                    <p className="text-primary-500 text-sm font-semibold">
                        <a href="https://meet.google.com/vtr-bvvv-mac" target="_blank" rel="noopener noreferrer">
                            Join Meeting
                        </a>
                    </p>
                ) : (
                    <p
                        className={`text-primary-500 text-sm font-semibold cursor-pointer ${
                            loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={loading ? undefined : goToMaps}
                    >
                        {loading ? "Loading..." : "View on Maps"}
                    </p>
                )}
            </div>
        </div>
    );
}
