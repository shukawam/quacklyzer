/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useMemo } from 'react';
import mermaid from 'mermaid';

// A reusable Card component for consistent styling
const Card: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`bg-[rgb(var(--card-background))] border border-[rgb(var(--border-color))] rounded-xl shadow-sm ${className}`}>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );

interface AnalysisResult {
  rawData?: any;
}

interface GraphVisualizationProps {
  analysisResult: AnalysisResult;
  onNodeClick: (title: string, data: any) => void;
}

// This is a one-time setup
mermaid.initialize({ 
    startOnLoad: true, // Let mermaid find the elements with class="mermaid"
    theme: 'neutral', 
    securityLevel: 'loose',
    fontFamily: 'var(--font-geist-sans)',
});

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ analysisResult, onNodeClick }) => {
  const { graphDefinition, nodeDataMap } = useMemo(() => {
    const { rawData } = analysisResult;
    if (!rawData || !rawData.services) return { graphDefinition: 'graph TD\n    A[Upload a file to see the graph]', nodeDataMap: new Map() };

    let definition = 'graph TD\n';
    definition += '    classDef service fill:#e0f2fe,stroke:#0ea5e9,stroke-width:2px,color:#0c4a6e\n';
    definition += '    classDef route fill:#dcfce7,stroke:#22c55e,stroke-width:1px,color:#15803d\n';
    definition += '    classDef plugin fill:#fefce8,stroke:#eab308,stroke-width:1px,color:#ca8a04\n';

    const dataMap = new Map<string, { title: string; data: any }>();
    const sanitize = (name: string) => name.replace(/[^a-zA-Z0-9_]/g, '_');

    (rawData.plugins || []).forEach((p: any) => {
        const nodeId = `global_plugin_${sanitize(p.name)}`;
        definition += `    ${nodeId}("Global: ${p.name}"):::plugin\n`;
        definition += `    click ${nodeId} call window.onMermaidNodeClick('${nodeId}') "See details"\n`;
        dataMap.set(nodeId, { title: `Global Plugin: ${p.name}`, data: p });
    });

    (rawData.services || []).forEach((s: any) => {
      const sanitizedServiceName = sanitize(s.name);
      const serviceNodeId = `service_${sanitizedServiceName}`;
      definition += `    subgraph Service: ${s.name}\n`;
      definition += `        ${serviceNodeId}["${s.name}"]:::service\n`;
      definition += `        click ${serviceNodeId} call window.onMermaidNodeClick('${serviceNodeId}') "See details"\n`;
      dataMap.set(serviceNodeId, { title: `Service: ${s.name}`, data: s });
      
      (s.plugins || []).forEach((p: any) => {
        const pluginNodeId = `service_plugin_${sanitizedServiceName}_${sanitize(p.name)}`;
        definition += `        ${pluginNodeId}["${p.name}"]:::plugin\n`;
        definition += `        ${serviceNodeId} --> ${pluginNodeId}\n`;
        definition += `        click ${pluginNodeId} call window.onMermaidNodeClick('${pluginNodeId}') "See details"\n`;
        dataMap.set(pluginNodeId, { title: `Plugin: ${p.name} on ${s.name}`, data: p });
      });

      (s.routes || []).forEach((r: any) => {
        const routeNodeId = `route_${sanitizedServiceName}_${sanitize(r.name)}`;
        definition += `        ${routeNodeId}["Route: ${r.name}"]:::route\n`;
        definition += `        ${serviceNodeId} --> ${routeNodeId}\n`;
        definition += `        click ${routeNodeId} call window.onMermaidNodeClick('${routeNodeId}') "See details"\n`;
        dataMap.set(routeNodeId, { title: `Route: ${r.name}`, data: r });

        (r.plugins || []).forEach((p: any) => {
          const pluginNodeId = `route_plugin_${sanitizedServiceName}_${sanitize(r.name)}_${sanitize(p.name)}`;
          definition += `        ${pluginNodeId}["${p.name}"]:::plugin\n`;
          definition += `        ${routeNodeId} --> ${pluginNodeId}\n`;
          definition += `        click ${pluginNodeId} call window.onMermaidNodeClick('${pluginNodeId}') "See details"\n`;
          dataMap.set(pluginNodeId, { title: `Plugin: ${p.name} on ${r.name}`, data: p });
        });
      });
      definition += '    end\n';
    });

    return { graphDefinition: definition, nodeDataMap: dataMap };
  }, [analysisResult]);

  useEffect(() => {
    // Expose the click handler to the window object so Mermaid can call it
    (window as any).onMermaidNodeClick = (nodeId: string) => {
        const nodeInfo = nodeDataMap.get(nodeId);
        if (nodeInfo) {
            onNodeClick(nodeInfo.title, nodeInfo.data);
        }
    };

    // We need to tell mermaid to re-render when the graph definition changes
    mermaid.contentLoaded();

    return () => {
        delete (window as any).onMermaidNodeClick;
    }
  }, [nodeDataMap, onNodeClick]);

  return (
    <Card title="Graphical Visualization">
        <div className="mermaid w-full h-full flex justify-center items-center">
            {graphDefinition}
        </div>
    </Card>
  );
};

export default GraphVisualization;
