export default function DownloadPage() {
  return (
    <div className="p-16 max-w-4xl mx-auto bg-white rounded-3xl shadow-xl mt-10 text-center">
      <h1 className="text-3xl font-black text-[#001f3f] mb-8">下載中心</h1>
      <a href="/ScoutSystem_V28_Core.txt" download className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:bg-blue-700 shadow-lg inline-block">
        ⬇️ 獲取最新後端代碼 (V28.0)
      </a>
      <p className="mt-6 text-gray-400">下載後請全選內容貼入 Google Apps Script</p>
    </div>
  );
}
