import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminFeedback() {
    const { fetchWithAuth, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [expandedImage, setExpandedImage] = useState(null); // For modal
    const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });

    useEffect(() => {
        if (user === undefined) return;
        if (!user || user.role !== "admin") {
            navigate("/"); // Redirect non-admins immediately
            return;
        }
        load();
    }, [user]);

    useEffect(() => {
        // Recalculate stats whenever items change
        const total = items.length;
        const resolved = items.filter(i => i.resolved).length;
        const pending = total - resolved;
        setStats({ total, resolved, pending });
    }, [items]);

    const load = async () => {
        try {
            const res = await fetchWithAuth("/api/feedback");
            const data = await res.json();
            if (res.ok) setItems(data.items || []);
        } catch (e) {
            console.error("Failed to load feedback");
        } finally {
            setLoading(false);
        }
    };

    const resolveItem = async (id) => {
        try {
            const res = await fetchWithAuth(`/api/feedback/${id}/resolve`, {
                method: "PATCH",
            });
            if (res.ok) {
                setItems(prev =>
                    prev.map(i => (i._id === id ? { ...i, resolved: true } : i))
                );
            }
        } catch (e) {
            console.error(e);
        }
    };

    const filteredItems = items.filter((i) => {
        if (filter === "resolved") return i.resolved;
        if (filter === "pending") return !i.resolved;
        return true;
    });

    if (loading) return (
        <div className="flex h-screen items-center justify-center text-indigo-600">
            <svg className="animate-spin h-10 w-10" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
            <div className="max-w-6xl mx-auto">

                {/* HEADER & STATS */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-800 mb-6">Admin Dashboard</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard label="Total Feedback" count={stats.total} color="bg-blue-500" />
                        <StatCard label="Pending Issues" count={stats.pending} color="bg-amber-500" />
                        <StatCard label="Resolved" count={stats.resolved} color="bg-green-500" />
                    </div>
                </div>

                {/* TABS */}
                <div className="flex gap-2 mb-6 border-b border-slate-200 pb-1">
                    {['all', 'pending', 'resolved'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-t-lg font-medium capitalize transition-all ${
                                filter === f
                                    ? "bg-white text-indigo-600 border border-b-0 border-slate-200 shadow-sm translate-y-[1px]"
                                    : "text-slate-500 hover:text-indigo-500 hover:bg-slate-100"
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* FEEDBACK LIST */}
                <div className="grid gap-4">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200 border-dashed">
                            No feedbacks found in this category.
                        </div>
                    ) : (
                        filteredItems.map((fb) => (
                            <FeedbackCard
                                key={fb._id}
                                fb={fb}
                                onResolve={resolveItem}
                                onExpandImage={setExpandedImage}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* IMAGE MODAL */}
            {expandedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setExpandedImage(null)}
                >
                    <img
                        src={expandedImage}
                        alt="Full View"
                        className="max-w-full max-h-full rounded-lg shadow-2xl border-2 border-white"
                    />
                    <button className="absolute top-5 right-5 text-white text-4xl">&times;</button>
                </div>
            )}
        </div>
    );
}

// --- Sub Components ---

function StatCard({ label, count, color }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-sm uppercase tracking-wider font-semibold">{label}</p>
                <p className="text-3xl font-bold text-slate-800">{count}</p>
            </div>
            <div className={`h-10 w-1 bg-opacity-20 rounded-full ${color}`}></div>
        </div>
    );
}

function FeedbackCard({ fb, onResolve, onExpandImage }) {
    return (
        <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 transition-all hover:shadow-md ${fb.resolved ? 'border-l-green-500 opacity-75' : 'border-l-amber-500'}`}>
            <div className="flex flex-col md:flex-row justify-between gap-4">

                {/* CONTENT */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${
                            fb.type === 'bug' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                            {fb.type}
                        </span>
                        <span className="text-slate-400 text-sm">
                            {new Date(fb.createdAt).toLocaleString()}
                        </span>
                        {fb.resolved && (
                            <span className="text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-700 border border-green-200">
                                ✓ Resolved
                            </span>
                        )}
                    </div>

                    <p className="text-slate-800 text-lg mb-2">{fb.text}</p>

                    <div className="text-sm text-slate-500 flex gap-4">
                        {fb.page && <span>Page: <code className="bg-slate-100 px-1 rounded">{fb.page}</code></span>}
                        {fb.meta?.userAgent && <span className="truncate max-w-xs" title={fb.meta.userAgent}>Device Info Available</span>}
                    </div>

                    {/* SCREENSHOT PREVIEW */}
                    {fb.screenshot && (
                        <div className="mt-4">
                            <p className="text-xs text-slate-400 mb-1">Attached Screenshot:</p>
                            <img
                                src={fb.screenshot}
                                alt="Screenshot"
                                className="h-24 w-auto rounded border border-slate-200 cursor-zoom-in hover:opacity-90 transition"
                                onClick={() => onExpandImage(fb.screenshot)}
                            />
                        </div>
                    )}
                </div>

                {/* ACTIONS */}
                <div className="flex items-start">
                    {!fb.resolved && (
                        <button
                            onClick={() => onResolve(fb._id)}
                            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
                        >
                            Mark Resolved
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}