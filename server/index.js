const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const http = require('http')
const WebSocketServer = require('./websocket')
require('dotenv').config()

const app = express()
const server = http.createServer(app)

// Initialize WebSocket server
const wsServer = new WebSocketServer(server, {
  corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:3000'],
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: process.env.REDIS_PORT || 6379
})

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(compression())
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    websocket: wsServer.io.engine.clientsCount || 0
  })
})

// Routes
const yahooRoutes = require('./routes/yahoo')
app.use('/api/yahoo', yahooRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`WebSocket server ready`)
  console.log(`CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173, http://localhost:3000'}`)
  
  // Check Redis connection
  wsServer.redis.ping().then(() => {
    console.log('Redis connected successfully')
  }).catch((err) => {
    console.warn('Redis connection failed:', err.message)
    console.warn('WebSocket server will work without Redis, but horizontal scaling will be limited')
  })
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...')
  
  // Stop accepting new connections
  server.close(() => {
    console.log('HTTP server closed')
  })
  
  // Shutdown WebSocket server
  await wsServer.shutdown()
  
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...')
  
  server.close(() => {
    console.log('HTTP server closed')
  })
  
  await wsServer.shutdown()
  
  process.exit(0)
}) 