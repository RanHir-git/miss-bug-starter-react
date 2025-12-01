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

// Express Config
// Serve the current project folder (where index.html, app.js, assets, lib live)
app.use(express.static(__dirname))
app.use(cookieParser())

// Root route - always send the SPA HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

// API routes
app.get('/api/bug', (req, res) => {
    const filterBy = {
        txt: req.query.txt || '',
        minSeverity: +req.query.minSeverity || 0
    }

    bugService.query(filterBy)
        .then(bugs => {
            res.json(bugs)
        })
        .catch(err => {
            loggerService.error('ERROR: Cannot get bugs:', err)
            res.status(400).send('Cannot get bugs')
        })
})

app.get('/api/bug/save', (req, res) => {
    const bug = {
        _id: req.query._id,
        title: req.query.title,
        description: req.query.description,
        severity: +req.query.severity,
        createdAt: req.query.createdAt
    }

    const func = (bug._id) ? 'update' : 'add'
    bugService[func](bug)
        .then((savedBug) => {
            res.json(savedBug)
        })
        .catch(err => {
            loggerService.error('ERROR: Cannot save bug:', err)
            res.status(400).send('Cannot save bug')
        })
})

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

app.get('/api/bug/:bugId/remove', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => {
            res.send('bug removed')
        })
        .catch(err => {
            loggerService.error('ERROR: Cannot remove bug:', err)
            res.status(400).send('Cannot remove bug')
        })
})

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

