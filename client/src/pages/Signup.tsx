import { useState } from "react";
import { Link} from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type SignupData,
  signupSchema,
} from "../features/auth/validation/authSchema";
import { useSignup } from "../features/auth/hooks/useSignup";

export const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { mutate, isPending } = useSignup();
  
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
  });

  const onSubmit = (data: SignupData) => {
     mutate(data);
    
  };

  return (
    <div className="min-h-screen w-full bg-[#E5E7EB] flex items-center justify-center p-4">
      {/* Login Card */}
      <div className="bg-white rounded-card shadow-sm w-full max-w-md p-8 sm:p-12 text-center mt-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Create Account</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="text-left space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-body mb-1"
            >
              Email address
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Leo Messi"
              {...register("name")}
              className="w-full px-4 py-2.5 rounded-input border border-body/50 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition text-heading text-sm"
              required
            />
            {errors.name && (
              <p className="text-error text-xs">{errors.name.message}</p>
            )}
          </div>
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
              required
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
                required
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
          </div>
          <div>
            <label
              htmlFor="passwordConfirm"
              className="block text-sm font-semibold text-body mb-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("passwordConfirm")}
                className="w-full px-4 py-2.5 rounded-input border border-body/50 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition text-heading text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
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
            {errors.passwordConfirm && (
              <p className="text-error text-xs">
                {errors.passwordConfirm.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-700 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-200 mt-2 shadow-sm active:scale-[0.99]"
          >
            {isPending ? "Sign up..." : "Sign Up"}
          </button>
        </form>

        <hr className="my-8 border-body/30" />

        <p className="text-sm text-body font-medium">
          Already registered
          <Link
            to="/login"
            className="text-primary font-bold hover:underline ml-1"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};
