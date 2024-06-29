import express from "express"
import cookieParser from "cookie-parser"
import fs from 'fs'
import PDFDocument from 'pdfkit'

import { bugService } from './services/bug.service.js'

const app = express()

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

app.get('/api/bug/download', (req, res) => {
    const doc = new PDFDocument()
    doc.pipe(fs.createWriteStream('bugs.pdf'))
    doc.fontSize(25).text('BUGS LIST').fontSize(16)
    
    bugService.query().then((bugs) => {
      bugs.forEach((bug) => {
        var bugTxt = `${bug.title}: ${bug.description}. (severity: ${bug.severity})`
        doc.text(bugTxt)
      })
  
      doc.end()
    })
  })

app.get('/api/bug', (req, res) => {
    const filterBy = {
        txt: req.query.txt || '',
        minSeverity: +req.query.minSeverity || 0,
        pageIdx: +req.query.pageIdx || 0
    }

    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
})

app.put('/api/bug/:id', (req, res) => {
    const { _id, title, description, severity, createdAt } = req.body
    const bugToSave = {
        _id,
        title,
        description,
        severity: +severity,
        createdAt: +createdAt,
    }

    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
})

app.post('/api/bug/', (req, res) => {
    const { title, description, severity, createdAt } = req.body
    const bugToSave = {
        title: title || '',
        description: description || '',
        severity: +severity,
        createdAt: +createdAt,
    }

    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
})

app.get('/api/bug/:id', (req, res) => {
    const { id } = req.params

    var visitedBugs = req.cookies.visitedBugs || []

    if (visitedBugs.length >= 3) res.status(401).send('BUF LIMITED REACHED')
    if (!visitedBugs.includes(id)) visitedBugs.push(id)
    console.log('visitedBugs:', visitedBugs)
    res.cookie('visitedBugs', visitedBugs, { maxAge: 7000 })

    bugService.getById(id)
        .then(bug => res.send(bug))
})

app.delete('/api/bug/:id', (req, res) => {
    const { id } = req.params

    bugService.remove(id)
        .then(() => res.send(`Bug ${id} deleted...`))
})

const port = 3030
app.listen(port, () => console.log(`Server ready at port http://127.0.0.1:${port}`))