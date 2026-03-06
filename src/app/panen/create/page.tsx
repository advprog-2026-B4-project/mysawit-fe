import { CreatePanenForm } from '@/modules/panen/components/CreatePanenForm';
// import { useDaftarKebun } from '@/lib/services/kebunService'; 

export default function CreatePanenPage() {
  // const { data, isLoading } = useDaftarKebun();

  return (
    <div className="min-h-screen bg-cream flex justify-center py-10">
      <CreatePanenForm 
         // daftarKebun={data} 
         // isKebunLoading={isLoading}
         daftarKebun={[]} // <-- Ganti dengan data asli nanti
         isKebunLoading={false} 
      />
    </div>
  );
}