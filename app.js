const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const exBody = require('express-body')

// 静态资源服务
app.use(express.static('./www'))

// 解析请求体
// app.use(require('express-body'));
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

app.post('/file/exists', exBody, function (req, res) {
  console.log(req.body)
  const {md5} = req.body
  const isExit = fs.existsSync(path.resolve('uploads', md5))
  // 判断原来是否上传过
  if (isExit) {
    res.send({
      data: {
        isExit: true,
        // 已经上传了几个文件。需要告诉前端，现在可以从第几个文件开始上传
        lastIndex: fs.readdirSync(path.resolve('uploads', md5)).length
      }
    })
  } else {
    res.send({
      data: {
        isExit: false
      }
    })
  }
})

app.post('/upload', upload.single('file'), function (req, res) {
  console.log(req.file, req.body)
  const {index, total, md5, name} = req.body
  // 如果文件夹不存在，在里面创建文件，会报错
  if (!fs.existsSync(path.resolve('uploads', md5))) fs.mkdirSync(path.resolve('uploads', md5))
  fs.renameSync(req.file.path, path.resolve('uploads', md5, `${md5}-${index}`))
  if (index === total) {
    fs.writeFileSync(path.resolve('uploads', name), '')
    const dirPath = path.resolve('uploads', md5)
    for (var i=1; i <= total; i++ ) {
      const filePath = path.resolve('uploads', md5, `${md5}-${i}`)
      fs.appendFileSync(path.resolve('uploads', name), fs.readFileSync(filePath))
      console.log(filePath)
      // fs.unlinkSync(filePath);
    }
    // fs.rmdirSync(dirPath)
  }
  res.send('success')
})


app.listen(3000, () => console.log('http://127.0.0.1:3000'))