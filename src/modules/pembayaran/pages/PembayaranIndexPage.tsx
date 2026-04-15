"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PembayaranIndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/pembayaran/payroll");
  }, [router]);

  return null;
}
