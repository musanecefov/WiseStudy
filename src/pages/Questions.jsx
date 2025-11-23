import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { Spinner } from "flowbite-react";
import MathText from "../components/MathText.jsx";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Questions() {
    const { subject, topicName } = useParams();
    const { user, fetchWithAuth } = useContext(AuthContext);

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [answers, setAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [showFeedback, setShowFeedback] = useState(false);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [direction, setDirection] = useState(0);
    const [previousResults, setPreviousResults] = useState({});

    const [startTime, setStartTime] = useState(Date.now());
    const [elapsedTime, setElapsedTime] = useState(0); // in seconds

    // Modal for previous attempts
    const [showAttemptsModal, setShowAttemptsModal] = useState(false);
    const [attemptsList, setAttemptsList] = useState([]);
    // store the options for the question whose attempts are shown (fixes wrong option display)
    const [currentAttemptOptions, setCurrentAttemptOptions] = useState([]);

    // Timer effect (Option A: reset timer when question resets via resetQuestionState)
    useEffect(() => {
        if (isAnswerChecked) return; // stop timer if answer checked
        const interval = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime, isAnswerChecked]);

    // Fetch questions (use fetchWithAuth so base URL + token are applied)
    useEffect(() => {
        if (!subject) return;

        const fetchQuestions = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetchWithAuth(`/api/questions?subject=${subject}&topic=${topicName}`, {
                    headers: { "Content-Type": "application/json" },
                });
                if (!res.ok) throw new Error("Failed to fetch questions");
                const data = await res.json();
                setQuestions(data);
                setCurrentQuestionIndex(0);
                setFeedback("");
                setShowFeedback(false);
                setIsAnswerChecked(false);
                setStartTime(Date.now());
                setElapsedTime(0);
                setAnswers({});
                setPreviousResults({});
            } catch (err) {
                setError(err.message || "Xəta baş verdi");
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [subject, topicName, fetchWithAuth]);

    // Fetch previous results for the loaded questions (only when user is present)
    useEffect(() => {
        const fetchPreviousResults = async () => {
            if (!user || questions.length === 0) return;

            const results = {};
            for (let q of questions) {
                try {
                    const res = await fetchWithAuth(`/api/student-answers/answers/${user.id}/${q._id}`, {
                        headers: { "Content-Type": "application/json" },
                    });
                    if (!res.ok) continue;
                    const data = await res.json();
                    results[q._id] = data;
                } catch (err) {
                    console.error("Failed to fetch previous result for question", q._id, err);
                }
            }
            setPreviousResults(results);
        };

        fetchPreviousResults();
    }, [questions, user, fetchWithAuth]);

    const handleSelect = (questionId, optionIndex) => {
        if (!isAnswerChecked) setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleCheckAnswer = async () => {
        // Require login to "solve" (check answer)
        if (!user) {
            setFeedback("Bu funksiyadan istifadə etmək üçün daxil olmalısınız.");
            setShowFeedback(true);
            return;
        }

        const currentQuestion = questions[currentQuestionIndex];
        const userAnswerIndex = answers[currentQuestion._id];

        if (userAnswerIndex === undefined) {
            setFeedback("Zəhmət olmasa yoxlamamışdan qabaq bir cavabı seçin.");
            setShowFeedback(true);
            return;
        }

        const isCorrect = userAnswerIndex === currentQuestion.correctAnswer;
        const timeTaken = elapsedTime * 1000; // in ms

        setFeedback(
            isCorrect
                ? "Düzdür!"
                : `Səhvdir. Düzgün cavab: ${currentQuestion.options[currentQuestion.correctAnswer]}`
        );
        setShowFeedback(true);
        setIsAnswerChecked(true);

        setPreviousResults(prev => ({
            ...prev,
            [currentQuestion._id]: { attempted: true, correct: isCorrect },
        }));

        // Save answer only if user is logged in
        try {
            const res = await fetchWithAuth("/api/student-answers/answers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: user.id,
                    questionId: currentQuestion._id,
                    correct: isCorrect,
                    selectedOption: userAnswerIndex,
                    timeTaken,
                }),
            });

            if (!res.ok) {
                console.error("Failed to save answer");
            }
        } catch (err) {
            console.error("Error saving answer:", err);
        }
    };

    // Fetch attempts for a specific question and store its options to show correct selected option in modal
    const fetchAttempts = async (questionId, questionOptions) => {
        if (!user) {
            setFeedback("Cəhdlərə baxmaq üçün daxil olmalısınız.");
            setShowFeedback(true);
            return;
        }

        try {
            const res = await fetchWithAuth(`/api/student-answers/answers/attempts/${user.id}/${questionId}`, {
                headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) {
                console.error("Failed to fetch attempts");
                return;
            }
            const data = await res.json();
            setAttemptsList(data.attempts || []);
            setCurrentAttemptOptions(questionOptions || []);
            setShowAttemptsModal(true);
        } catch (error) {
            console.error("Error fetching attempts:", error);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setDirection(1);
            setCurrentQuestionIndex(prev => prev + 1);
            resetQuestionState();
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setDirection(-1);
            setCurrentQuestionIndex(prev => prev - 1);
            resetQuestionState();
        }
    };

    const handleGoToQuestion = (index) => {
        if (index === currentQuestionIndex) return;
        setDirection(index > currentQuestionIndex ? 1 : -1);
        setCurrentQuestionIndex(index);
        resetQuestionState();
    };

    const resetQuestionState = () => {
        setFeedback("");
        setShowFeedback(false);
        setIsAnswerChecked(false);
        setStartTime(Date.now());
        setElapsedTime(0);
    };

    const variants = {
        enter: (direction) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (direction) => ({ x: direction > 0 ? -100 : 100, opacity: 0 }),
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0b0b2b] via-[#1b2735] to-[#090a0f] text-white flex flex-col items-center justify-center p-4">
            <div className="relative z-10 w-full max-w-2xl space-y-6 bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6">
                {loading && (
                    <p className="flex flex-row items-center justify-center text-blue-400 text-lg font-semibold space-x-3 py-4">
                        <Spinner className="w-6 h-6" /> Suallar yüklənir...
                    </p>
                )}
                {!loading && questions.length > 0 && (
                    <>
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={questions[currentQuestionIndex]._id}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                            >
                                <div className="bg-white/20 p-4 rounded-lg shadow space-y-3">
                                    {/* Timer */}
                                    <p className="text-right font-mono text-sm text-yellow-300">
                                        Vaxt: {formatTime(elapsedTime)}
                                    </p>

                                    {/* Question */}
                                    <p className="font-semibold">{currentQuestionIndex + 1}.
                                        {subject === "math" ? (
                                            <MathText text={questions[currentQuestionIndex].text} />
                                        ) : (
                                            questions[currentQuestionIndex].text
                                        )}
                                    </p>

                                    {/* Options */}
                                    <div className="flex flex-col space-y-2">
                                        {questions[currentQuestionIndex].options.map((opt, i) => {
                                            const isSelected = answers[questions[currentQuestionIndex]._id] === i;
                                            const isCorrect = i === questions[currentQuestionIndex].correctAnswer;

                                            let buttonClass =
                                                "bg-gray-200/30 border border-gray-400/50 hover:bg-gray-200/50";

                                            if (isSelected) buttonClass = "bg-blue-400/30 border-blue-400";
                                            if (isAnswerChecked) {
                                                if (isCorrect) buttonClass = "bg-green-400/30 border-green-400";
                                                else if (isSelected) buttonClass = "bg-red-400/30 border-red-400";
                                            }

                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() =>
                                                        handleSelect(questions[currentQuestionIndex]._id, i)
                                                    }
                                                    className={`px-4 py-2 rounded border w-full text-left ${buttonClass}`}
                                                    disabled={isAnswerChecked}
                                                >
                                                    {subject === "math" ? <MathText text={opt} /> : opt}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Previous Result Badge */}
                                    {previousResults[questions[currentQuestionIndex]._id]?.attempted ? (
                                        <p className="mt-2 text-sm">
                                            Ən son cəhd:{" "}
                                            {previousResults[questions[currentQuestionIndex]._id].correct ? (
                                                <span className="text-green-400 font-semibold">Düzgün ✓</span>
                                            ) : (
                                                <span className="text-red-400 font-semibold">Səhv ✗</span>
                                            )}
                                        </p>
                                    ) : (
                                        <p className="mt-2 text-sm text-gray-300">Daha əvvəl cəhd edilməyib</p>
                                    )}

                                    {/* Previous Attempts Button */}
                                    <button
                                        onClick={() =>
                                            fetchAttempts(
                                                questions[currentQuestionIndex]._id,
                                                questions[currentQuestionIndex].options
                                            )
                                        }
                                        className="mt-3 bg-blue-600/40 hover:bg-blue-600/60 px-3 py-2 rounded-lg text-sm"
                                    >
                                        Əvvəlki Cəhdlər
                                    </button>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {showFeedback && (
                            <div
                                className={`p-3 rounded-md ${
                                    feedback.startsWith("Düzdür!")
                                        ? "bg-green-500/30 text-green-300"
                                        : "bg-red-500/30 text-red-300"
                                }`}
                            >
                                {feedback}
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex items-center justify-end w-full mt-6 space-x-2">
                            {currentQuestionIndex > 0 && (
                                <button
                                    onClick={handlePreviousQuestion}
                                    className="bg-slate-700 hover:bg-slate-800 px-3 py-2 rounded-lg"
                                >
                                    <HiOutlineChevronLeft className="inline-block" /> Əvvəlki sual
                                </button>
                            )}

                            {currentQuestionIndex < questions.length - 1 && (
                                <button
                                    onClick={handleNextQuestion}
                                    className="bg-slate-700 hover:bg-slate-800 px-3 py-2 rounded-lg"
                                >
                                    Sonrakı sual <HiOutlineChevronRight className="inline-block" />
                                </button>
                            )}

                            <button
                                onClick={handleCheckAnswer}
                                disabled={
                                    isAnswerChecked ||
                                    answers[questions[currentQuestionIndex]._id] === undefined
                                }
                                className="bg-slate-700 hover:bg-slate-800 px-3 py-2 rounded-lg"
                            >
                                Yoxla
                            </button>
                        </div>

                        {/* Question Navigation */}
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            {questions.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleGoToQuestion(idx)}
                                    className={`px-3 py-1 rounded-lg border ${
                                        currentQuestionIndex === idx
                                            ? "bg-blue-500 border-blue-400"
                                            : "bg-gray-200/20 border-gray-400/50"
                                    }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {!loading && questions.length === 0 && (
                    <p className="text-center text-gray-300">Bu mövzu üçün sual tapılmadı.</p>
                )}

                {error && <p className="text-red-400 text-center">{error}</p>}
            </div>

            {/* Previous Attempts Modal */}
            {showAttemptsModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-900 text-white rounded-xl shadow-2xl p-6 max-w-lg w-full flex flex-col space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="font-bold text-2xl text-yellow-400">Əvvəlki Cəhdlər</h2>
                            <button
                                onClick={() => setShowAttemptsModal(false)}
                                className="text-white hover:text-red-500 text-lg font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {attemptsList.length === 0 ? (
                            <p className="text-gray-400 text-center">Daha əvvəl cəhd edilməyib.</p>
                        ) : (
                            <div className="max-h-64 overflow-y-auto">
                                <ul className="space-y-2">
                                    {attemptsList.map((attempt, idx) => (
                                        <li
                                            key={idx}
                                            className={`flex justify-between items-center p-3 rounded-lg ${
                                                attempt.correct ? "bg-green-500/20" : "bg-red-500/20"
                                            }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-semibold">
                                                    {attempt.correct ? "✅ Düzdür" : "❌ Səhvdir"}
                                                </span>
                                                <span className="text-gray-300 text-sm">
                                                    Seçilən:{" "}
                                                    {attempt.selectedOption !== undefined
                                                        ? (currentAttemptOptions[attempt.selectedOption] ?? "N/A")
                                                        : "N/A"}
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    Cəhd edildi: {new Date(attempt.attemptedAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="font-mono text-sm text-yellow-300">
                                                {Math.floor(attempt.timeTaken / 1000)}s
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            onClick={() => setShowAttemptsModal(false)}
                            className="self-end px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-500 transition"
                        >
                            Bağla
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
