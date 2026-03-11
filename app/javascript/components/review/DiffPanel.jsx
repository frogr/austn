import React, { useState, useRef, useEffect } from 'react'

const lineStyle = (line) => {
  if (line.startsWith('+')) return 'bg-green-50 text-green-800'
  if (line.startsWith('-')) return 'bg-red-50 text-red-800'
  if (line.startsWith('@@')) return 'bg-blue-50 text-blue-600 font-medium'
  return 'text-gray-700'
}

const DiffPanel = ({ sections, status, highlightFile, highlightRange }) => {
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
    if (status === 'reviewing' || status === 'submitting') {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-400 p-4">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full" />
          Fetching diff...
        </div>
      )
    }
    return (
      <div className="text-sm text-gray-400 p-4 text-center">
        Submit a PR URL to see the diff here.
      </div>
    )
  }

  return (
    <div className="space-y-2 overflow-y-auto max-h-[80vh]">
      {sections.map((section) => (
        <div
          key={section.filename}
          ref={el => fileRefs.current[section.filename] = el}
          className="border border-gray-200 rounded overflow-hidden"
        >
          <button
            onClick={() => toggleFile(section.filename)}
            className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 text-left text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs">{section.filename}</span>
              {section.language && section.language !== 'text' && (
                <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{section.language}</span>
              )}
            </div>
            <span className="text-gray-400 text-xs">{collapsed[section.filename] ? '▸' : '▾'}</span>
          </button>

          {!collapsed[section.filename] && (
            <div className="border-t border-gray-200">
              {section.patch_text ? (
                <pre className="text-xs leading-5 overflow-x-auto p-0 m-0">
                  {section.patch_text.split('\n').map((line, i) => (
                    <div key={i} className={`px-3 ${lineStyle(line)}`}>{line || ' '}</div>
                  ))}
                </pre>
              ) : (
                <div className="p-3 text-xs text-gray-400 italic">No diff content available</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default DiffPanel
