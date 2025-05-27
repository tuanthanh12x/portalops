import React, { useState } from 'react'
import axiosInstance from '../api/axiosInstance' // import từ file mới
import './LoginPage.css'

function LoginPage() {
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [error, setError] = useState('')

  // Hàm lưu token với thời gian hết hạn 1h (3600000 ms)
  const setTokenWithExpiry = (key, token, ttl = 3600000) => {
    const now = new Date()
    const item = {
      token: token,
      expiry: now.getTime() + ttl,
    }
    localStorage.setItem(key, JSON.stringify(item))
  }

  // Hàm lấy token, nếu hết hạn thì xóa và trả về null
  const getTokenWithExpiry = (key) => {
    const itemStr = localStorage.getItem(key)
    if (!itemStr) return null

    const item = JSON.parse(itemStr)
    const now = new Date()

    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key)
      return null
    }
    return item.token
  }

  const handleGetProjects = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await axiosInstance.post('/auth/projects/', {
        username,
        password,
      })

      setProjects(response.data.projects)
      if (response.data.projects.length === 1) {
        setSelectedProject(response.data.projects[0].id)
      }
      setStep(2)
    } catch (err) {
      setError('Đăng nhập thất bại hoặc không lấy được project.')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await axiosInstance.post('/auth/login/', {
        username,
        password,
        project_id: selectedProject,
      })

      const { access, refresh } = response.data
      // Lưu token có kèm expiry
      setTokenWithExpiry('accessToken', access)
      setTokenWithExpiry('refreshToken', refresh)

      window.location.href = '/'
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại.')
    }
  }

  return (
    <div className="login">
      <h1>Login</h1>

      {step === 1 && (
        <form onSubmit={handleGetProjects}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-login btn btn-primary btn-block btn-large">
            Next
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleLogin}>
          <label>Select Project</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            required
          >
            <option value="">-- Select a Project --</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-login btn btn-success btn-block btn-large">
            Login
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      )}
    </div>
  )
}

export default LoginPage
