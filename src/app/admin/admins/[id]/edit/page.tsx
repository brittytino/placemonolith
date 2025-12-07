export default function EditAdminPage({ params }: { params: { id: string } }) { return <div className="p-8"><h1 className="text-2xl font-bold">Edit Admin {params.id}</h1></div>; }
