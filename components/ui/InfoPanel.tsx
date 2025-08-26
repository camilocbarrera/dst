"use client"

import React from 'react'
import { Info } from 'lucide-react'
import { useClickOutside } from '../../hooks/useClickOutside'

interface InfoPanelProps {
  isDarkMode: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function InfoPanel({ isDarkMode, isOpen, setIsOpen }: InfoPanelProps) {
  const infoRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));

  return (
    <div ref={infoRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'} flex items-center`}
      >
        <Info size={16} className="mr-2" />
        Info
      </button>
      {isOpen && (
        <div className={`absolute top-16 left-4 w-96 p-4 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} ring-1 ring-black ring-opacity-5 z-20`}>
          <h2 className="text-lg font-semibold mb-4">DAG Sketch</h2>
          
          <section className="mb-4">
            <p className="mb-2">
              An open-source tool for visualizing Directed Acyclic Graphs (DAGs) from YAML-based DAGML definitions.
            </p>
            <p>
              DAGML (DAG Markup Language) is a YAML-based format for defining DAGs, commonly used in workflow orchestration tools like Apache Airflow.
            </p>
          </section>

          <section className="mb-4">
            <h3 className="text-md font-semibold mb-2">Bitshift Mode</h3>
            <p>
              In Airflow, the <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{'>>'}</code> operators (called bitshift operators) are used to define task dependencies. Use this syntax in Bitshift mode.
            </p>
          </section>

          <section className="mb-4">
            <h3 className="text-md font-semibold mb-2">Instructions</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>Write or paste your DAGML definition in the left editor.</li>
              <li>The visualization updates in real-time on the right.</li>
              <li>Use the Examples dropdown for sample DAGML structures.</li>
              <li>Toggle between DAGML and Bitshift modes for different syntax.</li>
            </ol>
          </section>

          <section className="flex flex-col space-y-2">
            <a
              href="https://github.com/camilocbarrera/dst"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-blue-500 hover:underline ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}
            >
              GitHub Repository
            </a>
            <a
              href="https://github.com/camilocbarrera/dst/issues"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-blue-500 hover:underline ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}
            >
              Report Issues
            </a>
            <a 
              href="https://stackoverflow.com/questions/52389105/how-operator-defines-task-dependencies-in-airflow"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-blue-500 hover:underline ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}
            >
              Learn more about bitshift operators in Airflow
            </a>
          </section>
        </div>
      )}
    </div>
  );
}
