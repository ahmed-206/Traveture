import { RouterProvider, createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/HomePage";
import ToursDetails from "../features/tours/pages/TourDetails";
import { LoginPage } from "../features/auth/pages/Login";
import NotFound from "../pages/NotFound";
import { SignupPage } from "../features/auth/pages/Signup";
import ProtectRoute from "../components/auth/ProtectedRoute";
import ProfilePage from "../features/profile/pages/Profile";
import AllTours from "../features/tours/pages/AllTours";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";
import { Favorites } from "../features/favorites/pages/FavoritesPage";
import { BookingPage } from "../features/bookings/pages/BookingPage";

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
    element: <ForgotPassword />,
  },
  {
    path: "resetPassword/:token",
    element: <ResetPassword />,
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
  {
    path: "favorites",
    element: (
      <ProtectRoute>
        <Favorites />
      </ProtectRoute>
    ),
  },
  {
    path: "booking",
    element: (
       <ProtectRoute>
        <BookingPage />
      </ProtectRoute>
    )
  }
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
