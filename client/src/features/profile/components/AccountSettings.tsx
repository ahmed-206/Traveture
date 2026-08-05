import { useEffect, useRef, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useForm } from "react-hook-form";
import {
  updateProfileSchema,
  type UpdateProfileData,
} from "../../auth/validation/authSchema";
import { useMe } from "../../auth/hooks/useMe";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

export const AccountSettings = () => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { mutateAsync, isPending } = useUpdateProfile();
  const { data: user } = useMe();
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, reset]);

  const handleUpdatePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const onSubmit = async (data: UpdateProfileData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    if (photo) {
      formData.append("photo", photo);
    }
    await mutateAsync(formData);
    setPhoto(null);
    setPreview(null);
  };

  return (
    <section>
      <h2 className="text-2xl sm:text-3xl font-bold text-heading mb-8">
        Your account
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
        {/* Name */}
        <Input
          type="text"
          label="Name"
          {...register("name")}
          error={errors.name?.message}
        />

        {/* Email address */}
        <Input
          type="email"
          label="Email address"
          {...register("email")}
          error={errors.email?.message}
        />

        {/* Photo Upload */}
        <div className="flex items-center gap-4 pt-2">
          <div className="w-14 h-14 rounded-full bg-gray-400 overflow-hidden shrink-0 border border-gray-200">
            <img
              src={
                preview ??
                (user?.photo
                  ? `http://localhost:3000/img/users/${user.photo}`
                  : "/img/default-user.jpg")
              }
              alt={user?.name}
              className="w-full h-full object-cover"
            />
          </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpdatePhoto}
            ref={fileInputRef}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm font-medium text-primary hover:bg-primary hover:text-white hover:px-1.5 hover:py-3 duration-300 transition-all cursor-pointer"
          >
            Choose new photo
          </button>
        </div>

        {/* Save Settings Button */}
        <div className="flex justify-end pt-4">
          <Button type="submit" isLoading={isPending}>
            Save Settings
          </Button>
        </div>
      </form>
    </section>
  );
};
