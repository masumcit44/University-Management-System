import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    department_name: "",
    department_code: "",
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateDepartment = async () => {
    try {
      await api.post("/departments", formData);

      alert("Department Created Successfully");

      setShowModal(false);

      setFormData({
        department_name: "",
        department_code: "",
      });

      fetchDepartments();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message || "Failed to create department"
      );
    }
  };

  return (    <MainLayout>
      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold">
          Departments
        </h1>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          + Add Department
        </button>

      </div>

      <div className="bg-white rounded-xl shadow p-6">

        <input
          type="text"
          placeholder="Search Department..."
          className="border rounded-lg px-4 py-2 mb-5 w-80"
        />

        {loading ? (
          <p className="text-blue-600">
            Loading Departments...
          </p>
        ) : (
          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Department</th>
                <th className="text-left p-3">Code</th>
                <th className="text-center p-3">Action</th>
              </tr>

            </thead>

            <tbody>

              {departments.length > 0 ? (

                departments.map((department) => (

                  <tr
                    key={department.department_id}
                    className="border-b"
                  >

                    <td className="p-3">
                      {department.department_id}
                    </td>

                    <td className="p-3">
                      {department.department_name}
                    </td>

                    <td className="p-3">
                      {department.department_code}
                    </td>

                    <td className="text-center p-3">

                      <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mr-2">
                        Edit
                      </button>

                      <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                        Delete
                      </button>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="4"
                    className="text-center p-5 text-gray-500"
                  >
                    No Departments Found
                  </td>

                </tr>

              )}

            </tbody>

          </table>
        )}

      </div>

      {/* Modal */}

      {showModal && (

        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">

          <div className="bg-white rounded-xl p-6 w-96">

            <h2 className="text-2xl font-bold mb-5">
              Add Department
            </h2>

            <input
              type="text"
              name="department_name"
              placeholder="Department Name"
              value={formData.department_name}
              onChange={handleChange}
              className="border w-full rounded-lg p-2 mb-4"
            />

            <input
              type="text"
              name="department_code"
              placeholder="Department Code"
              value={formData.department_code}
              onChange={handleChange}
              className="border w-full rounded-lg p-2 mb-5"
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateDepartment}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Save
              </button>

            </div>

          </div>

        </div>

      )}

    </MainLayout>
  );
}

export default Departments;