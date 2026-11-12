import StatusBadge from "./components/StatusBadge";
import Navbar from "./components/Navbar";
import ApplicationCard from "./components/ApplicationCard";

function App() {

      const applications = [
      {
        id: 1,
        company: "Google",
        role: "SDE Intern",
        status: "Selected",
        deadline: "20 Nov 2026"
      },
      {
        id: 2,
        company: "Amazon",
        role: "Software Intern",
        status: "OA",
        deadline: "22 Nov 2026"
      },
      {
        id: 3,
        company: "Microsoft",
        role: "Frontend Intern",
        status: "Interview",
        deadline: "25 Nov 2026"
      },
      {
        id: 4,
        company: "Adobe",
        role: "Product Intern",
        status: "Selected",
        deadline: "28 Nov 2026"
      },
      {
        id: 5,
        company: "NVIDIA",
        role: "Systems Intern",
        status: "Rejected",
        deadline: "30 Nov 2026"
      },
      {
        id: 6,
        company: "Flipkart",
        role: "SDE Intern",
        status: "Applied",
        deadline: "2 Dec 2026"
      }
    ];

return (
  <div className="min-h-screen bg-gray-100">
    <Navbar />

    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        My Applications
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {applications.map((app) => (
          <ApplicationCard
            key={app.id}
            company={app.company}
            role={app.role}
            status={app.status}
            deadline={app.deadline}
          />
        ))}
      </div>
    </div>
  </div>
);
}

export default App;