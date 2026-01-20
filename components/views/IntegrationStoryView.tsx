import React from "react";
import { Icon } from "../Icons";
import { ViewHeader } from "../ViewHeader";

interface IntegrationStoryViewProps {
  onBack: () => void;
}

export const IntegrationStoryView: React.FC<IntegrationStoryViewProps> = ({
  onBack,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <ViewHeader
        title="The Integration Story"
        subTitle="A visual breakdown of how MyOps keeps the world in sync while you stay in the zone."
      >
        <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-notion-light-muted dark:text-notion-dark-muted hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover rounded-lg transition-all font-semibold text-sm"
          >
            <Icon.ArrowLeft size={16} />
            Back to Hub
          </button>
        </ViewHeader>

        <div className="relative max-w-5xl mx-auto p-8 bg-white dark:bg-notion-dark-sidebar rounded-3xl border border-notion-light-border dark:border-notion-dark-border shadow-2xl overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

          <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            {/* Step 1: The Operator (Input) */}
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg mb-4 transform -rotate-3 group hover:rotate-0 transition-transform">
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
                    color: "text-green-500",
                    bg: "bg-green-500/10",
                  },
                  {
                    label: "New Reflection",
                    icon: "History",
                    color: "text-blue-500",
                    bg: "bg-blue-500/10",
                  },
                  {
                    label: "Project Milestone",
                    icon: "Missions",
                    color: "text-purple-500",
                    bg: "bg-purple-500/10",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-notion-light-sidebar dark:bg-notion-dark-border rounded-xl border border-notion-light-border dark:border-notion-dark-border animate-in slide-in-from-left duration-500"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
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
              <div className="hidden lg:block absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 w-12 h-[2px] bg-gradient-to-r from-transparent to-blue-500" />
              <div className="hidden lg:block absolute right-0 top-1/2 translate-x-full -translate-y-1/2 w-12 h-[2px] bg-gradient-to-l from-transparent to-blue-500" />

              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-2xl mb-6 relative group">
                  <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20 group-hover:opacity-40" />
                  <Icon.Zap size={48} className="text-white relative z-10" />
                </div>
                <h3 className="text-2xl font-black tracking-tight">
                  Integration Hub
                </h3>
                <p className="text-sm text-notion-light-muted dark:text-notion-dark-muted mt-2">
                  MyOps detects the event and routes it to your configured
                  channels instantly.
                </p>

                <div className="mt-8 px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-500/20">
                  Zero Friction Engine
                </div>
              </div>
            </div>

            {/* Step 3: The Outside World (Output) */}
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-notion-dark-border text-gray-600 dark:text-gray-400 rounded-2xl flex items-center justify-center shadow-lg mb-4 transform rotate-3 group hover:rotate-0 transition-transform">
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
                    color: "text-purple-500",
                    bg: "bg-purple-500/10",
                  },
                  {
                    label: "WhatsApp Message",
                    icon: "Phone",
                    color: "text-green-500",
                    bg: "bg-green-500/10",
                  },
                  {
                    label: "Email Digest",
                    icon: "Mail",
                    color: "text-blue-500",
                    bg: "bg-blue-500/10",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-notion-light-sidebar dark:bg-notion-dark-border animate-in slide-in-from-right duration-500"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
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
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                LIVE STATUS
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-500">
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
            },
            {
              title: "Universal Language",
              desc: "Speak Slack, WhatsApp, and Email without learning five different APIs.",
              icon: "Globe" as keyof typeof Icon,
            },
            {
              title: "Client Trust",
              desc: "Automatic visibility builds radical transparency and long-term loyalty.",
              icon: "Users" as keyof typeof Icon,
            },
          ].map((benefit, i) => {
            const IconComponent = Icon[benefit.icon] || Icon.Zap;
            return (
              <div
                key={i}
                className="p-6 bg-white dark:bg-notion-dark-sidebar rounded-2xl border border-notion-light-border dark:border-notion-dark-border"
              >
              <div className="w-10 h-10 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-4">
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
