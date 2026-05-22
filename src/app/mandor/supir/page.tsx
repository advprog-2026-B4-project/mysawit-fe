"use client";

import dynamic from "next/dynamic";

const MandorSupirPage = dynamic(
  () => import("@/modules/pengiriman/pages/MandorSupirPage"),
  { ssr: false }
);

export default MandorSupirPage;
