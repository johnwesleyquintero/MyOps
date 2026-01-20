import React from "react";
import { Contact } from "../types";
import { CRM_COLUMN_CONFIG_KEY, MODULE_COLORS } from "@/constants";
import { Icon, iconProps } from "./Icons";
import { Button } from "./ui";
import { useTableColumns, ColumnConfig } from "../hooks/useTableColumns";
import { useSortableData } from "../hooks/useSortableData";
import { ColumnConfigDropdown } from "./ColumnConfigDropdown";

interface ContactTableProps {
  contacts: Contact[];
  isLoading: boolean;
  onEdit: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
  onSelect: (contact: Contact) => void;
  selectedContactId?: string;
}

const CONTACT_COLUMNS: ColumnConfig[] = [
  { key: "name", label: "Contact", visible: true, width: "min-w-[200px]" },
  { key: "company", label: "Company", visible: true, width: "w-40" },
  { key: "type", label: "Type", visible: true, width: "w-32" },
  { key: "status", label: "Status", visible: true, width: "w-32" },
  { key: "email", label: "Email", visible: true, width: "w-48" },
  { key: "createdAt", label: "Added", visible: true, width: "w-32" },
];

const TableSkeleton = ({ colSpan }: { colSpan: number }) => (
  <tbody className="divide-y divide-notion-light-border dark:divide-notion-dark-border animate-pulse">
    {[...Array(5)].map((_, i) => (
      <tr key={i}>
        <td colSpan={colSpan} className="px-3 py-4">
          <div className="flex gap-4">
            <div className="h-4 bg-notion-light-hover dark:bg-notion-dark-hover rounded w-24"></div>
            <div className="h-4 bg-notion-light-hover dark:bg-notion-dark-hover rounded w-full"></div>
            <div className="h-4 bg-notion-light-hover dark:bg-notion-dark-hover rounded w-20"></div>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
);

export const ContactTable: React.FC<ContactTableProps> = ({
  contacts,
  isLoading,
  onEdit,
  onDelete,
  onSelect,
  selectedContactId,
}) => {
  const { columns, toggleColumn } = useTableColumns<keyof Contact>(
    CONTACT_COLUMNS,
    CRM_COLUMN_CONFIG_KEY,
  );

  const colors = MODULE_COLORS.crm;

  const {
    items: sortedContacts,
    requestSort,
    sortConfig,
  } = useSortableData<Contact>(contacts, {
    key: "name",
    direction: "asc",
  });

  const typeColors = {
    Client:
      MODULE_COLORS.crm.text +
      " " +
      MODULE_COLORS.crm.bg +
      " " +
      MODULE_COLORS.crm.border,
    Lead:
      MODULE_COLORS.integrations.text +
      " " +
      MODULE_COLORS.integrations.bg +
      " " +
      MODULE_COLORS.integrations.border,
    Vendor:
      MODULE_COLORS.docs.text +
      " " +
      MODULE_COLORS.docs.bg +
      " " +
      MODULE_COLORS.docs.border,
    Partner:
      MODULE_COLORS.analytics.text +
      " " +
      MODULE_COLORS.analytics.bg +
      " " +
      MODULE_COLORS.analytics.border,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-notion-light-bg dark:bg-notion-dark-bg transition-colors">
      <div className="flex-1 overflow-auto custom-scrollbar border border-notion-light-border dark:border-notion-dark-border rounded shadow-sm">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="sticky top-0 z-20 bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-b border-notion-light-border dark:border-notion-dark-border">
            <tr>
              {columns
                .filter((c) => c.visible)
                .map((col) => (
                  <th
                    key={col.key}
                    className={`${col.width} px-3 py-2 text-[10px] font-bold text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-widest cursor-pointer ${colors.hoverBg} transition-colors group`}
                    onClick={() => requestSort(col.key as keyof Contact)}
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {sortConfig?.key === col.key && (
                        <span className="text-notion-light-text dark:text-notion-dark-text">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              <th className="w-28 px-3 py-2 bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-b border-notion-light-border dark:border-notion-dark-border">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[10px] font-bold text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-widest">
                    Actions
                  </span>
                  <ColumnConfigDropdown
                    columns={columns}
                    toggleColumn={toggleColumn}
                  />
                </div>
              </th>
            </tr>
          </thead>
          {isLoading ? (
            <TableSkeleton
              colSpan={columns.filter((c) => c.visible).length + 1}
            />
          ) : (
            <tbody className="divide-y divide-notion-light-border dark:divide-notion-dark-border">
              {sortedContacts.map((contact) => (
                <tr
                  key={contact.id}
                  className={`group transition-colors ${
                    selectedContactId === contact.id
                      ? colors.lightBg
                      : `hover:${colors.lightBg}`
                  }`}
                  onClick={() => onSelect(contact)}
                >
                  {columns
                    .filter((c) => c.visible)
                    .map((col) => (
                      <td
                        key={col.key}
                        className="px-3 py-3 align-middle text-sm cursor-pointer"
                      >
                        {col.key === "name" && (
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold shadow-sm ${
                                selectedContactId === contact.id
                                  ? `${colors.dot} text-white`
                                  : `${colors.lightBg} ${colors.text} border ${colors.border}`
                              }`}
                            >
                              {contact.name.charAt(0)}
                            </div>
                            <span className="font-bold text-notion-light-text dark:text-notion-dark-text group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {contact.name}
                            </span>
                          </div>
                        )}
                        {col.key === "company" && (
                          <span className="text-notion-light-muted dark:text-notion-dark-muted">
                            {contact.company || "Individual"}
                          </span>
                        )}
                        {col.key === "type" && (
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm border ${typeColors[contact.type as keyof typeof typeColors]}`}
                          >
                            {contact.type}
                          </span>
                        )}
                        {col.key === "status" && (
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}
                            />
                            <span className="text-xs text-notion-light-text dark:text-notion-dark-text">
                              {contact.status}
                            </span>
                          </div>
                        )}
                        {col.key === "email" && (
                          <span className="text-xs text-notion-light-muted dark:text-notion-dark-muted truncate block max-w-full">
                            {contact.email || "N/A"}
                          </span>
                        )}
                        {col.key === "createdAt" && (
                          <span className="text-[10px] text-notion-light-muted dark:text-notion-dark-muted">
                            {new Date(contact.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                    ))}
                  <td className="px-3 py-3 align-middle">
                    <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(contact);
                        }}
                        variant="custom"
                        size="icon"
                        className={`text-notion-light-muted hover:${colors.text} ${colors.lightBg} rounded-lg`}
                        title="Edit Contact"
                      >
                        <Icon.Edit {...iconProps(14)} />
                      </Button>
                      {onDelete && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(contact);
                          }}
                          variant="custom"
                          size="icon"
                          className="text-notion-light-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                          title="Delete Contact"
                        >
                          <Icon.Delete {...iconProps(14)} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};
