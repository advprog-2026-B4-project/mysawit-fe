import NotificationList from "@/modules/notification/components/NotificationList";

export default function MandorNotifikasiPage() {
  return (
    <div>
      <div className="mb-10">
        <h1 className="font-serif text-[36px] font-normal text-text-dark">Notifikasi</h1>
        <p className="mt-1.5 text-[13px] font-light text-text-light">
            Melihat pemberitahuan terbaru untuk akun Anda.
        </p>
      </div>
      <NotificationList />
    </div>
  );
}