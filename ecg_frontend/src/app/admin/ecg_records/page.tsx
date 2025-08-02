"use client";

import NavBar from "@/components/navBar";
import { columns, Records } from "./columns"
import { DataTable } from "./data-table"
import { useEffect, useState } from "react"



export default function RecordsList() {
 
  const [records, setRecords] = useState<Records[]>([])

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch("http://localhost:5000/admin/ecg_records",{
          credentials: "include"
        });
        const data = await res.json()
        console.log("Fetched data:", data);

        

        setRecords(data.records)
      } catch (error) {
        console.error("Error fetching records:", error)
      } finally {

      }
    }

    fetchRecords()
  }, [])

  return (
    <>
    <NavBar />
    <div className="container mx-auto py-20">
        
      {/* Titre et barre de recherche */}
      
      <div className="table-auto mx-auto mt-5" style={{width: "90%"}} >
        <DataTable columns={columns} data={records} />
      </div>
    </div>
    
    </>
  );
}