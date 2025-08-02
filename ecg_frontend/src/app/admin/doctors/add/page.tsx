import NavBar from "@/components/navBar";
import NewDoctorFormPage from "./form";

export default function AddDoctorPage() {
  return (
    <>
      <NavBar />
      <div className="container mx-auto py-20">
        <h1 className="text-2xl font-bold text-center mb-5 mt-10">Add New Doctor</h1>
        <div className="flex justify-center items-center pt-10 px-30 " > 
         <NewDoctorFormPage />
        </div>
      </div>
    </>
  );
}