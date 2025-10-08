import VirtualTryOn from '@/components/VirtualTryOn'
import TryOnHeader from '@/components/TryOnHeader'
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TryOnHeader />
      <main className="pt-0">
        <VirtualTryOn />
      </main>
    </div>
  );
};

export default Page;
