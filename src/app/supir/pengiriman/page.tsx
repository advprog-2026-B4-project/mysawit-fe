"use client";

import dynamic from "next/dynamic";

const SupirPengirimanPage = dynamic(
  () => import("@/modules/pengiriman/pages/SupirPengirimanPage"),
  { ssr: false }
);

export default SupirPengirimanPage;
