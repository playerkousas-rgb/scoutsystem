export default function SetupPage() {
  return (
    <div className="p-16 max-w-4xl mx-auto bg-white rounded-3xl shadow-xl mt-10 border border-gray-100">
      <h1 className="text-3xl font-black text-[#001f3f] mb-6">旅團接入指南 (Setup Guide)</h1>
      <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
        <p>1. 複製 ScoutSystem 官方數據模版。</p>
        <p>2. 在 Google Sheet `SystemConfig` 中填入你的旅號 ID。</p>
        <p>3. 前往 <a href="/download" className="text-blue-600 underline">下載中心</a> 下載最新的 Code.gs 代碼。</p>
        <p>4. 部署為網頁應用程式，並將 API URL 提供給管理員。</p>
      </div>
    </div>
  );
}
