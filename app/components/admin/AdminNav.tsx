"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function IconDashboard({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconProviders({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconBookings({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function IconImport({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function IconUsers({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconAnalytics({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

export function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: IconDashboard, exact: true },
    { href: "/admin/providers", label: "Providers", icon: IconProviders },
    { href: "/admin/bookings", label: "All Bookings", icon: IconBookings },
    { href: "/admin/customers", label: "Customers", icon: IconUsers },
    { href: "/admin/analytics", label: "Analytics", icon: IconAnalytics },
    {
      href: "/admin/providers/import",
      label: "Import Provider",
      icon: IconImport,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-neutral-200 bg-white shadow-sm">
      <div className="flex h-full flex-col">
        {/* Logo/Brand */}
        <div className="border-b border-neutral-200 bg-gradient-to-br from-neutral-50 to-white px-6 py-4">
          <Link href="/admin" className="group flex items-center gap-3">
            <div
              className="grid h-10 w-10 place-items-center rounded-xl text-white shadow-md transition-shadow group-hover:shadow-lg"
              style={{ background: "var(--color-forest)" }}
            >
              <span className="text-lg font-bold">A</span>
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-neutral-900">
                Trailion
              </div>
              <div
                className="text-xs font-medium"
                style={{ color: "var(--color-accent)" }}
              >
                Super Admin
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href ||
                  (item.href !== "/admin" &&
                    pathname.startsWith(item.href) &&
                    item.href !== "/admin/providers/import");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-neutral-100 to-neutral-50 text-neutral-900 shadow-sm"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 hover:shadow-sm",
                  )}
                >
                  <span
                    className={cx(
                      "flex items-center justify-center transition-transform duration-200",
                      isActive ? "scale-110" : "group-hover:scale-110",
                    )}
                  >
                    <item.icon
                      className={cx(
                        isActive
                          ? "text-neutral-900"
                          : "text-neutral-500 group-hover:text-neutral-700",
                      )}
                    />
                  </span>
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full"
                      style={{ background: "var(--color-forest)" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-neutral-200 px-6 py-4">
          <div className="text-xs text-neutral-500">
            <div className="font-medium text-neutral-700">Admin Console</div>
            <div className="mt-1">Platform-wide access</div>
          </div>
          <a
            href="/auth/logout"
            className="mt-3 block text-xs font-medium hover:underline"
            style={{ color: "var(--color-sage)" }}
          >
            Sign out
          </a>
        </div>
      </div>
    </aside>
  );
}
