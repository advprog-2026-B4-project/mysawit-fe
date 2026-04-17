"use client";

import dynamic from "next/dynamic";

const MandorSupirDeliveriesPage = dynamic(
  () => import("@/modules/pengiriman/pages/MandorSupirDeliveriesPage"),
  { ssr: false }
);

export default MandorSupirDeliveriesPage;
