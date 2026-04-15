import { CreatePanenForm } from "@/modules/panen/components/CreatePanenForm";
import BuruhGuard from "@/components/guards/BuruhGuard";

export default function BuruhCreatePanenPage() {
  return (
    <BuruhGuard>
      <main className="container mx-auto py-8">
        <CreatePanenForm />
      </main>
    </BuruhGuard>
  );
}
