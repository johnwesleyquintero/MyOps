import { useState, useMemo, useCallback } from "react";
import { TaskEntry, TaskTemplate, DecisionEntry } from "../types";
import {
  DEFAULT_PROJECTS,
  RECURRENCE_OPTIONS,
  TEMPLATE_STORAGE_KEY,
} from "@/constants";
import { storage } from "../utils/storageUtils";

const getLocalDate = (offsetDays: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
};

export const useTaskForm = (
  initialData: TaskEntry | null | undefined,
  entries: TaskEntry[],
  decisionEntries: DecisionEntry[] = [],
) => {
  // Form State
  const [formData, setFormData] = useState<TaskEntry>(() => {
    if (initialData) {
      return {
        ...initialData,
        dependencies: initialData.dependencies || [],
      };
    }
    return {
      id: "",
      date: getLocalDate(),
      description: "",
      project: DEFAULT_PROJECTS[0],
      priority: "Medium",
      status: "Backlog",
      dependencies: [],
    };
  });

  const [isCustomProject, setIsCustomProject] = useState<boolean>(() => {
    if (initialData) {
      return !DEFAULT_PROJECTS.includes(initialData.project);
    }
    return false;
  });
  const [showDeps, setShowDeps] = useState<boolean>(() => {
    return !!(
      initialData &&
      initialData.dependencies &&
      initialData.dependencies.length > 0
    );
  });
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  // Template State
  const [templates, setTemplates] = useState<TaskTemplate[]>(() => {
    return storage.get<TaskTemplate[]>(TEMPLATE_STORAGE_KEY, []);
  });
  const [showTemplates, setShowTemplates] = useState<boolean>(false);

  const resetForm = useCallback(() => {
    setFormData({
      id: "",
      date: getLocalDate(),
      description: "",
      project: DEFAULT_PROJECTS[0],
      priority: "Medium",
      status: "Backlog",
      dependencies: [],
    });
    setIsCustomProject(false);
    setShowDeps(false);
    setIsPreviewMode(false);
  }, []);

  const [prevInitialData, setPrevInitialData] = useState(initialData);

  const availableProjects = useMemo(() => {
    const taskProjects = entries
      .map((e) => e.project)
      .filter((p) => p && !DEFAULT_PROJECTS.includes(p));

    const decisionProjects = decisionEntries
      .map((d) => d.project)
      .filter((p): p is string => !!p && !DEFAULT_PROJECTS.includes(p));

    return Array.from(
      new Set([...DEFAULT_PROJECTS, ...taskProjects, ...decisionProjects]),
    );
  }, [entries, decisionEntries]);

  // Sync form data when initialData changes (e.g. switching between different tasks in edit mode)
  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    if (initialData) {
      setFormData({
        ...initialData,
        dependencies: initialData.dependencies || [],
      });
      // Check if project exists in available projects list (default + extracted)
      // If not in the list, treat as custom (though logic below adds it to availableProjects,
      // but 'isCustomProject' state here specifically controls the "Manual Input" UI toggle)
      // Actually, we want to allow selection of ANY existing project.
      // So 'isCustomProject' should only be true if we are creating a NEW project not in the list.
      // But for edit mode, if the project is already in the list (which it will be via useMemo),
      // we don't need to force custom input unless the user wants to type a new one.
      setIsCustomProject(false);

      setShowDeps(
        !!(initialData.dependencies && initialData.dependencies.length > 0),
      );
    } else {
      resetForm();
    }
  }

  // --- Recurrence Logic ---
  const handleRecurrenceChange = useCallback((tag: string) => {
    setFormData((prev) => {
      let cleanDesc = prev.description;
      RECURRENCE_OPTIONS.forEach((opt) => {
        if (opt.tag) cleanDesc = cleanDesc.replace(opt.tag, "");
      });
      cleanDesc = cleanDesc.trim();

      if (tag) {
        return {
          ...prev,
          description: `${cleanDesc} ${tag}`,
        };
      } else {
        return { ...prev, description: cleanDesc };
      }
    });
  }, []);

  const currentRecurrence = useMemo(() => {
    for (const opt of RECURRENCE_OPTIONS) {
      if (opt.tag && formData.description.includes(opt.tag)) return opt.tag;
    }
    return "";
  }, [formData.description]);

  // --- Dependency Logic ---
  const toggleDependency = useCallback((id: string) => {
    setFormData((prev) => {
      const current = prev.dependencies || [];
      if (current.includes(id)) {
        return { ...prev, dependencies: current.filter((d) => d !== id) };
      } else {
        return { ...prev, dependencies: [...current, id] };
      }
    });
  }, []);

  const potentialDeps = useMemo(() => {
    return entries.filter((e) => e.id !== formData.id && e.status !== "Done");
  }, [entries, formData.id]);

  // --- Template Logic ---
  const saveAsTemplate = useCallback(() => {
    const name = prompt("Template Name:", formData.description.slice(0, 30));
    if (!name) return;

    const newTemplate: TaskTemplate = {
      id: crypto.randomUUID(),
      name,
      description: formData.description,
      project: formData.project,
      priority: formData.priority,
    };

    setTemplates((prev) => {
      const updated = [...prev, newTemplate];
      storage.set(TEMPLATE_STORAGE_KEY, updated);
      return updated;
    });
    alert("Template Saved!");
  }, [formData]);

  const loadTemplate = useCallback((template: TaskTemplate) => {
    setFormData((prev) => ({
      ...prev,
      description: template.description,
      project: template.project,
      priority: template.priority,
    }));
    setShowTemplates(false);
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    if (!window.confirm("Delete this template?")) return;
    setTemplates((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      storage.set(TEMPLATE_STORAGE_KEY, updated);
      return updated;
    });
  }, []);

  return useMemo(
    () => ({
      formData,
      setFormData,
      isCustomProject,
      setIsCustomProject,
      showDeps,
      setShowDeps,
      isPreviewMode,
      setIsPreviewMode,
      templates,
      setTemplates,
      showTemplates,
      setShowTemplates,
      currentRecurrence,
      potentialDeps,
      handleRecurrenceChange,
      toggleDependency,
      saveAsTemplate,
      loadTemplate,
      deleteTemplate,
      resetForm,
      availableProjects,
    }),
    [
      formData,
      isCustomProject,
      showDeps,
      isPreviewMode,
      templates,
      showTemplates,
      currentRecurrence,
      potentialDeps,
      handleRecurrenceChange,
      toggleDependency,
      saveAsTemplate,
      loadTemplate,
      deleteTemplate,
      resetForm,
      availableProjects,
    ],
  );
};
