'use client'

import { useState, useCallback } from 'react'
import yaml from 'js-yaml'
import { useDropzone } from 'react-dropzone'
import { Diff, Hunk, parseDiff } from 'react-diff-view'
import 'react-diff-view/style/index.css'
import { structuredPatch } from 'diff'

const FileDropzone = ({
  onFileLoad,
  fileName,
  label
}: {
  onFileLoad: (file: { name: string; content: string }) => void
  fileName: string | null
  label: string
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = () => {
        onFileLoad({ name: file.name, content: reader.result as string })
      }
      reader.readAsText(file)
    },
    [onFileLoad]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/x-yaml': ['.yaml', '.yml'] }
  })

  return (
    <div
      {...getRootProps()}
      className={`w-full p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors duration-200 ease-in-out ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
    >
      <input {...getInputProps()} />
      <p className="text-gray-500">
        {fileName
          ? `Loaded: ${fileName}`
          : isDragActive
            ? 'Drop the file here ...'
            : label}
      </p>
    </div>
  )
}

export default function ComparerPage() {
  const [fileA, setFileA] = useState<{ name: string; content: string } | null>(
    null
  )
  const [fileB, setFileB] = useState<{ name: string; content: string } | null>(
    null
  )
  const [diff, setDiff] = useState<string | null>(null)

  const handleCompare = () => {
    if (!fileA || !fileB) return

    try {
      const dataA = yaml.load(fileA.content)
      const dataB = yaml.load(fileB.content)

      const yamlA = yaml.dump(dataA, { sortKeys: true })
      const yamlB = yaml.dump(dataB, { sortKeys: true })

      const diffResult = structuredPatch(
        fileA.name,
        fileB.name,
        yamlA,
        yamlB,
        '',
        '',
        { context: 3 }
      )

      let diffString = `--- a/${fileA.name}
+++ b/${fileB.name}
`
      diffResult.hunks.forEach((hunk) => {
        diffString += `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@
`
        hunk.lines.forEach((line) => {
          diffString += `${line}
`
        })
      })

      setDiff(diffString)
    } catch (e) {
      console.error(e)
      alert('Failed to parse or compare files. Check console for details.')
    }
  }

  const files = diff ? parseDiff(diff) : []

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">kong.yaml differ</h1>
        <p className="mt-2 text-lg text-gray-600">
          Upload two kong.yaml files to see the differences.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <FileDropzone
          onFileLoad={setFileA}
          fileName={fileA?.name || null}
          label="Drop Original File Here"
        />
        <FileDropzone
          onFileLoad={setFileB}
          fileName={fileB?.name || null}
          label="Drop Modified File Here"
        />
      </div>

      <div className="text-center mb-8">
        <button
          onClick={handleCompare}
          disabled={!fileA || !fileB}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Compare Files
        </button>
      </div>

      {diff && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {files.map(({ oldRevision, newRevision, type, hunks }) => (
            <Diff
              key={oldRevision + '-' + newRevision}
              viewType="split"
              diffType={type}
              hunks={hunks}
            >
              {(hunks) =>
                hunks.map((hunk) => <Hunk key={hunk.content} hunk={hunk} />)
              }
            </Diff>
          ))}
        </div>
      )}
    </div>
  )
}
