import NavBar from "@/components/navBar";
import UpdateDoctorFormPage from "./form";

export default function UpdateDoctorPage() {
  return (
    <>
    <NavBar />
    <div className="container mx-auto py-20">
      <h1 className="text-2xl font-bold text-center mb-5 mt-10">Update Doctor</h1>
      <div className="flex justify-center items-center pt-10 px-30" > 
        <UpdateDoctorFormPage />
      </div>
    </div>
    </>
  );
}