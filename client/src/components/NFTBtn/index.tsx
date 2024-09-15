/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "flowbite-react";
import { useState } from "react";
import metamask from "@/assets/images/metamask.svg";
import { toast } from "react-toastify";
interface NFTBtnProps {
    action: () => Promise<void>;
    item: string;
    title: string;
}

const NFTBtn = ({ item, title, action }: NFTBtnProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    return (
        <Button
            gradientMonochrome={"success"}
            type="button"
            onClick={async () => {
                try {
                    setLoading(true);
                    await action();
                } catch (error: any) {
                    console.log(error);
                    toast.error(error?.reason || "Withdraw NFT error");
                } finally {
                    setLoading(false);
                }
            }}
            className="group"
            disabled={loading}
            isProcessing={loading}
        >
            <img
                src={metamask}
                alt="icon"
                className="w-6 h-5 object-cover mr-2 group-hover:rotate-180 duration-1000"
            />
            {title} {item}
        </Button>
    );
};

export default NFTBtn;
