import { Link, NavLink, Outlet } from "react-router-dom";
import { menuConfig } from "../constant/menuConfig";
import type { MenuItem } from "../constant/menuConfig";
import { useMe } from "../features/auth/hooks/useMe";
import { FaArrowLeft } from "react-icons/fa";

const linkBase =
  "flex items-center gap-3.5 px-4 py-3 mx-3 my-1 font-medium text-sm rounded-xl transition-all duration-200 shrink-0";
const linkActive =
  "bg-white text-primary font-bold shadow-md shadow-blue-500/5 translate-x-1";
const linkIdle =
  "text-slate-500 hover:text-primary hover:bg-white/60 font-semibold";

const SidebarLink = ({ item }: { item: MenuItem }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `${linkBase} ${isActive ? linkActive : linkIdle}`
      }
    >
      <Icon size={18} className="shrink-0" />
      {item.label}
    </NavLink>
  );
};


export const DashboardLayout = () => {
  const { data: user } = useMe();

  if (!user) return null;

  const sections = menuConfig[user.role];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <aside className="bg-primary/10 shadow-md flex md:flex-col  md:w-48 md:shrink-0 md:sticky md:top-0 md:h-screen overflow-x-auto md:overflow-x-hidden md:overflow-y-auto">
        <div className="hidden md:block px-6 pt-8 pb-6">
          <Link to="/">
            <img
              src="/img/logov1.png"
              alt="traveture logo"
              className="w-24 sm:w-28 h-auto object-contain transition-all"
            />
          </Link>
          
        </div>

        <nav className="flex md:flex-col md:flex-1">
          {sections.map((section) => (
            <div key={section.title ?? "account"} className="flex md:flex-col">
              {section.title && (
                <p className="hidden md:block px-6 pt-6 pb-2 text-small text-white/60">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => (
                <SidebarLink key={item.to} item={item} />
              ))}
            </div>
          ))}
        </nav>

        <div className="md:border-t md:border-white/20">
          <Link to="/" className={`${linkBase} ${linkIdle}`}>
            <FaArrowLeft size={18} className="shrink-0" />
            Back to home
          </Link>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-6 sm:p-10 lg:p-12 bg-white">
        <Outlet />
      </main>
      
    </div>
  );
};

export default DashboardLayout;
