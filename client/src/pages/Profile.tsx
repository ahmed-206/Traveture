import { useState } from "react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { AccountSettings } from "../features/profile/components/AccountSettings";



const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("settings");
  // const fileInputRef = useRef<HTMLInputElement>(null);




  return (
    <div className="min-h-screen bg-[#E5E7EB] py-12 px-4 flex justify-center items-center">
      {/* Container Card */}
      <div className="bg-white w-full max-w-5xl rounded-card shadow-lg flex flex-col md:flex-row overflow-hidden min-h-175">
        {/* Side Navigation (Left Panel) */}
        <nav className="w-full md:w-64 bg-linear-to-r from-primary to-primary-light py-10 flex flex-col text-white shrink-0">
          <ul className="space-y-1 w-full">
            {[
              { id: "settings", label: "Settings" },
              { id: "booking", label: "My booking" },
              { id: "reviews", label: "My reviews" },
              { id: "billing", label: "Billing" },
            ].map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-8 py-3.5 font-semibold text-lg transition-all duration-200 border-l-4 ${
                    activeTab === tab.id
                      ? "bg-white text-primary border-white shadow-sm"
                      : "border-transparent text-white/90 hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content Area (Right Panel) */}
        <div className="flex-1 p-8 sm:p-12 lg:p-16 space-y-12">
          {/*  Your Account */}
          <AccountSettings />

          <hr className="border-body/30" />

          {/* Password Change */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-heading mb-8">
              Password change
            </h2>

            <form
              
              className="space-y-6 max-w-lg"
            >
              {/* Current Password */}
              <Input
                type="password"
                label="Current password"
                placeholder="••••••••"
              />

              {/* New Password */}
              <Input
                type="password"
                label="New password"
                placeholder="••••••••"
              />

              {/* Confirm Password */}
              <Input
                type="password"
                label="Confirm password"
                placeholder="••••••••"
              />

              {/* Save Password Button */}
              <div className="flex justify-end pt-4">
                <Button type="submit">
                  Save Password
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
