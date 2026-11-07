
import { useEffect, useState } from 'react'
import './App.css'
import Login from './Login'
import { auth } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { db } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const initialSkills = [
  { id: 1, name: 'HTML', category: 'Web Development', status: 'completed' },
  { id: 2, name: 'CSS', category: 'Web Development', status: 'completed' },
  { id: 3, name: 'JavaScript', category: 'Web Development', status: 'learning' },
  { id: 4, name: 'C++', category: 'Programming', status: 'learning' },
  { id: 5, name: 'Data Structures & Algorithms', category: 'DSA', status: 'pending' },
  { id: 6, name: 'SQL', category: 'Database', status: 'pending' },
  { id: 7, name: 'React.js', category: 'Web Development', status: 'pending' },
  { id: 8, name: 'Python', category: 'AI/ML', status: 'pending' },
]

const initialTasks = [
  { id: 1, title: 'Practice JavaScript', done: false },
  { id: 2, title: 'Study DSA', done: false },
  { id: 3, title: 'Work on a project', done: true },
]

const initialProjects = [
  { id: 1, name: 'SkillPath', description: 'Career roadmap tracker', status: 'In Progress' },
]

function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [loadedUid, setLoadedUid] = useState('')

  const [page, setPage] = useState('Dashboard')
  const [skills, setSkills] = useState(initialSkills)
  const [tasks, setTasks] = useState(initialTasks)
  const [projects, setProjects] = useState(initialProjects)
  const [goal, setGoal] = useState('Become a Software Developer')

  const [newSkill, setNewSkill] = useState('')
  const [newCategory, setNewCategory] = useState('Programming')
  const [newTask, setNewTask] = useState('')
  const [newProject, setNewProject] = useState('')
  const [search, setSearch] = useState('')

  // Check logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Load individual user's data from Firestore
  useEffect(() => {
    if (!user) {
      setLoadedUid('')
      return
    }

    let cancelled = false

    async function loadData() {
      setDataLoading(true)
      setLoadedUid('')

      try {
        const userRef = doc(db, 'users', user.uid)
        const snapshot = await getDoc(userRef)

        if (cancelled) return

        if (snapshot.exists()) {
          const data = snapshot.data()

          setSkills(data.skills ?? initialSkills)
          setTasks(data.tasks ?? initialTasks)
          setProjects(data.projects ?? initialProjects)
          setGoal(data.goal ?? 'Become a Software Developer')
        } else {
          await setDoc(userRef, {
            skills: initialSkills,
            tasks: initialTasks,
            projects: initialProjects,
            goal: 'Become a Software Developer'
          })
          
          if (cancelled) return

          setSkills(initialSkills)
          setTasks(initialTasks)
          setProjects(initialProjects)
          setGoal('Become a Software Developer')
        }

        setLoadedUid(user.uid)
      } catch (error) {
        console.error('Database error:', error)
        alert('Could not load your data. Please check your internet and try again.')
      } finally {
        if (!cancelled) setDataLoading(false)
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [user])

  // Save each user's data separately
  useEffect(() => {
    if (!user || loadedUid !== user.uid) return

    setDoc(doc(db, 'users', user.uid), {
      skills: skills
    }, { merge: true }).catch(console.error)
  }, [skills, user, loadedUid])

  useEffect(() => {
    if (!user || loadedUid !== user.uid) return

    setDoc(doc(db, 'users', user.uid), {
      tasks: tasks
    }, { merge: true }).catch(console.error)
  }, [tasks, user, loadedUid])

  useEffect(() => {
    if (!user || loadedUid !== user.uid) return

    setDoc(doc(db, 'users', user.uid), {
      projects: projects
    }, { merge: true }).catch(console.error)
  }, [projects, user, loadedUid])

  useEffect(() => {
    if (!user || loadedUid !== user.uid) return

    setDoc(doc(db, 'users', user.uid), {
      goal: goal
    }, { merge: true }).catch(console.error)
  }, [goal, user, loadedUid])

  const completed = skills.filter(s => s.status === 'completed').length

  const progress = skills.length
    ? Math.round((completed / skills.length) * 100)
    : 0

  function addSkill(e) {
    e.preventDefault()
    if (!newSkill.trim()) return

    setSkills([...skills, {
      id: Date.now(),
      name: newSkill.trim(),
      category: newCategory,
      status: 'pending'
    }])

    setNewSkill('')
  }

  function changeStatus(id, status) {
    setSkills(skills.map(s =>
      s.id === id ? { ...s, status } : s
    ))
  }

  function deleteSkill(id) {
    setSkills(skills.filter(s => s.id !== id))
  }

  function addTask(e) {
    e.preventDefault()
    if (!newTask.trim()) return

    setTasks([...tasks, {
      id: Date.now(),
      title: newTask.trim(),
      done: false
    }])

    setNewTask('')
  }

  function addProject(e) {
    e.preventDefault()
    if (!newProject.trim()) return

    setProjects([...projects, {
      id: Date.now(),
      name: newProject.trim(),
      description: 'Personal project',
      status: 'In Progress'
    }])

    setNewProject('')
  }

  function toggleTask(id) {
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    ))
  }

  function deleteTask(id) {
    setTasks(tasks.filter(t => t.id !== id))
  }

  async function handleLogout() {
    await signOut(auth)
    setPage('Dashboard')
  }

  const menu = [
    ['Dashboard', '▦'],
    ['My Roadmap', '◇'],
    ['Daily Planner', '▤'],
    ['My Projects', '▣'],
    ['Analytics', '◷'],
    ['Settings', '⚙'],
  ]

  function heading(title, subtitle) {
    return (
      <div className="page-heading">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
    )
  }

  function dashboard() {
    return (
      <>
        <div className="welcome">
          <div>
            <h1>Welcome, {user?.displayName || 'Learner'} 👋</h1>
            <p>Your journey to success starts here.</p>
            <p className="goal-text">Career Goal: {goal}</p>
          </div>
          <button onClick={() => setPage('My Roadmap')}>
            + Add Skill
          </button>
        </div>

        <div className="stats">
          <Stat title="Total Skills" value={skills.length} icon="✧"/>
          <Stat title="Completed Skills" value={completed} icon="✓"/>
          <Stat title="Active Projects" value={projects.length} icon="▣"/>
          <Stat title="Learning Progress" value={progress + '%'} icon="◷"/>
        </div>

        <div className="content-grid">
          <div className="panel">
            <h2>My Learning Roadmap</h2>
            <p className="subtitle">Your skill development journey</p>

            {skills.slice(0, 5).map(skill => (
              <div className="roadmap-item" key={skill.id}>
                <div>
                  <h3>{skill.name}</h3>
                  <p>{skill.category}</p>
                </div>
                <span className={'status ' + skill.status}>
                  {skill.status}
                </span>
              </div>
            ))}

            <button className="text-button" onClick={() => setPage('My Roadmap')}>
              View all skills →
            </button>
          </div>

          <div className="panel">
            <h2>Daily Tasks</h2>
            <p className="subtitle">Your today's activities</p>

            {tasks.slice(0, 5).map(task => (
              <label className="task-row" key={task.id}>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                />
                <span className={task.done ? 'done' : ''}>
                  {task.title}
                </span>
              </label>
            ))}

            <button className="text-button" onClick={() => setPage('Daily Planner')}>
              View planner →
            </button>
          </div>
        </div>
      </>
    )
  }

  function roadmap() {
    const filtered = skills.filter(s =>
      (s.name + s.category).toLowerCase().includes(search.toLowerCase())
    )

    return (
      <>
        {heading('My Roadmap', 'Build your personal learning journey')}

        <div className="panel form-panel">
          <h2>Add a New Skill</h2>

          <form onSubmit={addSkill} className="add-form">
            <input
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              placeholder="Enter skill name..."
              required
            />

            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
            >
              <option>Programming</option>
              <option>Web Development</option>
              <option>DSA</option>
              <option>Database</option>
              <option>AI/ML</option>
              <option>Other</option>
            </select>

            <button type="submit">Add Skill</button>
          </form>
        </div>

        <div className="panel">
          <div className="panel-title">
            <h2>All Skills ({skills.length})</h2>

            <input
              className="search-input"
              placeholder="Search skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {filtered.map(skill => (
            <div className="skill-row" key={skill.id}>
              <div className="skill-info">
                <h3>{skill.name}</h3>
                <p>{skill.category}</p>
              </div>

              <select
                value={skill.status}
                onChange={e => changeStatus(skill.id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="learning">Learning</option>
                <option value="completed">Completed</option>
              </select>

              <button className="delete-btn" onClick={() => deleteSkill(skill.id)}>
                Delete
              </button>
            </div>
          ))}

          {filtered.length === 0 && <p>No skills found.</p>}
        </div>
      </>
    )
  }

  function planner() {
    return (
      <>
        {heading('Daily Planner', 'Plan your learning day')}

        <div className="panel form-panel">
          <h2>Add New Task</h2>

          <form className="add-form" onSubmit={addTask}>
            <input
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              placeholder="What do you want to learn today?"
              required
            />

            <button type="submit">Add Task</button>
          </form>
        </div>

        <div className="panel">
          <h2>My Tasks</h2>

          <p className="subtitle">
            {tasks.filter(t => t.done).length} of {tasks.length} completed
          </p>

          {tasks.map(task => (
            <div className="skill-row" key={task.id}>
              <label className="task-row">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                />
                <span className={task.done ? 'done' : ''}>
                  {task.title}
                </span>
              </label>

              <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                Delete
              </button>
            </div>
          ))}

          {tasks.length === 0 && <p>No tasks yet. Add your first task!</p>}
        </div>
      </>
    )
  }

  function myProjects() {
    return (
      <>
        {heading('My Projects', 'Manage your portfolio projects')}

        <div className="panel form-panel">
          <h2>Add Project</h2>

          <form className="add-form" onSubmit={addProject}>
            <input
              value={newProject}
              onChange={e => setNewProject(e.target.value)}
              placeholder="Enter project name..."
              required
            />

            <button type="submit">Add Project</button>
          </form>
        </div>

        <div className="project-grid">
          {projects.map(project => (
            <div className="panel" key={project.id}>
              <h2>▣ {project.name}</h2>
              <p className="subtitle">{project.description}</p>
              <span className="status learning">{project.status}</span>

              <button
                className="delete-btn project-delete"
                onClick={() => setProjects(projects.filter(p => p.id !== project.id))}
              >
                Delete Project
              </button>
            </div>
          ))}

          {projects.length === 0 && <p>No projects added yet.</p>}
        </div>
      </>
    )
  }

  function analytics() {
    return (
      <>
        {heading('Analytics', 'Understand your learning progress')}

        <div className="stats">
          <Stat title="Total Skills" value={skills.length} icon="✧"/>
          <Stat title="Completed" value={completed} icon="✓"/>
          <Stat title="Remaining" value={skills.length - completed} icon="◷"/>
          <Stat title="Progress" value={progress + '%'} icon="↗"/>
        </div>

        <div className="panel analytics-panel">
          <h2>Overall Learning Progress</h2>

          <div className="progress-track">
            <div className="progress-fill" style={{ width: progress + '%' }}/>
          </div>

          <h1>{progress}%</h1>

          <p className="subtitle">
            {completed} skills completed out of {skills.length}
          </p>
        </div>
      </>
    )
  }

  function settings() {
    return (
      <>
        {heading('Settings', 'Customize your SkillPath experience')}

        <div className="panel form-panel">
          <h2>My Account</h2>
          <p>{user?.displayName || 'User'}</p>
          <p className="subtitle">{user?.email}</p>
        </div>

        <div className="panel form-panel">
          <h2>Career Goal</h2>

          <form className="add-form" onSubmit={e => e.preventDefault()}>
            <input
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="Enter your career goal"
            />
          </form>

          <p className="subtitle">Your goal is saved automatically.</p>
        </div>

        <div className="panel form-panel">
          <h2>Data Management</h2>

          <p className="subtitle">
            Your data is saved securely in your personal cloud database.
          </p>

          <button className="delete-btn" onClick={() => {
            if (window.confirm('Reset all SkillPath data?')) {
              setSkills(initialSkills)
              setTasks(initialTasks)
              setProjects(initialProjects)
              setGoal('Become a Software Developer')
            }
          }}>
            Reset App Data
          </button>
        </div>
      </>
    )
  }

  const pages = {
    Dashboard: dashboard,
    'My Roadmap': roadmap,
    'Daily Planner': planner,
    'My Projects': myProjects,
    Analytics: analytics,
    Settings: settings,
  }

  if (authLoading) {
    return <div className="loading-screen">Loading SkillPath...</div>
  }

  if (!user) {
    return <Login />
  }

  if (dataLoading || loadedUid !== user.uid) {
    return <div className="loading-screen">Loading your personal data...</div>
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2 className="brand">SkillPath<span>.</span></h2>

        <p className="menu-title">WORKSPACE</p>

        <nav>
          {menu.map(([name, icon]) => (
            <button
              key={name}
              className={page === name ? 'nav-link active' : 'nav-link'}
              onClick={() => {
                setPage(name)
                setSearch('')
              }}
            >
              <span>{icon}</span>{name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <span>SkillPath v1.0</span>
          <small>Your growth journey starts here.</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="top-search">
            My Workspace / {page}
          </div>

          <div className="profile">
            <span className="avatar">
              {(user.displayName || user.email || 'S')[0].toUpperCase()}
            </span>

            <span>{user.displayName || user.email}</span>

            <button onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <div className="page-content">
          {pages[page]()}
        </div>

        <footer>© 2026 SkillPath. Learn. Build. Grow.</footer>
      </main>
    </div>
  )
}

function Stat({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <p>{title}</p>
        <span>{icon}</span>
      </div>
      <h2>{value}</h2>
    </div>
  )
}

export default App

