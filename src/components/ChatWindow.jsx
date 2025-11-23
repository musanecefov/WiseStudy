import React, { useState } from "react";
import MessageList from "./MessageList.jsx";
import { Bars3Icon } from "@heroicons/react/24/outline";

export default function ChatWindow({ currentUser, currentChannel }) {
    const [showChannelInfo, setShowChannelInfo] = useState(false);

    return (
        <div className="flex flex-col h-full bg-gray-950">
            {/* Modern Chat Header */}
            <div className="border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-900/95 backdrop-blur-sm">
                <div className="px-4 md:px-6 py-3 md:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <div>
                                <h2 className="font-bold text-gray-100 text-base md:text-lg flex items-center gap-2">
                                    <span className="text-cyan-400">#</span>
                                    {currentChannel.name}
                                </h2>
                                <p className="text-xs text-gray-500 hidden md:block">
                                    Community discussion for {currentChannel.name}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowChannelInfo(!showChannelInfo)}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <Bars3Icon className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <MessageList currentUser={currentUser} currentChannel={currentChannel} />
        </div>
    );
}

