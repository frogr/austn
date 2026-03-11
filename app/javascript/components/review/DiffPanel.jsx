import React, { useState, useRef, useEffect } from 'react'

const DiffPanel = ({ sections, highlightFile, highlightRange }) => {
  const [collapsed, setCollapsed] = useState({})
  const fileRefs = useRef({})

  useEffect(() => {
    if (highlightFile && fileRefs.current[highlightFile]) {
      fileRefs.current[highlightFile].scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [highlightFile, highlightRange])

  const toggleFile = (filename) => {
    setCollapsed(prev => ({ ...prev, [filename]: !prev[filename] }))
  }

  if (!sections || sections.length === 0) {
    return <div className="text-sm text-gray-400 p-4">No diff data available</div>
  }

  return (
    <div className="space-y-2 overflow-y-auto">
      {sections.map((section) => (
        <div
          key={section.filename}
          ref={el => fileRefs.current[section.filename] = el}
          className="border border-gray-200 rounded"
        >
          <button
            onClick={() => toggleFile(section.filename)}
            className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 text-left text-sm"
          >
            <span className="font-mono text-xs">{section.filename}</span>
            <span className="text-gray-400 text-xs">{collapsed[section.filename] ? '▸' : '▾'}</span>
          </button>

          {!collapsed[section.filename] && section.findings && (
            <div className="p-2 text-xs text-gray-500">
              {section.findings.length} finding{section.findings.length !== 1 ? 's' : ''}
              {section.findings.some(f => f.severity === 'red_flag') && (
                <span className="ml-2 text-red-600 font-medium">contains red flags</span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default DiffPanel
