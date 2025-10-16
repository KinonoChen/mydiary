# 时区功能修复说明

## 🐛 问题描述

在将时区功能从固定中国时区改为用户时区时，遇到了 Next.js 的客户端/服务端分离问题：

```
Error: Attempted to call formatTimezoneYearMonth() from the server but formatTimezoneYearMonth is on the client. 
It's not possible to invoke a client function from the server.
```

## 🔧 解决方案

将时区工具函数分离为客户端和服务端两个版本：

### 1. 服务端时区工具 (`src/lib/timezone-server.ts`)

**用途：** API 路由中的时区处理
**特点：**
- 无 `'use client'` 标记
- 可在服务端环境中运行
- 不依赖 localStorage 等浏览器 API

**主要函数：**
- `getTimezoneTime(timezone)` - 获取指定时区时间
- `formatTimezoneDate(utcDate, timezone)` - 格式化时区日期
- `formatTimezoneYearMonth(utcDate, timezone)` - 格式化时区年月
- `getTimezoneMonthRange(year, month, timezone)` - 获取月份UTC范围

### 2. 客户端时区工具 (`src/lib/timezone-client.ts`)

**用途：** React 组件中的时区处理
**特点：**
- 有 `'use client'` 标记
- 可访问 localStorage、window 等浏览器 API
- 支持用户时区偏好设置

**主要函数：**
- `getCurrentTimezone()` - 获取当前用户时区
- `getBrowserTimezone()` - 获取浏览器时区
- `saveUserTimezone()` / `getUserTimezone()` - 时区偏好管理
- `formatTimezoneYearMonth()` - 客户端版本的时区格式化

### 3. 原有时区工具 (`src/lib/timezone.ts`)

**状态：** 保留但移除 `'use client'` 标记
**用途：** 通用时区工具，客户端和服务端都可使用
**特点：** 运行时检查环境，兼容两端

## 📁 文件更新

### API 路由更新
- `src/app/api/diaries/stats/route.ts` - 使用 `timezone-server`
- `src/app/api/debug/streak/route.ts` - 使用 `timezone-server`
- `src/app/api/test/timezone/route.ts` - 使用 `timezone-server`

### 客户端组件更新
- `src/app/dashboard/page.tsx` - 使用 `timezone-client`
- `src/components/timeline/TimelineContainer.tsx` - 使用 `timezone-client`
- `src/app/timeline/page.tsx` - 使用 `timezone-client`
- `src/components/settings/TimezoneSettings.tsx` - 使用 `timezone-client`
- `src/app/test/timezone/page.tsx` - 使用 `timezone-client`

## 🎯 修复结果

### 之前的错误
```
Error: Attempted to call formatTimezoneYearMonth() from the server but formatTimezoneYearMonth is on the client.
```

### 修复后
- ✅ 服务端 API 正常工作
- ✅ 客户端组件正常工作
- ✅ 时区功能完全可用
- ✅ 统计数据使用用户时区

## 🧪 测试方法

1. **访问仪表板** - 检查统计数据是否正确
2. **访问时间主线** - 检查日记分组是否按用户时区
3. **访问测试页面** `/test/timezone` - 验证时区转换功能
4. **调用统计API** - 检查是否支持 timezone 参数

## 📊 功能验证

### 统计API测试
```bash
# 测试不同时区的统计数据
curl "http://localhost:3000/api/diaries/stats?timezone=Asia/Shanghai"
curl "http://localhost:3000/api/diaries/stats?timezone=America/New_York"
curl "http://localhost:3000/api/diaries/stats?timezone=Europe/London"
```

### 时区测试API
```bash
# 测试时区转换功能
curl "http://localhost:3000/api/test/timezone?timezone=Asia/Shanghai"
```

## 🎉 总结

通过将时区工具函数分离为客户端和服务端版本，成功解决了 Next.js 环境分离的问题：

- **服务端** - 使用 `timezone-server.ts` 处理 API 中的时区逻辑
- **客户端** - 使用 `timezone-client.ts` 处理组件中的时区逻辑
- **通用** - 保留 `timezone.ts` 作为兼容层（仅重新导出）

### ✅ 修复验证

1. **开发服务器启动成功** - 无编译错误
2. **API 正常工作** - 统计API支持时区参数
3. **前端组件正常** - 仪表板和时间主线正常显示
4. **时区功能完整** - 支持全球用户的准确统计

现在时区功能完全正常，所有用户都能获得基于其实际时区的准确统计数据！

### 🌍 全球化支持

- ✅ **中国用户** - 自动使用 Asia/Shanghai 时区
- ✅ **美国用户** - 自动使用 America/New_York 等时区
- ✅ **欧洲用户** - 自动使用 Europe/London 等时区
- ✅ **其他地区** - 自动检测并使用正确时区

### 📊 功能改进

- **连续天数计算** - 基于用户本地时区
- **月度统计** - 使用用户时区的月份边界
- **时间主线** - 按用户时区正确分组
- **所有统计** - 反映用户实际时间体验

## 🔄 后续优化

1. **性能优化** - 考虑缓存时区转换结果
2. **错误处理** - 增强时区相关的错误处理
3. **测试覆盖** - 添加更多时区相关的单元测试
4. **用户体验** - 在设置页面添加时区选择界面
