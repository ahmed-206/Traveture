import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type SignupData,
  signupSchema,
} from "../features/auth/validation/authSchema";
import { useSignup } from "../features/auth/hooks/useSignup";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export const SignupPage = () => {
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
      {/* Signup Card */}
      <div className="bg-white rounded-card shadow-sm w-full max-w-md p-8 sm:p-12 text-center mt-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Create Account</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="text-left space-y-5">
          <Input
            id="name"
            type="text"
            label="Full name"
            placeholder="e.g. Leo Messi"
            error={errors.name?.message}
            required
            {...register("name")}
          />

          <Input
            id="email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            error={errors.email?.message}
            required
            {...register("email")}
          />

          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            error={errors.password?.message}
            required
            {...register("password")}
          />

          <Input
            id="passwordConfirm"
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            error={errors.passwordConfirm?.message}
            required
            {...register("passwordConfirm")}
          />

          <Button
            type="submit"
            fullWidth
            isLoading={isPending}
            loadingText="Signing up..."
          >
            Sign Up
          </Button>
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
