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
      localStorage.setItem('accessToken', access)
      localStorage.setItem('refreshToken', refresh)

      window.location.href = '/dashboard'
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
