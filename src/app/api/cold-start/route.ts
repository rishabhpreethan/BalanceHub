import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Simulate some processing to measure cold start
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const endTime = Date.now()
    const latency = endTime - startTime
    
    // Get additional metrics
    const memoryUsage = process.memoryUsage()
    const uptime = process.uptime()
    
    return NextResponse.json({
      latency,
      timestamp: new Date().toISOString(),
      memoryUsage: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      },
      uptime: Math.round(uptime * 1000), // ms
      coldStart: uptime < 5 // Consider cold start if uptime < 5 seconds
    })
  } catch (error) {
    console.error('Error in cold start measurement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
