import React, { useState, useEffect, useCallback } from 'react'
import { useDAW } from '../context/DAWContext'

const STORAGE_KEY = 'daw-projects'

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    minWidth: '180px',
  },
  title: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  row: {
    display: 'flex',
    gap: '0.25rem',
  },
  button: {
    flex: 1,
    padding: '0.375rem 0.5rem',
    fontSize: '0.7rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.25rem',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  select: {
    flex: 1,
    padding: '0.375rem 0.5rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.25rem',
    color: 'white',
    fontSize: '0.7rem',
  },
  input: {
    flex: 1,
    padding: '0.375rem 0.5rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.25rem',
    color: 'white',
    fontSize: '0.7rem',
  },
  saveButton: {
    background: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  deleteButton: {
    background: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    flex: 'none',
    width: '32px',
  },
}

function getProjects() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export default function ProjectPanel() {
  const { state, actions } = useDAW()
  const [projects, setProjects] = useState({})
  const [selectedProject, setSelectedProject] = useState('')

  // Use global state for project name
  const projectName = state.projectName || ''
  const setProjectName = (name) => actions.setProjectName(name)

  useEffect(() => {
    setProjects(getProjects())
  }, [])

  const handleSave = useCallback(() => {
    if (!projectName.trim()) return

    const projectState = {
      ...state,
      audioInitialized: false, // Don't persist this
    }

    const updatedProjects = {
      ...projects,
      [projectName]: {
        state: projectState,
        savedAt: Date.now(),
      },
    }

    saveProjects(updatedProjects)
    setProjects(updatedProjects)
    setSelectedProject(projectName)
  }, [projectName, state, projects])

  const handleLoad = useCallback(() => {
    if (!selectedProject || !projects[selectedProject]) return

    const projectData = projects[selectedProject]
    actions.loadProject(projectData.state)
    setProjectName(selectedProject)
  }, [selectedProject, projects, actions])

  const handleDelete = useCallback(() => {
    if (!selectedProject || !projects[selectedProject]) return

    const { [selectedProject]: _, ...rest } = projects
    saveProjects(rest)
    setProjects(rest)
    setSelectedProject('')
  }, [selectedProject, projects])

  const handleNew = useCallback(() => {
    actions.newProject()
    setProjectName('')
    setSelectedProject('')
  }, [actions])

  const projectList = Object.keys(projects)

  return (
    <div style={styles.container}>
      <span style={styles.title}>Project</span>

      {/* Save row */}
      <div style={styles.row}>
        <input
          type="text"
          placeholder="Project name..."
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          style={styles.input}
        />
        <button
          style={{ ...styles.button, ...styles.saveButton, flex: 'none', width: '50px' }}
          onClick={handleSave}
          disabled={!projectName.trim()}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
        >
          Save
        </button>
      </div>

      {/* Load row */}
      <div style={styles.row}>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          style={styles.select}
        >
          <option value="">Select project...</option>
          {projectList.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <button
          style={{ ...styles.button, flex: 'none', width: '50px' }}
          onClick={handleLoad}
          disabled={!selectedProject}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
        >
          Load
        </button>
        <button
          style={{ ...styles.button, ...styles.deleteButton }}
          onClick={handleDelete}
          disabled={!selectedProject}
          title="Delete selected project"
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
        >
          ×
        </button>
      </div>

      {/* New project button */}
      <button
        style={styles.button}
        onClick={handleNew}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
      >
        New Project
      </button>
    </div>
  )
}
