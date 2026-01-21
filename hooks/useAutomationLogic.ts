import { useState } from "react";
import { Automation } from "../types";
import { toast } from "sonner";
import { Icon } from "../components/Icons";
import { ColorToken } from "../constants";
import React from "react";

interface UseAutomationLogicProps {
  onSave: (automation: Automation, isUpdate: boolean) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onToggle: (id: string) => Promise<boolean>;
}

interface AutomationTemplate {
  name: string;
  trigger: string;
  action: string;
  description: string;
  icon: string;
  colors: ColorToken;
}

export const useAutomationLogic = ({
  onSave,
  onDelete,
  onToggle,
}: UseAutomationLogicProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] =
    useState<Partial<Automation> | null>(null);

  const handleAdd = () => {
    setEditingAutomation({
      name: "",
      trigger: "",
      action: "",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (auto: Automation) => {
    setEditingAutomation(auto);
    setIsModalOpen(true);
  };

  const handleUseTemplate = (template: AutomationTemplate) => {
    setEditingAutomation({
      name: template.name,
      trigger: template.trigger,
      action: template.action,
      status: "Active",
    });
    setIsModalOpen(true);
    toast.info("Template loaded", {
      description: "Customize the trigger and action, then save to activate.",
      icon: React.createElement(Icon.Settings, { size: 14 }),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAutomation) {
      const isUpdate = !!editingAutomation.id;
      const success = await onSave(editingAutomation as Automation, isUpdate);
      if (success) {
        setIsModalOpen(false);
        setEditingAutomation(null);
        toast.success(isUpdate ? "Automation updated" : "Automation created", {
          description: `"${editingAutomation.name}" is now ${editingAutomation.status?.toLowerCase()}.`,
          icon: React.createElement(Icon.Zap, { size: 14 }),
        });
      } else {
        toast.error("Failed to save automation");
      }
    }
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      const success = await onDelete(id);
      if (success) {
        toast.success("Automation deleted", {
          description: `"${name}" has been removed from your workflows.`,
          icon: React.createElement(Icon.Delete, { size: 14 }),
        });
      } else {
        toast.error("Failed to delete automation");
      }
    }
  };

  const handleToggleClick = async (
    id: string,
    currentStatus: string,
    name: string,
  ) => {
    const success = await onToggle(id);
    if (success) {
      const newStatus = currentStatus === "Active" ? "Paused" : "Active";
      toast.info(`Automation ${newStatus.toLowerCase()}`, {
        description: `"${name}" is now ${newStatus.toLowerCase()}.`,
        icon:
          newStatus === "Active"
            ? React.createElement(Icon.Zap, { size: 14 })
            : React.createElement(Icon.Pause, { size: 14 }),
      });
    } else {
      toast.error("Failed to toggle automation");
    }
  };

  return {
    isModalOpen,
    setIsModalOpen,
    editingAutomation,
    setEditingAutomation,
    handleAdd,
    handleEdit,
    handleUseTemplate,
    handleSubmit,
    handleDeleteClick,
    handleToggleClick,
  };
};
