import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    HomeIcon,
    XMarkIcon,
    BookOpenIcon,
    ChartBarSquareIcon,
    ChatBubbleBottomCenterTextIcon,
    UserCircleIcon,
    MegaphoneIcon,
    BugAntIcon,
    CloudArrowUpIcon,
    ShieldCheckIcon,
    PhotoIcon,
    TrashIcon // 🟩 Added TrashIcon for removing images
} from "@heroicons/react/24/outline";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [showBugReport, setShowBugReport] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [pageContext, setPageContext] = useState("");
    const [toast, setToast] = useState(null);
    const [screenshot, setScreenshot] = useState(null);

    const { user, fetchWithAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // Clear form when modals close
    const closeModals = () => {
        setShowFeedback(false);
        setShowBugReport(false);
        setMessage("");
        setPageContext("");
        setScreenshot(null);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setScreenshot(e.target.files[0]);
        }
    };

    const submit = async (type) => {
        if (!message || message.trim().length < 3) {
            setToast({ type: "error", text: "Zəhmət olmasa, ən azı 3 simvol yazın." });
            return;
        }

        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("type", type);
            formData.append("text", message.trim());
            formData.append("page", pageContext || window.location.pathname);
            formData.append("meta", JSON.stringify({ userAgent: navigator.userAgent }));

            if (screenshot) {
                formData.append("screenshot", screenshot);
            }

            const res = await fetchWithAuth("/api/feedback", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Göndərilmə uğursuz oldu");
            }

            setToast({ type: "success", text: "Təşəkkürlər! Mesajınız qəbul edildi." });
            closeModals();
        } catch (err) {
            console.error("submit feedback error:", err);
            setToast({ type: "error", text: err.message || "Şəbəkə xətası" });
        } finally {
            setSubmitting(false);
            setTimeout(() => setToast(null), 4000);
        }
    };

    return (
        <>
            <nav className="flex items-center justify-between p-4 shadow-md bg-white sticky top-0 z-50">
                <div className="flex items-center">
                    <img src="/wisestudy.logo.png" alt="WiseStudyLogo" className="h-16 w-16" />
                    <h1 className="text-purple-500 font-extrabold tracking-wider ml-2">WiseStudy</h1>
                </div>

                <div className="hidden md:flex items-center space-x-6">
                    <Link to="/" className="flex items-center text-gray-600 hover:text-sky-400">
                        <HomeIcon className="h-5 w-5" /><span className="ml-2">Ana Səhifə</span>
                    </Link>
                    <Link to="/questions" className="flex items-center text-gray-600 hover:text-sky-400">
                        <BookOpenIcon className="h-5 w-5" /><span className="ml-2">Fənlər</span>
                    </Link>
                    <Link to="/results" className="flex items-center text-gray-600 hover:text-sky-400">
                        <ChartBarSquareIcon className="h-5 w-5" /><span className="ml-2">Nəticələr</span>
                    </Link>
                    <Link to="/community" className="flex items-center text-gray-600 hover:text-sky-400">
                        <ChatBubbleBottomCenterTextIcon className="h-5 w-5" /><span className="ml-2">Müzakirələr</span>
                    </Link>

                    <button onClick={() => setShowFeedback(true)} className="flex items-center text-gray-600 hover:text-purple-500">
                        <MegaphoneIcon className="h-5 w-5" /><span className="ml-2">Rəy</span>
                    </button>
                    <button onClick={() => setShowBugReport(true)} className="flex items-center text-gray-600 hover:text-red-500">
                        <BugAntIcon className="h-5 w-5" /><span className="ml-2">Xəta Bildir</span>
                    </button>
                </div>

                {/* AUTH SECTION */}
                {user ? (
                    <div className="hidden md:flex items-center gap-4">
                        {user.role === 'admin' && (
                            <Link
                                to="/admin/feedback"
                                className="flex items-center px-3 py-1 bg-indigo-600 text-white text-sm font-bold rounded-full hover:bg-indigo-700 shadow transition-all"
                            >
                                <ShieldCheckIcon className="h-4 w-4 mr-1" />
                                Admin
                            </Link>
                        )}

                        <UserCircleIcon
                            className="w-10 h-10 text-purple-500 cursor-pointer hover:text-purple-600 transition"
                            onClick={() => navigate("/profile")}
                        />
                    </div>
                ) : (
                    <Link
                        to="/login"
                        className="hidden md:flex items-center bg-purple-500 text-white font-bold py-1 px-4 rounded-lg shadow-md hover:bg-purple-600 transition"
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        <span className="ml-2">Daxil ol</span>
                    </Link>
                )}

                <div className="md:hidden flex items-center">
                    <button onClick={toggleMenu} className="text-gray-600 hover:text-sky-400">
                        {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                    </button>
                </div>
            </nav>

            {/* MOBILE MENU */}
            {isMenuOpen && (
                <div className="md:hidden bg-white shadow-md sticky top-16 z-50 w-full">
                    {user && user.role === 'admin' && (
                        <Link to="/admin/feedback" className="block p-4 text-indigo-600 font-bold bg-indigo-50" onClick={()=> setIsMenuOpen(false)}>
                            🛡️ Admin Paneli
                        </Link>
                    )}

                    <Link to="/" className="block p-4 text-gray-600 hover:text-sky-400" onClick={()=> setIsMenuOpen(false)}>Ana Səhifə</Link>
                    <Link to="/questions" className="block p-4 text-gray-600 hover:text-sky-400" onClick={()=> setIsMenuOpen(false)}>Fənlər</Link>
                    <Link to="/results" className="block p-4 text-gray-600 hover:text-sky-400" onClick={()=> setIsMenuOpen(false)}>Nəticələr</Link>
                    <Link to="/community" className="block p-4 text-gray-600 hover:text-sky-400" onClick={()=> setIsMenuOpen(false)}>Müzakirələr</Link>

                    <button onClick={() => {setShowFeedback(true); setIsMenuOpen(false)}} className="block w-full text-left p-4 text-purple-600">Rəy</button>
                    <button onClick={() => {setShowBugReport(true); setIsMenuOpen(false)}} className="block w-full text-left p-4 text-red-500">Xəta Bildir</button>

                    {user ? (
                        <Link to="/profile" className="block p-4 text-purple-500 font-bold border-t" onClick={()=> setIsMenuOpen(false)}>Profilim</Link>
                    ) : (
                        <Link to="/login" className="block p-4 text-purple-500 border-t" onClick={()=> setIsMenuOpen(false)}>Daxil ol</Link>
                    )}
                </div>
            )}

            {toast && (
                <div
                    className={`fixed right-4 top-20 z-50 rounded-lg px-4 py-2 ${
                        toast.type === "success" ? "bg-green-500" : "bg-rose-500"
                    } text-white`}
                >
                    {toast.text}
                </div>
            )}

            {/* 🟪 FEEDBACK MODAL (Purple Theme) */}
            {showFeedback && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative animate-fade-in">
                        <button onClick={closeModals} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <XMarkIcon className="h-6 w-6" />
                        </button>

                        <div className="flex items-center gap-2 mb-4 text-purple-600">
                            <MegaphoneIcon className="h-6 w-6" />
                            <h2 className="text-xl font-bold">Rəy Göndər</h2>
                        </div>

                        <div className="space-y-4">
                            <input
                                value={pageContext}
                                onChange={(e) => setPageContext(e.target.value)}
                                placeholder="Səhifə / keçid (könüllü)"
                                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-purple-200 outline-none"
                            />

                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={5}
                                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-purple-200 outline-none resize-none"
                                placeholder="Nəyi bəyənirsiniz və ya nəyin təkmilləşdirilməsini istəyirsiniz?"
                            />

                            {/* Custom Image Upload UI */}
                            {!screenshot ? (
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-purple-300 border-dashed rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100 transition-all">
                                    <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                        <PhotoIcon className="w-6 h-6 mb-1 text-purple-400" />
                                        <p className="text-xs text-purple-500 font-semibold">Ekran görüntüsü əlavə et</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            ) : (
                                <div className="flex items-center justify-between w-full p-2 border border-purple-200 rounded-lg bg-purple-50">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <img src={URL.createObjectURL(screenshot)} alt="preview" className="h-10 w-10 object-cover rounded" />
                                        <span className="text-sm truncate max-w-[150px] text-purple-700">{screenshot.name}</span>
                                    </div>
                                    <button onClick={() => setScreenshot(null)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={closeModals} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium">
                                Ləğv et
                            </button>
                            <button
                                onClick={() => submit("feedback")}
                                disabled={submitting}
                                className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold shadow transition-all disabled:opacity-50"
                            >
                                {submitting ? "Göndərilir..." : "Rəy Göndər"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🟥 BUG REPORT MODAL (Red Theme) */}
            {showBugReport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative animate-fade-in">
                        <button onClick={closeModals} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <XMarkIcon className="h-6 w-6" />
                        </button>

                        <div className="flex items-center gap-2 mb-4 text-red-600">
                            <BugAntIcon className="h-6 w-6" />
                            <h2 className="text-xl font-bold">Xəta Bildir</h2>
                        </div>

                        <div className="space-y-4">
                            <input
                                value={pageContext}
                                onChange={(e) => setPageContext(e.target.value)}
                                placeholder="Səhifə / keçid (könüllü)"
                                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-red-200 outline-none"
                            />

                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={5}
                                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-red-200 outline-none resize-none"
                                placeholder="Xətanın yaranma addımları, gözlənilən və faktiki nəticə..."
                            />

                            {/* Custom Image Upload UI */}
                            {!screenshot ? (
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-red-300 border-dashed rounded-lg cursor-pointer bg-red-50 hover:bg-red-100 transition-all">
                                    <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                        <PhotoIcon className="w-6 h-6 mb-1 text-red-400" />
                                        <p className="text-xs text-red-500 font-semibold">Ekran görüntüsü yüklə</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            ) : (
                                <div className="flex items-center justify-between w-full p-2 border border-red-200 rounded-lg bg-red-50">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <img src={URL.createObjectURL(screenshot)} alt="preview" className="h-10 w-10 object-cover rounded" />
                                        <span className="text-sm truncate max-w-[150px] text-red-700">{screenshot.name}</span>
                                    </div>
                                    <button onClick={() => setScreenshot(null)} className="text-red-400 hover:text-red-600 hover:bg-red-100 p-1 rounded">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={closeModals} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium">
                                Ləğv et
                            </button>
                            <button
                                onClick={() => submit("bug")}
                                disabled={submitting}
                                className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold shadow transition-all disabled:opacity-50"
                            >
                                {submitting ? "Göndərilir..." : "Xətanı Bildir"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}