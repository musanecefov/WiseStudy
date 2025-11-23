import React from 'react';
import { ShieldCheckIcon, AcademicCapIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function RulesDisplay() {
    return (
        <div className="h-full w-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-950 p-6 md:p-10 overflow-y-auto">

            <header className="mb-8 pb-4 border-b border-gray-800">
                <div className="flex items-center gap-4">
                    <ShieldCheckIcon className="w-8 h-8 text-yellow-400" />
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-100">
                        Cəmiyyət Təlimatları və Qaydaları
                    </h1>
                </div>
                <p className="text-gray-400 mt-2 text-sm md:text-base">
                    WiseStudy icmasında uğurlu və faydalı bir mühit üçün əsas prinsiplər.
                </p>
            </header>

            <div className="space-y-6 flex-1">

                {/* Rule 1: Respect */}
                <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700 hover:border-cyan-600 transition-colors">
                    <div className="flex items-start gap-3 mb-2">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                        <h2 className="text-lg font-semibold text-gray-200">Hörmət və Nəzakət</h2>
                    </div>
                    <p className="text-gray-400 text-sm md:text-base">
                        Hər kəsə qarşı hörmətlə davranın. **Təhqir, nifrət nitqi** və şəxsi hücumlar qəti qadağandır. Unutmayın, hamımız eyni məqsəd üçün buradayıq.
                    </p>
                </div>

                {/* Rule 2: Topic Relevance */}
                <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700 hover:border-cyan-600 transition-colors">
                    <div className="flex items-start gap-3 mb-2">
                        <AcademicCapIcon className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                        <h2 className="text-lg font-semibold text-gray-200">Yalnız Tədrisə Aid Mövzular</h2>
                    </div>
                    <p className="text-gray-400 text-sm md:text-base">
                        Bütün söhbətlər **dövlət imtahanlarına hazırlıq**, tədris materialları və fənlərlə əlaqəli olmalıdır. Siyasi və ya mövzudan kənar (off-topic) müzakirələrə icazə verilmir.
                    </p>
                </div>

                {/* Rule 3: Spam/Ads */}
                <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700 hover:border-cyan-600 transition-colors">
                    <div className="flex items-start gap-3 mb-2">
                        <ShieldCheckIcon className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                        <h2 className="text-lg font-semibold text-gray-200">Spam və Reklam Qadağandır</h2>
                    </div>
                    <p className="text-gray-400 text-sm md:text-base">
                        **Təkrarlanan mesajlar (spam)**, digər kommersiya platformalarına linklər və ya reklam xarakterli məzmun yerləşdirmək qadağandır.
                    </p>
                </div>

                {/* Rule 4: Personal Info */}
                <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700 hover:border-cyan-600 transition-colors">
                    <div className="flex items-start gap-3 mb-2">
                        <ShieldCheckIcon className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                        <h2 className="text-lg font-semibold text-gray-200">Şəxsi Məlumatların Qorunması</h2>
                    </div>
                    <p className="text-gray-400 text-sm md:text-base">
                        Özünüzün və ya başqalarının **şəxsi məlumatlarını** (telefon, ünvan və s.) açıq şəkildə paylaşmayın. Təhlükəsizliyinizə diqqət edin.
                    </p>
                </div>
            </div>

            <footer className="mt-8 pt-4 border-t border-gray-800 text-center">
                <p className="text-xs text-gray-600">Qaydaları pozan istifadəçilərə qarşı müvafiq tədbirlər görüləcəkdir.</p>
            </footer>
        </div>
    );
}