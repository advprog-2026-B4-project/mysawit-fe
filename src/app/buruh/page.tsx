"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BuruhPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/buruh/dashboard");
  }, [router]);
  return null;
}
