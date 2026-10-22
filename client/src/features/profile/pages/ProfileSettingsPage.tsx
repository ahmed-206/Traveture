import { AccountSettings } from "../components/AccountSettings";
import { PasswordSettings } from "../components/PasswordSettings";

const ProfileSettingsPage = () => (
  <div className="max-w-3xl space-y-12">
    <AccountSettings />
    <hr className="border-body/30" />
    <PasswordSettings />
  </div>
);

export default ProfileSettingsPage;
