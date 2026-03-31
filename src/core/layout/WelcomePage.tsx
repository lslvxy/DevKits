export function WelcomePage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#1c1c1c] text-[#666]">
      <div className="text-6xl mb-4">🛠️</div>
      <h2 className="text-2xl font-semibold text-[#e0e0e0] mb-2">DevKits</h2>
      <p className="text-sm mb-6">插件化开发者工具集</p>
      <p className="text-xs">从左侧选择一个工具开始使用</p>
    </div>
  );
}
