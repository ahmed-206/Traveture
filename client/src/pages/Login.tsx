import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type LoginData,
  loginSchema,
} from "../features/auth/validation/authSchema";
import { useLogin } from "../features/auth/hooks/useLogin";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export const LoginPage = () => {
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
          <Input
            id="email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <div>
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />

            <div className="text-right mt-1.5">
              <Link
                to="/forgot-password"
                className="text-xs text-primary-light hover:underline font-medium"
              >
                Forgot password
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            isLoading={isPending}
            loadingText="Logging in..."
            className="mt-2"
          >
            Login
          </Button>
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
