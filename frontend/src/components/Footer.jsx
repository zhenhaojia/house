function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 公司信息 */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-4">易居租房平台</h3>
            <p className="text-gray-300 mb-4">
              专业的租房信息平台，为您提供真实可靠的房源信息，让租房变得更简单。
            </p>
            <p className="text-gray-400 text-sm">
              © 2024 易居租房平台. 保留所有权利.
            </p>
          </div>
          
          {/* 快速链接 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">快速链接</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/" className="hover:text-white transition-colors">首页</a></li>
              <li><a href="/listings" className="hover:text-white transition-colors">房源列表</a></li>
              <li><a href="/admin/login" className="hover:text-white transition-colors">房东入口</a></li>
            </ul>
          </div>
          
          {/* 热门城市 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">热门城市</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/listings?city=北京" className="hover:text-white transition-colors">北京</a></li>
              <li><a href="/listings?city=上海" className="hover:text-white transition-colors">上海</a></li>
              <li><a href="/listings?city=广州" className="hover:text-white transition-colors">广州</a></li>
              <li><a href="/listings?city=深圳" className="hover:text-white transition-colors">深圳</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer