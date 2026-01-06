export default function AdminPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-red-400">
        Admin Panel
      </h1>

      <ul className="list-disc pl-6 text-lg">
        <li>สร้างข้อสอบตามอาชีพ</li>
        <li>แก้ไข / ลบ / กู้คืน / ลบถาวร ของข้อสอบตามอาชีพ</li>
        <li>ดู Dashboard การใช้งาน (เร็ว ๆ นี้)</li>
        <li>ระบบพูดคุย Admin (เร็ว ๆ นี้)</li>
        <li>ดูประวัติการสอบ (เร็ว ๆ นี้)</li>
      </ul>
    </div>
  );
}