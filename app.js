// app.js - 文字存储 API
const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 3000

// 中间件：解析 JSON
app.use(express.json())

// 数据文件路径
const dataFile = path.join(__dirname, 'data.json')

// 确保 data.json 存在
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify([], null, 2))
}

// ✅ 接口：接收并保存文字
app.post('/api/save', (req, res) => {
  const { text, timestamp = new Date().toISOString() } = req.body

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: '缺少或无效的 text 字段' })
  }

  try {
    // 读取现有数据
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'))
    // 添加新记录
    data.push({ text, timestamp })
    // 保存回文件
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf-8')

    res.status(201).json({ message: '保存成功', text, timestamp })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '保存失败' })
  }
})

// ✅ 接口：获取所有保存的文字（可选）
app.get('/api/texts', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'))
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: '读取失败' })
  }
})

// 首页提示
app.get('/', (req, res) => {
  res.send(`
    <h1>📝 文字存储服务已启动</h1>
    <p>使用 POST 请求发送到 <code>/api/save</code></p>
    <pre>
{
  "text": "你想保存的文字"
}
    </pre>
  `)
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务已启动，端口：${PORT}`)
})