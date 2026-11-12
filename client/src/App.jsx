
import { useState } from "react";
import Navbar from "./components/Navbar";
import ApplicationCard from "./components/ApplicationCard";

function App() {
  const [applications, setApplications] = useState([
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
  ]);

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    status: "Applied",
    deadline: ""
  });

  const [error, setError] = useState("");

  const [filter, setFilter] = useState("All");

  const filteredApplications =
    filter === "All"
      ? applications
      : applications.filter((app) => app.status === filter);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Delete an application
  const handleDelete = (id) => {
    setApplications((prev) =>
      prev.filter((app) => app.id !== id)
    );
  };

  // Submit the application form
      const handleSubmit = (e) => {
      e.preventDefault();

      if (!formData.company.trim()) {
        setError("Company name is required");
        return;
      }

      if (!formData.role.trim()) {
        setError("Job role is required");
        return;
      }

      if (!formData.deadline) {
        setError("Deadline is required");
        return;
      }

      setError("");

      const newApplication = {
        id: Date.now(),
        ...formData
      };

      setApplications((prev) => [...prev, newApplication]);

      setFormData({
        company: "",
        role: "",
        status: "Applied",
        deadline: ""
      });
    };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">
          My Applications
        </h1>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {["All", "Applied", "OA", "Interview", "Selected", "Rejected"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === status
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        {/* Add Application Form */}
        <form
          className="bg-white p-6 rounded-xl shadow-md mb-8"
          onSubmit={handleSubmit}
        >
          <h2 className="text-xl font-bold mb-4">
            Add New Application
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="company"
              placeholder="Company Name"
              value={formData.company}
              onChange={handleChange}
              className="border p-3 rounded-lg"
            />

            <input
              type="text"
              name="role"
              placeholder="Job Role"
              value={formData.role}
              onChange={handleChange}
              className="border p-3 rounded-lg"
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border p-3 rounded-lg"
            >
              <option value="Applied">Applied</option>
              <option value="OA">OA</option>
              <option value="Interview">Interview</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>

            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="border p-3 rounded-lg"
            />
          </div>

          {error && (
      <p className="text-red-500 text-sm mt-3">
        {error}
      </p>
    )}

          <button
            type="submit"
            className="mt-5 bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Add Application
          </button>
        </form>

        {/* Application Cards and Empty State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                id={app.id}
                company={app.company}
                role={app.role}
                status={app.status}
                deadline={app.deadline}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <p className="text-gray-500 text-lg col-span-2 text-center py-8">
              {applications.length === 0
                ? "No applications yet. Add your first application!"
                : `No applications found for ${filter}.`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
