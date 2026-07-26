import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type LoginData,
  loginSchema,
} from "../features/auth/validation/authSchema";
import { useLogin } from "../features/auth/hooks/useLogin";

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync, isPending } = useLogin();
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: LoginData) => {
    await mutateAsync(data);
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full bg-[#E5E7EB] flex items-center justify-center p-4">
      {/* Login Card */}
      <div className="bg-white rounded-card shadow-sm w-full max-w-md p-8 sm:p-12 text-center mt-8">
        <h1 className="text-3xl font-bold text-primary">Welcome Back</h1>
        <p className="text-body text-sm mt-1 mb-8">Log into your account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="text-left space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-body mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className="w-full px-4 py-2.5 rounded-input border border-body/50 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition text-heading text-sm"
            />
            {errors.email && (
              <p className="text-error text-xs">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-body mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className="w-full px-4 py-2.5 rounded-input border border-body/50 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition text-heading text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-body/50 hover:text-body focus:outline-none p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FaRegEyeSlash size={20} />
                ) : (
                  <FaRegEye size={20} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-error text-xs">{errors.password.message}</p>
            )}

            <div className="text-right mt-1.5">
              <Link
                to="/forgot-password"
                className="text-xs text-primary-light hover:underline font-medium"
              >
                Forgot password
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary-700 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-200 mt-2 shadow-sm active:scale-[0.99] disabled:opacity-60
disabled:cursor-not-allowed"
          >
            {isPending ? "Logging in..." : "Login"}
          </button>
        </form>

        <hr className="my-8 border-body/30" />

        <p className="text-sm text-body font-medium">
          Not yet registered{" "}
          <Link
            to="/signup"
            className="text-primary font-bold hover:underline ml-1"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
