// src/pages/CommunityPage.jsx
import React, { useState, useRef, useEffect, useContext } from "react";
import CommunitySidebar from "../components/CommunitySidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import RulesDisplay from "../components/RulesDisplay.jsx"; // <<< 1. RulesDisplay import edildi
import { AuthContext } from "../context/AuthContext.jsx";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function CommunityPage() {
    const { user: currentUser, fetchWithAuth } = useContext(AuthContext);

    // 2. Yeni state: Hansı bölmənin aktiv olduğunu izləmək üçün
    const [selectedView, setSelectedView] = useState({ type: 'rules', name: 'Təlimatlar' });
    const [currentChannel, setCurrentChannel] = useState(null);

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Desktop resize (unchanged)
    const initialSidebarWidth = 280;
    const minSidebarWidth = 200;
    const maxSidebarWidth = 400;
    const isResizing = useRef(false);
    const [sidebarWidth, setSidebarWidth] = useState(initialSidebarWidth);

    const handleMouseDown = () => {
        isResizing.current = true;
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e) => {
        if (!isResizing.current) return;
        const newWidth = e.clientX;
        if (newWidth >= minSidebarWidth && newWidth <= maxSidebarWidth) {
            setSidebarWidth(newWidth);
        }
    };

    const handleMouseUp = () => {
        isResizing.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };

    useEffect(() => {
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    // 3. Yeni handler: Sidebar-dan gələn seçimi idarə edir
    const handleSelectSection = async (selection) => {
        setSelectedView(selection);

        if (selection.type === 'rules') {
            setCurrentChannel(null); // Təlimatlar seçiləndə kanalı təmizləyin
            setIsMobileSidebarOpen(false);
            return;
        }

        // Əgər selection.type === 'channel' (fənn kanalıdır)
        const subjectName = selection.name;

        if (!currentUser) {
            console.error("Cannot select channel: User is not authenticated.");
            return;
        }

        try {
            const res = await fetchWithAuth("/api/channels/getOrCreate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject: subjectName }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to get or create channel");
            }

            setCurrentChannel(data.channel);
            setIsMobileSidebarOpen(false); // Mobil sidebarı bağlayın
        } catch (err) {
            console.error("Error selecting subject:", err);
            // Seçim uğursuz olsa belə, Təlimatlara geri qayıda bilərik
            setSelectedView({ type: 'rules', name: 'Təlimatlar' });
        }
    };

    // Köhnə handleSelectSubject artıq istifadə edilmir, lakin uyğunluq üçün saxlayırıq:
    // const handleSelectSubject = handleSelectSection;

    // Məzmunu render etmək üçün köməkçi funksiya
    const renderContent = () => {
        if (selectedView.type === 'rules') {
            return <RulesDisplay />;
        }

        if (currentUser && currentChannel) {
            return <ChatWindow currentUser={currentUser} currentChannel={currentChannel} />;
        }

        // Boş vəziyyət (Kanal yüklənməyibsə və ya Təlimatlar seçilməyibsə)
        return (
            <div className="flex flex-col h-full items-center justify-center text-gray-500 px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">
                        {currentUser ? "WiseStudy Cəmiyyətinə Xoş Gəlmisiniz" : "Yüklənir..."}
                    </h3>
                    <p className="text-gray-500">
                        {currentUser
                            ? "Zəhmət olmasa, çatlaşmaya başlamaq üçün sidebar-dan bir fənn kanalı seçin və ya Təlimatları oxuyun 📚."
                            : "Məlumatlarınız yüklənənə qədər gözləyin..."
                        }
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-950">
            {/* Mobile Sidebar Toggle (unchanged) */}
            <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg shadow-lg"
            >
                {isMobileSidebarOpen ? (
                    <XMarkIcon className="w-6 h-6 text-gray-300" />
                ) : (
                    <Bars3Icon className="w-6 h-6 text-gray-300" />
                )}
            </button>

            {/* Mobile Overlay (unchanged) */}
            {isMobileSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 z-30"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Desktop */}
            <div
                className="hidden lg:block flex-shrink-0"
                style={{ width: sidebarWidth }}
            >
                {/* 4. handleSelectSection yeni prop kimi ötürülür */}
                <CommunitySidebar
                    onSelectSubject={(name) => handleSelectSection({ type: 'channel', name })}
                    onSelectSection={handleSelectSection} // Sidebar indi bu handler-i istifadə edir
                />
            </div>

            {/* Sidebar - Mobile */}
            <div
                className={`lg:hidden fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ${
                    isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* 4. handleSelectSection yeni prop kimi ötürülür */}
                <CommunitySidebar
                    onSelectSubject={(name) => handleSelectSection({ type: 'channel', name })}
                    onSelectSection={handleSelectSection} // Sidebar indi bu handler-i istifadə edir
                />
            </div>

            {/* Resize Handle - Desktop only (unchanged) */}
            <div
                className="hidden lg:block w-1 bg-gray-800 hover:bg-cyan-600 cursor-ew-resize flex-shrink-0 transition-colors"
                onMouseDown={handleMouseDown}
            />

            {/* Chat Area - RenderContent funksiyası ilə əvəz edilir */}
            <div className="flex-1 flex flex-col min-w-0">
                {renderContent()}
            </div>
        </div>
    );
}