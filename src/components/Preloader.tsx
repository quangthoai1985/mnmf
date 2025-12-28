import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const WORDS = ["LOADING", "FOCUSING", "EXPOSING", "DEVELOPING", "PRINTING"];

export const Preloader = ({ onComplete }: { onComplete: () => void }) => {
    const [count, setCount] = useState(0);
    const [wordIndex, setWordIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount((prev) => {
                if (prev === 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 500); // Small delay before finishing
                    return 100;
                }
                const jump = Math.floor(Math.random() * 10) + 1;
                return Math.min(prev + jump, 100);
            });
        }, 150);

        return () => clearInterval(interval);
    }, [onComplete]);

    useEffect(() => {
        const wordInterval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % WORDS.length);
        }, 400);
        return () => clearInterval(wordInterval);
    }, []);

    return (
        <motion.div
            initial={{ y: 0 }}
            exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white cursor-wait"
        >
            <div className="relative w-full max-w-md px-10">
                {/* Counter */}
                <div className="flex justify-between items-end mb-4">
                    <span className="text-6xl font-black tracking-tighter loading-text">
                        {count}%
                    </span>
                    <span className="text-sm font-mono tracking-widest text-neutral-500 animate-pulse">
                        {WORDS[wordIndex]}...
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="h-1 w-full bg-neutral-800 overflow-hidden relative">
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-white"
                        initial={{ width: "0%" }}
                        animate={{ width: `${count}%` }}
                        transition={{ ease: "linear", duration: 0.2 }}
                    />
                </div>
            </div>
        </motion.div>
    );
};
