import { motion } from "framer-motion";
import { Camera, Calendar, Trophy, Wallet, Users } from "lucide-react";

interface HeroProps {
    onEnter: () => void;
}

export const Hero = ({ onEnter }: HeroProps) => {
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

                    <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600 drop-shadow-2xl py-6 leading-normal">
                        MANG XUÂN VỀ
                    </h1>

                    <p className="max-w-xl mx-auto text-xl text-muted-foreground md:text-2xl font-light tracking-wide">
                        Cuộc thi ảnh Xuân 2026
                    </p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="pt-8"
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

            {/* Info Cards - Pushed to bottom */}
            <div className="relative z-20 container mx-auto px-4 w-full mt-12 md:mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Categories */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-card/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-card/50 transition-colors"
                    >
                        <div className="flex items-center gap-2 mb-2 text-green-400">
                            <Camera size={20} />
                            <h4 className="font-bold text-sm">3 THỂ LOẠI</h4>
                        </div>
                        <div className="text-xs space-y-1 text-foreground/80">
                            <p>• Phong cảnh</p>
                            <p>• Chân dung</p>
                            <p>• Tự do</p>
                        </div>
                    </motion.div>

                    {/* Timeline */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-card/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-card/50 transition-colors"
                    >
                        <div className="flex items-center gap-2 mb-2 text-blue-400">
                            <Calendar size={20} />
                            <h4 className="font-bold text-sm">THỜI GIAN</h4>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-foreground/60">Nhận ảnh</p>
                            <p className="font-bold">1/1 - 26/2</p>
                            <p className="text-xs text-foreground/60">2026</p>
                        </div>
                    </motion.div>

                    {/* Prizes */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="bg-card/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-card/50 transition-colors"
                    >
                        <div className="flex items-center gap-2 mb-2 text-rose-400">
                            <Trophy size={20} />
                            <h4 className="font-bold text-sm">GIẢI THƯỞNG</h4>
                        </div>
                        <p className="text-sm font-medium leading-tight mt-2">
                            1 Giải Duy Nhất
                            <br />
                            <span className="text-xs text-foreground/60">cho mỗi chủ đề!</span>
                        </p>
                    </motion.div>

                    {/* Fee */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="bg-card/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-card/50 transition-colors"
                    >
                        <div className="flex items-center gap-2 mb-2 text-orange-400">
                            <Wallet size={20} />
                            <h4 className="font-bold text-sm">PHÍ THAM GIA</h4>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold">100k</p>
                            <p className="text-[10px] text-orange-400 leading-tight">(Toàn bộ làm giải thưởng!)</p>
                        </div>
                    </motion.div>

                    {/* Judges */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }}
                        className="bg-card/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-card/50 transition-colors"
                    >
                        <div className="flex items-center gap-2 mb-2 text-purple-400">
                            <Users size={20} />
                            <h4 className="font-bold text-sm">GIÁM KHẢO</h4>
                        </div>
                        <div className="text-center mt-1">
                            <p className="text-xs font-medium">Cộng đồng bình chọn</p>
                            <p className="text-[10px] text-purple-400 italic mt-1">More Votes = More Fun!</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
