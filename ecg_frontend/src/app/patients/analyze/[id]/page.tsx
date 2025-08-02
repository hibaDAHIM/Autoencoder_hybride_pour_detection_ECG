import AnalyzeECGClient from "./AnalyzeECGClient";

export default function AnalyzePage({ params }: { params: { id: string } }) {
  return (
     <div className="container mx-auto py-20">
        <AnalyzeECGClient patientId={params.id} />
      </div>
    )
}
