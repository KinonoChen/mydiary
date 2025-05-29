import Image from "next/image";

export default function HomePage() {
  return (
    <div className="text-center py-12">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl text-white">📔</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            欢迎来到 MyDiary
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            用心记录生活的每一天，让美好时光永远留存
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-4">✍️</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              自由书写
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              富文本编辑器，支持多种格式，让你的想法尽情表达
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              智能搜索
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              快速找到任何时间的日记，搜索功能让回忆触手可及
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-4">🏷️</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              标签分类
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              用标签整理你的日记，让生活的每个主题都有迹可循
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
            开始写日记
          </button>
          <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-8 py-3 rounded-lg font-medium transition-colors">
            查看示例
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">篇日记</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">个标签</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">天记录</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">字数</div>
          </div>
        </div>
      </div>
    </div>
  );
}
