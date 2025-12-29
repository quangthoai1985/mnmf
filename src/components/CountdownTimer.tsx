import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CountdownTimer = () => {
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

    const timerComponents = Object.keys(timeLeft).map((interval) => {
        return (
            <div key={interval} className="flex flex-col items-center mx-2 sm:mx-4">
                <motion.div
                    key={timeLeft[interval as keyof typeof timeLeft]}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 font-mono"
                >
                    {String(timeLeft[interval as keyof typeof timeLeft]).padStart(2, '0')}
                </motion.div>
                <div className="text-xs sm:text-sm uppercase tracking-wider text-gray-500 mt-2 font-medium">
                    {interval === 'days' ? 'Ngày' :
                        interval === 'hours' ? 'Giờ' :
                            interval === 'minutes' ? 'Phút' : 'Giây'}
                </div>
            </div>
        );
    });

    return (
        <div className="w-full py-12 px-4 bg-muted/30 border-y border-border/50">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                    Sự kiện Cuộc thi Ảnh Nghệ thuật 2026
                </h2>
                <h3 className="text-lg sm:text-xl text-muted-foreground mb-8">
                    Thời hạn kết thúc nhận ảnh: 23:59 Ngày 26/02/2026
                </h3>

                <div className="flex justify-center flex-wrap items-center bg-background/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-border/50 max-w-3xl mx-auto">
                    {timerComponents}
                </div>

                <p className="mt-8 text-sm text-gray-400 italic">
                    Hãy nhanh tay gửi những tác phẩm tuyệt vời nhất của bạn!
                </p>
            </div>
        </div>
    );
};

export default CountdownTimer;
