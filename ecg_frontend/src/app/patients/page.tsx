"use client";
import NavBarPatient from "@/components/navBarPatient";
import { columns, Patient } from "./columns"
import { DataTable } from "./data-table"
import { useEffect, useState } from "react"



export default function PatientList() {
 
  const [patients, setPatients] = useState<Patient[]>([])

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch("http://localhost:5000/patients", {
        credentials: "include", // Important
      });
    
        console.log("Response status:", res.status); // Ajouté
        if (!res.ok) {
          const text = await res.text(); // Récupérer le HTML si erreur
          console.error("Response error text:", text);
          throw new Error(`HTTP error ${res.status}`);
        }
        const data = await res.json()
        console.log("Fetched data:", data);

        

        setPatients(data.patients)
      } catch (error) {
        console.error("Error fetching patients:", error)
      } finally {

      }
    }

    fetchPatients()
  }, [])

  return (
    <>
    <NavBarPatient />
    <div className="container mx-auto py-20">
        
      {/* Titre et barre de recherche */}
      
      <div className="table-auto mx-auto mt-5" style={{width: "90%"}} >
        <DataTable columns={columns} data={patients} />
      </div>
    </div>
    
    </>
  );
}