"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, MoreVertical, Phone, Video, Smile, Paperclip } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { messagesAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

interface Message {
    id: string
    text: string
    sender_name: string
    sender_image: string
    is_current_user: boolean
    created_at: string
}

interface SessionChatProps {
    sessionId: string
    sessionTitle: string
    attendeesCount: number
}

export function SessionChat({ sessionId, sessionTitle, attendeesCount }: SessionChatProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const { user } = useAuth()

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Fetch messages on mount
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setLoading(true)
                const data = await messagesAPI.getSessionMessages(sessionId)
                setMessages(data)
            } catch (error) {
                console.error("Failed to fetch messages:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchMessages()
    }, [sessionId])

    // Poll for new messages every 3 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const data = await messagesAPI.getSessionMessages(sessionId)
                setMessages(data)
            } catch (error) {
                console.error("Failed to fetch messages:", error)
            }
        }, 3000)

        return () => clearInterval(interval)
    }, [sessionId])

    const handleSendMessage = async () => {
        if (!newMessage.trim() || sending) return

        try {
            setSending(true)
            const sentMessage = await messagesAPI.sendSessionMessage(sessionId, newMessage)
            setMessages([...messages, sentMessage])
            setNewMessage("")
        } catch (error: any) {
            console.error("Failed to send message:", error)
            alert(error.response?.data?.detail || "Failed to send message")
        } finally {
            setSending(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    if (loading) {
        return (
            <div className="flex flex-col h-[500px] rounded-xl overflow-hidden border border-border bg-background/50 backdrop-blur-sm">
                <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Loading chat...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[500px] rounded-xl overflow-hidden border border-border bg-background/50 backdrop-blur-sm">
            {/* Chat Header - WhatsApp style */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">SC</span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm line-clamp-1">{sessionTitle}</h3>
                        <p className="text-xs text-muted-foreground">{attendeesCount} participants</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                        <Video size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                        <Phone size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                        <MoreVertical size={18} />
                    </Button>
                </div>
            </div>

            {/* Messages Container */}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-3"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            >
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground text-sm">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message, index) => {
                        const showAvatar = index === 0 || messages[index - 1].sender_name !== message.sender_name

                        return (
                            <div
                                key={message.id}
                                className={`flex items-end gap-2 ${message.is_current_user ? "flex-row-reverse" : ""}`}
                            >
                                {!message.is_current_user && showAvatar ? (
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                        <AvatarImage src={message.sender_image || "/placeholder.svg"} />
                                        <AvatarFallback>{message.sender_name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                ) : !message.is_current_user ? (
                                    <div className="w-8 flex-shrink-0" />
                                ) : null}

                                <div
                                    className={`max-w-[75%] px-3 py-2 rounded-2xl ${message.is_current_user
                                        ? "bg-primary text-primary-foreground rounded-br-md"
                                        : "bg-muted rounded-bl-md"
                                        }`}
                                >
                                    {!message.is_current_user && showAvatar && (
                                        <p className="text-xs font-medium text-primary mb-1">{message.sender_name}</p>
                                    )}
                                    <p className="text-sm leading-relaxed">{message.text}</p>
                                    <p
                                        className={`text-[10px] mt-1 text-right ${message.is_current_user ? "text-primary-foreground/70" : "text-muted-foreground"
                                            }`}
                                    >
                                        {formatTimestamp(message.created_at)}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input - WhatsApp style */}
            <div className="px-3 py-3 bg-background/80 border-t border-border">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-foreground flex-shrink-0"
                    >
                        <Smile size={20} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-foreground flex-shrink-0"
                    >
                        <Paperclip size={20} />
                    </Button>
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50 rounded-full px-4"
                        disabled={sending}
                    />
                    <Button
                        onClick={handleSendMessage}
                        size="icon"
                        className="h-9 w-9 rounded-full flex-shrink-0"
                        disabled={!newMessage.trim() || sending}
                    >
                        <Send size={18} />
                    </Button>
                </div>
            </div>
        </div>
    )
}