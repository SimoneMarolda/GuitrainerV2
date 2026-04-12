#!/usr/bin/env node
const http = require('http')
const fs   = require('fs')
const PORT = 3000

http.createServer((req, res) => {
  if (req.url === '/__reload') {
    res.setHeader('Content-Type', 'text/plain')
    res.end('0')
    return
  }
  const html = fs.readFileSync('index.html', 'utf8')
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(html)
}).listen(PORT, () => {
  console.log('Guitrainer running on http://localhost:' + PORT)
})
