const { useState, useEffect } = React
const { useParams, useNavigate, Link } = ReactRouterDOM

import { userService } from "../services/user.service.js"
import { bugService } from "../services/bug.service.local.js"
import { BugList } from "../cmps/BugList.jsx"

export function UserDetails() {

    const [user, setUser] = useState(null)
    const [userBugs, setUserBugs] = useState(null)
    const params = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        loadUser()
        loadUserBugs()
    }, [params.userId])

    function loadUser() {
        userService.getById(params.userId)
            .then(setUser)
            .catch(err => {
                console.log('err:', err)
                navigate('/')
            })
    }

    function loadUserBugs() {
        bugService.query()
            .then(bugs => {
                const filteredBugs = bugs.filter(bug => bug.creator && bug.creator._id === params.userId)
                setUserBugs(filteredBugs)
            })
            .catch(err => {
                console.log('Failed to load user bugs:', err)
                setUserBugs([])
            })
    }

    function onBack() {
        navigate('/')
    }

    if (!user) return <div>Loading...</div>

    return <section className="user-details">
        <h1>User {user.fullname}</h1>
        <pre>
            {JSON.stringify(user, null, 2)}
        </pre>
        <section className="user-bugs">
            <h2>{user.fullname}'s Bugs</h2>
            <BugList
                bugs={userBugs}
                onRemoveBug={() => { }}
                onEditBug={() => { }}
            />
        </section>
        {user.isAdmin && (
            <section className="user-actions">
                <h2>Admins Only</h2>
                <Link to="/user">View All Users</Link>
            </section>
        )}
        <button onClick={onBack} >Back</button>
    </section>
}