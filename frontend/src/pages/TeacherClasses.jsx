import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const TeacherClasses = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await api.get("/users/teacher/me");
        setClasses(resp.data.classes || []);
      } catch (err) {
        console.error("Load classes", err);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Đang tải lớp...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Lớp được phân công</h1>
      {classes.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-sm text-gray-600">
          <p className="mb-3">Bạn chưa được phân công lớp nào.</p>
          <p className="text-xs text-gray-500 mb-4">
            Nếu bạn là giáo viên, hãy yêu cầu quản trị viên phân công lớp cho
            bạn.
          </p>
          <div className="flex items-center gap-2">
            <a
              href={`mailto:admin@codejudge.local?subject=Y%C3%AAu%20c%E1%BA%A7u%20ph%C3%A2n%20c%C3%B4ng%20l%E1%BB%8Bp%20cho%20${encodeURIComponent(
                ""
              )}`}
              className="px-3 py-2 bg-indigo-600 text-white rounded"
            >
              Yêu cầu phân công lớp
            </a>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-2 border rounded"
            >
              Tải lại
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {classes.map((c) => (
            <div
              key={c._id}
              className="bg-white p-4 rounded shadow flex items-center justify-between"
            >
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-gray-500">
                  {c.description || "Không có mô tả"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/teacher/students?classId=${c._id}`)}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded"
                >
                  Quản lý lớp học
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherClasses;
