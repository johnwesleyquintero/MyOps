import React from "react";
import { Icon } from "../Icons";
import { ViewHeader } from "../ViewHeader";
import { Button } from "../ui/Button";
import { MODULE_COLORS } from "@/constants";

interface IntegrationStoryViewProps {
  onBack: () => void;
}

export const IntegrationStoryView: React.FC<IntegrationStoryViewProps> = ({
  onBack,
}) => {
  const colors = MODULE_COLORS.integration;
  const operatorColors = MODULE_COLORS.sovereign;
  const hubColors = MODULE_COLORS.automation;
  const clientColors = MODULE_COLORS.crm;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <ViewHeader
        title="The Integration Story"
        subTitle="A visual breakdown of how MyOps keeps the world in sync while you stay in the zone."
      >
        <Button
          variant="ghost"
          onClick={onBack}
          leftIcon={<Icon.ArrowLeft size={16} />}
          className="text-notion-light-muted dark:text-notion-dark-muted font-semibold text-sm"
        >
          Back to Hub
        </Button>
      </ViewHeader>

      <div className="relative max-w-5xl mx-auto p-8 bg-white dark:bg-notion-dark-sidebar rounded-3xl border border-notion-light-border dark:border-notion-dark-border shadow-2xl overflow-hidden">
        {/* Decorative background elements */}
        <div
          className={`absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 ${colors.lightBg} rounded-full blur-3xl opacity-50`}
        />
        <div
          className={`absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 ${hubColors.lightBg} rounded-full blur-3xl opacity-50`}
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          {/* Step 1: The Operator (Input) */}
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-16 h-16 ${operatorColors.bg} text-white rounded-2xl flex items-center justify-center shadow-lg mb-4 transform -rotate-3 group hover:rotate-0 transition-transform`}
              >
                <Icon.Edit size={32} />
              </div>
              <h3 className="text-xl font-bold">The Action</h3>
              <p className="text-sm text-notion-light-muted dark:text-notion-dark-muted">
                You log a task, finish a milestone, or jot down a reflection.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: "Task Completed",
                  icon: "Check",
                  colors: MODULE_COLORS.tasks,
                },
                {
                  label: "New Reflection",
                  icon: "History",
                  colors: MODULE_COLORS.reflection,
                },
                {
                  label: "Project Milestone",
                  icon: "Missions",
                  colors: MODULE_COLORS.strategy,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-notion-light-sidebar dark:bg-notion-dark-border rounded-xl border border-notion-light-border dark:border-notion-dark-border animate-in slide-in-from-left duration-500"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div
                    className={`p-2 rounded-lg ${item.colors.lightBg} ${item.colors.text}`}
                  >
                    {Icon[item.icon as keyof typeof Icon] ? (
                      React.createElement(
                        Icon[item.icon as keyof typeof Icon],
                        { size: 16 },
                      )
                    ) : (
                      <Icon.Zap size={16} />
                    )}
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: The Hub (Processing) */}
          <div className="relative py-12 lg:py-0">
            {/* Arrows/Lines */}
            <div
              className={`hidden lg:block absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 w-12 h-[2px] bg-gradient-to-r from-transparent ${hubColors.text.replace("text-", "to-")}`}
            />
            <div
              className={`hidden lg:block absolute right-0 top-1/2 translate-x-full -translate-y-1/2 w-12 h-[2px] bg-gradient-to-l from-transparent ${hubColors.text.replace("text-", "to-")}`}
            />

            <div className="flex flex-col items-center text-center">
              <div
                className={`w-24 h-24 bg-gradient-to-br ${hubColors.text.replace("text-", "from-").replace("600", "500").replace("400", "400")} ${hubColors.text.replace("text-", "to-").replace("600", "700").replace("400", "600")} rounded-full flex items-center justify-center shadow-2xl mb-6 relative group`}
              >
                <div
                  className={`absolute inset-0 ${hubColors.bg} rounded-full animate-ping opacity-20 group-hover:opacity-40`}
                />
                <Icon.Zap size={48} className="text-white relative z-10" />
              </div>
              <h3 className="text-2xl font-black tracking-tight">
                Integration Hub
              </h3>
              <p className="text-sm text-notion-light-muted dark:text-notion-dark-muted mt-2">
                MyOps detects the event and routes it to your configured
                channels instantly.
              </p>

              <div
                className={`mt-8 px-4 py-2 ${hubColors.lightBg} ${hubColors.text} rounded-full text-xs font-bold uppercase tracking-widest border ${hubColors.border}`}
              >
                Zero Friction Engine
              </div>
            </div>
          </div>

          {/* Step 3: The Outside World (Output) */}
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-16 h-16 ${clientColors.lightBg} ${clientColors.text} rounded-2xl flex items-center justify-center shadow-lg mb-4 transform rotate-3 group hover:rotate-0 transition-transform`}
              >
                <Icon.Globe size={32} />
              </div>
              <h3 className="text-xl font-bold">The Client</h3>
              <p className="text-sm text-notion-light-muted dark:text-notion-dark-muted">
                Clients receive beautiful, real-time updates in their own
                preferred apps.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: "Slack Notification",
                  icon: "MessageSquare",
                  colors: MODULE_COLORS.automation,
                },
                {
                  label: "WhatsApp Message",
                  icon: "Phone",
                  colors: MODULE_COLORS.crm,
                },
                {
                  label: "Email Digest",
                  icon: "Mail",
                  colors: MODULE_COLORS.report,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-notion-light-sidebar dark:bg-notion-dark-border animate-in slide-in-from-right duration-500"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div
                    className={`p-2 rounded-lg ${item.colors.lightBg} ${item.colors.text}`}
                  >
                    {Icon[item.icon as keyof typeof Icon] ? (
                      React.createElement(
                        Icon[item.icon as keyof typeof Icon],
                        { size: 16 },
                      )
                    ) : (
                      <Icon.Zap size={16} />
                    )}
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-16 pt-8 border-t border-notion-light-border dark:border-notion-dark-border text-center">
          <p className="text-notion-light-muted dark:text-notion-dark-muted italic">
            "Reliability isn’t just completing tasks. It’s making your work
            visible, predictable, and frictionless."
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold ${MODULE_COLORS.status_active.text}`}
            >
              <div
                className={`w-2 h-2 ${MODULE_COLORS.status_active.dot} rounded-full animate-pulse`}
              />
              LIVE STATUS
            </div>
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold ${MODULE_COLORS.tasks.text}`}
            >
              <Icon.Check size={12} />
              AUTO-SYNC ACTIVE
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "No Context Switching",
            desc: "Never leave MyOps to update a client again. One tab, total control.",
            icon: "Zap" as keyof typeof Icon,
            colors: MODULE_COLORS.sovereign,
          },
          {
            title: "Universal Language",
            desc: "Speak Slack, WhatsApp, and Email without learning five different APIs.",
            icon: "Globe" as keyof typeof Icon,
            colors: MODULE_COLORS.integration,
          },
          {
            title: "Client Trust",
            desc: "Automatic visibility builds radical transparency and long-term loyalty.",
            icon: "Users" as keyof typeof Icon,
            colors: MODULE_COLORS.crm,
          },
        ].map((benefit, i) => {
          const IconComponent = Icon[benefit.icon] || Icon.Zap;
          return (
            <div
              key={i}
              className="p-6 bg-white dark:bg-notion-dark-sidebar rounded-2xl border border-notion-light-border dark:border-notion-dark-border group hover:shadow-lg transition-shadow"
            >
              <div
                className={`w-10 h-10 ${benefit.colors.lightBg} ${benefit.colors.text} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <IconComponent size={20} />
              </div>
              <h4 className="font-bold mb-2">{benefit.title}</h4>
              <p className="text-sm text-notion-light-muted dark:text-notion-dark-muted leading-relaxed">
                {benefit.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
