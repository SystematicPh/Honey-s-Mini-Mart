"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client"
import type { Message, Profile } from "@/lib/types"
import { MessageCircle, User, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatUser {
  id: string
  username: string
  unreadCount: number
  lastMessage?: string
}

export default function AdminMessagesPage() {
  const [users, setUsers] = useState<ChatUser[]>([])
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // 🔥 LOAD USER + CONVERSATIONS
  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      setAdminProfile(profile)

      const { data: allMessages } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!sender_id(id, username),
          receiver:profiles!receiver_id(id, username)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false })

      const userMap = new Map<string, ChatUser>()

      allMessages?.forEach((msg) => {
        const otherUser =
          msg.sender_id === user.id
            ? { id: msg.receiver_id, username: (msg.receiver as any)?.username || "Unknown" }
            : { id: msg.sender_id, username: (msg.sender as any)?.username || "Unknown" }

        if (!userMap.has(otherUser.id)) {
          userMap.set(otherUser.id, {
            id: otherUser.id,
            username: otherUser.username,
            unreadCount: 0,
            lastMessage: msg.content,
          })
        }

        if (msg.receiver_id === user.id && !msg.is_read) {
          userMap.get(otherUser.id)!.unreadCount++
        }
      })

      setUsers(Array.from(userMap.values()))
    }

    fetchData()
  }, [])

  // 🔥 REALTIME
  useEffect(() => {
    if (!adminProfile) return

    const channel = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message

          if (
            selectedUser &&
            (msg.sender_id === selectedUser.id || msg.receiver_id === selectedUser.id)
          ) {
            setMessages((prev) => {
              const exists = prev.some((m) => m.id === msg.id)
              if (exists) return prev
              return [...prev, msg]
            })
          }

          const otherUserId =
            msg.sender_id === adminProfile.id
              ? msg.receiver_id
              : msg.sender_id

          setUsers((prev) =>
            prev.map((u) =>
              u.id === otherUserId
                ? {
                    ...u,
                    lastMessage: msg.content,
                    unreadCount:
                      msg.receiver_id === adminProfile.id
                        ? u.unreadCount + 1
                        : u.unreadCount,
                  }
                : u
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedUser, adminProfile])

  // 🔥 SELECT USER
  async function selectUser(user: ChatUser) {
    if (!adminProfile) return

    setSelectedUser(user)

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${adminProfile.id}),and(sender_id.eq.${adminProfile.id},receiver_id.eq.${user.id})`
      )
      .order("created_at", { ascending: true })

    if (!error) setMessages(data || [])

    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("sender_id", user.id)
      .eq("receiver_id", adminProfile.id)
      .eq("is_read", false)

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, unreadCount: 0 } : u))
    )
  }

  // 🔥 AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 🔥 SEND MESSAGE
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUser || !adminProfile) return

    const tempMessage: Message = {
      id: crypto.randomUUID(),
      sender_id: adminProfile.id,
      receiver_id: selectedUser.id,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
      is_read: false,
    }

    setMessages((prev) => [...prev, tempMessage])
    setNewMessage("")

    await supabase.from("messages").insert({
      sender_id: adminProfile.id,
      receiver_id: selectedUser.id,
      content: tempMessage.content,
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Message Management</h1>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* USERS */}
        <Card className="h-[500px] overflow-y-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Conversations
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => selectUser(user)}
                  className={cn(
                    "flex w-full justify-between p-4 border-b hover:bg-muted/50",
                    selectedUser?.id === user.id && "bg-muted"
                  )}
                >
                  <div className="flex flex-col w-full">
                    <p className="font-medium text-left">{user.username}</p>

                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground truncate">
                        {user.lastMessage}
                      </p>
                    </div>
                  </div>

                  {user.unreadCount > 0 && (
                    <span className="h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                      {user.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* CHAT */}
        <Card className="lg:col-span-2 h-[500px] flex flex-col overflow-hidden">
          <CardHeader className="shrink-0">
            <CardTitle>
              {selectedUser?.username || "Select a conversation"}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
            {selectedUser ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "flex",
                        m.sender_id === adminProfile?.id
                          ? "justify-end"
                          : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "px-3 py-2 rounded-lg max-w-[80%] text-sm break-words",
                          m.sender_id === adminProfile?.id
                            ? "bg-primary text-white"
                            : "bg-muted"
                        )}
                      >
                        <p>{m.content}</p>
                        <span className="text-[10px] opacity-60 block mt-1">
                          {new Date(m.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="flex gap-2 p-3 border-t shrink-0 bg-background"
                >
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type message..."
                  />
                  <Button type="submit">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-muted-foreground">
                Select a chat
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}