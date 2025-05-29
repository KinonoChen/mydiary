export default function DiaryPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            所有日记
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            管理和浏览你的所有日记
          </p>
        </div>
        <button className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          写新日记
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              排序：
            </label>
            <select className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>最新创建</option>
              <option>最早创建</option>
              <option>最近更新</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              标签：
            </label>
            <select className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>全部标签</option>
              <option>生活</option>
              <option>工作</option>
              <option>旅行</option>
            </select>
          </div>
        </div>
      </div>

      {/* Diary List */}
      <div className="grid gap-4">
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  今天的美好时光 {index}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  2024年12月{25 - index}日 • 晴天 ☀️
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  编辑
                </button>
                <button className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                  删除
                </button>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
              今天和朋友一起去了咖啡厅，聊了很多有趣的话题。天气很好，心情也很棒。下午的阳光透过窗户洒在桌子上，感觉特别温暖。我们聊了工作、生活，还有对未来的憧憬...
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                  生活
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                  朋友
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                约 280 字
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center">
        <div className="flex space-x-2">
          <button className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            上一页
          </button>
          <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md">
            1
          </button>
          <button className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            2
          </button>
          <button className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            下一页
          </button>
        </div>
      </div>
    </div>
  );
} 