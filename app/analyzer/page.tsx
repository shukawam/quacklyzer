/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useCallback } from 'react'
import yaml from 'js-yaml'
import GraphVisualization from '@/components/GraphVisualization'
import Modal from '@/components/Modal'
import { useDropzone } from 'react-dropzone'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

// Define types for our data structure
interface Plugin {
  name: string
  scope: string
  scopeName?: string
}

interface AnalysisResult {
  serviceCount: number
  routeCount: number
  consumerCount: number
  plugins: Plugin[]
  rawData: any
}

// A reusable Card component for consistent styling
const Card: React.FC<{
  title: string
  children: React.ReactNode
  className?: string
}> = ({ title, children, className }) => (
  <div
    className={`bg-[rgb(var(--card-background))] border border-[rgb(var(--border-color))] rounded-xl shadow-sm ${className}`}
  >
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>
  </div>
)

export default function AnalyzerPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{
    title: string
    data: any
  } | null>(null)

  const handleOpenModal = (title: string, data: any) => {
    setSelectedItem({ title, data })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  const findPluginData = (plugin: Plugin) => {
    const { rawData } = analysisResult!
    let foundPlugin
    if (plugin.scope === 'global') {
      foundPlugin = rawData.plugins?.find((p: any) => p.name === plugin.name)
    } else if (plugin.scope === 'service') {
      const service = rawData.services?.find(
        (s: any) => s.name === plugin.scopeName
      )
      foundPlugin = service?.plugins?.find((p: any) => p.name === plugin.name)
    } else if (plugin.scope === 'route') {
      rawData.services?.forEach((s: any) => {
        const route = s.routes?.find((r: any) => r.name === plugin.scopeName)
        if (route) {
          foundPlugin = route.plugins?.find((p: any) => p.name === plugin.name)
        }
      })
    }
    return foundPlugin
  }

  const getAllRoutes = (rawData: any) => {
    let allRoutes = rawData.routes ? [...rawData.routes] : []
    if (rawData.services) {
      const nestedRoutes = rawData.services.flatMap((s: any) => s.routes || [])
      allRoutes = allRoutes.concat(nestedRoutes)
    }
    return allRoutes
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const content = reader.result as string
        const data = yaml.load(content) as any

        const serviceCount = data.services?.length || 0
        const allRoutes = getAllRoutes(data)
        const routeCount = allRoutes.length
        const consumerCount = data.consumers?.length || 0
        const plugins: Plugin[] = []
        data.plugins?.forEach((p: any) =>
          plugins.push({ name: p.name, scope: 'global' })
        )
        data.services?.forEach((s: any) => {
          s.plugins?.forEach((p: any) =>
            plugins.push({ name: p.name, scope: 'service', scopeName: s.name })
          )
          s.routes?.forEach((r: any) => {
            r.plugins?.forEach((p: any) =>
              plugins.push({ name: p.name, scope: 'route', scopeName: r.name })
            )
          })
        })

        setAnalysisResult({
          serviceCount,
          routeCount,
          consumerCount,
          plugins,
          rawData: data
        })
        setError(null)
      } catch (err) {
        setError('Failed to parse YAML file. Please check the file format.')
        setAnalysisResult(null)
        console.error(err)
      }
    }
    reader.readAsText(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/x-yaml': ['.yaml', '.yml'] }
  })

  return (
    <>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          decK dump analyzer
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Upload your Kong configuration file to analyze and visualize it.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`w-full p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors duration-200 ease-in-out ${isDragActive ? 'border-[rgb(var(--primary-accent))] bg-blue-50' : 'border-[rgb(var(--border-color))] hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-500">
          {isDragActive
            ? 'Drop the file here ...'
            : "Drag 'n' drop a .yaml file here, or click to select one"}
        </p>
      </div>

      {error && (
        <div
          className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative"
          role="alert"
        >
          {error}
        </div>
      )}

      {analysisResult && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 flex flex-col gap-8">
            <Card title="Analysis Results">
              <div className="space-y-3 text-gray-700">
                <p
                  className="cursor-pointer hover:underline"
                  onClick={() =>
                    handleOpenModal('Services', analysisResult.rawData.services)
                  }
                >
                  <strong>Services:</strong> {analysisResult.serviceCount}
                </p>
                <p
                  className="cursor-pointer hover:underline"
                  onClick={() =>
                    handleOpenModal(
                      'Routes',
                      getAllRoutes(analysisResult.rawData)
                    )
                  }
                >
                  <strong>Routes:</strong> {analysisResult.routeCount}
                </p>
                <p
                  className="cursor-pointer hover:underline"
                  onClick={() =>
                    handleOpenModal(
                      'Consumers',
                      analysisResult.rawData.consumers
                    )
                  }
                >
                  <strong>Consumers:</strong> {analysisResult.consumerCount}
                </p>
              </div>
            </Card>
            <Card title={`Plugins (${analysisResult.plugins.length})`}>
              <ul className="space-y-2 text-sm h-64 overflow-y-auto">
                {analysisResult.plugins.map((plugin, index) => (
                  <li
                    key={index}
                    className="text-gray-600 cursor-pointer hover:underline"
                    onClick={() =>
                      handleOpenModal(
                        `Plugin: ${plugin.name}`,
                        findPluginData(plugin)
                      )
                    }
                  >
                    <span className="font-semibold text-gray-800">
                      {plugin.name}
                    </span>
                    <span className="text-xs italic">
                      {' '}
                      ({plugin.scope}
                      {plugin.scopeName && ` on ${plugin.scopeName}`})
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <GraphVisualization
              analysisResult={analysisResult}
              onNodeClick={handleOpenModal}
            />
          </div>
        </div>
      )}

      {selectedItem && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedItem.title}
        >
          <SyntaxHighlighter
            language="yaml"
            style={vscDarkPlus}
            customStyle={{ margin: 0, padding: '1rem', borderRadius: '0.5rem' }}
          >
            {yaml.dump(selectedItem.data)}
          </SyntaxHighlighter>
        </Modal>
      )}
    </>
  )
}
