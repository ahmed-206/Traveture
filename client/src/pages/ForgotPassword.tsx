import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPassword } from "../features/auth/hooks/useForgotPassword";
import { type ForgotPasswordData, forgotPasswordSchema } from "../features/auth/validation/authSchema";
import { EmailSentSuccess } from "../features/auth/components/EmailSent";



export const ForgotPassword = () => {
    const [emailSent, setEmailSent] = useState(false);
    const {mutateAsync, isPending} = useForgotPassword()
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data:ForgotPasswordData) => {
    await mutateAsync(data.email);
    setEmailSent(true)
  };

  if(emailSent) {
    return <EmailSentSuccess />
  }
  return (
    <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-120 bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center">
        <h1 className="text-3xl font-bold text-primary mb-4 tracking-tight">
          Forgot Password
        </h1>

        <p className="text-body text-sm leading-relaxed mb-8 px-2">
          Enter your email address and we'll send you a password reset link.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
          <Input
            id="email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <Button
            type="submit"
            fullWidth
            isLoading={isPending}
            loadingText="Sending..."
            className="mt-2"
          >
            Send Reset Link
          </Button>
        </form>

        <p className="mt-12 text-sm text-body font-medium">
          Remember your password?{" "}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
