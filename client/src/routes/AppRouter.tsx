import { RouterProvider, createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/HomePage";
import ToursDetails from "../features/tours/pages/TourDetails";
import { LoginPage } from "../pages/Login";
import NotFound from "../pages/NotFound";
import { SignupPage } from "../pages/Signup";
import ProtectRoute from "../components/auth/ProtectedRoute";
import ProfilePage from "../pages/Profile";
import AllTours from "../features/tours/pages/AllTours";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

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
        element: <AllTours />,
      },
      {
        path: "tours/:tourId",
        element: <ToursDetails />,
      },
  
    ],
  },

  {
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "signup",
    element: <SignupPage />,
  },
  {
    path: "forgot-password",
    element: <ForgotPassword />
  },
  {
    path: "resetPassword/:token",
    element: <ResetPassword />
  },
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "profile",
    element: (
      <ProtectRoute>
        <ProfilePage />
      </ProtectRoute>
    ),
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
