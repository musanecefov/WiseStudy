import {
    AdjustmentsHorizontalIcon,
    ArrowRightIcon,
    ArrowTrendingUpIcon,
    BookOpenIcon,
    CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";


export default function Landing() {
    return (
        <>


            {/* Main content */}
            <div className="relative min-h-screen  text-gray-900">
                <div className="relative z-10">

                    {/* HERO SECTION */}
                    <motion.section
                        className="p-3 sm:p-6 md:p-8"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex flex-col md:flex-row items-center justify-center">
                            <div className="flex flex-col text-center items-center">
                                <h2 className="flex items-center space-x-12 p-4 px-3 py-1 bg-sky-200 text-indigo-400 rounded-full shadow-md w-fit">
                                    <CheckBadgeIcon className="h-6 w-5" />
                                    Azərbaycanda #1 Imtahan Hazırlıq Platforması
                                </h2>
                                <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold pt-4">
                                    <span className="text-gradient">Dövlət</span> imtahanlarına hazırlaşın.
                                </h2>
                                <p className="text-gray-500 pt-2 font-semibold">
                                    Minlərlə test sualı, detallı izləmə sistemi və professional tövsiyələrlə yüksək nəticə əldə edin.
                                </p>
                            </div>
                        </div>
                    </motion.section>

                    {/* CTA */}
                    <motion.section
                        className="flex justify-center px-4 sm:px-6 md:px-8"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Link to="/questions" className="flex items-center justify-center text-white rounded-lg px-7 py-3 shadow-md bg-blue-500 w-fit space-x-2 hover:bg-blue-600 hover:-translate-y-0.5 transition duration-200 ease-in-out">
                            <span>İndi Başla</span>
                            <ArrowRightIcon className="h-5 w-5" />
                        </Link>
                    </motion.section>

                    {/* SUBJECTS */}
                    <motion.section
                        className="flex flex-col items-center justify-center pt-10"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl font-bold mb-4 text-gradient1">Fənlər</h2>
                        <p className="text-lg text-gray-500 max-w-2xl text-center">
                            Hazırlıq görmək istədiyiniz fənni seçin
                        </p>
                    </motion.section>

                    <motion.section
                        className="w-full flex flex-col items-center md:flex-row justify-center gap-8 py-5 px-4"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        {[
                            { title: "Azərbaycan dili", questions: "250+" },
                            { title: "Riyaziyyat", questions: "250+" },
                            { title: "İngilis dili", questions: "250+" },
                        ].map((subject, idx) => (
                            <Link

                                to="/questions"
                                className="bg-white rounded-lg shadow-md p-6 w-72 flex flex-row items-center justify-between transition-transform transform hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div>
                                    <h2 className="text-xl font-bold text-purple-600">
                                        {subject.title}
                                    </h2>
                                    <p className="text-slate-500">{subject.questions} sual</p>
                                </div>
                                <ArrowRightIcon className="h-6 w-6 text-slate-400" />
                            </Link>
                        ))}
                    </motion.section>

                    {/* WHY WISESTUDY */}
                    <motion.section
                        className="flex flex-col items-center justify-center pt-10 text-center md:text-left"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Niyə WiseStudy?</h2>
                        <p className="text-lg text-gray-500 max-w-2xl">
                            Uğurunuz üçün lazım olan hər şey
                        </p>
                    </motion.section>

                    <motion.section
                        className="w-full flex flex-col items-center md:flex-row md:justify-center md:gap-8 py-10 px-4"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="bg-white rounded-lg shadow-md p-6 w-72 flex flex-col items-center mb-6 md:mb-0">
                            <BookOpenIcon className="py-5 h-20 w-20" />
                            <h2 className="mb-5 font-bold">1000+ Test Sualı</h2>
                            <p className="text-gray-500">Bütün fənlər üzrə geniş sual bankı</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 w-72 flex flex-col items-center mb-6 md:mb-0">
                            <AdjustmentsHorizontalIcon className="py-5 h-20 w-20" />
                            <h2 className="mb-5 font-bold">Hədəfə yönəlmiş plan sistemi</h2>
                            <p className="text-gray-500">
                                Zəif tərəfləriniz gücləndirmə imkanları
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 w-72 flex flex-col items-center">
                            <ArrowTrendingUpIcon className="py-5 h-20 w-20" />
                            <h2 className="mb-5 font-bold">Nəticə izləmə</h2>
                            <p className="text-gray-500">
                                İrəliləyişinizi izləyin və təhlil edin
                            </p>
                        </div>
                    </motion.section>


                    {/* FINAL CTA */}
                    <motion.section
                        className="flex flex-col items-center justify-center bg-gradient2 h-62 gap-5"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="font-medium text-4xl text-white">Hazırsınız?</h2>
                        <p className="text-white text-lg">İndi qeydiyyatdan keçin və uğura doğru ilk addımı atın</p>

                        <Link
                            to="/signup"
                            className="flex items-center text-white rounded-lg px-7 py-3 shadow-md bg-green-400 w-fit space-x-2 hover:bg-green-600 hover:-translate-y-0.5 transition duration-200 ease-in-out"
                        >
                            <span className="text-xl">Qeydiyyatdan keç</span>
                            <ArrowRightIcon className="h-5 w-5" />
                        </Link>
                    </motion.section>

                </div>
            </div>
        </>
    );
}
