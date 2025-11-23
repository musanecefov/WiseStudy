import { useEffect, useState, useContext, useMemo } from "react";
import { Spinner, Progress } from "flowbite-react";
import { AuthContext } from "../context/AuthContext.jsx";
import MathText from "../components/MathText.jsx";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";

/**
 * Pastel Purple palette
 * accent: #8b5cf6
 * light accent variants created inline
 */

const DAYS = ["B.", "B.E.", "Ç.A.", "Ç.", "C.A.", "C.", "Ş."];

// Helper for translating subject keys to display names
const subjectTitles = {
    azerbaijani: "Azərbaycan dili",
    math: "Riyaziyyat",
    english: "İngilis dili"
};

export default function Results() {
    const { user, fetchWithAuth } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [lastAttempts, setLastAttempts] = useState([]);
    const [topicStats, setTopicStats] = useState({});
    const [overallStats, setOverallStats] = useState({ total: 0, correct: 0, average: 0 });
    const [studyStreak, setStudyStreak] = useState(0);
    const [weeklyActivity, setWeeklyActivity] = useState([]); // [{ day, solved }]
    const [subjectAnalytics, setSubjectAnalytics] = useState({});
    const [overallTime, setOverallTime] = useState(0); // seconds

    // Helper: seconds -> mm:ss
    const formatSeconds = (s) => {
        if (!s && s !== 0) return "-";
        const mins = Math.floor(s / 60);
        const secs = Math.floor(s % 60);
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    // Heatmap color function (pastel purple scale)
    const getHeatColor = (count, maxCount) => {
        // returns rgba-based pastel purple depending on intensity
        if (!count) return "rgba(139,92,246,0.06)"; // very light
        const intensity = Math.min(count / Math.max(1, maxCount), 1);
        // map intensity to alpha between 0.15 and 0.95
        const alpha = 0.15 + intensity * 0.8;
        return `rgba(139,92,246,${alpha})`;
    };

    useEffect(() => {
        if (!user) return;

        const fetchResults = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetchWithAuth(`/api/student-answers/results/${user.id}`);
                if (!res.ok) throw new Error("Nəticələri yükləmək mümkün olmadı");

                const data = await res.json();
                const attempts = data.lastAttempts || [];
                setLastAttempts(attempts);

                // --- Overall stats (based on lastAttempt correctness) ---
                let totalQuestions = 0,
                    totalCorrect = 0;
                let globalTimeMs = 0;

                attempts.forEach((att) => {
                    totalQuestions += 1;
                    if (att.lastAttempt?.correct) totalCorrect += 1;
                    globalTimeMs += att.lastAttempt?.timeTaken || 0;
                });

                setOverallStats({
                    total: totalQuestions,
                    correct: totalCorrect,
                    average: totalQuestions ? (totalCorrect / totalQuestions) * 100 : 0,
                });

                setOverallTime(Number((globalTimeMs / 1000).toFixed(1))); // seconds

                // --- Topic stats ---
                const topicData = {};
                attempts.forEach((att) => {
                    const topic = att.question?.topic || "General";
                    if (!topicData[topic]) topicData[topic] = { total: 0, correct: 0 };
                    topicData[topic].total += 1;
                    if (att.lastAttempt?.correct) topicData[topic].correct += 1;
                });
                for (let t in topicData) {
                    topicData[t].average = (topicData[t].correct / topicData[t].total) * 100;
                }
                setTopicStats(topicData);

                // --- Study streak: consecutive days with >=1 attempt (consider lastAttempt time) ---
                // get unique attempt dates (local)
                const uniqueDates = [
                    ...new Set(
                        attempts
                            .map((a) => (a.lastAttempt?.attemptedAt ? new Date(a.lastAttempt.attemptedAt).toDateString() : null))
                            .filter(Boolean)
                    ),
                ].sort((a, b) => new Date(b) - new Date(a)); // newest first

                let streak = 0;
                let cursor = new Date(); // today
                for (let dStr of uniqueDates) {
                    const d = new Date(dStr);
                    // if d is same day as cursor
                    if (d.toDateString() === cursor.toDateString()) {
                        streak++;
                        cursor = new Date(cursor.getTime() - 24 * 3600 * 1000);
                    } else {
                        // if d equals cursor - 1 day
                        const diffDays = Math.round((cursor - d) / (24 * 3600 * 1000));
                        if (diffDays === 1) {
                            streak++;
                            cursor = new Date(d.getTime() - 24 * 3600 * 1000);
                        } else break;
                    }
                }
                setStudyStreak(streak);

                // --- Weekly activity (Sun..Sat count of solved attempts (lastAttempt exists)) ---
                const weekCounts = DAYS.map((day) => ({ day, solved: 0 }));
                attempts.forEach((att) => {
                    const dt = att.lastAttempt?.attemptedAt ? new Date(att.lastAttempt.attemptedAt) : null;
                    if (!dt) return;
                    const idx = dt.getDay();
                    weekCounts[idx].solved += 1;
                });
                setWeeklyActivity(weekCounts);

                // --- Subject analytics (Azerbaijani, Math, English) ---
                const subjects = ["Azerbaijani", "Math", "English"];
                const subAnalytics = {};
                for (let sub of subjects) {
                    const filtered = attempts.filter((a) => (a.question?.subject || "").toLowerCase() === sub.toLowerCase());
                    const total = filtered.length;
                    const correct = filtered.filter((a) => a.lastAttempt?.correct).length;
                    const wrong = total - correct;
                    const totalTimeMs = filtered.reduce((acc, a) => acc + (a.lastAttempt?.timeTaken || 0), 0);
                    const avgTimeMs = total ? totalTimeMs / total : 0;

                    // weekly breakdown (Sun..Sat)
                    const weeklyAttempts = DAYS.map((day, i) => {
                        const filteredDay = filtered.filter((a) => {
                            const dt = a.lastAttempt?.attemptedAt ? new Date(a.lastAttempt.attemptedAt) : null;
                            return dt ? dt.getDay() === i : false;
                        });
                        const correctC = filteredDay.filter((a) => a.lastAttempt?.correct).length;
                        const wrongC = filteredDay.length - correctC;
                        const timeC = filteredDay.reduce((acc, a) => acc + (a.lastAttempt?.timeTaken || 0), 0);
                        return {
                            day,
                            correct: correctC,
                            wrong: wrongC,
                            time: Number((timeC / 1000).toFixed(1)), // seconds
                        };
                    });

                    subAnalytics[sub.toLowerCase()] = {
                        total,
                        correct,
                        wrong,
                        totalTime: Number((totalTimeMs / 1000).toFixed(1)), // seconds
                        avgTime: Number((avgTimeMs / 1000).toFixed(1)), // seconds
                        weeklyAttempts,
                    };
                }
                setSubjectAnalytics(subAnalytics);
            } catch (err) {
                setError(err.message || "Nəticələrin yüklənməsində xəta");
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [user, fetchWithAuth]);

    // derive max count for heatmap intensity
    const heatMax = useMemo(() => {
        const max = weeklyActivity.reduce((acc, d) => Math.max(acc, d.solved || 0), 0);
        return Math.max(1, max);
    }, [weeklyActivity]);

    if (loading)
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-gray-800 bg-white">
                <Spinner className="w-12 h-12 mb-4" />
                <p className="text-gray-600">Nəticələr yüklənir...</p>
            </div>
        );

    if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

    // Pastel white card style
    const cardClass =
        "bg-white shadow-sm rounded-2xl p-4 text-gray-800";

    return (
        <div className="min-h-screen p-6 bg-[#FBFBFD] text-gray-800">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-semibold mb-6 text-center" style={{ color: "#3b3054" }}>
                    Nəticələrim
                </h1>

                {/* Top Summary Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className={cardClass}>
                        <p className="text-sm text-gray-500">İndiyədək cəhd edilən sualların sayı</p>
                        <p className="text-2xl font-bold mt-2">{overallStats.total}</p>
                    </div>

                    <div className={cardClass}>
                        <p className="text-sm text-gray-500">Hazırkı dəqiqlik</p>
                        <p className="text-2xl font-bold mt-2">
                            {overallStats.correct} / {overallStats.total}
                        </p>
                        <div className="mt-3">
                            <Progress
                                className="h-3 rounded-lg"
                                progress={Number(overallStats.average.toFixed(1))}
                                color="purple"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {overallStats.average.toFixed(1)}% ortalama
                            </div>
                        </div>
                    </div>

                    <div className={cardClass}>
                        <p className="text-sm text-gray-500">Seriya</p>
                        <p className="text-2xl font-bold mt-2">{studyStreak} {studyStreak === 1 ? "gün" : "gün"}</p>
                        <div className="text-xs text-gray-500 mt-2">Ən azı 1 sual həll etdiyin ardıcıl günlər</div>
                    </div>

                    <div className={cardClass}>
                        <p className="text-sm text-gray-500">Ümumi Sərf Edilən Vaxt</p>
                        <p className="text-2xl font-bold mt-2">{overallTime}san</p>
                        <div className="text-xs text-gray-500 mt-2">Son cəhdlərin ümumi vaxtı (saniyə ilə)</div>
                    </div>
                </div>

                {/* Weekly Heatmap + Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    {/* Heatmap */}
                    <div className={`${cardClass} col-span-1 lg:col-span-1`}>
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold">Həftəlik Fəaliyyət Xəritəsi</h2>
                            <div className="text-xs text-gray-500">B.-Ş.</div>
                        </div>
                        <div className="mt-4">
                            <div className="flex gap-2 items-center">
                                {weeklyActivity.map((d, idx) => (
                                    <div key={d.day} className="flex flex-col items-center">
                                        <div
                                            title={`${d.solved} cəhd`}
                                            style={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: 8,
                                                background: getHeatColor(d.solved, heatMax),
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
                                            }}
                                        >
                                            <div className="text-sm font-medium" style={{ color: "#3b3054" }}>
                                                {d.solved || ""}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">{d.day}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 text-xs text-gray-500">
                                Heatmap hər gün üzrə cəhdlərin sayını göstərir. Tünd rəng = Daha çox aktivlik.
                            </div>
                        </div>
                    </div>

                    {/* Weekly Activity chart */}
                    <div className={`${cardClass} col-span-2`}>
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold">Həftəlik Fəaliyyət</h2>
                            <div className="text-xs text-gray-500">Cəhd olunan sualların sayı</div>
                        </div>

                        <div className="mt-4 h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyActivity}>
                                    <XAxis dataKey="day" stroke="#8b5cf6" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="solved" name="Həll olunan" fill="#8b5cf6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Topic Summary */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3">Mövzu İcmalı</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.keys(topicStats).length === 0 ? (
                            <div className={cardClass}>Hələ mövzu məlumatı yoxdur.</div>
                        ) : (
                            Object.keys(topicStats).map((topic) => (
                                <div key={topic} className={cardClass}>
                                    <h3 className="font-medium">{topic}</h3>
                                    <div className="mt-2 text-sm text-gray-600">
                                        {topicStats[topic].correct} / {topicStats[topic].total} düzgün
                                    </div>
                                    <div className="mt-3">
                                        <Progress
                                            className="h-3 rounded-lg"
                                            progress={Number(topicStats[topic].average.toFixed(1))}
                                            color="purple"
                                        />
                                        <div className="text-xs text-gray-500 mt-1">
                                            {topicStats[topic].average.toFixed(1)}% dəqiqlik
                                        </div>
                                    </div>
                                    {topicStats[topic].average < 80 && (
                                        <div className="mt-3 text-sm text-rose-600 font-semibold">
                                            Bu mövzunu təkmilləşdirməyiniz məsləhətdir
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Subject Analytics */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">Fənn Analizi</h2>

                    {["azerbaijani", "math", "english"].map((subKey) => {
                        const s = subjectAnalytics[subKey] || { total: 0, correct: 0, wrong: 0, totalTime: 0, avgTime: 0, weeklyAttempts: DAYS.map(d => ({ day: d, correct: 0, wrong: 0, time: 0 })) };
                        return (
                            <div key={subKey} className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-lg">
                                        {subjectTitles[subKey] || subKey}
                                    </h3>
                                    <div className="text-sm text-gray-500">
                                        Ümumi vaxt: <span className="font-medium">{s.totalTime}san</span> • Ort: <span className="font-medium">{s.avgTime}san</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className={cardClass}>
                                        <p className="text-xs text-gray-500">Ümumi Sual Sayı</p>
                                        <p className="text-xl font-bold mt-2">{s.total}</p>
                                    </div>
                                    <div className={cardClass}>
                                        <p className="text-xs text-gray-500">Düzgün</p>
                                        <p className="text-xl font-bold mt-2">{s.correct}</p>
                                    </div>
                                    <div className={cardClass}>
                                        <p className="text-xs text-gray-500">Səhv</p>
                                        <p className="text-xl font-bold mt-2">{s.wrong}</p>
                                    </div>
                                </div>

                                {/* Charts row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className={`${cardClass} p-3`}>
                                        <p className="font-semibold mb-2">Cəhdlər (həftəlik)</p>
                                        <div style={{ height: 180 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={s.weeklyAttempts}>
                                                    <XAxis dataKey="day" stroke="#8b5cf6" />
                                                    <YAxis allowDecimals={false} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="correct" name="Düzgün" fill="#8b5cf6" />
                                                    <Bar dataKey="wrong" name="Səhv" fill="#f87171" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className={`${cardClass} p-3`}>
                                        <p className="font-semibold mb-2">Sərf olunan vaxt (həftəlik/san)</p>
                                        <div style={{ height: 180 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={s.weeklyAttempts}>
                                                    <XAxis dataKey="day" stroke="#8b5cf6" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="time" name="Vaxt (san)" fill="#c4b5fd" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}