import { RouterProvider, createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/HomePage";
import ToursPage from "../features/tours/pages/ToursPage";
import ToursDetails from "../features/tours/pages/TourDetails";
import { LoginPage } from "../pages/Login";
import NotFound from "../pages/NotFound";
import { SignupPage } from "../pages/Signup";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "tours",
        element: <ToursPage />,
      },
      {
        path: "tours/:tourId",
        element: <ToursDetails />,
      },
    ],
  },
  
  {
    path: "login",
    element: <LoginPage />
  },
  {
    path: "signup",
    element: <SignupPage/>
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
