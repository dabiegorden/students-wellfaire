"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search, MessageSquare, Plus, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSocket } from "@/context/socket-context";
import { useUser } from "@/context/user-context";
import { MessageBubble, type ChatMessage } from "./MessageBubble";
import {
  ConversationList,
  type ConversationItem,
} from "./ConversationList";
import { formatDistanceToNow } from "date-fns";

interface StudentItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId?: string;
}

export function ChatInterface() {
  const { user } = useUser();
  const { socket, isOnline, isSupportOnline } = useSocket();

  const isAdmin = user?.role === "admin";

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selected, setSelected] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherTyping, setOtherTyping] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedIdRef = useRef<string | null>(null);

  selectedIdRef.current = selected?._id || null;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Load conversation(s)
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/conversations", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (isAdmin) {
          setConversations(res.data.conversations || []);
        } else if (res.data.conversation) {
          setSelected(res.data.conversation);
        }
      } catch (err) {
        console.error("Failed to load conversations", err);
        toast.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    if (token) load();
  }, [token, isAdmin]);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (!selected?._id || !token) return;

    const loadMessages = async () => {
      try {
        const res = await axios.get(
          `/api/conversations/${selected._id}/messages`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Failed to load messages", err);
        toast.error("Failed to load messages");
      }
    };

    loadMessages();
    setOtherTyping(false);

    socket?.emit("conversation:join", selected._id);
    socket?.emit("message:read", { conversationId: selected._id });

    return () => {
      socket?.emit("conversation:leave", selected._id);
    };
  }, [selected?._id, token, socket]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: ChatMessage) => {
      const currentId = selectedIdRef.current;

      if (message.conversation === currentId) {
        setMessages((prev) => [...prev, message]);
        if (message.sender !== user?.id) {
          socket.emit("message:read", { conversationId: currentId });
        }
      }

      if (isAdmin) {
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c._id === message.conversation);
          if (idx === -1) return prev;
          const updated = [...prev];
          const conv = { ...updated[idx] };
          conv.lastMessage = message.content;
          conv.lastMessageAt = message.createdAt;
          conv.lastMessageSender = message.senderRole;
          if (message.conversation !== currentId && message.senderRole === "students") {
            conv.adminUnreadCount = (conv.adminUnreadCount || 0) + 1;
          } else if (message.conversation === currentId) {
            conv.adminUnreadCount = 0;
          }
          updated.splice(idx, 1);
          updated.unshift(conv);
          return updated;
        });
      }
    };

    const handleRead = ({
      conversationId,
      reader,
    }: {
      conversationId: string;
      reader: "students" | "admin";
    }) => {
      if (conversationId !== selectedIdRef.current) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.senderRole !== reader && !m.readAt
            ? { ...m, readAt: new Date().toISOString() }
            : m,
        ),
      );
    };

    const handleTyping = ({
      conversationId,
      userId,
      isTyping,
    }: {
      conversationId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      if (conversationId !== selectedIdRef.current || userId === user?.id)
        return;
      setOtherTyping(isTyping);
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:read", handleRead);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:read", handleRead);
      socket.off("typing", handleTyping);
    };
  }, [socket, isAdmin, user?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, otherTyping]);

  const loadStudents = async () => {
    if (!token) return;
    try {
      setStudentsLoading(true);
      const res = await axios.get("/api/students", {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 1000 },
      });
      setStudents(res.data.students || []);
    } catch (err) {
      console.error("Failed to load students", err);
      toast.error("Failed to load students");
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleOpenNewChat = () => {
    setShowNewChat(true);
    if (students.length === 0) loadStudents();
  };

  const handleStartConversation = async (student: StudentItem) => {
    if (!token) return;

    const existing = conversations.find((c) => c.student?._id === student._id);
    if (existing) {
      setSelected(existing);
      setShowNewChat(false);
      return;
    }

    try {
      const res = await axios.post(
        "/api/conversations",
        { studentId: student._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const conversation: ConversationItem = res.data.conversation;
      setConversations((prev) => [conversation, ...prev]);
      setSelected(conversation);
      setShowNewChat(false);
    } catch (err) {
      console.error("Failed to start conversation", err);
      toast.error("Failed to start conversation");
    }
  };

  const handleSend = () => {
    const content = input.trim();
    if (!content || !selected?._id) return;

    if (!socket || !socket.connected) {
      toast.error("Not connected to chat server. Please refresh the page.");
      return;
    }

    const conversationId = selected._id;

    socket.emit(
      "message:send",
      { conversationId, content },
      (response: { error?: string; message?: ChatMessage }) => {
        if (response?.error) {
          toast.error(response.error);
        }
      },
    );

    setInput("");
    socket.emit("typing", {
      conversationId,
      isTyping: false,
    });
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (!socket || !selected?._id) return;

    socket.emit("typing", { conversationId: selected._id, isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        conversationId: selected._id,
        isTyping: false,
      });
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <div className="relative h-10 w-10 animate-spin rounded-full border-4 border-zinc-800 border-t-emerald-400" />
      </div>
    );
  }

  const headerName = isAdmin
    ? selected
      ? `${selected.student?.firstName} ${selected.student?.lastName}`
      : "Select a conversation"
    : "Student Wellfaire Support";

  const headerOnline = isAdmin
    ? selected
      ? isOnline(selected.student?._id)
      : false
    : isSupportOnline;

  const headerInitials = isAdmin
    ? selected
      ? `${selected.student?.firstName?.charAt(0) || ""}${selected.student?.lastName?.charAt(0) || ""}`.toUpperCase()
      : "?"
    : "SW";

  return (
    <div className="flex h-[calc(100vh-10rem)] overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-950/60 backdrop-blur-xl">
      {isAdmin && (
        <div className="flex w-full max-w-xs flex-col border-r border-zinc-800/50">
          <div className="border-b border-zinc-800/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {showNewChat ? "New Message" : "Messages"}
              </h2>
              {showNewChat ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-white"
                  onClick={() => setShowNewChat(false)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-white"
                  onClick={handleOpenNewChat}
                  title="Message a student"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="border-zinc-800 bg-zinc-900 pl-9 text-sm text-white placeholder:text-zinc-500"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {showNewChat ? (
              studentsLoading ? (
                <div className="flex items-center justify-center p-6 text-sm text-zinc-500">
                  Loading students...
                </div>
              ) : (
                <div className="flex flex-col overflow-y-auto">
                  {students
                    .filter((s) => {
                      if (!search) return true;
                      const name = `${s.firstName} ${s.lastName}`.toLowerCase();
                      return (
                        name.includes(search.toLowerCase()) ||
                        s.email?.toLowerCase().includes(search.toLowerCase()) ||
                        s.studentId?.toLowerCase().includes(search.toLowerCase())
                      );
                    })
                    .map((student) => {
                      const initials = `${student.firstName?.charAt(0) || ""}${student.lastName?.charAt(0) || ""}`.toUpperCase();
                      return (
                        <button
                          key={student._id}
                          onClick={() => handleStartConversation(student)}
                          className="flex items-center gap-3 border-b border-zinc-800/50 px-4 py-3 text-left transition-colors hover:bg-zinc-800/50"
                        >
                          <div className="relative shrink-0">
                            <Avatar className="h-11 w-11 border-2 border-linear-to-br from-emerald-400 to-teal-600">
                              <AvatarFallback className="bg-linear-to-br from-emerald-400 to-teal-600 text-zinc-950 font-bold text-sm">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <span
                              className={cn(
                                "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-950",
                                isOnline(student._id)
                                  ? "bg-emerald-400"
                                  : "bg-zinc-600",
                              )}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="truncate text-xs text-zinc-400">
                              {student.email}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  {students.length === 0 && (
                    <div className="flex items-center justify-center p-6 text-center text-sm text-zinc-500">
                      No students found.
                    </div>
                  )}
                </div>
              )
            ) : (
              <ConversationList
                conversations={conversations}
                selectedId={selected?._id || null}
                onSelect={setSelected}
                isOnline={isOnline}
                search={search}
              />
            )}
          </ScrollArea>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        {(!isAdmin || selected) ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-zinc-800/50 p-4">
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-linear-to-br from-emerald-400 to-teal-600">
                  <AvatarFallback className="bg-linear-to-br from-emerald-400 to-teal-600 text-zinc-950 font-bold text-sm">
                    {headerInitials}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-950",
                    headerOnline ? "bg-emerald-400" : "bg-zinc-600",
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {headerName}
                </p>
                <p className="text-xs text-zinc-400">
                  {otherTyping
                    ? "typing..."
                    : headerOnline
                      ? "Online"
                      : isAdmin && selected?.student?.lastSeen
                        ? `Last seen ${formatDistanceToNow(
                            new Date(selected.student.lastSeen),
                            { addSuffix: true },
                          )}`
                        : "Offline"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-3">
                {messages.length === 0 && (
                  <div className="flex flex-1 items-center justify-center py-10 text-center text-sm text-zinc-500">
                    No messages yet. Say hello!
                  </div>
                )}
                {messages.map((message) => (
                  <MessageBubble
                    key={message._id}
                    message={message}
                    isOwn={message.sender === user?.id}
                  />
                ))}
                {otherTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-zinc-800 px-4 py-2.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-zinc-800/50 p-4">
              <Input
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message..."
                className="border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-500"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-linear-to-r from-emerald-400 to-teal-500 text-zinc-950 hover:opacity-90 shrink-0"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-zinc-500">
            <MessageSquare className="h-12 w-12" />
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
