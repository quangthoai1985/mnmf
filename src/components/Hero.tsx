import { motion } from "framer-motion";

interface HeroProps {
    onEnter: () => void;
}

export const Hero = ({ onEnter }: HeroProps) => {
    return (
        <div className="relative h-screen w-full overflow-hidden bg-background text-foreground flex items-center justify-center">
            {/* Background with Noise Overlay */}
            <div className="noise-bg absolute inset-0 z-10 pointer-events-none"></div>

            {/* Animated Gradient Blobs with Fade In/Out Effect */}
            <div className="absolute inset-0 z-0">
                {/* Main center blob - large */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(37, 99, 235, 0.2) 50%, transparent 70%)",
                    }}
                    animate={{
                        opacity: [0.3, 0.7, 0.3],
                        scale: [1, 1.15, 1],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* Top-left blob */}
                <motion.div
                    className="absolute top-[15%] left-[20%] w-[400px] h-[400px] rounded-full blur-2xl"
                    style={{
                        background: "radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(30, 64, 175, 0.2) 60%, transparent 80%)",
                    }}
                    animate={{
                        opacity: [0.2, 0.6, 0.2],
                        x: [0, 30, 0],
                        y: [0, -20, 0],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5,
                    }}
                />

                {/* Top-right blob */}
                <motion.div
                    className="absolute top-[10%] right-[15%] w-[350px] h-[350px] rounded-full blur-3xl"
                    style={{
                        background: "radial-gradient(circle, rgba(96, 165, 250, 0.5) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 75%)",
                    }}
                    animate={{
                        opacity: [0.4, 0.8, 0.4],
                        x: [0, -25, 0],
                        y: [0, 25, 0],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1,
                    }}
                />

                {/* Bottom-left blob */}
                <motion.div
                    className="absolute bottom-[20%] left-[10%] w-[450px] h-[450px] rounded-full blur-2xl"
                    style={{
                        background: "radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(29, 78, 216, 0.15) 60%, transparent 80%)",
                    }}
                    animate={{
                        opacity: [0.3, 0.7, 0.3],
                        x: [0, 40, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.5,
                    }}
                />

                {/* Bottom-right blob */}
                <motion.div
                    className="absolute bottom-[15%] right-[20%] w-[500px] h-[500px] rounded-full blur-3xl"
                    style={{
                        background: "radial-gradient(circle, rgba(59, 130, 246, 0.45) 0%, rgba(30, 58, 138, 0.2) 55%, transparent 75%)",
                    }}
                    animate={{
                        opacity: [0.25, 0.65, 0.25],
                        x: [0, -35, 0],
                        y: [0, 20, 0],
                    }}
                    transition={{
                        duration: 5.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2,
                    }}
                />

                {/* Center accent blob - small and bright */}
                <motion.div
                    className="absolute top-[40%] left-[45%] w-[200px] h-[200px] rounded-full blur-xl"
                    style={{
                        background: "radial-gradient(circle, rgba(147, 197, 253, 0.6) 0%, rgba(96, 165, 250, 0.3) 50%, transparent 70%)",
                    }}
                    animate={{
                        opacity: [0.5, 1, 0.5],
                        scale: [0.9, 1.2, 0.9],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.3,
                    }}
                />

                {/* Additional floating particles */}
                <motion.div
                    className="absolute top-[30%] right-[35%] w-[150px] h-[150px] rounded-full blur-2xl"
                    style={{
                        background: "radial-gradient(circle, rgba(191, 219, 254, 0.5) 0%, transparent 60%)",
                    }}
                    animate={{
                        opacity: [0.3, 0.8, 0.3],
                        y: [0, -40, 0],
                    }}
                    transition={{
                        duration: 4.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.8,
                    }}
                />

                <motion.div
                    className="absolute bottom-[35%] left-[40%] w-[180px] h-[180px] rounded-full blur-xl"
                    style={{
                        background: "radial-gradient(circle, rgba(147, 197, 253, 0.4) 0%, transparent 65%)",
                    }}
                    animate={{
                        opacity: [0.2, 0.7, 0.2],
                        x: [0, 30, 0],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.2,
                    }}
                />
            </div>

            <div className="relative z-20 container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-6"
                >
                    <h2 className="text-sm md:text-lg uppercase tracking-[0.5em] text-muted-foreground">
                        Photography Contest
                    </h2>

                    <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600">
                        MORE NOISE
                        <br />
                        MORE FUN
                    </h1>

                    <p className="max-w-xl mx-auto text-lg text-muted-foreground md:text-xl font-light">
                        Accept the grain. Embrace the imperfections. Show us the raw beauty of the world.
                    </p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="pt-8"
                    >
                        <button
                            onClick={onEnter}
                            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all rounded-full cursor-pointer shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                        >
                            Enter Gallery
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};
