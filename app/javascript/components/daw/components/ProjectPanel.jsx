import React, { useState, useEffect, useCallback } from 'react'
import { useDAW } from '../context/DAWContext'
import PatternLibrary from './PatternLibrary'
import SavePatternModal from './SavePatternModal'

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
    color: 'var(--ink-2)',
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
    background: 'var(--ground-3)',
    border: '1px solid var(--line)',
    borderRadius: '0.25rem',
    color: 'var(--ink-2)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  select: {
    flex: 1,
    padding: '0.375rem 0.5rem',
    background: 'var(--ground-3)',
    border: '1px solid var(--line)',
    borderRadius: '0.25rem',
    color: 'var(--ink)',
    fontSize: '0.7rem',
  },
  input: {
    flex: 1,
    padding: '0.375rem 0.5rem',
    background: 'var(--ground-3)',
    border: '1px solid var(--line)',
    borderRadius: '0.25rem',
    color: 'var(--ink)',
    fontSize: '0.7rem',
  },
  saveButton: {
    background: 'color-mix(in srgb, var(--brand) 10%, transparent)',
    borderColor: 'color-mix(in srgb, var(--brand) 20%, transparent)',
  },
  deleteButton: {
    background: 'color-mix(in srgb, var(--clay) 10%, transparent)',
    borderColor: 'color-mix(in srgb, var(--clay) 20%, transparent)',
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
  const [showLibrary, setShowLibrary] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)

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
          onMouseOver={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--brand) 20%, transparent)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--brand) 10%, transparent)'}
        >
          Save
        </button>
      </div>

      {/* Load row */}
      <div style={styles.row}>
        <select aria-label="Saved projects"
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
          onMouseOver={(e) => e.currentTarget.style.background = 'var(--line)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'var(--ground-3)'}
        >
          Load
        </button>
        <button
          style={{ ...styles.button, ...styles.deleteButton }}
          onClick={handleDelete}
          disabled={!selectedProject}
          title="Delete selected project"
          onMouseOver={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--clay) 20%, transparent)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--clay) 10%, transparent)'}
        >
          ×
        </button>
      </div>

      {/* New project button */}
      <button
        style={styles.button}
        onClick={handleNew}
        onMouseOver={(e) => e.currentTarget.style.background = 'var(--line)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'var(--ground-3)'}
      >
        New Project
      </button>

      {/* Pattern Library section */}
      <div style={{ borderTop: '1px solid var(--line)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
        <span style={{ ...styles.title, marginBottom: '0.5rem', display: 'block' }}>Pattern Library</span>
        <div style={styles.row}>
          <button
            style={{ ...styles.button, background: 'color-mix(in srgb, var(--plum) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--plum) 20%, transparent)' }}
            onClick={() => setShowLibrary(true)}
            onMouseOver={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--plum) 20%, transparent)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--plum) 10%, transparent)'}
          >
            Browse
          </button>
          <button
            style={{ ...styles.button, ...styles.saveButton }}
            onClick={() => setShowSaveModal(true)}
            onMouseOver={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--brand) 20%, transparent)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--brand) 10%, transparent)'}
          >
            Save to Library
          </button>
        </div>
      </div>

      {/* Modals */}
      <PatternLibrary isOpen={showLibrary} onClose={() => setShowLibrary(false)} />
      <SavePatternModal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} />
    </div>
  )
}
