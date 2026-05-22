"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const MandorSupirDeliveriesPage = dynamic(
  () => import("@/modules/pengiriman/pages/MandorSupirDeliveriesPage"),
  { ssr: false }
);

export default function MandorSupirDeliveriesRoute() {
  const { supirId } = useParams<{ supirId: string }>();
  return <MandorSupirDeliveriesPage key={supirId} />;
}
