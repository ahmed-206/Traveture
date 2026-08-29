import { useState } from "react";
import { AccountSettings } from "../components/AccountSettings";
import { PasswordSettings } from "../components/PasswordSettings";
import { menuConfig } from "../../../constant/menuConfig";
import { useMe } from "../../auth/hooks/useMe";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("settings");
  const { data: user } = useMe();

  if (!user) return null;

  const navigation = menuConfig[user.role];

  return (
    <div className="min-h-screen bg-bg py-12 px-4 flex justify-center items-center">
      {/* Container Card */}
      <div className="bg-white w-full max-w-5xl rounded-card shadow-lg flex flex-col md:flex-row overflow-hidden min-h-175">
        {/* Side Navigation (Left Panel) */}
        <nav className="w-full md:w-64 bg-primary  py-10 flex flex-col text-white shrink-0">
          <ul className="space-y-1 w-full">
            {navigation.map((tab) => (
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

        <div className="flex-1 p-8 sm:p-12 lg:p-16 space-y-12">
          {/*  Your Account */}
          <AccountSettings />
          <hr className="border-body/30" />
          {/* Password Change */}
          <PasswordSettings />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
