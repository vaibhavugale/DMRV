import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface Project {
  _id: string;
  name: string;
  region: string;
}

interface ProjectContextType {
  projects: Project[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string) => void;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType>({} as ProjectContextType);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    localStorage.getItem('dmrv_active_project') || null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('https://dmrv-f367.onrender.com/api/projects');
        if (!res.ok) throw new Error('Failed to load projects');
        const json = await res.json();
        const projectsData = json.data;
        setProjects(projectsData);
        
        // Auto-select first project if none active OR if active ID is stale
        const isValid = projectsData.some((p: Project) => p._id === activeProjectId);
        if (projectsData.length > 0 && (!activeProjectId || !isValid)) {
          setActiveProjectId(projectsData[0]._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []); // Only run once on mount

  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem('dmrv_active_project', activeProjectId);
    }
  }, [activeProjectId]);

  return (
    <ProjectContext.Provider value={{ projects, activeProjectId, setActiveProjectId, isLoading }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}
