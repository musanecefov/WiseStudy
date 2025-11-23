// src/pages/Profile.jsx
import { useEffect, useState, useContext, useRef } from "react";
import { Spinner, Progress } from "flowbite-react";
import { AuthContext } from "../context/AuthContext.jsx";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

// Translate Days for Charts
const DAYS = ["B.", "B.E.", "Ç.A.", "Ç.", "C.A.", "C.", "Ş."];

export default function Profile() {
    const { user, fetchWithAuth, logout } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [updatingAvatar, setUpdatingAvatar] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState("overview"); // overview, settings, security

    // profile state (editable)
    const [profile, setProfile] = useState({
        id: user?.id || user?._id || null,
        username: user?.username || "",
        email: user?.email || "",
        role: user?.role || "user",
        avatarUrl: user?.avatarUrl || user?.avatar || null,
        joinedAt: user?.createdAt || null,
    });

    // stats fetched from results endpoint
    const [stats, setStats] = useState({
        overall: { total: 0, correct: 0, average: 0, timeSeconds: 0 },
        weekly: DAYS.map((d) => ({ day: d, solved: 0 })),
    });

    // password inputs
    const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmNew: "" });

    // avatar file ref
    const fileRef = useRef(null);

    useEffect(() => {
        if (!user) return;
        setProfile((p) => ({
            ...p,
            id: user.id || user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl || user.avatar || p.avatarUrl,
            joinedAt: user.createdAt || user.joinedAt,
        }));

        fetchProfileStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchProfileStats = async () => {
        setLoading(true);
        try {
            const res = await fetchWithAuth(`/api/student-answers/results/${profile.id}`);
            if (!res.ok) throw new Error("Statistikanı yükləmək mümkün olmadı");
            const data = await res.json();
            const attempts = data.lastAttempts || [];

            let total = 0,
                correct = 0,
                totalTimeMs = 0;
            const weekCounts = DAYS.map((d) => ({ day: d, solved: 0 }));

            attempts.forEach((att) => {
                total += 1;
                if (att.lastAttempt?.correct) correct += 1;
                totalTimeMs += att.lastAttempt?.timeTaken || 0;
                const dt = att.lastAttempt?.attemptedAt ? new Date(att.lastAttempt.attemptedAt) : null;
                if (dt) {
                    weekCounts[dt.getDay()].solved += 1;
                }
            });

            setStats({
                overall: {
                    total,
                    correct,
                    average: total ? (correct / total) * 100 : 0,
                    timeSeconds: Math.round(totalTimeMs / 1000),
                },
                weekly: weekCounts,
            });
        } catch (err) {
            console.error("fetchProfileStats error:", err);
            setToast({ type: "error", text: err.message || "Statistika yüklənmədi" });
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (k, v) => setProfile((p) => ({ ...p, [k]: v }));

    const saveProfile = async () => {
        setSavingProfile(true);
        try {
            const res = await fetchWithAuth(`/api/users/${profile.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: profile.username }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Profili yeniləmək mümkün olmadı");
            }

            const updated = await res.json();
            const newUser = updated.user || updated;
            if (newUser) {
                localStorage.setItem("user", JSON.stringify(newUser));
            }
            setToast({ type: "success", text: "Profil uğurla yeniləndi!" });
        } catch (err) {
            console.error("saveProfile error:", err);
            setToast({ type: "error", text: err.message || "Yadda saxlamaq mümkün olmadı" });
        } finally {
            setSavingProfile(false);
            setTimeout(() => setToast(null), 3000);
        }
    };

    const onChooseFile = (file) => {
        setUpdatingAvatar(true);
        const fd = new FormData();
        fd.append("avatar", file);

        fetchWithAuth(`/api/users/${profile.id}/avatar`, {
            method: "POST",
            body: fd,
        })
            .then(async (res) => {
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.message || "Yükləmə uğursuz oldu");
                }
                return res.json();
            })
            .then((data) => {
                const updated = data.user || data;
                const avatarUrl = updated.avatarUrl || updated.avatar || data.avatarUrl;
                setProfile((p) => ({ ...p, avatarUrl }));
                const stored = JSON.parse(localStorage.getItem("user") || "{}");
                stored.avatarUrl = avatarUrl;
                localStorage.setItem("user", JSON.stringify(stored));
                setToast({ type: "success", text: "Profil şəkli uğurla yeniləndi!" });
            })
            .catch((err) => {
                console.error("avatar upload error:", err);
                setToast({ type: "error", text: err.message || "Yükləmə uğursuz oldu" });
            })
            .finally(() => {
                setUpdatingAvatar(false);
                setTimeout(() => setToast(null), 3000);
            });
    };

    const handleAvatarInput = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (!f.type.startsWith("image/")) {
            setToast({ type: "error", text: "Zəhmət olmasa, şəkil faylı seçin" });
            setTimeout(() => setToast(null), 2500);
            return;
        }
        onChooseFile(f);
    };

    const changePassword = async () => {
        if (!passwords.oldPassword || !passwords.newPassword || passwords.newPassword !== passwords.confirmNew) {
            setToast({ type: "error", text: "Zəhmət olmasa bütün xanaları doldurun və şifrələrin uyğunluğundan əmin olun" });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        setChangingPassword(true);
        try {
            const res = await fetchWithAuth("/api/users/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: profile.id,
                    oldPassword: passwords.oldPassword,
                    newPassword: passwords.newPassword,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Şifrə dəyişdirilə bilmədi");
            }

            setPasswords({ oldPassword: "", newPassword: "", confirmNew: "" });
            setToast({ type: "success", text: "Şifrə uğurla dəyişdirildi!" });
        } catch (err) {
            console.error("changePassword error:", err);
            setToast({ type: "error", text: err.message || "Şifrəni dəyişmək mümkün olmadı" });
        } finally {
            setChangingPassword(false);
            setTimeout(() => setToast(null), 3000);
        }
    };

    const deleteAccount = async () => {
        if (!confirm("Hesabınızı silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.")) return;
        setDeleting(true);
        try {
            const res = await fetchWithAuth(`/api/users/${profile.id}`, { method: "DELETE" });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Silmək mümkün olmadı");
            }
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
            logout();
            setToast({ type: "success", text: "Hesab silindi" });
            setTimeout(() => (window.location.href = "/"), 1000);
        } catch (err) {
            console.error("deleteAccount error:", err);
            setToast({ type: "error", text: err.message || "Silinmə xətası" });
        } finally {
            setDeleting(false);
            setTimeout(() => setToast(null), 3000);
        }
    };

    const exportJson = () => {
        const payload = { profile, stats };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `wisestudy-profile-${profile.username || "user"}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportCsv = () => {
        const rows = [["day", "solved"], ...stats.weekly.map((r) => [r.day, r.solved])];
        const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `wisestudy-weekly-${profile.username || "user"}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const formatSeconds = (s) => {
        if (!s && s !== 0) return "-";
        const mins = Math.floor(s / 60);
        const secs = Math.floor(s % 60);
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-50 via-white to-blue-50">
                <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 text-center max-w-md">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-800">Daxil olmaq tələb olunur</h2>
                    <p className="text-gray-600 mb-6">Profilinizi görmək və idarə etmək üçün zəhmət olmasa daxil olun</p>
                    <a href="/login" className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
                        Daxil ol
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Toast Notification */}
                {toast && (
                    <div className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-xl shadow-xl text-white font-medium transform transition-all ${
                        toast.type === "error" ? "bg-red-500" : toast.type === "info" ? "bg-blue-500" : "bg-green-500"
                    }`}>
                        {toast.text}
                    </div>
                )}

                {/* Header Card */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 mb-6 relative overflow-hidden">
                    {/* Decorative gradient */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-100/50 to-blue-100/50 rounded-full blur-3xl -z-0"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-400 via-purple-500 to-blue-500 shadow-xl ring-4 ring-white">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-4xl">
                                        {profile.username?.charAt(0)?.toUpperCase() || "U"}
                                    </div>
                                )}
                            </div>

                            {/* Hover overlay */}
                            <label
                                htmlFor="avatarInput"
                                className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <div className="text-center text-white">
                                    <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-xs font-medium">Dəyişdir</span>
                                </div>
                            </label>
                            <input id="avatarInput" type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleAvatarInput} />

                            {updatingAvatar && (
                                <div className="absolute inset-0 bg-white/90 rounded-2xl flex items-center justify-center">
                                    <Spinner size="lg" />
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">{profile.username}</h1>
                            <p className="text-gray-600 mb-4">{profile.email}</p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                                  </svg>
                                    {profile.role}
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  Qoşuldu {profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString() : "-"}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    disabled={updatingAvatar}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updatingAvatar ? "Yüklənir..." : "Şəkil yüklə"}
                                </button>

                                <button
                                    onClick={() => {
                                        if (confirm("Çıxış edilsin?")) {
                                            logout();
                                            window.location.href = "/";
                                        }
                                    }}
                                    className="px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Çıxış
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-2 mb-6">
                    <div className="flex gap-2">
                        {[
                            { id: "overview", label: "İcmal", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
                            { id: "settings", label: "Profil Tənzimləmələri", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
                            { id: "security", label: "Təhlükəsizlik", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                                    activeTab === tab.id
                                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                                        : "text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                                </svg>
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Stats Cards */}
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.overall.total}</div>
                                <div className="text-sm text-gray-600">Ümumi Cəhdlər</div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.overall.correct}</div>
                                <div className="text-sm text-gray-600">Düzgün Cavablar</div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.overall.average.toFixed(1)}%</div>
                                <div className="text-sm text-gray-600">Dəqiqlik Dərəcəsi</div>
                                <div className="mt-3">
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                                            style={{ width: `${stats.overall.average}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">{formatSeconds(stats.overall.timeSeconds)}</div>
                                <div className="text-sm text-gray-600">Ümumi Təhsil Müddəti</div>
                            </div>
                        </div>

                        {/* Weekly Activity Chart */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Həftəlik Fəaliyyət
                            </h3>
                            <div style={{ height: 240 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.weekly}>
                                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '12px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Bar dataKey="solved" name="Həll olunan" radius={[8, 8, 0, 0]}>
                                            {stats.weekly.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={`url(#colorGradient${index})`} />
                                            ))}
                                        </Bar>
                                        <defs>
                                            {stats.weekly.map((_, index) => (
                                                <linearGradient key={index} id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "settings" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Profile Information */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Profil Məlumatları
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">İstifadəçi adı</label>
                                    <input
                                        value={profile.username}
                                        onChange={(e) => handleProfileChange("username", e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        placeholder="İstifadəçi adı daxil edin"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">E-poçt ünvanı</label>
                                    <input
                                        value={profile.email}
                                        readOnly
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">E-poçt dəyişdirilə bilməz</p>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        onClick={saveProfile}
                                        disabled={savingProfile}
                                        className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {savingProfile ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Spinner size="sm" />
                                                Yadda saxlanılır...
                                            </span>
                                        ) : (
                                            "Yadda Saxla"
                                        )}
                                    </button>

                                    <button
                                        onClick={() => {
                                            setProfile((p) => ({ ...p, username: user.username }));
                                            setToast({ type: "info", text: "Dəyişikliklər geri qaytarıldı" });
                                            setTimeout(() => setToast(null), 2000);
                                        }}
                                        className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Ləğv et
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Data Export */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Məlumatları İxrac Et
                            </h3>

                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                                    <h4 className="font-medium text-gray-900 mb-1">JSON İxrac Et</h4>
                                    <p className="text-sm text-gray-500 mb-3">Profil məlumatlarınızı JSON formatında endirin</p>
                                    <button onClick={exportJson} className="text-sm text-purple-600 font-medium hover:text-purple-700">
                                        Endir &rarr;
                                    </button>
                                </div>

                                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                                    <h4 className="font-medium text-gray-900 mb-1">CSV İxrac Et</h4>
                                    <p className="text-sm text-gray-500 mb-3">Həftəlik statistikanızı CSV formatında endirin</p>
                                    <button onClick={exportCsv} className="text-sm text-purple-600 font-medium hover:text-purple-700">
                                        Endir &rarr;
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "security" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Change Password */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Şifrəni Dəyiş
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Köhnə Şifrə</label>
                                    <input
                                        type="password"
                                        value={passwords.oldPassword}
                                        onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        placeholder="Köhnə şifrəni daxil edin"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Şifrə</label>
                                    <input
                                        type="password"
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        placeholder="Yeni şifrəni daxil edin"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Şifrəni Təsdiqlə</label>
                                    <input
                                        type="password"
                                        value={passwords.confirmNew}
                                        onChange={(e) => setPasswords({...passwords, confirmNew: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        placeholder="Yeni şifrəni təkrar daxil edin"
                                    />
                                </div>

                                <button
                                    onClick={changePassword}
                                    disabled={changingPassword}
                                    className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {changingPassword ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Spinner size="sm" />
                                            Dəyişdirilir...
                                        </span>
                                    ) : (
                                        "Şifrəni Yenilə"
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Delete Account */}
                        <div className="bg-white rounded-2xl shadow-md border border-red-100 p-6">
                            <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Hesabı Sil
                            </h3>

                            <p className="text-sm text-gray-600 mb-6">
                                Hesabınızı və bütün məlumatlarınızı həmişəlik silin. Bu əməliyyatı geri qaytarmaq mümkün deyil.
                            </p>

                            <button
                                onClick={deleteAccount}
                                disabled={deleting}
                                className="px-6 py-3 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors w-full sm:w-auto"
                            >
                                {deleting ? "Silinir..." : "Hesabımı Sil"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
