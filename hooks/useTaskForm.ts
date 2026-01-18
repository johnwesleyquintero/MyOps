import { useState, useMemo } from "react";
import { TaskEntry, TaskTemplate } from "../types";
import {
  DEFAULT_PROJECTS,
  RECURRENCE_OPTIONS,
  TEMPLATE_STORAGE_KEY,
} from "@/constants";

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
    const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [showTemplates, setShowTemplates] = useState<boolean>(false);

  const resetForm = () => {
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
  };

  const [prevInitialData, setPrevInitialData] = useState(initialData);

  // Sync form data when initialData changes (e.g. switching between different tasks in edit mode)
  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    if (initialData) {
      setFormData({
        ...initialData,
        dependencies: initialData.dependencies || [],
      });
      setIsCustomProject(!DEFAULT_PROJECTS.includes(initialData.project));
      setShowDeps(
        !!(initialData.dependencies && initialData.dependencies.length > 0),
      );
    } else {
      resetForm();
    }
  }

  // --- Recurrence Logic ---
  const handleRecurrenceChange = (tag: string) => {
    let cleanDesc = formData.description;
    RECURRENCE_OPTIONS.forEach((opt) => {
      if (opt.tag) cleanDesc = cleanDesc.replace(opt.tag, "");
    });
    cleanDesc = cleanDesc.trim();

    if (tag) {
      setFormData({ ...formData, description: `${cleanDesc} ${tag}` });
    } else {
      setFormData({ ...formData, description: cleanDesc });
    }
  };

  const currentRecurrence = useMemo(() => {
    for (const opt of RECURRENCE_OPTIONS) {
      if (opt.tag && formData.description.includes(opt.tag)) return opt.tag;
    }
    return "";
  }, [formData.description]);

  // --- Dependency Logic ---
  const toggleDependency = (id: string) => {
    setFormData((prev) => {
      const current = prev.dependencies || [];
      if (current.includes(id)) {
        return { ...prev, dependencies: current.filter((d) => d !== id) };
      } else {
        return { ...prev, dependencies: [...current, id] };
      }
    });
  };

  const potentialDeps = useMemo(() => {
    return entries.filter((e) => e.id !== formData.id && e.status !== "Done");
  }, [entries, formData.id]);

  // --- Template Logic ---
  const saveAsTemplate = () => {
    const name = prompt("Template Name:", formData.description.slice(0, 30));
    if (!name) return;

    const newTemplate: TaskTemplate = {
      id: crypto.randomUUID(),
      name,
      description: formData.description,
      project: formData.project,
      priority: formData.priority,
    };

    const updated = [...templates, newTemplate];
    setTemplates(updated);
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(updated));
    alert("Template Saved!");
  };

  const loadTemplate = (template: TaskTemplate) => {
    setFormData((prev) => ({
      ...prev,
      description: template.description,
      project: template.project,
      priority: template.priority,
    }));
    setShowTemplates(false);
  };

  const deleteTemplate = (id: string) => {
    if (!window.confirm("Delete this template?")) return;
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(updated));
  };

  return {
    formData,
    setFormData,
    isCustomProject,
    setIsCustomProject,
    showDeps,
    setShowDeps,
    isPreviewMode,
    setIsPreviewMode,
    templates,
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
  };
};
