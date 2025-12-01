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

const bugsFile = 'data/bug.json'
const bugs = utilService.readJsonFile(bugsFile)

function query(filterBy = getDefaultFilter()) {
    const { txt, minSeverity } = filterBy

    let filteredBugs = bugs

    if (txt) {
        const regex = new RegExp(txt, 'i')
        filteredBugs = filteredBugs.filter(bug => regex.test(bug.title))
    }

    if (minSeverity) {
        filteredBugs = filteredBugs.filter(bug => bug.severity >= minSeverity)
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
        createdAt: bug.createdAt
    }
    bugs.push(bugToSave)
    return _saveBugs().then(() => bugToSave)
}

function update(bug) {
    const bugToUpdate = bugs.find(currBug => currBug._id === bug._id)
    if (!bugToUpdate) return Promise.reject(`No such bug ${bug._id}`)
    bugToUpdate.vendor = bug.vendor
    bugToUpdate.speed = bug.speed
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
    return { txt: '', minSeverity: 0 }
}