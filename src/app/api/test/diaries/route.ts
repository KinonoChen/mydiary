import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/test/diaries - 测试日记API功能
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testType = searchParams.get('type') || 'basic'

    const results = {
      timestamp: new Date().toISOString(),
      testType,
      results: [] as any[]
    }

    // 检查数据库连接
    try {
      await prisma.$connect()
      results.results.push({
        test: 'Database Connection',
        status: 'PASS',
        message: 'Successfully connected to database'
      })
    } catch (error) {
      results.results.push({
        test: 'Database Connection',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return NextResponse.json(results, { status: 500 })
    }

    // 检查用户表是否存在
    try {
      const userCount = await prisma.user.count()
      results.results.push({
        test: 'User Table Access',
        status: 'PASS',
        message: `Found ${userCount} users in database`
      })
    } catch (error) {
      results.results.push({
        test: 'User Table Access',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // 检查日记表是否存在
    try {
      const diaryCount = await prisma.diary.count()
      results.results.push({
        test: 'Diary Table Access',
        status: 'PASS',
        message: `Found ${diaryCount} diaries in database`
      })
    } catch (error) {
      results.results.push({
        test: 'Diary Table Access',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    if (testType === 'detailed') {
      // 详细测试 - 创建测试用户和日记
      try {
        // 检查是否有测试用户
        let testUser = await prisma.user.findFirst({
          where: { email: 'test@example.com' }
        })

        if (!testUser) {
          // 创建测试用户
          testUser = await prisma.user.create({
            data: {
              email: 'test@example.com',
              username: 'testuser',
              password: 'hashedpassword' // 这里应该是实际的哈希密码
            }
          })
          results.results.push({
            test: 'Create Test User',
            status: 'PASS',
            message: `Created test user with ID: ${testUser.id}`
          })
        } else {
          results.results.push({
            test: 'Find Test User',
            status: 'PASS',
            message: `Found existing test user with ID: ${testUser.id}`
          })
        }

        // 创建测试日记
        const testDiary = await prisma.diary.create({
          data: {
            title: 'Test Diary Entry',
            content: 'This is a test diary entry created for API testing.',
            tags: JSON.stringify(['test', 'api', 'demo']),
            mood: 'happy',
            weather: 'sunny',
            userId: testUser.id
          }
        })

        results.results.push({
          test: 'Create Test Diary',
          status: 'PASS',
          message: `Created test diary with ID: ${testDiary.id}`
        })

        // 测试查询日记
        const fetchedDiary = await prisma.diary.findUnique({
          where: { id: testDiary.id }
        })

        if (fetchedDiary) {
          results.results.push({
            test: 'Fetch Test Diary',
            status: 'PASS',
            message: `Successfully fetched diary: ${fetchedDiary.title}`
          })
        }

        // 测试更新日记
        const updatedDiary = await prisma.diary.update({
          where: { id: testDiary.id },
          data: {
            title: 'Updated Test Diary Entry',
            content: 'This diary entry has been updated during API testing.'
          }
        })

        results.results.push({
          test: 'Update Test Diary',
          status: 'PASS',
          message: `Successfully updated diary title to: ${updatedDiary.title}`
        })

        // 测试删除日记
        await prisma.diary.delete({
          where: { id: testDiary.id }
        })

        results.results.push({
          test: 'Delete Test Diary',
          status: 'PASS',
          message: 'Successfully deleted test diary'
        })

        // 清理测试用户（可选）
        // await prisma.user.delete({
        //   where: { id: testUser.id }
        // })

      } catch (error) {
        results.results.push({
          test: 'Detailed CRUD Operations',
          status: 'FAIL',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // 测试日记API端点（需要认证的端点在这里只能做基础检查）
    const apiTests = [
      { endpoint: '/api/diaries', method: 'GET', description: 'List diaries (requires auth)' },
      { endpoint: '/api/diaries', method: 'POST', description: 'Create diary (requires auth)' },
      { endpoint: '/api/diaries/[id]', method: 'GET', description: 'Get diary by ID (requires auth)' },
      { endpoint: '/api/diaries/[id]', method: 'PUT', description: 'Update diary (requires auth)' },
      { endpoint: '/api/diaries/[id]', method: 'DELETE', description: 'Delete diary (requires auth)' },
      { endpoint: '/api/diaries/stats', method: 'GET', description: 'Get diary statistics (requires auth)' },
      { endpoint: '/api/diaries/search', method: 'GET', description: 'Quick search (requires auth)' },
      { endpoint: '/api/diaries/search', method: 'POST', description: 'Advanced search (requires auth)' },
      { endpoint: '/api/diaries/batch', method: 'POST', description: 'Batch operations (requires auth)' },
      { endpoint: '/api/diaries/batch/export-all', method: 'GET', description: 'Export all diaries (requires auth)' }
    ]

    results.results.push({
      test: 'API Endpoints Definition',
      status: 'INFO',
      message: 'Available diary API endpoints',
      data: apiTests
    })

    await prisma.$disconnect()

    const passCount = results.results.filter(r => r.status === 'PASS').length
    const failCount = results.results.filter(r => r.status === 'FAIL').length
    const totalTests = results.results.filter(r => r.status !== 'INFO').length

    return NextResponse.json({
      ...results,
      summary: {
        total: totalTests,
        passed: passCount,
        failed: failCount,
        success: failCount === 0
      }
    })

  } catch (error) {
    console.error('Error in diary API test:', error)
    return NextResponse.json(
      {
        error: 'Test execution failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 