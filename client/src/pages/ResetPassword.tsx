import { useParams, useNavigate } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResetPassword } from "../features/auth/hooks/useResetPassword";
import {
  type ResetPasswordData,
  resetPasswordSchema,
} from "../features/auth/validation/authSchema";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { mutateAsync, isPending } = useResetPassword();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: ResetPasswordData) => {
    if (!token) return;
    await mutateAsync({ token, data });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-120 bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center">
        <h1 className="text-3xl font-bold text-primary mb-4 tracking-tight">
          Reset Password
        </h1>

        <p className="text-body text-sm leading-relaxed mb-8 px-2">
          Create a new password for your account.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
          <Input
            id="password"
            type="password"
            label="New Password"
            placeholder="Enter your new password"
            error={errors.password?.message}
            {...register("password")}
          />

          <Input
            id="passwordConfirm"
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            error={errors.passwordConfirm?.message}
            {...register("passwordConfirm")}
          />

          <Button
            type="submit"
            fullWidth
            isLoading={isPending}
            loadingText="Resetting..."
            className="mt-2"
          >
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
