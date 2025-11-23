import { HomeIcon } from '@heroicons/react/24/solid';
import { BoltIcon, BookOpenIcon, AcademicCapIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

// NOTE: I am assuming the parent component now accepts an optional onSelectSection prop
export default function CommunitySidebar({ onSelectSubject, onSelectSection }) {
    const [activeSubject, setActiveSubject] = useState(null);
    const [isExpanded, setIsExpanded] = useState(true);
    // 1. NEW STATE: Track the currently active section (subject name or 'rules')
    const [activeSection, setActiveSection] = useState('rules');

    const subjects = [
        { name: "Azerbaycan Dili", icon: AcademicCapIcon, color: "text-blue-400" },
        { name: "Riyaziyyat", icon: BoltIcon, color: "text-yellow-400" },
        { name: "İngilis Dili", icon: BookOpenIcon, color: "text-green-400" }
    ];

    const handleSubjectClick = (subject) => {
        setActiveSubject(subject.name);
        setActiveSection(subject.name); // Set active section to subject name
        if (onSelectSubject) onSelectSubject(subject.name);
        if (onSelectSection) onSelectSection({ type: 'channel', name: subject.name });
    };

    // 2. NEW HANDLER: Handle clicking the "Təlimatlar" button
    const handleRulesClick = () => {
        setActiveSubject(null); // Deselect any active subject
        setActiveSection('rules'); // Set active section to 'rules'
        if (onSelectSection) onSelectSection({ type: 'rules' });
    };

    return (
        <aside className="w-full h-full bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100 flex flex-col border-r border-gray-800">
            {/* Server Header (unchanged) */}
            <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between bg-gray-800/50 hover:bg-gray-800 transition-all rounded-xl px-4 py-3 cursor-pointer group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <HomeIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-base">WiseStudy</span>
                            <p className="text-xs text-gray-400">Community Hub</p>
                        </div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent p-4 space-y-6">

                {/* General Section */}
                <div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full flex items-center justify-between text-xs uppercase text-gray-500 font-semibold tracking-wider mb-3 hover:text-gray-400 transition-colors"
                    >
                        <span>General</span>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isExpanded && (
                        <div className="space-y-1">
                            {/* 3. UPDATED RULES BUTTON */}
                            <div
                                onClick={handleRulesClick}
                                className={`flex items-center gap-3 rounded-lg transition-all px-3 py-2.5 cursor-pointer group ${
                                    activeSection === 'rules'
                                        ? 'bg-yellow-600/20 border border-yellow-600/50'
                                        : 'bg-gray-800/30 hover:bg-gray-800/60 border border-transparent'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                    activeSection === 'rules'
                                        ? 'bg-yellow-500/30'
                                        : 'bg-yellow-500/10 group-hover:bg-yellow-500/20'
                                }`}>
                                    <BoltIcon className="h-4 w-4 text-yellow-400" />
                                </div>
                                <span className={`text-sm font-medium ${activeSection === 'rules' ? 'text-yellow-300' : 'text-gray-300'}`}>
                                    Təlimatlar
                                </span>
                                {activeSection === 'rules' && (
                                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse ml-auto" />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Subject Channels */}
                <div>
                    <div className="flex items-center justify-between text-xs uppercase text-gray-500 font-semibold tracking-wider mb-3">
                        <span>Fənlər</span>
                        <span className="text-cyan-400">{subjects.length}</span>
                    </div>

                    <div className="space-y-1">
                        {subjects.map((subject, index) => {
                            const Icon = subject.icon;
                            const isActive = activeSection === subject.name; // Check against activeSection

                            return (
                                <div
                                    key={index}
                                    onClick={() => handleSubjectClick(subject)}
                                    className={`flex items-center gap-3 rounded-lg transition-all px-3 py-2.5 cursor-pointer group relative ${
                                        isActive
                                            ? 'bg-cyan-600/20 border border-cyan-600/50'
                                            : 'bg-gray-800/30 hover:bg-gray-800/60 border border-transparent'
                                    }`}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-500 rounded-r" />
                                    )}

                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                        isActive
                                            ? 'bg-cyan-600/30'
                                            : 'bg-gray-700/50 group-hover:bg-gray-700'
                                    }`}>
                                        <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : subject.color}`} />
                                    </div>

                                    <div className="flex-1">
                                        <span className={`text-sm font-medium ${isActive ? 'text-cyan-300' : 'text-gray-300'}`}>
                                            {subject.name}
                                        </span>
                                    </div>

                                    {isActive && (
                                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Online Status (unchanged) */}
                <div className="mt-auto pt-4 border-t border-gray-800">
                    <div className="bg-gray-800/30 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span>Online</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}