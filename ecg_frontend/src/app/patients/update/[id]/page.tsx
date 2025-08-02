import NavBarPatient from "@/components/navBarPatient";
import UpdatePatientFormPage from "./form";

export default function UpdatePatientPage() {
  return (
    <>
    <NavBarPatient />
    <div className="container mx-auto py-20">
          <h1 className="text-2xl font-bold text-center mb-5 mt-10">Update Patient</h1>
        <div className="flex justify-center items-center pt-10 px-30" > 
          <UpdatePatientFormPage />
        </div>
    </div>
    </>
  );
}