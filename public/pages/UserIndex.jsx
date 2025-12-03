const { useState, useEffect } = React
const { Link } = ReactRouterDOM

import { userService } from '../services/user.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

export function UserIndex() {

    const [users, setUsers] = useState(null)

    useEffect(() => {
        userService.query()
            .then(setUsers)
            .catch(err => {
                console.log('Failed to load users:', err)
            })
    }, [])

    if (!users) return <div>Loading users...</div>

    function onRemoveUser(userId) {
        userService.remove(userId)
            .then(() => {
                const usersToUpdate = users.filter(user => user._id !== userId)
                setUsers(usersToUpdate)
                showSuccessMsg('User removed')
            })
            .catch((err) => showErrorMsg(`Cannot remove user`, err))
    }

    return <section className="user-index">
        <h1>Users</h1>
        <ul>
            {users.map(user => (
                <li key={user._id}>
                    <Link to={`/user/${user._id}`}>{user.fullname}</Link> 
                    <button onClick={() => onRemoveUser(user._id)}>x</button>
                </li>
            ))}
        </ul>
    </section>
}


