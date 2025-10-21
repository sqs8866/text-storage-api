// app.js - 使用 MongoDB 的文字存储 API（正确版本）

const { MongoClient, ServerApiVersion  } = require('mongodb')
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

// 中间件：解析 JSON
app.use(express.json())

// ========== MongoDB 连接（全局一次）==========
let db
let textsCollection

async function connectDB() {
  const uri = "mongodb+srv://sqs99:123@cluster0.l1vrpos.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

  try {

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  })

    await client.connect()
    console.log('✅ MongoDB 连接成功')

    db = client.db('textdb')
    textsCollection = db.collection('texts')
  } catch (err) {
    console.error('❌ MongoDB 连接失败:', err)
    process.exit(1) // 连接失败直接退出
  }
}

// ========== API 接口 ==========

// ✅ 保存文字
app.post('/api/save', async (req, res) => {
  const { text, timestamp = new Date().toISOString() } = req.body

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: '缺少或无效的 text 字段' })
  }

  try {
    await textsCollection.insertOne({ text, timestamp })
    res.status(201).json({ message: '保存成功', text, timestamp })
  } catch (err) {
    console.error('❌ 保存失败:', err)
    res.status(500).json({ error: '保存失败' })
  }
})

// ✅ 获取所有文字
app.get('/api/texts', async (req, res) => {
  try {
    const texts = await textsCollection.find().sort({ _id: -1 }).toArray()
    res.json(texts)
  } catch (err) {
    console.error('❌ 读取失败:', err)
    res.status(500).json({ error: '读取失败' })
  }
})

// 首页
app.get('/', (req, res) => {
  res.send(`
    <h1>📝 文字存储服务已启动</h1>
    <p>使用 POST 请求发送到 <code>/api/save</code></p>
    <pre>
{
  "text": "你想保存的文字"
}
    </pre>
    <p><a href="/api/texts">查看所有文字</a></p>
  `)
})

// ========== 启动服务 ==========

async function startServer() {
  await connectDB() // 先连接数据库

  app.listen(PORT, () => {
    console.log(`🚀 服务已启动：http://localhost:${PORT}`)
  })
}

startServer()