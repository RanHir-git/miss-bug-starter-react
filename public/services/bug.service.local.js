import { utilService } from './util.service.js'

const baseUrl = '/api/bug'
_createBugs()

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter,
    saveBugsPdf
}


function query(filterBy) {
    const params = new URLSearchParams()

    if (filterBy && filterBy.txt) params.set('txt', filterBy.txt)
    if (filterBy && filterBy.minSeverity != null) {
        params.set('minSeverity', filterBy.minSeverity)
    }
    if (filterBy && filterBy.labels) params.set('labels', filterBy.labels)
    if (filterBy && filterBy.pageIdx != null) params.set('pageIdx', filterBy.pageIdx)
    if (filterBy && filterBy.sortBy) params.set('sortBy', filterBy.sortBy)
    if (filterBy && filterBy.sortDir != null) params.set('sortDir', filterBy.sortDir)

    const queryStr = params.toString()
    const url = queryStr ? `${baseUrl}?${queryStr}` : baseUrl

    return axios.get(url)
        .then(res => res.data)
}

function getById(bugId) {
    return axios.get(`${baseUrl}/${bugId}`)
        .then(res => res.data)
}

function remove(bugId) {
    return axios.delete(`${baseUrl}/${bugId}`)
        .then(res => res.data)
}


function save(bug) {
    if (bug._id) {
      return axios.put(`${baseUrl}/${bug._id}`, bug).then(res => res.data)
    } else {
      const bugToSave = { ...bug, createdAt: new Date().toISOString() }
      return axios.post(baseUrl, bugToSave).then(res => res.data)
    }
  }
function _createBugs() {
    return
}

function getDefaultFilter(searchParams = new URLSearchParams()) {
    const txt = searchParams.get('txt') || ''
    const minSeverity = +searchParams.get('minSeverity') || 0
    const labels = searchParams.get('labels') || ''
    const pageIdx = +searchParams.get('pageIdx') || 0
    const sortBy = searchParams.get('sortBy') || ''
    const sortDir = +(searchParams.get('sortDir') || 1)
    return { txt, minSeverity, labels, pageIdx, sortBy, sortDir }
}

function saveBugsPdf(bugs) {
    return Promise.resolve()
}