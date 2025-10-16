# MyDiary - 个人日记应用

MyDiary 是一个使用 Next.js 15 构建的现代化个人日记应用。它提供了直观的用户界面和丰富的功能，帮助用户记录和管理他们的日常生活。

## ✨ 功能特点

- 📝 完整的日记 CRUD 操作
- 🏷️ 标签系统，轻松组织日记，时间轴功能
- 🌤️ 天气记录（晴天、多云、雨天、雪天、大风）
- 😊 心情记录（开心、兴奋、平静、沉思、难过、愤怒）
- 🔍 强大的搜索和过滤功能
- 📱 响应式设计，支持移动端
- 🔐 用户认证和数据安全

## 🛠️ 技术栈

- **前端框架**: Next.js 15 + React 19
- **样式**: Tailwind CSS
- **语言**: TypeScript
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **ORM**: Prisma
- **认证**: NextAuth.js

## 🚀 快速开始

### 前置要求

- Node.js 18.17 或更高版本
- npm 或 yarn 或 pnpm
- Git

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/yourusername/mydiary.git
cd mydiary
```

2. 安装依赖
```bash
npm install
# 或
yarn install
# 或
pnpm install
# 生成 Prisma 客户端
pnpm prisma generate
```

3. 环境配置
复制 `.env.example` 文件为 `.env` 并填写必要的环境变量：
```bash
cp .env.example .env
```

必需的环境变量：
```env
DATABASE_URL="file:/path/to/dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

4. 数据库设置
```bash
# 运行数据库迁移
npx prisma migrate dev
# 初始化示例数据
npx prisma db seed
```

5. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

现在你可以访问 [http://localhost:3000](http://localhost:3000) 查看应用了！

### 生产环境部署

1. 构建应用
```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

2. 启动生产服务器
```bash
npm start
# 或
yarn start
# 或
pnpm start
```

## 📝 使用指南

1. 注册/登录：首次使用需要创建账号
2. 写日记：点击"写新日记"按钮开始写作
3. 管理日记：在日记列表页面可以查看、编辑、删除日记
4. 搜索：使用搜索栏查找特定日记
5. 标签：通过标签组织和筛选日记
6. 主题：点击右上角的主题切换按钮切换明暗主题

## 🤝 贡献指南

欢迎贡献！请随时提交 Pull Request 或创建 Issue。

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！
