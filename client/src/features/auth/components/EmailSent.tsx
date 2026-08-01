import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { FaCircleCheck } from "react-icons/fa6";
export const EmailSentSuccess = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E5E7EB]">
      <div className="bg-white rounded-2xl shadow-sm p-10 max-w-md text-center">
        <FaCircleCheck size={40} className="text-success mb-4 m-auto"/>

        <h1 className="text-3xl font-bold text-primary">Check your email</h1>

        <p className="mt-4 text-body">
          If an account exists with this email, we've sent a password reset
          link.
        </p>

        <Button className="mt-8" fullWidth onClick={() => navigate("/login")}>
          Back to Login
        </Button>
      </div>
    </div>
  );
};
