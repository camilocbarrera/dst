"use client"

import React from 'react'
import { Info } from 'lucide-react'
import { Drawer } from './Drawer'

interface InfoPanelProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function InfoPanel({ isOpen, setIsOpen }: InfoPanelProps) {
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-2.5 py-1.5 text-xs font-medium bg-secondary/80 hover:bg-accent text-secondary-foreground rounded-md transition-all duration-200 flex items-center gap-1.5 border border-border/50 hover:border-border"
      >
        <Info size={12} />
        Info
      </button>
      
      <Drawer visible={isOpen} onClose={() => setIsOpen(false)} placement="right">
        <Drawer.Title>DAG Sketch Tool</Drawer.Title>
        <Drawer.Subtitle>
          Visualizing and designing Directed Acyclic Graphs (DAGs) from YAML-based DAGML definitions.
        </Drawer.Subtitle>
        
        <Drawer.Content>
          <div className="space-y-4">
            <section>
              <p className="text-xs text-muted-foreground">
                DAGML (DAG Markup Language) is a YAML-based format for defining DAGs, commonly used in workflow orchestration tools like Apache Airflow.
              </p>
            </section>

            <section>
              <h3 className="text-xs font-medium mb-2 text-foreground">Bitshift Mode</h3>
              <p className="text-xs text-muted-foreground">
                In Airflow, the <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{'>>'}</code> operators (called bitshift operators) are used to define task dependencies. Use this syntax in Bitshift mode.
              </p>
            </section>

            <section>
              <h3 className="text-xs font-medium mb-2 text-foreground">Instructions</h3>
              <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                <li>Write or paste your DAGML definition in the left editor.</li>
                <li>The visualization updates in real-time on the right.</li>
                <li>Use the Examples dropdown for sample DAGML structures.</li>
                <li>Toggle between DAGML and Bitshift modes for different syntax.</li>
                <li>Drag the divider between panels to resize them to your preference.</li>
                <li>Use <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">Ctrl+1/2/3/4</code> for quick panel layouts.</li>
              </ol>
            </section>

            <section className="pt-2 border-t border-border">
              <h3 className="text-xs font-medium mb-3 text-foreground">Resources</h3>
              <div className="flex flex-col space-y-2">
                <a
                  href="https://github.com/camilocbarrera/dst"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  GitHub Repository
                </a>
                <a
                  href="https://github.com/camilocbarrera/dst/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Report Issues
                </a>
                <a 
                  href="https://stackoverflow.com/questions/52389105/how-operator-defines-task-dependencies-in-airflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Learn more about bitshift operators in Airflow
                </a>
              </div>
            </section>
          </div>
        </Drawer.Content>
      </Drawer>
    </>
  );
}
