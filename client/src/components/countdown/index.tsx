import { Button } from "flowbite-react";
import moment from "moment";
import { memo, useEffect, useMemo, useRef, useState } from "react";

interface CountDownProps {
    timeInSeconds: number;
    title: string;
    action: () => Promise<void>;
}

const CountDown = ({ timeInSeconds, action, title }: CountDownProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const countDownInterval: { current: NodeJS.Timeout | null } = useRef(null);

    const displayTime = useMemo(() => {
        return ` in ${moment.utc(timeLeft * 1000).format("mm:ss")}`;
    }, [timeLeft]);

    useEffect(() => {
        if (timeLeft)
            clearInterval(countDownInterval.current as NodeJS.Timeout);
        setTimeLeft(timeInSeconds);
        countDownInterval.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev > 0) return prev - 1;
                return prev;
            });
        }, 1000);
    }, [timeInSeconds]);

    useEffect(() => {
        if (timeLeft <= 0) {
            clearInterval(countDownInterval.current as NodeJS.Timeout);
        }
    }, [timeLeft]);

    useEffect(() => {
        return () => {
            clearInterval(countDownInterval.current as NodeJS.Timeout);
        };
    }, []);

    return (
        <Button
            gradientMonochrome={"purple"}
            type="button"
            onClick={async () => {
                try {
                    setLoading(true);
                    await action();
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            }}
            disabled={!!timeLeft || loading}
            className="tabular-nums"
        >
            {`${title} ${timeLeft ? displayTime : ""}`}
        </Button>
    );
};

export default memo(CountDown);
