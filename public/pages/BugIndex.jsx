const { useState, useEffect, useRef } = React
const { Link, useSearchParams } = ReactRouterDOM

import { bugService } from '../services/bug.service.local.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugList } from '../cmps/BugList.jsx'
import { utilService } from '../services/util.service.js'

export function BugIndex() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [bugs, setBugs] = useState(null)
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter(searchParams))

    const debouncedLoadBugs = useRef(
        utilService.debounce((filter) => {
            bugService.query(filter)
                .then(setBugs)
                .catch(err => showErrorMsg(`Couldn't load bugs - ${err}`))
        }, 300)
    ).current

    useEffect(() => {
        setSearchParams(filterBy)
        debouncedLoadBugs(filterBy)
    }, [filterBy])

    function onSetFilterBy(fieldsToUpdate) {
        setFilterBy(prevFilter => {
            if (prevFilter.pageIdx !== undefined) prevFilter.pageIdx = 0
            return { ...prevFilter, ...fieldsToUpdate }
        })
    }

    function onChangePage(diff) {
        setFilterBy(prevFilter => ({
            ...prevFilter,
            pageIdx: (prevFilter.pageIdx || 0) + diff
        }))
    }

    function loadBugs() {
        bugService.query(filterBy)
            .then(setBugs)
            .catch(err => showErrorMsg(`Couldn't load bugs - ${err}`))
    }

    function onRemoveBug(bugId) {
        bugService.remove(bugId)
            .then(() => {
                const bugsToUpdate = bugs.filter(bug => bug._id !== bugId)
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug removed')
            })
            .catch((err) => showErrorMsg(`Cannot remove bug`, err))
    }

    function onAddBug() {
        const bug = {
            title: prompt('Bug title?', 'Bug ' + Date.now()),
            severity: +prompt('Bug severity?', 3),
            labels: prompt('Bug labels?', 'critical').split(',').map(label => label.trim()) || [],
            description: prompt('Bug description?', '')
        }

        bugService.save(bug)
            .then(savedBug => {
                setBugs([...bugs, savedBug])
                showSuccessMsg('Bug added')
            })
            .catch(err => showErrorMsg(`Cannot add bug`, err))
    }

    function onEditBug(bug) {
        const severity = +prompt('New severity?', bug.severity)
        const bugToSave = { ...bug, severity }

        bugService.save(bugToSave)
            .then(savedBug => {
                const bugsToUpdate = bugs.map(currBug =>
                    currBug._id === savedBug._id ? savedBug : currBug)

                setBugs(bugsToUpdate)
                showSuccessMsg('Bug updated')
            })
            .catch(err => showErrorMsg('Cannot update bug', err))
    }

    function saveBugsPdf() {
        // Fetch the PDF and trigger a download without leaving the /bug route
        fetch('/api/bugs/savepdf')
            .then(res => {
                if (!res.ok) throw new Error('Failed to generate PDF')
                return res.blob()
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'bugs.pdf'
                document.body.appendChild(a)
                a.click()
                a.remove()
                window.URL.revokeObjectURL(url)
            })
            .catch(err => showErrorMsg('Cannot save bugs to PDF', err.message || err))
    }

    return <section className="bug-index main-content">
        <BugFilter
            filterBy={filterBy}
            onSetFilterBy={onSetFilterBy} />
        <header>
            <h3>Bug List</h3>
            <button onClick={onAddBug}>Add Bug</button>
            <button onClick={saveBugsPdf}>Save Bugs To PDF</button>
        </header>

        <BugList
            bugs={bugs}
            onRemoveBug={onRemoveBug}
            onEditBug={onEditBug} />

        <section className="paging-controls">
            <button
                onClick={() => onChangePage(-1)}
                disabled={!filterBy.pageIdx || filterBy.pageIdx <= 0}>
                Prev
            </button>
            <span>Page: {(filterBy.pageIdx || 0) + 1}</span>
            <button onClick={() => onChangePage(1)}>
                Next
            </button>
        </section>
    </section>
}
