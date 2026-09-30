import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    MessageCircle,
    LockKeyhole,
    Send,
    ChevronDown,
} from "lucide-react";

import {
    AnimatePresence,
    motion,
} from "motion/react";

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

    // Shows the "new messages" down button
    const [showScrollButton, setShowScrollButton] =
        useState(false);

    const isEmployee = user?.role === "Employee";
    const canReply = canSend && !isUnderReview;

    // ------------------------------------------------------------
    // Refs
    // ------------------------------------------------------------

    const conversationRef = useRef(null);

    const commentsRef = useRef([]);

    const pendingMessageIdsRef = useRef(new Set());

    const lastCommentIdRef = useRef(0);

    const isNearBottomRef = useRef(true);

    const initialLoadRef = useRef(true);

    const pollingRef = useRef(false);

    // ------------------------------------------------------------
    // Keep commentsRef synchronized
    // ------------------------------------------------------------

    useEffect(() => {
        commentsRef.current = comments;
    }, [comments]);

    // ------------------------------------------------------------
    // Check whether user is near bottom
    // ------------------------------------------------------------

    const checkIfNearBottom = useCallback(() => {
        const element = conversationRef.current;

        if (!element) {
            return true;
        }

        const distanceFromBottom =
            element.scrollHeight -
            element.scrollTop -
            element.clientHeight;

        const nearBottom = distanceFromBottom <= 100;

        isNearBottomRef.current = nearBottom;

        if (nearBottom) {
            setShowScrollButton(false);
        }

        return nearBottom;
    }, []);

    // ------------------------------------------------------------
    // Scroll to bottom
    // ------------------------------------------------------------

    const scrollToBottom = useCallback(
        (behavior = "smooth") => {
            const element = conversationRef.current;

            if (!element) {
                return;
            }

            element.scrollTo({
                top: element.scrollHeight,
                behavior,
            });

            isNearBottomRef.current = true;
            setShowScrollButton(false);
        },
        []
    );

    // ------------------------------------------------------------
    // Scroll listener
    // ------------------------------------------------------------

    useEffect(() => {
        const element = conversationRef.current;

        if (!element) {
            return;
        }

        const handleScroll = () => {
            checkIfNearBottom();
        };

        element.addEventListener(
            "scroll",
            handleScroll,
            {
                passive: true,
            }
        );

        checkIfNearBottom();

        return () => {
            element.removeEventListener(
                "scroll",
                handleScroll
            );
        };
    }, [checkIfNearBottom]);

    // ------------------------------------------------------------
    // Mark comments as read
    // ------------------------------------------------------------

    const markCommentsAsRead = useCallback(async () => {
        if (!ticketId) {
            return;
        }

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
    }, [ticketId]);

    // ------------------------------------------------------------
    // Merge comments safely
    // ------------------------------------------------------------

    const mergeComments = useCallback(
        (incomingComments) => {
            if (!Array.isArray(incomingComments)) {
                return;
            }

            setComments((previousComments) => {
                const commentMap = new Map();

                // Existing comments
                previousComments.forEach((comment) => {
                    if (
                        comment?.id !== null &&
                        comment?.id !== undefined
                    ) {
                        commentMap.set(
                            comment.id,
                            comment
                        );
                    }
                });

                // Incoming comments replace existing copies
                incomingComments.forEach((comment) => {
                    if (
                        comment?.id !== null &&
                        comment?.id !== undefined
                    ) {
                        commentMap.set(
                            comment.id,
                            comment
                        );
                    }
                });

                // Preserve locally-added pending comments
                commentsRef.current.forEach((comment) => {
                    if (
                        comment?.id !== null &&
                        comment?.id !== undefined &&
                        pendingMessageIdsRef.current.has(
                            comment.id
                        )
                    ) {
                        if (!commentMap.has(comment.id)) {
                            commentMap.set(
                                comment.id,
                                comment
                            );
                        }
                    }
                });

                return Array.from(
                    commentMap.values()
                ).sort((a, b) => {
                    const dateA = new Date(
                        a.created_at
                    ).getTime();

                    const dateB = new Date(
                        b.created_at
                    ).getTime();

                    if (dateA !== dateB) {
                        return dateA - dateB;
                    }

                    return (
                        Number(a.id || 0) -
                        Number(b.id || 0)
                    );
                });
            });
        },
        []
    );

    // ------------------------------------------------------------
    // Initial comments load
    // ------------------------------------------------------------

    const loadInitialComments = useCallback(
        async () => {
            if (!ticketId) {
                return;
            }

            try {
                setLoadingComments(true);

                const response = await api.get(
                    `/tickets/${ticketId}/comments/`
                );

                const incomingComments =
                    Array.isArray(response.data)
                        ? response.data
                        : [];

                mergeComments(incomingComments);

                // Remember the newest comment.
                if (incomingComments.length > 0) {
                    const newestComment =
                        incomingComments[
                            incomingComments.length - 1
                        ];

                    lastCommentIdRef.current =
                        Number(newestComment.id) || 0;
                } else {
                    lastCommentIdRef.current = 0;
                }

                initialLoadRef.current = false;

                await markCommentsAsRead();

                // Start at the bottom when opening the ticket.
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        scrollToBottom("auto");
                    });
                });
            } catch (error) {
                console.error(
                    "Failed to fetch comments:",
                    error.response?.data || error
                );
            } finally {
                setLoadingComments(false);
            }
        },
        [
            ticketId,
            mergeComments,
            markCommentsAsRead,
            scrollToBottom,
        ]
    );

    // ------------------------------------------------------------
    // TRUE LONG POLLING
    // ------------------------------------------------------------

    useEffect(() => {
        if (!ticketId) {
            return;
        }

        let cancelled = false;

        // Reset ticket-specific state.
        initialLoadRef.current = true;
        pollingRef.current = false;
        lastCommentIdRef.current = 0;

        pendingMessageIdsRef.current.clear();

        isNearBottomRef.current = true;

        setShowScrollButton(false);
        setComments([]);
        setMessage("");
        setActiveTab("public");

        const startLongPolling = async () => {
            if (pollingRef.current) {
                return;
            }

            pollingRef.current = true;

            // ----------------------------------------------------
            // Initial load
            // ----------------------------------------------------

            await loadInitialComments();

            if (cancelled) {
                pollingRef.current = false;
                return;
            }

            // ----------------------------------------------------
            // Long-poll loop
            // ----------------------------------------------------

            while (!cancelled) {
                try {
                    const lastCommentId =
                        lastCommentIdRef.current;

                    const response = await api.get(
                        `/tickets/${ticketId}/comments/`,
                        {
                            params: {
                                last_comment_id:
                                    lastCommentId,
                            },
                        }
                    );

                    if (cancelled) {
                        break;
                    }

                    const newComments =
                        Array.isArray(response.data)
                            ? response.data
                            : [];

                    // ------------------------------------------------
                    // No new message
                    // ------------------------------------------------

                    if (newComments.length === 0) {
                        continue;
                    }

                    // ------------------------------------------------
                    // Remove returned comments from pending list
                    // ------------------------------------------------

                    newComments.forEach((comment) => {
                        if (
                            comment?.id !== null &&
                            comment?.id !== undefined
                        ) {
                            pendingMessageIdsRef.current.delete(
                                comment.id
                            );
                        }
                    });

                    // ------------------------------------------------
                    // Remember newest comment ID
                    // ------------------------------------------------

                    const newestComment =
                        newComments[
                            newComments.length - 1
                        ];

                    const newestCommentId =
                        Number(newestComment?.id) || 0;

                    if (
                        newestCommentId >
                        lastCommentIdRef.current
                    ) {
                        lastCommentIdRef.current =
                            newestCommentId;
                    }

                    // ------------------------------------------------
                    // Add new messages
                    // ------------------------------------------------

                    mergeComments(newComments);

                    // ------------------------------------------------
                    // Handle scrolling
                    // ------------------------------------------------

                    if (isNearBottomRef.current) {
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                scrollToBottom("smooth");
                            });
                        });
                    } else {
                        setShowScrollButton(true);
                    }

                    // ------------------------------------------------
                    // Mark conversation as read
                    // ------------------------------------------------

                    await markCommentsAsRead();
                } catch (error) {
                    if (cancelled) {
                        break;
                    }

                    console.error(
                        "Long polling failed:",
                        error.response?.data || error
                    );

                    // Give connection a short break before retrying.
                    await new Promise((resolve) =>
                        setTimeout(resolve, 2000)
                    );
                }
            }

            pollingRef.current = false;
        };

        startLongPolling();

        return () => {
            cancelled = true;
            pollingRef.current = false;
        };
    }, [
        ticketId,
        loadInitialComments,
        mergeComments,
        markCommentsAsRead,
        scrollToBottom,
    ]);

    // ------------------------------------------------------------
    // Employee cannot access internal notes
    // ------------------------------------------------------------

    useEffect(() => {
        if (
            isEmployee &&
            activeTab === "internal"
        ) {
            setActiveTab("public");
        }
    }, [isEmployee, activeTab]);

    // ------------------------------------------------------------
    // Clear composer when ticket goes under review
    // ------------------------------------------------------------

    useEffect(() => {
        if (isUnderReview) {
            setMessage("");
        }
    }, [isUnderReview]);

    // ------------------------------------------------------------
    // Filter comments
    // ------------------------------------------------------------

    const publicMessages = useMemo(
        () =>
            comments.filter(
                (comment) =>
                    comment.comment_type ===
                    "public_reply"
            ),
        [comments]
    );

    const internalNotes = useMemo(
        () =>
            comments.filter(
                (comment) =>
                    comment.comment_type ===
                    "internal_note"
            ),
        [comments]
    );

    // ------------------------------------------------------------
    // Send message
    // ------------------------------------------------------------

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

            const newComment = response.data;

            // Remember the sent message so it does not
            // temporarily disappear before long-poll returns it.
            if (
                newComment?.id !== null &&
                newComment?.id !== undefined
            ) {
                pendingMessageIdsRef.current.add(
                    newComment.id
                );

                const newId =
                    Number(newComment.id) || 0;

                if (
                    newId >
                    lastCommentIdRef.current
                ) {
                    lastCommentIdRef.current = newId;
                }
            }

            setComments((previousComments) => {
                const alreadyExists =
                    previousComments.some(
                        (comment) =>
                            comment.id ===
                            newComment?.id
                    );

                if (alreadyExists) {
                    return previousComments;
                }

                return [
                    ...previousComments,
                    newComment,
                ];
            });

            setMessage("");

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    scrollToBottom("smooth");
                });
            });

            await markCommentsAsRead();
        } catch (error) {
            console.error(
                "Failed to send comment:",
                error.response?.data || error
            );
        } finally {
            setSending(false);
        }
    };

    // ------------------------------------------------------------
    // Keyboard handling
    // ------------------------------------------------------------

    const handleKeyDown = (e) => {
        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {
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

                            <motion.div
                                initial={{
                                    opacity: 0,
                                    scale: 0.8,
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                }}
                                transition={{
                                    duration: 0.35,
                                    ease: "easeOut",
                                }}
                            >
                                <MessageCircle
                                    size={20}
                                    className="shrink-0 text-[#2563EB] min-[1280px]:max-[1535px]:size-[18px]"
                                />
                            </motion.div>

                            <motion.h2
                                initial={{
                                    opacity: 0,
                                    x: -8,
                                }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                }}
                                transition={{
                                    duration: 0.35,
                                    delay: 0.05,
                                }}
                                className="truncate font-semibold text-black min-[1280px]:max-[1535px]:text-[13px]"
                            >
                                Conversation
                            </motion.h2>

                        </div>

                        <motion.p
                            initial={{
                                opacity: 0,
                                y: -4,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                duration: 0.35,
                                delay: 0.1,
                            }}
                            className="mt-1 break-words text-xs text-gray-500 min-[1280px]:max-[1535px]:text-[11px]"
                        >
                            Communicate and share updates about this ticket.
                        </motion.p>

                    </div>

                    {/* Tabs */}
                    {!isEmployee && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                x: 10,
                            }}
                            animate={{
                                opacity: 1,
                                x: 0,
                            }}
                            transition={{
                                duration: 0.35,
                                delay: 0.1,
                            }}
                            className="flex shrink-0 items-center gap-1 rounded-lg bg-gray-100 p-1"
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    setActiveTab("public")
                                }
                                className={`relative flex items-center justify-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium transition 2xl:gap-2 2xl:px-3 min-[1280px]:max-[1535px]:gap-1 min-[1280px]:max-[1535px]:px-2 min-[1280px]:max-[1535px]:py-1.5 ${
                                    activeTab === "public"
                                        ? "text-white"
                                        : "text-gray-500 hover:text-black"
                                }`}
                            >

                                {activeTab === "public" && (
                                    <motion.span
                                        layoutId="conversation-tab"
                                        className="absolute inset-0 rounded-md bg-[#4C4CF9] shadow-sm"
                                        transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 35,
                                        }}
                                    />
                                )}

                                <MessageCircle
                                    size={14}
                                    className={`relative z-10 shrink-0 min-[1280px]:max-[1535px]:size-[13px] ${
                                        activeTab === "public"
                                            ? "text-white"
                                            : ""
                                    }`}
                                />

                                <span className="relative z-10 truncate">
                                    Public
                                </span>

                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setActiveTab("internal")
                                }
                                className={`relative flex items-center justify-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium transition 2xl:gap-2 2xl:px-3 min-[1280px]:max-[1535px]:gap-1 min-[1280px]:max-[1535px]:px-2 min-[1280px]:max-[1535px]:py-1.5 ${
                                    activeTab === "internal"
                                        ? "text-white"
                                        : "text-gray-500 hover:text-black"
                                }`}
                            >

                                {activeTab === "internal" && (
                                    <motion.span
                                        layoutId="conversation-tab"
                                        className="absolute inset-0 rounded-md bg-[#4C4CF9] shadow-sm"
                                        transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 35,
                                        }}
                                    />
                                )}

                                <LockKeyhole
                                    size={14}
                                    className={`relative z-10 shrink-0 min-[1280px]:max-[1535px]:size-[13px] ${
                                        activeTab === "internal"
                                            ? "text-white"
                                            : ""
                                    }`}
                                />

                                <span className="relative z-10 truncate">
                                    Internal
                                </span>

                            </button>

                        </motion.div>
                    )}

                </div>
            </div>

            {/* Internal Notes Notice */}
            <AnimatePresence initial={false}>
                {!isEmployee &&
                    activeTab === "internal" && (
                        <motion.div
                            initial={{
                                height: 0,
                                opacity: 0,
                            }}
                            animate={{
                                height: "auto",
                                opacity: 1,
                            }}
                            exit={{
                                height: 0,
                                opacity: 0,
                            }}
                            transition={{
                                duration: 0.22,
                                ease: "easeOut",
                            }}
                            className="shrink-0 overflow-hidden border-b border-amber-200 bg-amber-50"
                        >
                            <div className="px-4 py-3 2xl:px-6 min-[1280px]:max-[1535px]:px-4 min-[1280px]:max-[1535px]:py-2.5">

                                <div className="flex min-w-0 items-start gap-2">

                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            x: -5,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                        }}
                                    >
                                        <LockKeyhole
                                            size={15}
                                            className="mt-0.5 shrink-0 text-amber-700 min-[1280px]:max-[1535px]:size-[14px]"
                                        />
                                    </motion.div>

                                    <p className="break-words text-xs text-amber-800 min-[1280px]:max-[1535px]:text-[11px]">
                                        Internal notes are only visible to authorized IT personnel.
                                    </p>

                                </div>

                            </div>
                        </motion.div>
                    )}
            </AnimatePresence>

            {/* Ticket Under Review Notice */}
            <AnimatePresence initial={false}>
                {isUnderReview && (
                    <motion.div
                        initial={{
                            height: 0,
                            opacity: 0,
                        }}
                        animate={{
                            height: "auto",
                            opacity: 1,
                        }}
                        exit={{
                            height: 0,
                            opacity: 0,
                        }}
                        transition={{
                            duration: 0.25,
                            ease: "easeOut",
                        }}
                        className="shrink-0 overflow-hidden border-b border-blue-200 bg-blue-50"
                    >
                        <div className="px-4 py-3 2xl:px-6 min-[1280px]:max-[1535px]:px-4 min-[1280px]:max-[1535px]:py-2.5">

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
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Conversation */}
            <div
                ref={conversationRef}
                className="relative min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 2xl:px-6 min-[1280px]:max-[1535px]:px-4 min-[1280px]:max-[1535px]:py-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300"
            >

                <AnimatePresence mode="wait" initial={false}>

                    {loadingComments ? (
                        <motion.div
                            key="loading"
                            initial={{
                                opacity: 0,
                            }}
                            animate={{
                                opacity: 1,
                            }}
                            exit={{
                                opacity: 0,
                            }}
                            className="flex h-full items-center justify-center"
                        >

                            <motion.p
                                animate={{
                                    opacity: [
                                        0.45,
                                        1,
                                        0.45,
                                    ],
                                }}
                                transition={{
                                    duration: 1.4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="text-sm text-gray-500"
                            >
                                Loading conversation...
                            </motion.p>

                        </motion.div>
                    ) : activeTab === "public" ? (
                        publicMessages.length > 0 ? (
                            <motion.div
                                key="public-messages"
                                initial={{
                                    opacity: 0,
                                }}
                                animate={{
                                    opacity: 1,
                                }}
                                transition={{
                                    duration: 0.2,
                                }}
                                className="min-w-0 space-y-6 min-[1280px]:max-[1535px]:space-y-4"
                            >

                                <AnimatePresence
                                    initial={false}
                                    mode="popLayout"
                                >
                                    {publicMessages.map(
                                        (item) => (
                                            <PublicMessage
                                                key={item.id}
                                                item={item}
                                                user={user}
                                            />
                                        )
                                    )}
                                </AnimatePresence>

                            </motion.div>
                        ) : (
                            <motion.div
                                key="public-empty"
                                initial={{
                                    opacity: 0,
                                    y: 8,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    y: -8,
                                }}
                                transition={{
                                    duration: 0.25,
                                }}
                            >
                                <EmptyState
                                    title="No messages yet"
                                    description={
                                        isUnderReview
                                            ? "No public messages have been added."
                                            : "Start the conversation by sending a message."
                                    }
                                />
                            </motion.div>
                        )
                    ) : internalNotes.length > 0 ? (
                        <motion.div
                            key="internal-messages"
                            initial={{
                                opacity: 0,
                            }}
                            animate={{
                                opacity: 1,
                            }}
                            transition={{
                                duration: 0.2,
                            }}
                            className="min-w-0 space-y-4 min-[1280px]:max-[1535px]:space-y-3"
                        >

                            <AnimatePresence
                                initial={false}
                                mode="popLayout"
                            >
                                {internalNotes.map(
                                    (item) => (
                                        <InternalNote
                                            key={item.id}
                                            item={item}
                                            user={user}
                                        />
                                    )
                                )}
                            </AnimatePresence>

                        </motion.div>
                    ) : (
                        <motion.div
                            key="internal-empty"
                            initial={{
                                opacity: 0,
                                y: 8,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                y: -8,
                            }}
                            transition={{
                                duration: 0.25,
                            }}
                        >
                            <EmptyState
                                title="No internal notes yet"
                                description={
                                    isUnderReview
                                        ? "No internal notes have been added."
                                        : "Add an internal note for IT personnel."
                                }
                            />
                        </motion.div>
                    )}

                </AnimatePresence>

                {/* New Messages / Scroll Down Button */}
                <AnimatePresence>
                    {showScrollButton && (
                        <motion.button
                            type="button"
                            onClick={() =>
                                scrollToBottom("smooth")
                            }
                            initial={{
                                opacity: 0,
                                scale: 0.7,
                                y: 10,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.7,
                                y: 10,
                            }}
                            whileHover={{
                                scale: 1.08,
                            }}
                            whileTap={{
                                scale: 0.92,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 22,
                            }}
                            className="absolute bottom-5 left-1/2 z-20 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-lg transition hover:bg-gray-50 hover:text-[#4C4CF9] min-[1280px]:max-[1535px]:bottom-4"
                            title="Scroll to newest messages"
                            aria-label="Scroll to newest messages"
                        >
                            <motion.div
                                animate={{
                                    y: [0, 2, 0],
                                }}
                                transition={{
                                    duration: 1.2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                <ChevronDown size={18} />
                            </motion.div>
                        </motion.button>
                    )}
                </AnimatePresence>

            </div>

            {/* Composer */}
            <AnimatePresence initial={false}>
                {canReply ? (
                    <motion.div
                        key="composer"
                        initial={{
                            opacity: 0,
                            y: 15,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            y: 15,
                        }}
                        transition={{
                            duration: 0.25,
                            ease: "easeOut",
                        }}
                        className="shrink-0 border-t border-gray-200 bg-white px-4 py-4 2xl:px-6 min-[1280px]:max-[1535px]:px-4 min-[1280px]:max-[1535px]:py-3"
                    >

                        <div className="flex items-end gap-2.5 min-[1280px]:max-[1535px]:gap-2">

                            <textarea
                                value={message}
                                onChange={(e) =>
                                    setMessage(
                                        e.target.value
                                    )
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

                            <motion.button
                                type="button"
                                onClick={handleSend}
                                disabled={
                                    !message.trim() ||
                                    sending
                                }
                                whileHover={
                                    message.trim() &&
                                    !sending
                                        ? {
                                              scale: 1.03,
                                          }
                                        : {}
                                }
                                whileTap={
                                    message.trim() &&
                                    !sending
                                        ? {
                                              scale: 0.96,
                                          }
                                        : {}
                                }
                                className={`flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-white transition min-[1280px]:max-[1535px]:h-9 min-[1280px]:max-[1535px]:gap-1.5 min-[1280px]:max-[1535px]:px-3 min-[1280px]:max-[1535px]:text-[13px] ${
                                    message.trim() &&
                                    !sending
                                        ? "bg-[#4C4CF9] hover:bg-[#4242e8]"
                                        : "cursor-not-allowed bg-gray-300"
                                }`}
                            >

                                <AnimatePresence
                                    mode="wait"
                                    initial={false}
                                >
                                    {sending ? (
                                        <motion.div
                                            key="sending"
                                            initial={{
                                                opacity: 0,
                                                rotate: -30,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                rotate: 0,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                rotate: 30,
                                            }}
                                        >
                                            <Send
                                                size={16}
                                                className="min-[1280px]:max-[1535px]:size-[14px]"
                                            />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="send"
                                            initial={{
                                                opacity: 0,
                                                x: -3,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                x: 0,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                x: 3,
                                            }}
                                        >
                                            <Send
                                                size={16}
                                                className="min-[1280px]:max-[1535px]:size-[14px]"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <span className="hidden 2xl:inline">
                                    {sending
                                        ? "Sending..."
                                        : "Send"}
                                </span>

                            </motion.button>

                        </div>

                        <div className="mt-1 flex min-w-0 items-center justify-between gap-3">

                            <p className="min-w-0 truncate text-xs text-gray-400 min-[1280px]:max-[1535px]:text-[11px]">
                                Press Enter to send, Shift + Enter for a new line.
                            </p>

                            <motion.p
                                key={message.length}
                                initial={{
                                    opacity: 0.5,
                                    scale: 0.95,
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                }}
                                className="shrink-0 text-xs text-gray-400 min-[1280px]:max-[1535px]:text-[11px]"
                            >
                                {message.length}/1000
                            </motion.p>

                        </div>

                    </motion.div>
                ) : (
                    <motion.div
                        key="disabled-composer"
                        initial={{
                            opacity: 0,
                            y: 10,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            y: 10,
                        }}
                        transition={{
                            duration: 0.25,
                        }}
                        className="shrink-0 border-t border-gray-200 bg-gray-50 px-4 py-4 2xl:px-6 min-[1280px]:max-[1535px]:px-4 min-[1280px]:max-[1535px]:py-3"
                    >

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

                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}

/* ============================================================
   PUBLIC MESSAGE
   ============================================================ */

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
        <motion.div
            layout
            initial={{
                opacity: 0,
                y: 16,
                scale: 0.98,
            }}
            animate={{
                opacity: 1,
                y: 0,
                scale: 1,
            }}
            exit={{
                opacity: 0,
                y: -8,
                scale: 0.98,
            }}
            transition={{
                duration: 0.28,
                ease: "easeOut",
            }}
            className={`flex min-w-0 max-w-full gap-3 min-[1280px]:max-[1535px]:gap-2.5 ${
                isMine
                    ? "justify-end"
                    : "justify-start"
            }`}
        >

            {!isMine && (
                <Avatar
                    initials={initials}
                />
            )}

            <div
                className={`flex min-w-0 max-w-[85%] 2xl:max-w-[72%] min-[1280px]:max-[1535px]:max-w-[82%] flex-col ${
                    isMine
                        ? "items-end"
                        : "items-start"
                }`}
            >

                <div
                    className={`mb-1 flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1 ${
                        isMine
                            ? "justify-end"
                            : "justify-start"
                    }`}
                >

                    <p className="max-w-full break-words [overflow-wrap:anywhere] text-sm font-semibold text-black min-[1280px]:max-[1535px]:text-[13px]">
                        {item.commented_by_name ||
                            "Unknown User"}
                    </p>

                    <span className="break-words text-xs text-gray-400 min-[1280px]:max-[1535px]:text-[11px]">
                        {item.commented_by_role ||
                            ""}
                    </span>

                </div>

                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 0.96,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                    }}
                    transition={{
                        duration: 0.22,
                        delay: 0.04,
                    }}
                    className={`w-fit min-w-0 max-w-full overflow-hidden rounded-xl px-4 py-2.5 text-sm leading-6 min-[1280px]:max-[1535px]:px-3 min-[1280px]:max-[1535px]:py-2 min-[1280px]:max-[1535px]:text-[13px] min-[1280px]:max-[1535px]:leading-5 ${
                        isMine
                            ? "rounded-tr-sm bg-[#4C4CF9] text-white"
                            : "rounded-tl-sm bg-gray-100 text-black"
                    }`}
                >

                    <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                        {item.message}
                    </p>

                </motion.div>

                <p className="mt-1.5 text-[11px] text-gray-400 min-[1280px]:max-[1535px]:mt-1">
                    {formatDate(
                        item.created_at
                    )}
                </p>

            </div>

            {isMine && (
                <Avatar
                    initials={initials}
                    mine
                />
            )}

        </motion.div>
    );
}

/* ============================================================
   INTERNAL NOTE
   ============================================================ */

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
        <motion.div
            layout
            initial={{
                opacity: 0,
                y: 16,
                scale: 0.98,
            }}
            animate={{
                opacity: 1,
                y: 0,
                scale: 1,
            }}
            exit={{
                opacity: 0,
                y: -8,
                scale: 0.98,
            }}
            transition={{
                duration: 0.28,
                ease: "easeOut",
            }}
            className={`flex min-w-0 max-w-full gap-3 min-[1280px]:max-[1535px]:gap-2.5 ${
                isMine
                    ? "justify-end"
                    : "justify-start"
            }`}
        >

            {!isMine && (
                <Avatar
                    initials={initials}
                />
            )}

            <div
                className={`flex min-w-0 max-w-[85%] 2xl:max-w-[72%] min-[1280px]:max-[1535px]:max-w-[82%] flex-col ${
                    isMine
                        ? "items-end"
                        : "items-start"
                }`}
            >

                <div
                    className={`mb-1 flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1 ${
                        isMine
                            ? "justify-end"
                            : "justify-start"
                    }`}
                >

                    <p className="max-w-full break-words [overflow-wrap:anywhere] text-sm font-semibold text-black min-[1280px]:max-[1535px]:text-[13px]">
                        {item.commented_by_name ||
                            "Unknown User"}
                    </p>

                    <span className="break-words text-xs text-gray-400 min-[1280px]:max-[1535px]:text-[11px]">
                        {item.commented_by_role ||
                            ""}
                    </span>

                    <motion.span
                        initial={{
                            opacity: 0,
                            scale: 0.85,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                        }}
                        transition={{
                            duration: 0.2,
                            delay: 0.08,
                        }}
                        className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700 min-[1280px]:max-[1535px]:px-1.5 min-[1280px]:max-[1535px]:text-[9px]"
                    >
                        Internal Note
                    </motion.span>

                </div>

                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 0.96,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                    }}
                    transition={{
                        duration: 0.22,
                        delay: 0.04,
                    }}
                    className={`w-fit min-w-0 max-w-full overflow-hidden rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm leading-6 text-black min-[1280px]:max-[1535px]:px-3 min-[1280px]:max-[1535px]:py-2 min-[1280px]:max-[1535px]:text-[13px] min-[1280px]:max-[1535px]:leading-5 ${
                        isMine
                            ? "rounded-tr-sm"
                            : "rounded-tl-sm"
                    }`}
                >

                    <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                        {item.message}
                    </p>

                </motion.div>

                <p className="mt-1.5 text-[11px] text-gray-400 min-[1280px]:max-[1535px]:mt-1">
                    {formatDate(
                        item.created_at
                    )}
                </p>

            </div>

            {isMine && (
                <Avatar
                    initials={initials}
                    mine
                />
            )}

        </motion.div>
    );
}

/* ============================================================
   AVATAR
   ============================================================ */

function Avatar({
    initials,
    mine = false,
}) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                scale: 0.7,
            }}
            animate={{
                opacity: 1,
                scale: 1,
            }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 20,
            }}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold min-[1280px]:max-[1535px]:h-8 min-[1280px]:max-[1535px]:w-8 min-[1280px]:max-[1535px]:text-[11px] ${
                mine
                    ? "bg-[#4C4CF9]/10 text-[#4C4CF9]"
                    : "bg-gray-100 text-gray-700"
            }`}
        >
            {initials}
        </motion.div>
    );
}

/* ============================================================
   EMPTY STATE
   ============================================================ */

function EmptyState({
    title,
    description,
}) {
    return (
        <div className="flex h-full min-h-[220px] items-center justify-center min-[1280px]:max-[1535px]:min-h-[180px]">

            <motion.div
                initial={{
                    opacity: 0,
                    y: 10,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.3,
                    ease: "easeOut",
                }}
                className="max-w-[280px] text-center"
            >

                <motion.div
                    initial={{
                        scale: 0.8,
                    }}
                    animate={{
                        scale: 1,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 20,
                    }}
                    className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 min-[1280px]:max-[1535px]:h-9 min-[1280px]:max-[1535px]:w-9"
                >

                    <MessageCircle
                        size={18}
                        className="text-gray-400 min-[1280px]:max-[1535px]:size-[16px]"
                    />

                </motion.div>

                <p className="mt-3 text-sm font-medium text-black min-[1280px]:max-[1535px]:mt-2 min-[1280px]:max-[1535px]:text-[13px]">
                    {title}
                </p>

                <p className="mt-1 break-words text-xs leading-5 text-gray-500 min-[1280px]:max-[1535px]:text-[11px] min-[1280px]:max-[1535px]:leading-4">
                    {description}
                </p>

            </motion.div>

        </div>
    );
}


function getInitials(name) {
    if (!name) {
        return "?";
    }

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) =>
            part.charAt(0).toUpperCase()
        )
        .join("");
}