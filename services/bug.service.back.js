import fs from 'fs'
import { utilService } from './utils.service.back.js'

export const bugService = {
    query,
    getById,
    remove,
    add,
    update,
    getDefaultFilter
}


const PAGE_SIZE = 3
const bugsFile = 'data/bug.json'
const bugs = utilService.readJsonFile(bugsFile)
_createBugs()

function query(filterBy = getDefaultFilter()) {
    if (!bugs.length) _createBugs()

    const {
        txt,
        minSeverity,
        labels = '',
        sortBy,
        sortDir = 1
    } = filterBy

    let filteredBugs = bugs

    if (txt) {
        const regex = new RegExp(txt, 'i')
        filteredBugs = filteredBugs.filter(bug => regex.test(bug.title))
    }

    if (minSeverity) {
        filteredBugs = filteredBugs.filter(bug => bug.severity >= +minSeverity)
    }

    if (labels) {
        filteredBugs = filteredBugs.filter(bug => bug.labels.includes(labels))
    }

    // Sorting
    if (sortBy) {
        const dir = +sortDir === -1 ? -1 : 1

        filteredBugs = filteredBugs.toSorted((a, b) => {
            let aVal = a[sortBy]
            let bVal = b[sortBy]

            if (sortBy === 'createdAt') {
                aVal = new Date(aVal).getTime()
                bVal = new Date(bVal).getTime()
            }

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                aVal = aVal.toLowerCase()
                bVal = bVal.toLowerCase()
                if (aVal < bVal) return -1 * dir
                if (aVal > bVal) return 1 * dir
                return 0
            }

            if (aVal < bVal) return -1 * dir
            if (aVal > bVal) return 1 * dir
            return 0
        })
    }

    if (filterBy.pageIdx !== undefined) {
        const pageIdx = +filterBy.pageIdx || 0
        const startIdx = pageIdx * PAGE_SIZE
        filteredBugs = filteredBugs.slice(startIdx, startIdx + PAGE_SIZE)
    }

    return Promise.resolve(filteredBugs)
}

function getById(bugId) {
    // return Promise.reject('Not now!')
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject(`No such bug ${bugId}`)
    return Promise.resolve(bug)
}

function remove(bugId) {
    // return Promise.reject('Not now!')
    const idx = bugs.findIndex(bug => bug._id === bugId)
    if (idx === -1) return Promise.reject(`No such bug ${bugId}`)
    bugs.splice(idx, 1)
    return _saveBugs()

}

function add(bug) {
    const bugToSave = {
        _id: utilService.makeId(),
        title: bug.title,
        description: bug.description,
        severity: +bug.severity,
        createdAt: bug.createdAt,
        labels: bug.labels || []
    }
    bugs.push(bugToSave)
    return _saveBugs().then(() => bugToSave)
}

function update(bug) {
    const bugToUpdate = bugs.find(currBug => currBug._id === bug._id)
    if (!bugToUpdate) return Promise.reject(`No such bug ${bug._id}`)
    bugToUpdate.title = bug.title
    bugToUpdate.description = bug.description
    bugToUpdate.severity = bug.severity
    bugToUpdate.createdAt = bug.createdAt
    bugToUpdate.labels = bug.labels || []
    return _saveBugs().then(() => bugToUpdate)
}

function _saveBugs() {
    return new Promise((resolve, reject) => {
        const strBug = JSON.stringify(bugs, null, 2)
        fs.writeFile(bugsFile, strBug, (err) => {
            if (err) return reject('Cannot update bugs file')
            resolve()
        })
    })
}

function getDefaultFilter() {
    return {
        txt: '',
        minSeverity: 0,
        labels: '',
        sortBy: '',
        sortDir: 1
    }
}

function _createBugs() {
    if (bugs.length) return

    const demoBugs = [
        {
            _id: utilService.makeId(),
            title: 'Ant invasion',
            description: 'Trail of ants marching across the kitchen counter',
            severity: 2,
            createdAt: Date.now(),
            labels: ['ant', 'home']
        },
        {
            _id: utilService.makeId(),
            title: 'Spider in the shower',
            description: 'Big spider chilling in the corner of the shower',
            severity: 3,
            createdAt: Date.now(),
            labels: ['spider', 'bathroom']
        },
        {
            _id: utilService.makeId(),
            title: 'Mosquito at night',
            description: 'Annoying mosquito buzzing near your ear while you try to sleep',
            severity: 4,
            createdAt: Date.now(),
            labels: ['mosquito', 'night']
        }
    ]

    demoBugs.forEach(bug => bugs.push(bug))
    _saveBugs()
}