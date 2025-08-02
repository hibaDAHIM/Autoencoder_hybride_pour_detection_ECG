"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import NavBarPatient from "@/components/navBarPatient";

export default function AnalyzeECGClient({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loss, setLoss] = useState<number | null>(null);
  const [plotPath, setPlotPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("patient_id", patientId);

    try {
      const res = await fetch(`http://localhost:5000/patients/analyze/${patientId}` , {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();
      setPrediction(data.has_anomaly ? "Anomaly" : "Normal");
      setLoss(data.loss_score);
      setPlotPath(`http://localhost:5000/${data.plot_path}`);
    } catch (err) {
      console.error(err);
      alert("Error during analysis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <NavBarPatient />
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">ECG Analysis - Anomaly Detection</h1>

      <Card className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-semibold block mb-2">Select a CSV file:</label>
            <Input
              type="file"
              accept=".csv"
              required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Analysis loading..." : "Analyze ECG"}
          </Button>
        </form>
      </Card>

      {prediction && (
        <div className={`mt-6 p-4 rounded-md ${prediction === "Anomaly" ? "border-l-4 border-red-500 bg-red-50" : "border-l-4 border-green-500 bg-green-50"}`}>
          <h2 className="text-xl font-semibold">Diagnostic: {prediction}</h2>
          <p className="text-sm">
            The ECG signal is {prediction === "Anomaly" ? "anomalous" : "normal"}.
          </p>
        </div>
      )}

      {loss !== null && (
        <div className="my-6">
          <h3 className="text-lg font-semibold mb-2">Loss score</h3>
          <p className={`text-2xl font-bold ${prediction === "Anomaly" ? "text-red-500" : "text-green-600"}`}>{loss.toFixed(4)}</p>
          <p className="text-sm">Threshold: 5.7897</p>
        </div>
      )}

      {plotPath && (
        <div className="my-8 text-center">
          <h3 className="text-lg font-semibold mb-4">Original ECG signal vs reconstructed</h3>
          <img src={plotPath} alt="ECG plot" className="mx-auto border rounded shadow" />
          <p className="text-sm mt-2">Blue line = original, Orange line = reconstruction</p>
        </div>
      )}

      {(prediction || loss !== null || plotPath) && (
        <div className="text-center mt-6">
          <Button onClick={() => router.push(`/patients`)}>return</Button>
        </div>
      )}
    </div>
    </>
  );
}
