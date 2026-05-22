"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import type { Message, Profile } from "@/lib/types"
import { Send, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [profile, setProfile] = useState<Profile | null>(null)
  const [adminId, setAdminId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    // Fetch the profile and messages
    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      setProfile(profileData)

      const { data: adminData } = await supabase
        .from("profiles")
        .select("id")
        .eq("is_admin", true)
        .limit(1)
        .single()

      if (!adminData) return

      setAdminId(adminData.id)

      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true })

      setMessages(messagesData || [])
    }

    fetchData()

    // Setup real-time subscription
    const channel = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new as Message

          // Only update messages if the new message is related to the current conversation
          setMessages((prevMessages) => [
            ...prevMessages,
            newMessage,
          ])
        }
      )
      .subscribe()

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    // Scroll to the bottom whenever a new message is added
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [messages])

  // 🚀 SEND MESSAGE
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()

    if (!profile || !adminId) return
    if (!newMessage.trim()) return

    // Create the message
    const { data: msg, error } = await supabase
      .from("messages")
      .insert({
        sender_id: profile.id,
        receiver_id: adminId,
        content: newMessage.trim() || null,
      })
      .select()
      .single()

    if (error || !msg) return

    // Clear the input after sending
    setNewMessage("")
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 h-[calc(100vh-80px)] md:h-auto">
      <Card className="flex h-[calc(100vh-120px)] md:h-[600px] flex-col overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Admin Support
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col p-0 min-h-0">
          {/* CHAT */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex",
                  m.sender_id === profile?.id
                    ? "justify-end"
                    : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "px-3 py-1.5 rounded-lg max-w-[80%] text-sm md:text-base",
                    m.sender_id === profile?.id
                      ? "bg-primary text-white"
                      : "bg-muted text-foreground"
                  )}
                >
                  {m.content && <p>{m.content}</p>}

                  <span className="text-xs opacity-70 block mt-1">
                    {new Date(m.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <form
            onSubmit={handleSendMessage}
            className="flex gap-2 p-2 md:p-4 border-t"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type message..."
              className="text-sm md:text-base"
            />

            <Button
              type="submit"
              disabled={!newMessage.trim()}
              className="text-sm md:text-base"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}