const { useState, useEffect } = React

export function BugFilter({ filterBy, onSetFilterBy }) {

    const [filterByToEdit, setFilterByToEdit] = useState(filterBy)

    useEffect(() => {
        onSetFilterBy(filterByToEdit)
    }, [filterByToEdit])

    function handleChange({ target }) {
        const field = target.name
        let value = target.value

        switch (target.type) {
            case 'number':
            case 'range':
                value = +value || ''
                break

            case 'checkbox':
                value = target.checked
                break

            default:
                break
        }

        setFilterByToEdit(prevFilter => ({ ...prevFilter, [field]: value }))
    }

    function onSubmitFilter(ev) {
        ev.preventDefault()
        onSetFilterBy(filterByToEdit)
    }

    const {
        txt,
        minSeverity,
        labels = '',
        sortBy = '',
        sortDir = 1
    } = filterByToEdit
    return (
        <section className="bug-filter">
            <h2>Filter</h2>
            <form onSubmit={onSubmitFilter}>
                <label htmlFor="txt">Text: </label>
                <input value={txt} onChange={handleChange} type="text" placeholder="By Text" id="txt" name="txt" />

                <label htmlFor="minSeverity">Min Severity: </label>
                <input value={minSeverity} onChange={handleChange} type="number" placeholder="By Min Severity" id="minSeverity" name="minSeverity" />

                <label htmlFor="labels">Label: </label>
                <input value={labels} onChange={handleChange} type="text" placeholder="By Label" id="labels" name="labels" />

                <section className="sort-controls">
                    <h3>Sort By</h3>
                    <div className="sort-buttons">
                        <button
                            type="button"
                            className={sortBy === 'title' ? 'active' : ''}
                            onClick={() =>
                                setFilterByToEdit(prev => ({
                                    ...prev,
                                    sortBy: 'title',
                                    sortDir: prev.sortBy === 'title' ? prev.sortDir * -1 : 1
                                }))
                            }>
                            Title {sortBy === 'title' ? (sortDir === 1 ? '↑' : '↓') : ''}
                        </button>
                        <button
                            type="button"
                            className={sortBy === 'severity' ? 'active' : ''}
                            onClick={() =>
                                setFilterByToEdit(prev => ({
                                    ...prev,
                                    sortBy: 'severity',
                                    sortDir: prev.sortBy === 'severity' ? prev.sortDir * -1 : 1
                                }))
                            }>
                            Severity {sortBy === 'severity' ? (sortDir === 1 ? '↑' : '↓') : ''}
                        </button>
                        <button
                            type="button"
                            className={sortBy === 'createdAt' ? 'active' : ''}
                            onClick={() =>
                                setFilterByToEdit(prev => ({
                                    ...prev,
                                    sortBy: 'createdAt',
                                    sortDir: prev.sortBy === 'createdAt' ? prev.sortDir * -1 : -1
                                }))
                            }>
                            Created At {sortBy === 'createdAt' ? (sortDir === 1 ? '↑' : '↓') : ''}
                        </button>
                    </div>
                </section>
            </form>
        </section>
    )
}