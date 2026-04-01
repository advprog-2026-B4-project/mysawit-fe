"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MandorPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/mandor/dashboard");
  }, [router]);
  return null;
}
