import { useEffect, useState, useRef, useContext } from "react";
import socket from "../socket";
import { PaperAirplaneIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Message from "./MessageUI.jsx";
import { AuthContext } from "../context/AuthContext.jsx";

export default function MessageList({ currentUser, currentChannel }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);
    const prevMessagesLengthRef = useRef(0);

    const { fetchWithAuth } = useContext(AuthContext);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (file.type.startsWith("image/")) {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            }
        }
    };

    const removeFile = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const scrollToBottom = (smooth = true) => {
        messagesEndRef.current?.scrollIntoView({
            behavior: smooth ? "smooth" : "auto",
            block: "end",
        });
    };

    const handleScroll = () => {
        const container = containerRef.current;
        if (!container) return;

        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;

        const isBottom = scrollHeight - scrollTop - clientHeight < 100;
        setIsAtBottom(isBottom);
        setShowScrollButton(!isBottom && messages.length > 0);
    };

    // Handle message deletion
    const handleDeleteMessage = async (messageId) => {
        try {
            const res = await fetchWithAuth(`/api/messages/${messageId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                console.error("Failed to delete message");
                // OPTIONAL: Display an error toast/notification here
                return;
            }

            // SUCCESS: Do NOT update local state here.
            // The backend (messageController.js) will emit 'messageDeleted' via socket,
            // and the listener below will update the state for all clients.
        } catch (err) {
            console.error("Error deleting message:", err);
        }
    };

    // Handle message editing
    const handleEditMessage = async (messageId, newContent) => {
        const trimmedContent = newContent?.trim();
        if (!trimmedContent) {
            console.error("Cannot edit message: content is empty");
            return;
        }

        try {
            const res = await fetchWithAuth(`/api/messages/${messageId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                // FIX: Removed 'sender: currentUser._id' from the body.
                // The server uses the JWT token for authentication/authorization.
                body: JSON.stringify({ content: trimmedContent }),
            });

            if (!res.ok) {
                console.error("Failed to edit message. Status:", res.status);
                const errorData = await res.json();
                console.error("Error message from server:", errorData.message);
                return;
            }

            // SUCCESS: Do NOT update local state here.
            // The backend (messageController.js) will emit 'messageEdited' via socket,
            // and the listener below will update the state for all clients.
        } catch (err) {
            console.error("Error editing message:", err);
        }
    };

    useEffect(() => {
        const isNewMessage = messages.length > prevMessagesLengthRef.current;
        prevMessagesLengthRef.current = messages.length;

        if (isNewMessage && isAtBottom && messages.length > 0) {
            setTimeout(() => scrollToBottom(true), 100);
        }
    }, [messages, isAtBottom]);

    useEffect(() => {
        if (!currentChannel) return;

        setMessages([]);
        setIsAtBottom(true);
        prevMessagesLengthRef.current = 0;

        socket.emit("joinChannel", currentChannel._id);

        const fetchMessages = async () => {
            try {
                const res = await fetchWithAuth(`/api/messages/${currentChannel._id}`);

                if (!res.ok) {
                    console.error("Failed to fetch messages. Status:", res.status);
                    setMessages([]);
                    return;
                }

                const data = await res.json();

                if (!Array.isArray(data)) {
                    console.error("Fetched data is not an array:", data);
                    setMessages([]);
                    return;
                }

                setMessages(data);
                prevMessagesLengthRef.current = data.length;

                requestAnimationFrame(() => {
                    setTimeout(() => scrollToBottom(false), 150);
                });

            } catch (err) {
                console.error("Error fetching messages:", err);
                setMessages([]);
            }
        };

        fetchMessages();

        const handleNewMessage = (message) => {
            if (message.channel.toString() === currentChannel._id.toString()) {
                setMessages((prev) => [...prev, message]);
            }
        };

        // This listener handles the real-time update when the Express controller emits the event.
        const handleMessageDeleted = ({ messageId }) => {
            setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        };

        // This listener handles the real-time update when the Express controller emits the event.
        const handleMessageEdited = ({ messageId, content, edited, editedAt }) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === messageId
                        ? { ...msg, content, edited, editedAt }
                        : msg
                )
            );
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("messageDeleted", handleMessageDeleted);
        socket.on("messageEdited", handleMessageEdited);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("messageDeleted", handleMessageDeleted);
            socket.off("messageEdited", handleMessageEdited);
            socket.emit("leaveChannel", currentChannel._id);
        };
    }, [currentChannel, fetchWithAuth]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const currentUserId= currentUser?.id || currentUser?._id;

        if (!currentUser || !currentChannel || !currentUserId) {
            console.error("Cannot send message: User or Channel data is missing.");
            return;
        }

        if (!newMessage.trim() && !selectedFile) return;

        if (selectedFile) {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("channelId", currentChannel._id);
            formData.append("sender", currentUser._id || "");
            formData.append("content", newMessage || "");

            const res = await fetchWithAuth("/api/messages/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                console.error("File upload failed. Response status:", res.status);
                return;
            }

            // NOTE: For file uploads, the backend (messageController.js uploadFile function)
            // does NOT emit a socket event. If you want real-time updates for files,
            // the server needs to emit 'newMessage' after saving the file.
            // For now, file uploads will require a refresh to show the message unless you
            // add socket emission to messageController.js -> uploadFile.

            setNewMessage("");
            removeFile();
            return;
        }

        socket.emit("sendMessage", {
            content: newMessage,
            channelId: currentChannel._id,
            senderId: currentUserId,
        });

        setNewMessage("");
    };

    const isSendDisabled = (!newMessage.trim() && !selectedFile) || !currentUser;

    const currentUserId = currentUser?.id || currentUser?._id;
    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 to-gray-950 overflow-hidden">
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-6 py-4"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#374151 transparent'
                }}
            >
                <div className="space-y-2 min-h-full flex flex-col">
                    {messages.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="text-gray-400 text-sm">No messages yet</p>
                                <p className="text-gray-600 text-xs mt-1">Start the conversation! 💬</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg, index) => (
                                <Message
                                    key={msg._id || index}
                                    message={{
                                        id: msg._id,
                                        content: msg.content,
                                        username: msg.sender?.username,
                                        createdAt: msg.createdAt,
                                        avatar: msg.sender?.avatar,
                                        imageUrl: msg.imageUrl || null,
                                        edited: msg.edited || false,
                                        editedAt: msg.editedAt,
                                    }}
                                    isOwn={msg.sender?._id.toString() === currentUserId?.toString()}
                                    onDelete={handleDeleteMessage}
                                    onEdit={handleEditMessage}
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>
            </div>

            {showScrollButton && (
                <button
                    onClick={() => scrollToBottom(true)}
                    className="absolute bottom-28 md:bottom-32 right-6 z-10 bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-full shadow-lg transform transition-all hover:scale-110"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </button>
            )}

            <div className="flex-shrink-0 border-t border-gray-800 bg-gray-900/95 backdrop-blur-sm">
                <form onSubmit={handleSendMessage} className="p-3 md:p-4">
                    {selectedFile && (
                        <div className="mb-3 bg-gray-800 rounded-xl p-3 flex items-center gap-3">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="preview"
                                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <PhotoIcon className="w-8 h-8 text-gray-500" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-300 truncate">{selectedFile.name}</p>
                                <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button
                                type="button"
                                onClick={removeFile}
                                className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                            >
                                <XMarkIcon className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                    )}

                    <div className="flex items-end gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            id="fileInput"
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/*,video/*"
                        />

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 text-cyan-400 hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-50 flex-shrink-0"
                            disabled={!currentUser}
                        >
                            <PhotoIcon className="h-6 w-6" />
                        </button>

                        <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 focus-within:border-cyan-600 transition-colors min-w-0">
                            <textarea
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                className="w-full bg-transparent text-gray-200 placeholder-gray-500 px-4 py-2.5 outline-none resize-none max-h-32"
                                rows="1"
                                disabled={!currentUser}
                                style={{ scrollbarWidth: 'thin' }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="p-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex-shrink-0"
                            disabled={isSendDisabled}
                        >
                            <PaperAirplaneIcon className="h-6 w-6" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}