import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .schema(SCHEMA)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/auth/login");

  return (
    <div className="min-h-screen" style={{ background: "var(--color-cream)" }}>
      <nav className="border-b bg-white px-6 py-3 flex items-center justify-between">
        <span className="font-semibold text-sm" style={{ color: "var(--color-forest)" }}>
          Seeks &amp; Explore · Admin
        </span>
        <div className="flex gap-4 text-sm" style={{ color: "var(--color-sage)" }}>
          <a href="/admin" className="hover:text-[var(--color-forest)]">Dashboard</a>
          <a href="/admin/providers" className="hover:text-[var(--color-forest)]">Providers</a>
          <a href="/auth/logout" className="hover:text-[var(--color-forest)]">Sign out</a>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
