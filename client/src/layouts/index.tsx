import { Outlet } from "react-router-dom";
import HeaderLayout from "./header";

const DefaultLayout = () => {
    return (
        <div className="flex flex-col h-screen w-screen overflow-x-hidden">
            <HeaderLayout />
            <div className="mt-[62px] flex-1 flex flex-row gap-8 py-4 px-6 w-screen bg-slate-100">
                <Outlet />
            </div>
        </div>
    );
};

export default DefaultLayout;
