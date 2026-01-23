import { useState, useCallback, useMemo } from "react";
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

  const handleAdd = useCallback(() => {
    setEditingAutomation({
      name: "",
      trigger: "",
      action: "",
      status: "Active",
    });
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((auto: Automation) => {
    setEditingAutomation(auto);
    setIsModalOpen(true);
  }, []);

  const handleUseTemplate = useCallback((template: AutomationTemplate) => {
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
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (editingAutomation) {
        const isUpdate = !!editingAutomation.id;
        const success = await onSave(editingAutomation as Automation, isUpdate);
        if (success) {
          toast.success(isUpdate ? "Automation updated" : "Automation created");
          setIsModalOpen(false);
          setEditingAutomation(null);
        }
      }
    },
    [editingAutomation, onSave],
  );

  const handleDeleteClick = useCallback(
    async (id: string, name: string) => {
      if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
        await onDelete(id);
      }
    },
    [onDelete],
  );

  const handleToggleClick = useCallback(
    async (id: string) => {
      await onToggle(id);
    },
    [onToggle],
  );

  return useMemo(
    () => ({
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
    }),
    [
      isModalOpen,
      editingAutomation,
      handleAdd,
      handleEdit,
      handleUseTemplate,
      handleSubmit,
      handleDeleteClick,
      handleToggleClick,
    ],
  );
};
