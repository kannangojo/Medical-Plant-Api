import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bot,
  Leaf,
  Lock,
  LogIn,
  LogOut,
  MessageCircle,
  Plus,
  Send,
  Sprout,
  Trash2,
  UserPlus,
} from 'lucide-react'
import './App.css'

const API_URL = 'https://medical-plant-api.onrender.com/api'

const starterMessages = [
  {
    sender: 'bot',
    text: 'Welcome. Login or register, then type a medicinal plant name such as neem, tulsi, aloe vera, turmeric, or mint.',
  },
]

function App() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
  })
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('medicalPlantAuth')
    return saved ? JSON.parse(saved) : null
  })
  const [messages, setMessages] = useState(starterMessages)
  const [question, setQuestion] = useState('')
  const [status, setStatus] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [plants, setPlants] = useState([])
  const [plantStatus, setPlantStatus] = useState('')
  const [plantForm, setPlantForm] = useState({
    name: '',
    botanical_name: '',
    family: '',
    uses: '',
    parts_used: '',
    preparation: '',
    caution: '',
  })

  const isLoggedIn = Boolean(auth?.token)
  const isAdmin = Boolean(auth?.user?.is_staff)

  const suggestedPlants = useMemo(
    () => plants.map((plant) => plant.name),
    [plants],
  )

  useEffect(() => {
    if (auth) {
      localStorage.setItem('medicalPlantAuth', JSON.stringify(auth))
    } else {
      localStorage.removeItem('medicalPlantAuth')
    }
  }, [auth])

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const updatePlantForm = (event) => {
    const { name, value } = event.target
    setPlantForm((current) => ({ ...current, [name]: value }))
  }

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Token ${auth.token}`,
  }), [auth?.token])

  const loadPlants = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/plants/`, {
        headers: authHeaders(),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Could not load plants.')
      }

      setPlants(data.plants)
    } catch (error) {
      setPlantStatus(error.message)
    }
  }, [authHeaders])

  useEffect(() => {
    if (isLoggedIn) {
      loadPlants()
    } else {
      setPlants([])
    }
  }, [isLoggedIn, loadPlants])

  const submitAuth = async (event) => {
    event.preventDefault()
    setStatus('Checking details...')

    const payload =
      mode === 'register'
        ? form
        : { username: form.username, password: form.password }

    try {
      const response = await fetch(`${API_URL}/${mode}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok) {
        const firstError =
          data.detail || Object.values(data).flat().join(' ') || 'Request failed.'
        throw new Error(firstError)
      }

      setAuth(data)
      setStatus(`${mode === 'register' ? 'Registered' : 'Logged in'} as ${data.user.username}.`)
      setMessages([
        ...starterMessages,
        {
          sender: 'bot',
          text: 'You are connected. Ask me about neem and I will give plant details automatically.',
        },
      ])
    } catch (error) {
      setStatus(error.message)
    }
  }

  const logout = () => {
    setAuth(null)
    setStatus('Logged out.')
    setMessages(starterMessages)
    setPlantStatus('')
  }

  const submitPlant = async (event) => {
    event.preventDefault()
    if (!isLoggedIn || !isAdmin) return

    const payload = {
      ...plantForm,
      uses: plantForm.uses
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
      parts_used: plantForm.parts_used
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    }

    setPlantStatus('Saving plant...')

    try {
      const response = await fetch(`${API_URL}/plants/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok) {
        const firstError =
          data.detail || Object.values(data).flat().join(' ') || 'Could not save plant.'
        throw new Error(firstError)
      }

      setPlants((current) => [...current, data.plant].sort((a, b) => a.name.localeCompare(b.name)))
      setPlantForm({
        name: '',
        botanical_name: '',
        family: '',
        uses: '',
        parts_used: '',
        preparation: '',
        caution: '',
      })
      setPlantStatus(`${data.plant.name} added to database.`)
    } catch (error) {
      setPlantStatus(error.message)
    }
  }

  const deletePlant = async (plant) => {
    if (!isLoggedIn || !isAdmin) return

    setPlantStatus(`Deleting ${plant.name}...`)

    try {
      const response = await fetch(`${API_URL}/plants/${plant.id}/`, {
        method: 'DELETE',
        headers: authHeaders(),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Could not delete plant.')
      }

      setPlants((current) => current.filter((item) => item.id !== plant.id))
      setPlantStatus(`${plant.name} deleted from database.`)
    } catch (error) {
      setPlantStatus(error.message)
    }
  }

  const askPlant = async (text = question) => {
    const cleanText = text.trim()
    if (!cleanText || !isLoggedIn) return

    setMessages((current) => [...current, { sender: 'user', text: cleanText }])
    setQuestion('')
    setIsSending(true)

    try {
      const response = await fetch(`${API_URL}/chatbot/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${auth.token}`,
        },
        body: JSON.stringify({ message: cleanText }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Chatbot request failed.')
      }

      setMessages((current) => [
        ...current,
        {
          sender: 'bot',
          text: data.reply,
          plant: data.plant,
        },
      ])
    } catch (error) {
      setMessages((current) => [
        ...current,
        { sender: 'bot', text: error.message },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="brand-panel">
        <div className="brand-mark">
          <Leaf size={30} />
        </div>
        <div>
          <p className="eyebrow">Medical Plant API</p>
          <h1>Medicinal plant chatbot</h1>
          <p className="intro">
            A React and Django app with registration, login, database-backed
            users, and an automatic plant details chatbot.
          </p>
        </div>

        <div className="stat-row">
          <div>
            <strong>{isLoggedIn ? plants.length : 'DB'}</strong>
            <span>plants ready</span>
          </div>
          <div>
            <strong>API</strong>
            <span>Django REST</span>
          </div>
        </div>

        <form className="auth-box" onSubmit={submitAuth}>
          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => setMode('login')}
            >
              <LogIn size={17} />
              Login
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'active' : ''}
              onClick={() => setMode('register')}
            >
              <UserPlus size={17} />
              Register
            </button>
          </div>

          <label>
            Username
            <input
              name="username"
              value={form.username}
              onChange={updateForm}
              placeholder="client name"
              required
            />
          </label>

          {mode === 'register' && (
            <>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateForm}
                  placeholder="client@example.com"
                />
              </label>
              <div className="split-fields">
                <label>
                  First name
                  <input
                    name="first_name"
                    value={form.first_name}
                    onChange={updateForm}
                    placeholder="First"
                  />
                </label>
                <label>
                  Last name
                  <input
                    name="last_name"
                    value={form.last_name}
                    onChange={updateForm}
                    placeholder="Last"
                  />
                </label>
              </div>
            </>
          )}

          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateForm}
              placeholder="minimum 6 characters"
              required
            />
          </label>

          <button className="primary-action" type="submit">
            {mode === 'login' ? <Lock size={18} /> : <UserPlus size={18} />}
            {mode === 'login' ? 'Login' : 'Create account'}
          </button>

          {status && <p className="status-text">{status}</p>}
        </form>
      </section>

      <section className="chat-panel">
        <header className="chat-header">
          <div>
            <p className="eyebrow">Authenticated Chatbot</p>
            <h2>
              <Bot size={24} />
              Ask about a plant
            </h2>
          </div>
          {isLoggedIn && (
            <button className="ghost-action" type="button" onClick={logout}>
              <LogOut size={17} />
              Logout
            </button>
          )}
        </header>

        <div className="quick-list" aria-label="Suggested plants">
          {suggestedPlants.map((plant) => (
            <button
              key={plant}
              type="button"
              disabled={!isLoggedIn || isSending}
              onClick={() => askPlant(plant)}
            >
              <Sprout size={16} />
              {plant}
            </button>
          ))}
        </div>

        <div className="messages" aria-live="polite">
          {messages.map((message, index) => (
            <article className={`message ${message.sender}`} key={`${message.sender}-${index}`}>
              <div className="avatar">
                {message.sender === 'bot' ? <Bot size={18} /> : <MessageCircle size={18} />}
              </div>
              <div className="bubble">
                <p>{message.text}</p>
                {message.plant && (
                  <dl className="plant-card">
                    <div>
                      <dt>Botanical name</dt>
                      <dd>{message.plant.botanical_name}</dd>
                    </div>
                    <div>
                      <dt>Family</dt>
                      <dd>{message.plant.family}</dd>
                    </div>
                    <div>
                      <dt>Parts used</dt>
                      <dd>{message.plant.parts_used.join(', ')}</dd>
                    </div>
                    <div>
                      <dt>Caution</dt>
                      <dd>{message.plant.caution}</dd>
                    </div>
                  </dl>
                )}
              </div>
            </article>
          ))}
        </div>

        <form
          className="chat-input"
          onSubmit={(event) => {
            event.preventDefault()
            askPlant()
          }}
        >
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={
              isLoggedIn ? 'Type neem, tulsi, aloe vera...' : 'Login to start chatting'
            }
            disabled={!isLoggedIn || isSending}
          />
          <button type="submit" disabled={!isLoggedIn || isSending}>
            <Send size={18} />
            Send
          </button>
        </form>

        {isLoggedIn && !isAdmin && (
          <section className="admin-note">
            <Lock size={18} />
            Plant database editing is available only for admin users.
          </section>
        )}

        {isLoggedIn && isAdmin && (
          <section className="plant-manager">
            <div className="manager-header">
              <div>
                <p className="eyebrow">Plant Database</p>
                <h2>
                  <Leaf size={22} />
                  Add or delete plants
                </h2>
              </div>
              {plantStatus && <p className="manager-status">{plantStatus}</p>}
            </div>

            <form className="plant-form" onSubmit={submitPlant}>
              <div className="split-fields">
                <label>
                  Plant name
                  <input
                    name="name"
                    value={plantForm.name}
                    onChange={updatePlantForm}
                    placeholder="Example: Ashwagandha"
                    required
                  />
                </label>
                <label>
                  Botanical name
                  <input
                    name="botanical_name"
                    value={plantForm.botanical_name}
                    onChange={updatePlantForm}
                    placeholder="Withania somnifera"
                    required
                  />
                </label>
              </div>
              <label>
                Family
                <input
                  name="family"
                  value={plantForm.family}
                  onChange={updatePlantForm}
                  placeholder="Solanaceae"
                  required
                />
              </label>
              <div className="split-fields">
                <label>
                  Uses
                  <textarea
                    name="uses"
                    value={plantForm.uses}
                    onChange={updatePlantForm}
                    placeholder="One use per line or comma separated"
                    required
                  />
                </label>
                <label>
                  Parts used
                  <textarea
                    name="parts_used"
                    value={plantForm.parts_used}
                    onChange={updatePlantForm}
                    placeholder="Leaves, roots, bark"
                    required
                  />
                </label>
              </div>
              <label>
                Preparation
                <textarea
                  name="preparation"
                  value={plantForm.preparation}
                  onChange={updatePlantForm}
                  placeholder="How this plant is prepared"
                  required
                />
              </label>
              <label>
                Caution
                <textarea
                  name="caution"
                  value={plantForm.caution}
                  onChange={updatePlantForm}
                  placeholder="Safety notes"
                  required
                />
              </label>
              <button className="primary-action add-action" type="submit">
                <Plus size={18} />
                Add plant
              </button>
            </form>

            <div className="plant-table">
              {plants.map((plant) => (
                <article key={plant.id} className="plant-row">
                  <div>
                    <strong>{plant.name}</strong>
                    <span>{plant.botanical_name} - {plant.family}</span>
                  </div>
                  <button type="button" onClick={() => deletePlant(plant)}>
                    <Trash2 size={17} />
                    Delete
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  )
}

export default App
