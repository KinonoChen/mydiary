# Diary API Documentation

## 概述

本文档描述了MyDiary应用的日记管理API端点。所有API都需要用户认证（NextAuth.js session）。

## 基础信息

- **Base URL**: `/api/diaries`
- **认证方式**: NextAuth.js Session Cookie
- **内容类型**: `application/json`
- **响应格式**: JSON

## API 端点

### 1. 获取日记列表

```http
GET /api/diaries
```

**查询参数:**
- `page` (可选): 页码，默认为 1
- `limit` (可选): 每页条数，默认为 10
- `search` (可选): 搜索关键词（标题或内容）
- `tag` (可选): 标签过滤
- `mood` (可选): 心情过滤
- `weather` (可选): 天气过滤

**响应示例:**
```json
{
  "data": [
    {
      "id": "diary_id",
      "title": "今天的感想",
      "content": "今天是美好的一天...",
      "tags": ["生活", "感悟"],
      "mood": "happy",
      "weather": "sunny",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### 2. 创建新日记

```http
POST /api/diaries
```

**请求体:**
```json
{
  "title": "日记标题",
  "content": "日记内容",
  "tags": ["标签1", "标签2"],
  "mood": "happy",
  "weather": "sunny",
  "createdAt": "2024-01-01T22:00:00.000Z"
}
```

**字段说明:**
- `title` (必需): 日记标题
- `content` (必需): 日记内容
- `tags` (可选): 标签数组，默认为空数组
- `mood` (可选): 心情状态
- `weather` (可选): 天气状态
- `createdAt` (可选): 自定义创建时间，ISO 8601格式。如果不提供，将使用当前时间

**响应:** 创建的日记对象

### 3. 获取单个日记

```http
GET /api/diaries/{id}
```

**路径参数:**
- `id`: 日记ID

**响应:** 日记对象

### 4. 更新日记

```http
PUT /api/diaries/{id}
```

**路径参数:**
- `id`: 日记ID

**请求体:**
```json
{
  "title": "更新的日记标题",
  "content": "更新的日记内容",
  "tags": ["标签1", "标签2"],
  "mood": "happy",
  "weather": "sunny",
  "createdAt": "2024-01-01T22:00:00.000Z"
}
```

**字段说明:**
- `title` (必需): 日记标题
- `content` (必需): 日记内容
- `tags` (可选): 标签数组，默认为空数组
- `mood` (可选): 心情状态
- `weather` (可选): 天气状态
- `createdAt` (可选): 自定义创建时间，ISO 8601格式。如果不提供，将保持原有时间

**响应:** 更新后的日记对象

### 5. 删除日记

```http
DELETE /api/diaries/{id}
```

**路径参数:**
- `id`: 日记ID

**响应:**
```json
{
  "message": "Diary deleted successfully"
}
```

### 6. 获取统计信息

```http
GET /api/diaries/stats
```

**响应示例:**
```json
{
  "total": 100,
  "streak": 7,
  "mood": [
    { "mood": "happy", "count": 30 },
    { "mood": "sad", "count": 10 }
  ],
  "weather": [
    { "weather": "sunny", "count": 40 },
    { "weather": "rainy", "count": 20 }
  ],
  "monthly": [
    { "month": "2024-01", "count": 20 },
    { "month": "2023-12", "count": 15 }
  ],
  "tags": [
    { "tag": "生活", "count": 25 },
    { "tag": "工作", "count": 20 }
  ],
  "averagePerMonth": 18
}
```

### 7. 快速搜索

```http
GET /api/diaries/search?q=关键词&limit=5
```

**查询参数:**
- `q`: 搜索关键词
- `limit` (可选): 返回结果数量，默认为 5

**响应:**
```json
{
  "data": [
    {
      "id": "diary_id",
      "title": "标题",
      "preview": "内容预览...",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 8. 高级搜索

```http
POST /api/diaries/search
```

**请求体:**
```json
{
  "query": "搜索关键词",
  "tags": ["标签1", "标签2"],
  "mood": "happy",
  "weather": "sunny",
  "dateFrom": "2024-01-01",
  "dateTo": "2024-01-31",
  "page": 1,
  "limit": 10,
  "sortBy": "createdAt",
  "sortOrder": "desc"
}
```

**响应:** 包含搜索结果和高亮内容的日记列表

### 9. 批量操作

```http
POST /api/diaries/batch
```

**请求体 (删除):**
```json
{
  "action": "delete",
  "diaryIds": ["id1", "id2", "id3"]
}
```

**请求体 (导出):**
```json
{
  "action": "export",
  "diaryIds": ["id1", "id2", "id3"]
}
```

### 10. 导出所有日记

```http
GET /api/diaries/batch/export-all?format=json
```

**查询参数:**
- `format` (可选): 导出格式，支持 `json` 或 `csv`，默认为 `json`

## 数据模型

### Diary 对象

```typescript
interface Diary {
  id: string
  title: string
  content: string
  tags: string[]  // 前端显示为数组，数据库存储为JSON字符串
  mood?: string
  weather?: string
  userId: string
  createdAt: Date
  updatedAt: Date
}
```

### 预设的心情类型

- `happy` - 开心
- `sad` - 难过
- `angry` - 生气
- `excited` - 兴奋
- `calm` - 平静
- `anxious` - 焦虑
- `grateful` - 感恩
- `frustrated` - 沮丧

### 预设的天气类型

- `sunny` - 晴天
- `cloudy` - 多云
- `rainy` - 雨天
- `snowy` - 雪天
- `stormy` - 暴风雨
- `foggy` - 雾天
- `windy` - 有风

## 错误处理

所有API端点都使用标准HTTP状态码：

- `200` - 成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未认证
- `403` - 无权限
- `404` - 资源不存在
- `500` - 服务器错误

错误响应格式：
```json
{
  "error": "错误信息"
}
```

## 认证要求

所有API端点都需要有效的NextAuth.js session。确保在调用API之前用户已登录。

前端可以通过以下方式检查认证状态：
```javascript
import { useSession } from 'next-auth/react'

const { data: session, status } = useSession()
if (status === 'authenticated') {
  // 可以调用API
}
```

## API测试

可以使用以下端点测试API功能：

```http
GET /api/test/diaries?type=basic
GET /api/test/diaries?type=detailed
```

这些端点会测试数据库连接和基础CRUD操作。

## 示例代码

### React Hook 使用示例

```typescript
// 获取日记列表
const fetchDiaries = async (page = 1) => {
  const response = await fetch(`/api/diaries?page=${page}&limit=10`)
  if (!response.ok) throw new Error('Failed to fetch diaries')
  return response.json()
}

// 创建新日记
const createDiary = async (diaryData) => {
  const response = await fetch('/api/diaries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(diaryData)
  })
  if (!response.ok) throw new Error('Failed to create diary')
  return response.json()
}

// 更新日记
const updateDiary = async (id, diaryData) => {
  const response = await fetch(`/api/diaries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(diaryData)
  })
  if (!response.ok) throw new Error('Failed to update diary')
  return response.json()
}

// 删除日记
const deleteDiary = async (id) => {
  const response = await fetch(`/api/diaries/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete diary')
  return response.json()
}
```

## 注意事项

1. 所有日期时间都使用ISO 8601格式
2. 标签在数据库中存储为JSON字符串，API会自动处理转换
3. 搜索功能区分大小写（SQLite限制）
4. 批量操作有数量限制，建议单次不超过100条记录
5. 导出功能支持大量数据，但可能需要较长时间

## 版本信息

- **API版本**: 1.0.0
- **最后更新**: 2024-01-01
- **兼容性**: Next.js 15, React 19, Prisma 6.8 