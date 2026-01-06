import Link from "next/link";
import { roles } from "@/lib/roles";

export default function ExamPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        เลือกอาชีพเพื่อทำข้อสอบ
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Link
            key={role.id}
            href={`/exam/${role.id}`}
            className="block bg-gray-800 hover:bg-gray-700 rounded-lg p-6 transition"
          >
            <h2 className="text-xl font-semibold mb-2">
              {role.name}
            </h2>
            <p className="text-gray-300">
              {role.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}