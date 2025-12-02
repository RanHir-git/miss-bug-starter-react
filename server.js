import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'

import { bugService } from './services/bug.service.back.js'
import { loggerService } from './services/logger.service.js'
import { pdfService } from './services/PDFService.js'

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())
app.use(express.json())

// get all bugs
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// get bugs by filter (and optional sorting)
app.get('/api/bug', (req, res) => {
    const {
        txt = '',
        minSeverity = 0,
        labels = '',
        pageIdx = 0,
        sortBy = '',
        sortDir = 1
    } = req.query

    const filterBy = { txt, minSeverity, labels, pageIdx, sortBy, sortDir }
    bugService.query(filterBy)
        .then(bugs => {
            res.send(bugs)
        })
        .catch(err => {
            loggerService.error('ERROR: Cannot get bugs:', err)
            res.status(400).send('Cannot get bugs')
        })
})

// add bug
app.post('/api/bug', (req, res) => {
    const bug = req.body
    bugService.add(bug)
        .then(savedBug => {
            res.send(savedBug)
        })
        .catch(err => {
            loggerService.error('ERROR: Cannot add bug:', err)
            res.status(400).send('Cannot add bug')
        })
})

// update bug
app.put('/api/bug/:bugId', (req, res) => {
    const bug = { ...req.body, _id: req.params.bugId }
    bugService.update(bug)
        .then(savedBug => {
            res.send(savedBug)
        })
        .catch(err => {
            loggerService.error('ERROR: Cannot update bug:', err)
            res.status(400).send('Cannot update bug')
        })
})

//get bug by id
app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params

    let visitedBugs = []

    if (req.cookies.visitedBugs) {
        visitedBugs = JSON.parse(req.cookies.visitedBugs)
    }
    else {
        visitedBugs = []
    }


    if (!visitedBugs.includes(bugId)) {
        visitedBugs.push(bugId)
    }

    console.log('User visited the following bugs:', visitedBugs)

    if (visitedBugs.length > 3) {
        return res.status(401).send('Wait for a bit')
    }

    res.cookie('visitedBugs', JSON.stringify(visitedBugs), { maxAge: 7000 })

    bugService.getById(bugId)
        .then(bug => {
            res.json(bug)
        })
        .catch(err => {
            loggerService.error('ERROR: Cannot get bug:', err)
            res.status(400).send('Cannot get bug')
        })
})

//remove bug
app.delete('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => {
            res.send(bugId)
        })
        .catch(err => {
            loggerService.error('ERROR: Cannot remove bug:', err)
            res.status(400).send('Cannot remove bug')
        })
})

//save bugs to pdf
app.get('/api/bugs/savepdf', (req, res) => {
    bugService.query({})
        .then(bugs => {
            const doc = pdfService.buildBugsPDF(bugs)

            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader(
                'Content-Disposition',
                'attachment; filename="bugs.pdf"'
            )

            doc.pipe(res)
            doc.end()
        })
        .catch(err => {
            loggerService.error('ERROR: Cannot save bugs to pdf:', err)
            res.status(400).send('Cannot save bugs to pdf')
        })
})

const port = 3030
app.listen(port, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
)

