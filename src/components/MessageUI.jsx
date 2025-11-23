import React, { useState } from "react";
import { motion } from "framer-motion";
import Modal from "react-modal";

export default function Message({ message, isOwn, onDelete, onEdit }) {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content || "");

    const isImage = (url) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    const isVideoFile = (url) => /\.(mp4|webm|ogg)$/i.test(url);

    const openModal = () => setModalIsOpen(true);
    const closeModal = () => setModalIsOpen(false);

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this message?")) {
            onDelete(message.id);
            setShowMenu(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setShowMenu(false);
    };

    const handleSaveEdit = () => {
        const trimmed = editContent.trim();
        if (!trimmed) {
            alert("Message cannot be empty.");
            return;
        }
        if (trimmed !== message.content) {
            onEdit(message.id, trimmed);
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditContent(message.content || "");
        setIsEditing(false);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={`flex items-start gap-2 md:gap-3 ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
            {!isOwn && <img src={message.avatar || "/default-avatar.png"} alt={message.username} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-cyan-500/30 flex-shrink-0" />}
            <div className="relative group max-w-[75%] md:max-w-[60%]">
                {!isOwn && <p className="mb-1 px-2 text-xs md:text-sm font-semibold text-cyan-400">{message.username}</p>}
                <div className={`rounded-2xl shadow-lg overflow-hidden ${isOwn ? "bg-gradient-to-br from-cyan-600 to-blue-600 text-white" : "bg-gray-800 text-gray-100"}`}>
                    {message.imageUrl && (
                        <div className="relative">
                            {isImage(message.imageUrl) ? (
                                <>
                                    {!imageLoaded && <div className="absolute inset-0 bg-gray-700 animate-pulse" />}
                                    <img
                                        src={`http://localhost:3000${message.imageUrl}`}
                                        alt="sent"
                                        onLoad={() => setImageLoaded(true)}
                                        className={`w-full h-auto cursor-pointer hover:opacity-90 transition-opacity ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
                                        onClick={openModal}
                                        style={{ maxHeight: '400px', objectFit: 'cover' }}
                                    />
                                </>
                            ) : isVideoFile(message.imageUrl) ? (
                                <video src={`http://localhost:3000${message.imageUrl}`} controls className="w-full" style={{ maxHeight: '400px' }} />
                            ) : (
                                <a href={`http://localhost:3000${message.imageUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 bg-gray-700/50 hover:bg-gray-700">
                                    Download File
                                </a>
                            )}
                        </div>
                    )}

                    {message.content && (
                        <div className={`px-4 ${message.imageUrl ? 'py-3' : 'py-2.5'}`}>
                            {isEditing ? (
                                <div className="space-y-2">
                                    <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm md:text-base outline-none focus:ring-2 focus:ring-cyan-500 resize-none" rows="3" autoFocus />
                                    <div className="flex gap-2">
                                        <button onClick={handleSaveEdit} className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-medium">Save</button>
                                        <button onClick={handleCancelEdit} className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded-lg text-xs font-medium">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>
                                    {message.edited && <span className="text-xs opacity-60 italic mt-1 inline-block">(edited)</span>}
                                </div>
                            )}
                        </div>
                    )}

                    <div className={`px-4 pb-2 ${isOwn ? 'text-right' : 'text-left'}`}>
                        <p className="text-xs opacity-60">{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                </div>

                {isOwn && !isEditing && (
                    <div className="absolute top-0 right-0 -mt-1 -mr-1">
                        <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 bg-gray-800/90 hover:bg-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                            ⋮
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-20 min-w-[130px] overflow-hidden">
                                {message.content && <button onClick={handleEdit} className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-700">Edit</button>}
                                <button onClick={handleDelete} className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-700 text-red-400 border-t border-gray-700">Delete</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isOwn && <img src={message.avatar || "/default-avatar.png"} alt="You" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-cyan-500/30 flex-shrink-0" />}

            {(message.imageUrl && (isImage(message.imageUrl) || isVideoFile(message.imageUrl))) && (
                <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="fixed inset-0 flex items-center justify-center p-4 z-50" overlayClassName="fixed inset-0 bg-black/90 z-40" ariaHideApp={false}>
                    <button onClick={closeModal} className="absolute top-4 right-4 z-50 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full">X</button>
                    <div className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center">
                        {isImage(message.imageUrl) ? (
                            <img src={`http://localhost:3000${message.imageUrl}`} alt="Preview" className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain" />
                        ) : (
                            <video src={`http://localhost:3000${message.imageUrl}`} controls autoPlay className="max-h-[90vh] max-w-[90vw] rounded-lg" />
                        )}
                    </div>
                </Modal>
            )}
        </motion.div>
    );
}
