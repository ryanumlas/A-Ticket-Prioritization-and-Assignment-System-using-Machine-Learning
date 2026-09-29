import { useEffect, useMemo, useState } from "react";
import { MessageCircle, LockKeyhole, Send } from "lucide-react";

import api from "/src/api";
import { getCurrentUser } from "/src/utils/auth";
import { formatDate } from "/src/utils/formatDate";

export default function CenterPanel({
    ticketId,
    canSend = true,
    isUnderReview = false,
}) {
    const user = getCurrentUser();

    const [activeTab, setActiveTab] = useState("public");
    const [message, setMessage] = useState("");
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [sending, setSending] = useState(false);

    const isEmployee = user?.role === "Employee";
    const canReply = canSend && !isUnderReview;

    useEffect(() => {
        if (!ticketId) return;

        fetchComments();

        const interval = setInterval(() => {
            fetchComments(false);
        }, 3000);

        return () => clearInterval(interval);
    }, [ticketId]);

    useEffect(() => {
        if (isEmployee && activeTab === "internal") {
            setActiveTab("public");
        }
    }, [isEmployee, activeTab]);

    useEffect(() => {
        if (isUnderReview) {
            setMessage("");
        }
    }, [isUnderReview]);

    const fetchComments = async (showLoading = true) => {
        if (!ticketId) return;

        try {
            if (showLoading) {
                setLoadingComments(true);
            }

            const response = await api.get(
                `/tickets/${ticketId}/comments/`
            );

            setComments(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

            // Mark the conversation as read after
            // the comments have been successfully loaded.
            await markCommentsAsRead();
        } catch (error) {
            console.error(
                "Failed to fetch comments:",
                error.response?.data || error
            );
        } finally {
            if (showLoading) {
                setLoadingComments(false);
            }
        }
    };

    const markCommentsAsRead = async () => {
        if (!ticketId) return;

        try {
            await api.post(
                `/tickets/${ticketId}/comments/mark-read/`
            );
        } catch (error) {
            console.error(
                "Failed to mark comments as read:",
                error.response?.data || error
            );
        }
    };

    const publicMessages = useMemo(
        () =>
            comments.filter(
                (comment) =>
                    comment.comment_type === "public_reply"
            ),
        [comments]
    );

    const internalNotes = useMemo(
        () =>
            comments.filter(
                (comment) =>
                    comment.comment_type === "internal_note"
            ),
        [comments]
    );

    const handleSend = async () => {
        const cleanMessage = message.trim();

        if (
            !canReply ||
            !cleanMessage ||
            !ticketId ||
            sending
        ) {
            return;
        }

        try {
            setSending(true);

            const response = await api.post(
                `/tickets/${ticketId}/comments/`,
                {
                    message: cleanMessage,
                    comment_type:
                        activeTab === "internal"
                            ? "internal_note"
                            : "public_reply",
                }
            );

            setComments((prev) => [
                ...prev,
                response.data,
            ]);

            setMessage("");
        } catch (error) {
            console.error(
                "Failed to send comment:",
                error.response?.data || error
            );
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
        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden border-l border-gray-200 bg-white">

            {/* Header */}
            <div className="box-border h-auto shrink-0 border-b border-gray-200 px-4 py-4 min-[1280px]:max-[1535px]:h-[70px] min-[1280px]:max-[1535px]:px-4 min-[1280px]:max-[1535px]:py-3 2xl:px-6 min-[1536px]:max-[1599px]:h-[88px]">
                <div className="flex min-w-0 items-center justify-between gap-3">

                    {/* Header Title */}
                    <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-3 min-[1280px]:max-[1535px]:gap-2.5">
                            <MessageCircle
                                size={20}
                                className="shrink-0 text-[#2563EB] min-[1280px]:max-[1535px]:size-[18px]"
                            />

                            <h2 className="truncate font-semibold text-black min-[1280px]:max-[1535px]:text-[13px]">
                                Conversation
                            </h2>
                        </div>

                        <p className="mt-1 break-words text-xs text-gray-500 min-[1280px]:max-[1535px]:text-[11px]">
                            Communicate and share updates about this ticket.
                        </p>
                    </div>

                    {/* Tabs */}
                    {!isEmployee && (
                        <div className="flex shrink-0 items-center gap-1 rounded-lg bg-gray-100 p-1">

                            <button
                                type="button"
                                onClick={() =>
                                    setActiveTab("public")
                                }
                                className={`flex items-center justify-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium transition 2xl:gap-2 2xl:px-3 min-[1280px]:max-[1535px]:gap-1 min-[1280px]:max-[1535px]:px-2 min-[1280px]:max-[1535px]:py-1.5 ${
                                    activeTab === "public"
                                        ? "bg-[#4C4CF9] text-white shadow-sm"
                                        : "text-gray-500 hover:bg-white hover:text-black"
                                }`}
                            >

                                <MessageCircle
                                    size={14}
                                    className="shrink-0 min-[1280px]:max-[1535px]:size-[13px]"
                                />

                                <span className="truncate">
                                    Public
                                </span>

                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setActiveTab("internal")
                                }
                                className={`flex items-center justify-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium transition 2xl:gap-2 2xl:px-3 min-[1280px]:max-[1535px]:gap-1 min-[1280px]:max-[1535px]:px-2 min-[1280px]:max-[1535px]:py-1.5 ${
                                    activeTab === "internal"
                                        ? "bg-[#4C4CF9] text-white shadow-sm"
                                        : "text-gray-500 hover:bg-white hover:text-black"
                                }`}
                            >

                                <LockKeyhole
                                    size={14}
                                    className="shrink-0 min-[1280px]:max-[1535px]:size-[13px]"
                                />

                                <span className="truncate">
                                    Internal
                                </span>

                            </button>

                        </div>
                    )}

                </div>
            </div>

            {/* Internal Notes Notice */}
            {!isEmployee && activeTab === "internal" && (
                <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-3 2xl:px-6 min-[1280px]:max-[1535px]:px-4 min-[1280px]:max-[1535px]:py-2.5">

                    <div className="flex min-w-0 items-start gap-2">

                        <LockKeyhole
                            size={15}
                            className="mt-0.5 shrink-0 text-amber-700 min-[1280px]:max-[1535px]:size-[14px]"
                        />

                        <p className="break-words text-xs text-amber-800 min-[1280px]:max-[1535px]:text-[11px]">
                            Internal notes are only visible to authorized IT personnel.
                        </p>

                    </div>

                </div>
            )}

            {/* Ticket Under Review Notice */}
            {isUnderReview && (
                <div className="shrink-0 border-b border-blue-200 bg-blue-50 px-4 py-3 2xl:px-6 min-[1280px]:max-[1535px]:px-4 min-[1280px]:max-[1535px]:py-2.5">

                    <div className="flex min-w-0 items-start gap-2">

                        <LockKeyhole
                            size={15}
                            className="mt-0.5 shrink-0 text-blue-700 min-[1280px]:max-[1535px]:size-[14px]"
                        />

                        <div className="min-w-0">

                            <p className="text-xs font-medium text-blue-800 min-[1280px]:max-[1535px]:text-[11px]">
                                Pending Service Desk Review
                            </p>

                            <p className="mt-0.5 break-words text-xs leading-5 text-blue-700 min-[1280px]:max-[1535px]:text-[11px] min-[1280px]:max-[1535px]:leading-4">
                                This ticket has been returned to the Service Desk.
                                You can view the conversation, but new messages
                                are temporarily disabled.
                            </p>

                        </div>

                    </div>

                </div>
            )}

            {/* Conversation */}
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 2xl:px-6 min-[1280px]:max-[1535px]:px-4 min-[1280px]:max-[1535px]:py-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">

                {loadingComments ? (
                    <div className="flex h-full items-center justify-center">

                        <p className="text-sm text-gray-500">
                            Loading conversation...
                        </p>

                    </div>
                ) : activeTab === "public" ? (
                    publicMessages.length > 0 ? (
                        <div className="space-y-6 min-[1280px]:max-[1535px]:space-y-4">

                            {publicMessages.map((item) => (
                                <PublicMessage
                                    key={item.id}
                                    item={item}
                                    user={user}
                                />
                            ))}

                        </div>
                    ) : (
                        <EmptyState
                            title="No messages yet"
                            description={
                                isUnderReview
                                    ? "No public messages have been added."
                                    : "Start the conversation by sending a message."
                            }
                        />
                    )
                ) : internalNotes.length > 0 ? (
                    <div className="space-y-4 min-[1280px]:max-[1535px]:space-y-3">

                        {internalNotes.map((item) => (
                            <InternalNote
                                key={item.id}
                                item={item}
                                user={user}
                            />
                        ))}

                    </div>
                ) : (
                    <EmptyState
                        title="No internal notes yet"
                        description={
                            isUnderReview
                                ? "No internal notes have been added."
                                : "Add an internal note for IT personnel."
                        }
                    />
                )}

            </div>

            {/* Composer */}
            {canReply ? (
                <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-4 2xl:px-6 min-[1280px]:max-[1535px]:px-4 min-[1280px]:max-[1535px]:py-3">

                    <div className="flex items-end gap-2.5 min-[1280px]:max-[1535px]:gap-2">

                        <textarea
                            value={message}
                            onChange={(e) =>
                                setMessage(e.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            disabled={sending}
                            rows={3}
                            maxLength={1000}
                            placeholder={
                                activeTab === "public"
                                    ? "Type a message..."
                                    : "Write an internal note..."
                            }
                            className="min-h-[82px] min-w-0 flex-1 resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10 disabled:bg-gray-100 min-[1280px]:max-[1535px]:min-h-[68px] min-[1280px]:max-[1535px]:px-2.5 min-[1280px]:max-[1535px]:py-2 min-[1280px]:max-[1535px]:text-[13px]"
                        />

                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={!message.trim() || sending}
                            className={`flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-white transition min-[1280px]:max-[1535px]:h-9 min-[1280px]:max-[1535px]:gap-1.5 min-[1280px]:max-[1535px]:px-3 min-[1280px]:max-[1535px]:text-[13px] ${
                                message.trim() && !sending
                                    ? "bg-[#4C4CF9] hover:bg-[#4242e8]"
                                    : "cursor-not-allowed bg-gray-300"
                            }`}
                        >

                            <Send
                                size={16}
                                className="min-[1280px]:max-[1535px]:size-[14px]"
                            />

                            <span className="hidden 2xl:inline">
                                {sending
                                    ? "Sending..."
                                    : "Send"}
                            </span>

                        </button>

                    </div>

                    <div className="mt-1 flex min-w-0 items-center justify-between gap-3">

                        <p className="min-w-0 truncate text-xs text-gray-400 min-[1280px]:max-[1535px]:text-[11px]">
                            Press Enter to send, Shift + Enter for a new line.
                        </p>

                        <p className="shrink-0 text-xs text-gray-400 min-[1280px]:max-[1535px]:text-[11px]">
                            {message.length}/1000
                        </p>

                    </div>

                </div>
            ) : (
                <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-4 py-4 2xl:px-6 min-[1280px]:max-[1535px]:px-4 min-[1280px]:max-[1535px]:py-3">

                    <div className="flex min-w-0 items-start gap-2">

                        <LockKeyhole
                            size={15}
                            className="mt-0.5 shrink-0 text-gray-400 min-[1280px]:max-[1535px]:size-[14px]"
                        />

                        <p className="break-words text-xs leading-5 text-gray-500 min-[1280px]:max-[1535px]:text-[11px] min-[1280px]:max-[1535px]:leading-4">
                            {isUnderReview
                                ? "This ticket is currently under Service Desk review. You can view the conversation but cannot send new messages."
                                : "This ticket is not assigned to you. You can view the conversation but cannot reply."}
                        </p>

                    </div>

                </div>
            )}
        </div>
    );
}

function PublicMessage({ item, user }) {
    const currentUserId =
        user?.id ??
        user?.user_id ??
        user?.pk;

    const currentUserName =
        `${user?.first_name || ""} ${user?.last_name || ""}`.trim();

    const sameId =
        currentUserId != null &&
        String(item.commented_by) ===
            String(currentUserId);

    const sameName =
        currentUserName &&
        item.commented_by_name
            ?.trim()
            .toLowerCase() ===
        currentUserName.toLowerCase();

    const isMine = sameId || sameName;

    const initials = getInitials(
        item.commented_by_name
    );

    return (
        <div className={`flex min-w-0 gap-3 min-[1280px]:max-[1535px]:gap-2.5 ${isMine ? "justify-end" : "justify-start"}`}>

            {!isMine && (
                <Avatar initials={initials} />
            )}

            <div className={`flex min-w-0 max-w-[85%] flex-col 2xl:max-w-[72%] min-[1280px]:max-[1535px]:max-w-[82%] ${isMine ? "items-end" : "items-start"}`}>

                <div className={`mb-1 flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1 ${isMine ? "justify-end" : "justify-start"}`}>

                    <p className="max-w-full break-words text-sm font-semibold text-black min-[1280px]:max-[1535px]:text-[13px]">
                        {item.commented_by_name || "Unknown User"}
                    </p>

                    <span className="break-words text-xs text-gray-400 min-[1280px]:max-[1535px]:text-[11px]">
                        {item.commented_by_role || ""}
                    </span>

                </div>

                <div className={`w-fit max-w-full rounded-xl px-4 py-2.5 text-sm leading-6 min-[1280px]:max-[1535px]:px-3 min-[1280px]:max-[1535px]:py-2 min-[1280px]:max-[1535px]:text-[13px] min-[1280px]:max-[1535px]:leading-5 ${isMine ? "rounded-tr-sm bg-[#4C4CF9] text-white" : "rounded-tl-sm bg-gray-100 text-black"}`}>

                    <p className="whitespace-pre-wrap break-words">
                        {item.message}
                    </p>

                </div>

                <p className="mt-1.5 text-[11px] text-gray-400 min-[1280px]:max-[1535px]:mt-1">
                    {formatDate(item.created_at)}
                </p>

            </div>

            {isMine && (
                <Avatar
                    initials={initials}
                    mine
                />
            )}

        </div>
    );
}

function InternalNote({ item, user }) {
    const currentUserId =
        user?.id ??
        user?.user_id ??
        user?.pk;

    const currentUserName =
        `${user?.first_name || ""} ${user?.last_name || ""}`.trim();

    const sameId =
        currentUserId != null &&
        String(item.commented_by) ===
            String(currentUserId);

    const sameName =
        currentUserName &&
        item.commented_by_name
            ?.trim()
            .toLowerCase() ===
        currentUserName.toLowerCase();

    const isMine = sameId || sameName;

    const initials = getInitials(
        item.commented_by_name
    );

    return (
        <div className={`flex min-w-0 gap-3 min-[1280px]:max-[1535px]:gap-2.5 ${isMine ? "justify-end" : "justify-start"}`}>

            {!isMine && (
                <Avatar initials={initials} />
            )}

            <div className={`flex min-w-0 max-w-[85%] flex-col 2xl:max-w-[72%] min-[1280px]:max-[1535px]:max-w-[82%] ${isMine ? "items-end" : "items-start"}`}>

                <div className={`mb-1 flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1 ${isMine ? "justify-end" : "justify-start"}`}>

                    <p className="max-w-full break-words text-sm font-semibold text-black min-[1280px]:max-[1535px]:text-[13px]">
                        {item.commented_by_name || "Unknown User"}
                    </p>

                    <span className="break-words text-xs text-gray-400 min-[1280px]:max-[1535px]:text-[11px]">
                        {item.commented_by_role || ""}
                    </span>

                    <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700 min-[1280px]:max-[1535px]:px-1.5 min-[1280px]:max-[1535px]:text-[9px]">
                        Internal Note
                    </span>

                </div>

                <div className={`w-fit max-w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm leading-6 text-black min-[1280px]:max-[1535px]:px-3 min-[1280px]:max-[1535px]:py-2 min-[1280px]:max-[1535px]:text-[13px] min-[1280px]:max-[1535px]:leading-5 ${isMine ? "rounded-tr-sm" : "rounded-tl-sm"}`}>

                    <p className="whitespace-pre-wrap break-words">
                        {item.message}
                    </p>

                </div>

                <p className="mt-1.5 text-[11px] text-gray-400 min-[1280px]:max-[1535px]:mt-1">
                    {formatDate(item.created_at)}
                </p>

            </div>

            {isMine && (
                <Avatar
                    initials={initials}
                    mine
                />
            )}

        </div>
    );
}

function Avatar({ initials, mine = false }) {
    return (
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold min-[1280px]:max-[1535px]:h-8 min-[1280px]:max-[1535px]:w-8 min-[1280px]:max-[1535px]:text-[11px] ${mine ? "bg-[#4C4CF9]/10 text-[#4C4CF9]" : "bg-gray-100 text-gray-700"}`}>
            {initials}
        </div>
    );
}

function EmptyState({ title, description }) {
    return (
        <div className="flex h-full min-h-[220px] items-center justify-center min-[1280px]:max-[1535px]:min-h-[180px]">

            <div className="max-w-[280px] text-center">

                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 min-[1280px]:max-[1535px]:h-9 min-[1280px]:max-[1535px]:w-9">

                    <MessageCircle
                        size={18}
                        className="text-gray-400 min-[1280px]:max-[1535px]:size-[16px]"
                    />

                </div>

                <p className="mt-3 text-sm font-medium text-black min-[1280px]:max-[1535px]:mt-2 min-[1280px]:max-[1535px]:text-[13px]">
                    {title}
                </p>

                <p className="mt-1 break-words text-xs leading-5 text-gray-500 min-[1280px]:max-[1535px]:text-[11px] min-[1280px]:max-[1535px]:leading-4">
                    {description}
                </p>

            </div>

        </div>
    );
}

function getInitials(name) {
    if (!name) return "?";

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) =>
            part.charAt(0).toUpperCase()
        )
        .join("");
}