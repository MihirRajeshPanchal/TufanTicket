'use client';

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Ticket, ArrowLeft } from "lucide-react";
import { IUser } from "@/types";

interface EventPassProps {
  eventId: string;
  eventName: string;
  user: IUser;
  eventDate: string;
}

export default function EventPass({
  eventId,
  eventName,
  user,
  eventDate,
}: EventPassProps) {
  const qrValue = JSON.stringify({
    eventId,
    userId: user._id,
    timestamp: new Date().toISOString()
  });

  const formattedName = `${user.firstName} ${user.lastName}`
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-900 via-blue-900/90 to-blue-950 flex items-center justify-center">
      <button 
        onClick={() => window.history.back()} 
        className="absolute top-6 left-6 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all flex items-center gap-2"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </button>

      <div className="relative w-full max-w-md mx-auto px-4">
        <div className="w-full sm:max-w-[960px] md:max-w-[880px] mx-auto">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-16 flex flex-col items-center">
            <div className="w-full h-8 bg-zinc-800 rounded-t-lg" />
            <div className="w-3/4 h-8 bg-zinc-900" />
          </div>

          <div className="group perspective animate-gentle-sway origin-top">
            <div className="relative transform-gpu transition-transform duration-700 preserve-3d">
              <div className="relative w-full aspect-[3/5] sm:aspect-[3/4] md:aspect-[3/5] lg:aspect-[2.5/3] rounded-xl overflow-hidden backface-hidden bg-black shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-blue-900/20" />

                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-blue-600/30 via-blue-400/10 to-transparent animate-pulse" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-blue-600/30 via-blue-500/10 to-transparent animate-pulse" />

                <div className="absolute inset-0 flex flex-col items-center justify-between p-6 sm:p-8">
                  <div className="w-full text-center space-y-4 xm:space-y-2">
                    <Ticket
                      className="w-10 h-10 mx-auto text-blue-400/90 xm:w-8 xm:h-8"
                      strokeWidth={1.5}
                    />
                    <div className="space-y-2">
                      <div className="w-20 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent mx-auto" />
                      <h1 className="text-2xl xm:text-xl font-bold tracking-wider bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent">
                        {eventName.split(" ").map((word, i) => (
                          <React.Fragment key={i}>
                            {word}
                            <br />
                          </React.Fragment>
                        ))}
                      </h1>
                      <div className="w-20 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent mx-auto" />
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <h2 className="text-xl xm:text-lg font-medium text-white/90">
                      {formattedName}
                    </h2>
                    <div className="px-4 py-1 rounded-full bg-blue-500/10 backdrop-blur-sm border border-blue-400/20">
                      <p className="text-sm font-medium text-white/90">
                        {eventDate}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2 rounded-lg bg-white/95 backdrop-blur-sm shadow-lg">
                      <QRCodeSVG
                        value={qrValue}
                        size={120}
                        className="rounded w-[100px] h-[100px] sm:w-[120px] sm:h-[120px]"
                      />
                    </div>
                    <p className="text-xs font-medium text-blue-200/80">
                      Scan to verify
                    </p>
                  </div>
                </div>

                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
                <div className="absolute top-6 left-6 w-2 h-2 rounded-full bg-blue-400/50" />
                <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-blue-400/50" />
                <div className="absolute bottom-6 left-6 w-2 h-2 rounded-full bg-blue-400/50" />
                <div className="absolute bottom-6 right-6 w-2 h-2 rounded-full bg-blue-400/50" />
              </div>

              <div className="absolute inset-0 w-full aspect-[3/5] sm:aspect-[3/4] md:aspect-[3/5] lg:aspect-[2.5/3] rounded-xl overflow-hidden backface-hidden rotate-y-180 bg-black">
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-blue-600/30 via-blue-500/10 to-transparent animate-pulse" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-blue-600/30 via-blue-500/10 to-transparent animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="text-center space-y-6">
                    <h3 className="text-lg font-medium text-blue-200">
                      Event Guidelines
                    </h3>
                    <ul className="text-sm space-y-3 text-blue-100/90">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400/90" />
                        Valid only for dates shown
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400/90" />
                        Non-transferable
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400/90" />
                        Please bring ID
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400/90" />
                        No recording devices
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 