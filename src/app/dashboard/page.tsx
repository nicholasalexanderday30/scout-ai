"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProfileForm from "@/components/ProfileForm";

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
  	router.push("/login");
  	return;
      }

      setUserId(user.id);
    };

    run();
  }, [router]);

  const onSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!userId) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <p className="text-white/80">Loading...</p>
      </main>
    );
  }

  return <ProfileForm userId={userId} onSignOut={onSignOut} />;
}
