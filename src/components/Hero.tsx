import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Camera, Calendar, Trophy, Wallet, Users } from "lucide-react";

interface HeroProps {
    onEnter: () => void;
}

export const Hero = ({ onEnter }: HeroProps) => {
    const calculateTimeLeft = () => {
        const difference = +new Date('2026-02-26T23:59:00') - +new Date();
        let timeLeft = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground flex flex-col items-center justify-between py-10">
            {/* Background with Noise Overlay */}
            <div className="noise-bg absolute inset-0 z-10 pointer-events-none"></div>

            {/* Animated Gradient Blobs */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(37, 99, 235, 0.2) 50%, transparent 70%)" }}
                    animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.15, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-[15%] left-[20%] w-[400px] h-[400px] rounded-full blur-2xl"
                    style={{ background: "radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(30, 64, 175, 0.2) 60%, transparent 80%)" }}
                    animate={{ opacity: [0.2, 0.6, 0.2], x: [0, 30, 0], y: [0, -20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
                <motion.div
                    className="absolute bottom-[15%] right-[20%] w-[500px] h-[500px] rounded-full blur-3xl"
                    style={{ background: "radial-gradient(circle, rgba(59, 130, 246, 0.45) 0%, rgba(30, 58, 138, 0.2) 55%, transparent 75%)" }}
                    animate={{ opacity: [0.25, 0.65, 0.25], x: [0, -35, 0], y: [0, 20, 0] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                />
            </div>

            {/* Header Content */}
            <div className="relative z-20 container mx-auto px-4 text-center mt-10 md:mt-20 flex-grow flex flex-col justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-6"
                >
                    <h2 className="text-sm md:text-lg uppercase tracking-[0.5em] text-muted-foreground mb-8">
                        MORE NOISE MORE FUN PRESENTS
                    </h2>

                    <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600 drop-shadow-2xl py-6 leading-normal">
                        MANG XUÂN VỀ
                    </h1>

                    <p className="max-w-xl mx-auto text-lg sm:text-xl text-muted-foreground md:text-2xl font-light tracking-wide px-4">
                        Cuộc thi ảnh Xuân 2026
                    </p>

                    {/* Countdown Timer */}
                    <div className="py-8">
                        <div className="flex justify-center flex-wrap items-center gap-3 sm:gap-8">
                            {Object.keys(timeLeft).map((interval) => (
                                <div key={interval} className="flex flex-col items-center p-2 rounded-lg bg-white/5 backdrop-blur-sm sm:bg-transparent">
                                    <span className="text-2xl sm:text-5xl font-mono font-bold text-white drop-shadow-lg">
                                        {String(timeLeft[interval as keyof typeof timeLeft]).padStart(2, '0')}
                                    </span>
                                    <span className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground mt-1">
                                        {interval === 'days' ? 'Ngày' :
                                            interval === 'hours' ? 'Giờ' :
                                                interval === 'minutes' ? 'Phút' : 'Giây'}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-blue-300 mt-4 tracking-wider uppercase opacity-80">
                            Kết thúc nhận ảnh: 23:59 26/02/2026
                        </p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="pt-4"
                    >
                        <button
                            onClick={onEnter}
                            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all rounded-full cursor-pointer shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
                        >
                            Enter Gallery
                        </button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Info Cards - Uniform Layout */}
            <div className="relative z-20 container mx-auto px-4 w-full mt-12 md:mt-0 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                        {
                            icon: Camera,
                            color: "text-emerald-400",
                            title: "CHỦ ĐỀ THI",
                            content: "Tự Do • Chân Dung • Phong Cảnh",
                            subtext: "Thỏa sức sáng tạo",
                            delay: 0.6,
                        },
                        {
                            icon: Calendar,
                            color: "text-blue-400",
                            title: "NHẬN ẢNH",
                            content: "01/01 - 26/02",
                            subtext: "Năm 2026",
                            delay: 0.7,
                        },
                        {
                            icon: Trophy,
                            color: "text-rose-400",
                            title: "GIẢI THƯỞNG",
                            content: "01 Giải Nhất",
                            subtext: "Cho mỗi chủ đề",
                            delay: 0.8,
                        },
                        {
                            icon: Wallet,
                            color: "text-amber-400",
                            title: "LỆ PHÍ",
                            content: "100.000 VNĐ",
                            subtext: "Toàn bộ làm giải thưởng",
                            delay: 0.9,
                        },
                        {
                            icon: Users,
                            color: "text-purple-400",
                            title: "GIÁM KHẢO",
                            content: "Cộng Đồng",
                            subtext: "More Votes = More Fun",
                            delay: 1.0,
                        },
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: item.delay }}
                            className="group relative overflow-hidden bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/10"
                        >
                            <div className={`absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300 scale-150 rotate-12 ${item.color}`}>
                                <item.icon size={80} />
                            </div>

                            <div className="relative z-10 flex flex-col h-full justify-between items-start">
                                <div className={`p-3 rounded-xl bg-white/5 mb-4 ${item.color} shadow-inner ring-1 ring-white/10`}>
                                    <item.icon size={24} />
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">
                                        {item.title}
                                    </h4>
                                    <div className="text-lg font-bold text-white leading-tight mb-2">
                                        {item.content.split("•").map((part, i) => (
                                            <span key={i} className="block">
                                                {part.trim()}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-white/40 italic font-medium">
                                        {item.subtext}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
