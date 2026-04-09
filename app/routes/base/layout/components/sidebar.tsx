import { NavLink } from "react-router";

export const Sidebar = () => {
  const links = [
    { label: "Profile", to: "/base/profile" },
    { label: "Credits & History", to: "/base/credits" },
    { label: "Orders", to: "/base/orders" },
    { label: "Subscription", to: "/base/subscription" },
  ];

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto pb-4 md:pb-0">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-primary text-primary-content shadow-sm"
                  : "hover:bg-base-200 text-base-content/80"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
