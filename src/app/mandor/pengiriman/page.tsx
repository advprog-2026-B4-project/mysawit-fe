"use client";

import dynamic from "next/dynamic";

const MandorPengirimanPage = dynamic(
  () => import("@/modules/pengiriman/pages/MandorPengirimanPage"),
  { ssr: false }
);

export default MandorPengirimanPage;
