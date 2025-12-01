import { utilService } from './util.service.js'

_createBugs()

export const bugService = {
    query,
    getById,
    add,
    update,
    save,
    remove,
    getDefaultFilter,
    saveBugsPdf
}

// Note: keep this function ES5/ES2015-compatible for the in-browser Babel setup
function query(filterBy) {
    const params = new URLSearchParams()

    if (filterBy && filterBy.txt) params.set('txt', filterBy.txt)
    if (filterBy && filterBy.minSeverity != null) {
        params.set('minSeverity', filterBy.minSeverity)
    }

    const queryStr = params.toString()
    const url = queryStr ? `/api/bug?${queryStr}` : '/api/bug'

    return fetch(url)
        .then(res => {
            if (!res.ok) return Promise.reject('Could not fetch bugs')
            return res.json()
        })
}

function getById(bugId) {
    return fetch(`/api/bug/${bugId}`)
    .then(res => {
        if (!res.ok) return Promise.reject('Could not fetch bug')
        return res.json()
    })
}

function remove(bugId) {
    return fetch(`/api/bug/${bugId}/remove`)
    .then(res => {
        if (!res.ok) return Promise.reject('Could not remove bug')
    })
}

function add(bug) {
    // Frontend add only passes title & severity, so set createdAt here
    const bugToSave = { ...bug, createdAt: new Date().toISOString() }
    return save(bugToSave)
}

function update(bug) {
    return save(bug)
}

function save(bug) {
    const params = new URLSearchParams()
    if (bug._id) params.set('_id', bug._id)
    if (bug.title) params.set('title', bug.title)
    if (bug.description) params.set('description', bug.description)
    if (bug.severity != null) params.set('severity', bug.severity)
    if (bug.createdAt) params.set('createdAt', bug.createdAt)

    return fetch(`/api/bug/save?${params.toString()}`)
        .then(res => {
            if (!res.ok) return Promise.reject('Could not save bug')
            return res.json()
        })
}

function _createBugs() {
    // Backend already reads and writes from data/bug.json,
    // so we don't need to seed anything on the frontend.
    // This is left as a no-op for backward compatibility.
    return
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0 }
}

function saveBugsPdf(bugs) {
    // Stub implementation - actual PDF generation is done on the backend
    return Promise.resolve()
}