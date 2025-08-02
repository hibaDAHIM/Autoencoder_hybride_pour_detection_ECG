import NavBarPatient from "@/components/navBarPatient";
import NewPatientFormPage from "./form";

export default function AddPatientPage() {
  return (
    <>
      <NavBarPatient />
      <div className="container mx-auto py-20">
          <h1 className="text-2xl font-bold text-center mb-5 mt-10">Add New Patient</h1>
        <div className="flex justify-center items-center pt-10 px-30" > 
          <NewPatientFormPage />
        </div>
      </div>
    </>
  );
}