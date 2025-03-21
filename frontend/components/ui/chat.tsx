"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { Send, Sparkles, X, Calendar, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function AIEventFinder() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([])
  const [input, setInput] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (input.trim()) {
      setMessages((prev) => [...prev, { sender: "user", text: input }])
      setInput("")
      // Simulate bot response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "I found some events that might interest you! How about the Annual Tech Conference happening next weekend? It features workshops on AI and networking opportunities.",
          },
        ])
      }, 1000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="w-full sm:w-fit bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-md button"
        >
          <Sparkles className="mr-2 h-4 w-4" /> Find Your Event With AI
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="p-0 border-l border-gray-200 dark:border-gray-800 w-full sm:max-w-[50vw] overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <div>
              <h2 className="text-xl font-bold flex items-center">
                <Sparkles className="mr-2 h-5 w-5" /> AI Event Finder
              </h2>
              <p className="text-sm opacity-90">Discover the perfect events for you</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 dark:text-gray-400">
                <Calendar className="h-12 w-12 mb-4 text-indigo-500" />
                <h3 className="text-lg font-medium mb-2">Welcome to AI Event Finder</h3>
                <p className="max-w-md">
                  Tell me what kind of events you're interested in, your location, or any specific dates, and I'll help
                  you discover perfect events.
                </p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      setInput("Find tech events in New York this weekend")
                      setTimeout(() => handleSend(), 100)
                    }}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Tech events nearby
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      setInput("What music festivals are happening next month?")
                      setTimeout(() => handleSend(), 100)
                    }}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Upcoming festivals
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[80%] px-4 py-2 rounded-lg",
                        message.sender === "user"
                          ? "bg-indigo-600 text-white rounded-tr-none"
                          : "bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-tl-none",
                      )}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about events, locations, or dates..."
                className="flex-1 border-gray-300 dark:border-gray-700 focus-visible:ring-indigo-500"
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={!input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

