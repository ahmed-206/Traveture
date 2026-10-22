import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import Home from "../pages/HomePage";
import ToursDetails from "../features/tours/pages/TourDetails";
import { LoginPage } from "../features/auth/pages/Login";
import NotFound from "../pages/NotFound";
import { SignupPage } from "../features/auth/pages/Signup";
import ProtectRoute from "../components/auth/ProtectedRoute";
import RoleRoute from "../components/auth/RoleRoute";
import ProfileSettingsPage from "../features/profile/pages/ProfileSettingsPage";
import AllTours from "../features/tours/pages/AllTours";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";
import { Favorites } from "../features/favorites/pages/FavoritesPage";
import { BookingPage } from "../features/bookings/pages/BookingPage";
import { BookingSuccessPage } from "../features/bookings/pages/BookingSuccessPage";
import AdminDashboard from "../features/admin/pages/AdminDashboard";
import AdminToursList from "../features/admin/pages/AdminToursList";
import AdminTourForm from "../features/admin/pages/AdminTourForm";
import AdminBookingsList from "../features/admin/pages/AdminBookingsList";
import MyBookingsPage from "../features/bookings/pages/MyBookingsPage";

const router = createBrowserRouter([
  // Public site
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "tours", element: <AllTours /> },
      { path: "tours/:tourId", element: <ToursDetails /> },
    ],
  },

 
  {
    element: (
      <ProtectRoute>
        <DashboardLayout />
      </ProtectRoute>
    ),
    children: [
      {
        path: "profile",
        element: <Navigate to="/profile/settings" replace />,
      },
      { path: "profile/settings", element: <ProfileSettingsPage /> },
      { path: "profile/favorites", element: <Favorites /> },
      { path: "profile/bookings", element: <MyBookingsPage /> },

      {
        path: "admin",
        element: (
          <RoleRoute allowedRoles={["admin", "lead-guide"]}>
            <Outlet />
          </RoleRoute>
        ),
        children: [
          {
            index: true,
            element: (
              <RoleRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </RoleRoute>
            ),
          },
          { path: "tours", element: <AdminToursList /> },
          { path: "tours/new", element: <AdminTourForm /> },
          { path: "tours/:tourId/edit", element: <AdminTourForm /> },
          { path: "bookings", element: <AdminBookingsList /> },
        ],
      },
    ],
  },

  
  { path: "favorites", element: <Navigate to="/profile/favorites" replace /> },

 
  {
    path: "booking/:tourId",
    element: (
      <ProtectRoute>
        <BookingPage />
      </ProtectRoute>
    ),
  },
  {
    path: "bookings/success",
    element: (
      <ProtectRoute>
        <BookingSuccessPage />
      </ProtectRoute>
    ),
  },

  // Auth pages
  { path: "login", element: <LoginPage /> },
  { path: "signup", element: <SignupPage /> },
  { path: "forgot-password", element: <ForgotPassword /> },
  { path: "resetPassword/:token", element: <ResetPassword /> },

  { path: "*", element: <NotFound /> },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
