"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SupirPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/supir/dashboard");
  }, [router]);
  return null;
}
