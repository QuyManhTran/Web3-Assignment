import DefaultLayout from "@/layouts";
import ExplorerPage from "@/pages/explorer";
import HomePage from "@/pages/home";
import { useRoutes } from "react-router-dom";

const AppRouter = () => {
    const routes = useRoutes([
        {
            path: "",
            element: <DefaultLayout />,
            children: [
                {
                    path: "",
                    element: <HomePage />,
                },
                {
                    path: "explorer",
                    element: <ExplorerPage />,
                },
            ],
        },
    ]);
    return routes;
};

export default AppRouter;
