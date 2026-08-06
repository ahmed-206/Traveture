import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useForm } from "react-hook-form";
import {
  updatePasswordSchema,
  type UpdatePasswordData,
} from "../validation/profileSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdatePassword } from "../hooks/useUpdatePassword";
export const PasswordSettings = () => {
  const { mutateAsync, isPending } = useUpdatePassword();
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<UpdatePasswordData>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const onSubmit = (data: UpdatePasswordData) => {
    mutateAsync(data);
    reset();
  };
  return (
    <section>
      <h2 className="text-2xl sm:text-3xl font-bold text-heading mb-8">
        Password change
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
        {/* Current Password */}
        <Input
          type="password"
          label="Current password"
          placeholder="••••••••"
          {...register("currentPassword")}
          error={errors.currentPassword?.message}
        />

        {/* New Password */}
        <Input
          type="password"
          label="New password"
          placeholder="••••••••"
          {...register("password")}
          error={errors.password?.message}
        />

        {/* Confirm Password */}
        <Input
          type="password"
          label="Confirm password"
          placeholder="••••••••"
          {...register("passwordConfirm")}
          error={errors.passwordConfirm?.message}
        />

        {/* Save Password Button */}
        <div className="flex justify-end pt-4">
          <Button isLoading={isPending} type="submit">
            Save Password
          </Button>
        </div>
      </form>
    </section>
  );
};
