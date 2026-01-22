import React from "react";
import { Icon } from "../Icons";
import { ViewHeader } from "../ViewHeader";
import { Button } from "../ui";
import { MODULE_COLORS } from "@/constants";

interface IntegrationStoryViewProps {
  onBack: () => void;
}

export const IntegrationStoryView: React.FC<IntegrationStoryViewProps> =
  React.memo(({ onBack }) => {
    const colors = MODULE_COLORS.integrations;
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

        <div className="relative max-w-6xl mx-auto p-12 bg-white/80 dark:bg-notion-dark-sidebar/80 backdrop-blur-xl rounded-[2.5rem] border border-notion-light-border dark:border-notion-dark-border shadow-2xl overflow-hidden">
          {/* Decorative background elements */}
          <div
            className={`absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 ${colors.lightBg} rounded-full blur-[100px] opacity-30`}
          />
          <div
            className={`absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 ${hubColors.lightBg} rounded-full blur-[100px] opacity-30`}
          />
          <div className="absolute inset-0 bg-[grid-black/[0.02] dark:bg-[grid-white/[0.02]] bg-[size:20px_20px]" />

          <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
            {/* Step 1: The Operator (Input) */}
            <div className="space-y-8">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div
                  className={`w-14 h-14 ${operatorColors.lightBg} ${operatorColors.text} rounded-2xl flex items-center justify-center shadow-lg mb-6 transform -rotate-3 group-hover:rotate-0 transition-all duration-300 border border-white/50 dark:border-white/10`}
                >
                  <Icon.Edit size={28} />
                </div>
                <div className="space-y-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest ${operatorColors.text} opacity-60`}
                  >
                    Step 01
                  </span>
                  <h3 className="text-2xl font-bold tracking-tight">
                    The Action
                  </h3>
                  <p className="text-sm text-notion-light-muted dark:text-notion-dark-muted max-w-[240px]">
                    You log a task, finish a milestone, or jot down a
                    reflection.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
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
                    className="group flex items-center gap-4 p-4 bg-white/50 dark:bg-notion-dark-border/50 backdrop-blur-sm rounded-2xl border border-notion-light-border dark:border-notion-dark-border hover:border-indigo-500/30 dark:hover:border-indigo-400/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 animate-in slide-in-from-left"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <div
                      className={`p-2.5 rounded-xl ${item.colors.lightBg} ${item.colors.text} shadow-inner group-hover:scale-110 transition-transform duration-300`}
                    >
                      {Icon[item.icon as keyof typeof Icon] ? (
                        React.createElement(
                          Icon[item.icon as keyof typeof Icon],
                          { size: 18 },
                        )
                      ) : (
                        <Icon.Zap size={18} />
                      )}
                    </div>
                    <span className="text-sm font-semibold tracking-tight">
                      {item.label}
                    </span>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icon.ChevronRight
                        size={14}
                        className="text-notion-light-muted"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: The Hub (Processing) */}
            <div className="relative py-12 lg:py-0 flex flex-col items-center justify-center">
              {/* Dynamic Connectors (Desktop) */}
              <div className="hidden lg:block absolute inset-0 -z-10 pointer-events-none">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 400 400"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 200C100 200 100 200 200 200"
                    stroke="url(#gradient-left)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="animate-[dash_2s_linear_infinite]"
                  />
                  <path
                    d="M200 200C300 200 300 200 400 200"
                    stroke="url(#gradient-right)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="animate-[dash_2s_linear_infinite]"
                  />
                  <defs>
                    <linearGradient
                      id="gradient-left"
                      x1="0"
                      y1="200"
                      x2="200"
                      y2="200"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#6366f1" stopOpacity="0" />
                      <stop offset="1" stopColor="#6366f1" stopOpacity="0.5" />
                    </linearGradient>
                    <linearGradient
                      id="gradient-right"
                      x1="200"
                      y1="200"
                      x2="400"
                      y2="200"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#6366f1" stopOpacity="0.5" />
                      <stop offset="1" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="relative text-center group">
                {/* Central Logo with improved effects */}
                <div className="relative mx-auto w-32 h-32 mb-8">
                  <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-400/20 rounded-full blur-2xl animate-pulse" />
                  <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-full animate-spin-slow" />
                  <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 dark:from-indigo-400 dark:via-indigo-500 dark:to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_50px_-12px_rgba(79,70,229,0.5)] z-10 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2),transparent)]" />
                    <Icon.Zap
                      size={64}
                      className="text-white relative z-10 drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-notion-light-text to-notion-light-text/70 dark:from-white dark:to-white/70">
                    Integration Hub
                  </h3>
                  <p className="text-sm text-notion-light-muted dark:text-notion-dark-muted max-w-[280px] mx-auto leading-relaxed">
                    MyOps detects the event and routes it to your configured
                    channels{" "}
                    <span className="text-indigo-500 dark:text-indigo-400 font-semibold">
                      instantly
                    </span>
                    .
                  </p>

                  <div className="pt-4">
                    <div
                      className={`inline-flex items-center gap-2 px-6 py-2.5 ${hubColors.lightBg} ${hubColors.text} rounded-full text-[11px] font-black uppercase tracking-[0.2em] border ${hubColors.border} shadow-sm transform hover:scale-105 transition-transform cursor-default`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                      Zero Friction Engine
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: The Outside World (Output) */}
            <div className="space-y-8">
              <div className="flex flex-col items-center lg:items-end text-center lg:text-right">
                <div
                  className={`w-14 h-14 ${clientColors.lightBg} ${clientColors.text} rounded-2xl flex items-center justify-center shadow-lg mb-6 transform rotate-3 group-hover:rotate-0 transition-all duration-300 border border-white/50 dark:border-white/10`}
                >
                  <Icon.Globe size={28} />
                </div>
                <div className="space-y-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest ${clientColors.text} opacity-60`}
                  >
                    Step 03
                  </span>
                  <h3 className="text-2xl font-bold tracking-tight">
                    The Client
                  </h3>
                  <p className="text-sm text-notion-light-muted dark:text-notion-dark-muted max-w-[240px]">
                    Clients receive beautiful, real-time updates in their own
                    preferred apps.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
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
                    className="group flex items-center gap-4 p-4 bg-white/50 dark:bg-notion-dark-border/50 backdrop-blur-sm rounded-2xl border border-notion-light-border dark:border-notion-dark-border hover:border-purple-500/30 dark:hover:border-purple-400/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 animate-in slide-in-from-right"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <div
                      className={`p-2.5 rounded-xl ${item.colors.lightBg} ${item.colors.text} shadow-inner group-hover:scale-110 transition-transform duration-300`}
                    >
                      {Icon[item.icon as keyof typeof Icon] ? (
                        React.createElement(
                          Icon[item.icon as keyof typeof Icon],
                          { size: 18 },
                        )
                      ) : (
                        <Icon.Zap size={18} />
                      )}
                    </div>
                    <span className="text-sm font-semibold tracking-tight">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Banner */}
          <div className="mt-16 pt-8 border-t border-notion-light-border dark:border-notion-dark-border text-center">
            <p className="text-notion-light-muted dark:text-notion-dark-muted italic text-lg font-serif">
              "Reliability isn’t just completing tasks. It’s making your work
              visible, predictable, and frictionless."
            </p>
            <div className="mt-6 flex justify-center gap-6">
              <div
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/5 text-[10px] font-bold tracking-widest ${MODULE_COLORS.status_active.text} border border-emerald-500/10`}
              >
                <div
                  className={`w-2 h-2 ${MODULE_COLORS.status_active.dot} rounded-full animate-pulse`}
                />
                LIVE STATUS
              </div>
              <div
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/5 text-[10px] font-bold tracking-widest ${MODULE_COLORS.tasks.text} border border-indigo-500/10`}
              >
                <Icon.Check size={12} />
                AUTO-SYNC ACTIVE
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              colors: MODULE_COLORS.integrations,
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
                className="relative p-8 bg-white/50 dark:bg-notion-dark-sidebar/50 backdrop-blur-sm rounded-[2rem] border border-notion-light-border dark:border-notion-dark-border group hover:border-indigo-500/20 dark:hover:border-indigo-400/20 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500"
              >
                <div
                  className={`w-12 h-12 ${benefit.colors.lightBg} ${benefit.colors.text} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner`}
                >
                  <IconComponent size={24} />
                </div>
                <h4 className="text-lg font-bold mb-3 tracking-tight">
                  {benefit.title}
                </h4>
                <p className="text-sm text-notion-light-muted dark:text-notion-dark-muted leading-relaxed">
                  {benefit.desc}
                </p>

                <div className="absolute bottom-4 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div
                    className={`w-8 h-1 rounded-full ${benefit.colors.dot}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  });
