'use client';
export default function SetupPage() {
  return (
    <div className="p-16 max-w-4xl mx-auto bg-white rounded-3xl shadow-xl mt-10 border border-gray-100">
      <h1 className="text-3xl font-black text-[#001f3f] mb-6">旅團接入指南</h1>
      <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
        <p>1. 複製 ScoutSystem 數據模版。</p>
        <p>2. 在 Google Sheet `SystemConfig` 中填入你的旅號 ID。</p>
        <p>3. 下載最新後端代碼貼入 Apps Script。</p>
        <p>4. 部署網頁應用程式並選「所有人」。</p>
      </div>
    </div>
  );
}
