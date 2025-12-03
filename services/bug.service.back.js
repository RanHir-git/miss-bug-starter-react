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
const gBugs = utilService.readJsonFile(bugsFile)
_createBugs()

function query(filterBy = getDefaultFilter()) {
    if (!gBugs.length) _createBugs()

    const {
        txt,
        minSeverity,
        labels = '',
        sortBy,
        sortDir = 1
    } = filterBy

    let filteredBugs = gBugs

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

        if (sortBy === 'title') {
            filteredBugs = filteredBugs.toSorted((a, b) =>
                a.title.toLowerCase().localeCompare(b.title.toLowerCase()) * dir
            )
        } else if (sortBy === 'severity') {
            filteredBugs = filteredBugs.toSorted((a, b) =>
                (a.severity - b.severity) * dir
            )
        } else if (sortBy === 'createdAt') {
            filteredBugs = filteredBugs.toSorted((a, b) => {
                const aTime = new Date(a.createdAt).getTime()
                const bTime = new Date(b.createdAt).getTime()
                return (aTime - bTime) * dir
            })
        }
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
    const bug = gBugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject(`No such bug ${bugId}`)
    return Promise.resolve(bug)
}

function remove(bugId) {
    // return Promise.reject('Not now!')
    const idx = gBugs.findIndex(bug => bug._id === bugId)
    if (idx === -1) return Promise.reject(`No such bug ${bugId}`)
    gBugs.splice(idx, 1)
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
    gBugs.push(bugToSave)
    return _saveBugs().then(() => bugToSave)
}

function update(bug) {
    const bugToUpdate = gBugs.find(currBug => currBug._id === bug._id)
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
        const strBug = JSON.stringify(gBugs, null, 2)
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
    if (gBugs.length) return

    const demoBugs = [
        {
            _id: utilService.makeId(),
            title: 'Ant invasion',
            description: 'Trail of ants marching across the kitchen counter',
            severity: 2,
            createdAt: Date.now(),
            labels: ['ant', 'home','friendly','like sugar']
        },
        {
            _id: utilService.makeId(),
            title: 'Spider in the shower',
            description: 'Big spider chilling in the corner of the shower',
            severity: 3,
            createdAt: Date.now(),
            labels: ['spider', 'bathroom','friend']
        },
        {
            _id: utilService.makeId(),
            title: 'Mosquito at night',
            description: 'Annoying mosquito buzzing near your ear while you try to sleep',
            severity: 4,
            createdAt: Date.now(),
            labels: ['mosquito', 'night','annoying']
        },
        {
            _id: utilService.makeId(),
            title: 'Cocorouch',
            description: 'Worst bug ever (by zoe)',
            severity: 10,
            createdAt: Date.now(),
            labels: ['critical', 'dangerous','annoying']
        },
        {
            _id: utilService.makeId(),
            title: 'beetle',
            severity: 3,
            createdAt: Date.now(),
            labels: ['bug', 'harmless']
        },
        {
            _id: utilService.makeId(),
            title: 'fly',
            severity: 3,
            createdAt: Date.now(),
            labels: ['bug', 'harmless']
        },
        {
            _id: utilService.makeId(),
            title: 'butterfly',
            severity: 3,
            createdAt: Date.now(),
            labels: ['pretty', 'beautiful','harmless']
        }
    ]

    demoBugs.forEach(bug => gBugs.push(bug))
    _saveBugs()
}