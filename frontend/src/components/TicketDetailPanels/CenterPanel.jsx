import { useEffect, useMemo, useState } from "react";
import { MessageCircle, LockKeyhole, Send } from "lucide-react";

import api from "/src/api";
import { getCurrentUser } from "/src/utils/auth";
import { formatDate } from "/src/utils/formatDate";

export default function CenterPanel({ ticketId, canSend = true }) {
    const user = getCurrentUser();

    const [activeTab, setActiveTab] = useState("public");
    const [message, setMessage] = useState("");
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [sending, setSending] = useState(false);

    const isEmployee = user?.role === "Employee";

    useEffect(() => {
        if (!ticketId) return;

        fetchComments();

        const interval = setInterval(() => {
            fetchComments(false);
        }, 3000);

        return () => clearInterval(interval);
    }, [ticketId]);

    useEffect(() => {
        if (isEmployee && activeTab === "internal") setActiveTab("public");
    }, [isEmployee, activeTab]);

    const fetchComments = async (showLoading = true) => {
        if (!ticketId) return;

        try {
            if (showLoading) setLoadingComments(true);

            const response = await api.get(`/tickets/${ticketId}/comments/`);

            setComments(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (error) {
            console.error(
                "Failed to fetch comments:",
                error.response?.data || error
            );
        } finally {
            if (showLoading) setLoadingComments(false);
        }
    };
    
    const publicMessages = useMemo(() => comments.filter((comment) => comment.comment_type === "public_reply"), [comments]);
    const internalNotes = useMemo(() => comments.filter((comment) => comment.comment_type === "internal_note"), [comments]);

    const handleSend = async () => {
        const cleanMessage = message.trim();
        if (!canSend || !cleanMessage || !ticketId || sending) return;

        try {
            setSending(true);

            const response = await api.post(`/tickets/${ticketId}/comments/`, {
                message: cleanMessage,
                comment_type: activeTab === "internal" ? "internal_note" : "public_reply",
            });

            setComments((prev) => [...prev, response.data]);
            setMessage("");
        } catch (error) {
            console.error("Failed to send comment:", error.response?.data || error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex h-full min-w-0 flex-1 flex-col bg-white">
            <div className="shrink-0 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <MessageCircle size={20} className="text-gray-500" />
                            <h2 className="font-semibold text-black">Conversation</h2>
                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                            Communicate and share updates about this ticket.
                        </p>
                    </div>

                    {!isEmployee && (
                        <div className="flex shrink-0 items-center gap-1 rounded-lg bg-gray-100 p-1">
                            <button
                                type="button"
                                onClick={() => setActiveTab("public")}
                                className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition ${
                                    activeTab === "public"
                                        ? "bg-[#4C4CF9] text-white shadow-sm"
                                        : "text-gray-500 hover:bg-white hover:text-black"
                                }`}
                            >
                                <MessageCircle size={14} />
                                Public Conversation
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("internal")}
                                className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition ${
                                    activeTab === "internal"
                                        ? "bg-[#4C4CF9] text-white shadow-sm"
                                        : "text-gray-500 hover:bg-white hover:text-black"
                                }`}
                            >
                                <LockKeyhole size={14} />
                                Internal Notes
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {!isEmployee && activeTab === "internal" && (
                <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-6 py-3">
                    <div className="flex items-center gap-2">
                        <LockKeyhole size={15} className="text-amber-700" />
                        <p className="text-xs text-amber-800">
                            Internal notes are only visible to authorized IT personnel.
                        </p>
                    </div>
                </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                {loadingComments ? (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-gray-500">Loading conversation...</p>
                    </div>
                ) : activeTab === "public" ? (
                    publicMessages.length > 0 ? (
                        <div className="space-y-6">
                            {publicMessages.map((item) => (
                                <PublicMessage key={item.id} item={item} user={user} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState title="No messages yet" description="Start the conversation by sending a message." />
                    )
                ) : internalNotes.length > 0 ? (
                    <div className="space-y-4">
                        {internalNotes.map((item) => (
                            <InternalNote key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <EmptyState title="No internal notes yet" description="Add an internal note for IT personnel." />
                )}
            </div>

            {canSend ? (
                <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
                    <div className="flex items-end gap-3">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={sending}
                            rows={3}
                            maxLength={1000}
                            placeholder={activeTab === "public" ? "Type a message..." : "Write an internal note..."}
                            className="min-h-[88px] flex-1 resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10 disabled:bg-gray-100"
                        />

                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={!message.trim() || sending}
                            className={`flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium text-white transition ${
                                message.trim() && !sending
                                    ? "bg-[#4C4CF9] hover:bg-[#4242e8]"
                                    : "cursor-not-allowed bg-gray-300"
                            }`}
                        >
                            <Send size={16} />
                            {sending ? "Sending..." : "Send"}
                        </button>
                    </div>

                    <div className="mt-1 flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                            Press Enter to send, Shift + Enter for a new line.
                        </p>

                        <p className="text-xs text-gray-400">
                            {message.length}/1000
                        </p>
                    </div>
                </div>
            ) : (
                <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex items-center gap-2">
                        <LockKeyhole size={15} className="text-gray-400" />
                        <p className="text-xs text-gray-500">
                            This ticket is not assigned to you. You can view the conversation but cannot reply.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function PublicMessage({ item, user }) {
    const currentUserId = user?.id ?? user?.user_id ?? user?.pk;
    const currentUserName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();

    const sameId =
        currentUserId != null &&
        String(item.commented_by) === String(currentUserId);

    const sameName =
        currentUserName &&
        item.commented_by_name?.trim().toLowerCase() === currentUserName.toLowerCase();

    const isMine = sameId || sameName;
    const initials = getInitials(item.commented_by_name);

    return (
        <div className={`flex gap-3 ${isMine ? "justify-end" : "justify-start"}`}>
            {!isMine && <Avatar initials={initials} />}

            <div className={`max-w-[72%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                <div className={`mb-1 flex items-center gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                    <p className="text-sm font-semibold text-black">
                        {item.commented_by_name || "Unknown User"}
                    </p>

                    <span className="text-xs text-gray-400">
                        {item.commented_by_role || ""}
                    </span>
                </div>

                <div
                    className={`w-fit max-w-full rounded-xl px-4 py-2.5 text-sm leading-6 ${
                        isMine
                            ? "rounded-tr-sm bg-[#4C4CF9] text-white"
                            : "rounded-tl-sm bg-gray-100 text-black"
                    }`}
                >
                    <p className="whitespace-pre-wrap break-words">
                        {item.message}
                    </p>
                </div>

                <p className="mt-1.5 text-[11px] text-gray-400">
                    {formatDate(item.created_at)}
                </p>
            </div>

            {isMine && <Avatar initials={initials} mine />}
        </div>
    );
}

function InternalNote({ item }) {
    const initials = getInitials(item.commented_by_name);

    return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4">
            <div className="flex items-start gap-3">
                <Avatar initials={initials} />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-sm font-semibold text-black">
                            {item.commented_by_name || "Unknown User"}
                        </p>

                        <span className="text-xs text-gray-500">{item.commented_by_role || ""}</span>

                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700">
                            Internal Note
                        </span>
                    </div>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-black">
                        {item.message}
                    </p>

                    <p className="mt-2 text-[11px] text-gray-400">{formatDate(item.created_at)}</p>
                </div>
            </div>
        </div>
    );
}

function Avatar({ initials, mine = false }) {
    return (
        <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                mine
                    ? "bg-[#4C4CF9]/10 text-[#4C4CF9]"
                    : "bg-gray-100 text-gray-700"
            }`}
        >
            {initials}
        </div>
    );
}

function EmptyState({ title, description }) {
    return (
        <div className="flex h-full min-h-[220px] items-center justify-center">
            <div className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <MessageCircle size={18} className="text-gray-400" />
                </div>

                <p className="mt-3 text-sm font-medium text-black">{title}</p>
                <p className="mt-1 text-xs text-gray-500">{description}</p>
            </div>
        </div>
    );
}

function getInitials(name) {
    if (!name) return "?";
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
}