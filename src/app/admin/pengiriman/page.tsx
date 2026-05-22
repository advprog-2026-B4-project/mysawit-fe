"use client";

import dynamic from "next/dynamic";

const AdminPengirimanPage = dynamic(
  () => import("@/modules/pengiriman/pages/AdminPengirimanPage"),
  { ssr: false }
);

export default AdminPengirimanPage;
