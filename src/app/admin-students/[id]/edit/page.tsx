export default function EditStudentPage({ params }: { params: { id: string } }) { return <div className="p-8"><h1 className="text-2xl font-bold">Edit Student {params.id}</h1></div>; }
