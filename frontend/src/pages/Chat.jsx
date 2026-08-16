import { Sparkles, MessageSquare, Send } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import PageHeader from "../components/PageHeader";

function Chat() {
  return (
    <MainLayout>
      <PageHeader
        title="AI Assistant"
        subtitle="Ask anything about your courses, grades, attendance and academic standing."
      />

      <div className="border border-line bg-panel">
        {/* Chat window frame */}
        <div className="border-b border-line px-6 py-4 flex items-center gap-3">
          <span className="w-9 h-9 flex items-center justify-center border border-line bg-ink text-paper">
            <Sparkles size={16} strokeWidth={1.8} />
          </span>
          <div className="leading-tight">
            <p className="font-display font-bold text-[0.9375rem] text-ink tracking-tight">
              Eastern University Assistant
            </p>
            <p className="label-mono text-ink-mute mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-warn inline-block" />
              Coming soon
            </p>
          </div>
        </div>

        <div className="px-6 py-10 flex flex-col items-center text-center">
          <span className="w-14 h-14 mb-6 flex items-center justify-center border border-line bg-paper text-ink-mute">
            <MessageSquare size={22} strokeWidth={1.6} />
          </span>

          <h2 className="font-display font-bold text-xl text-ink tracking-tight">
            The AI Assistant is on its way
          </h2>

          <p className="text-[0.8125rem] text-ink-soft mt-3 max-w-md leading-relaxed">
            This workspace will soon answer questions about your academic record,
            explain your results in plain language and surface early warnings
            before they become problems.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line border border-line mt-8 w-full max-w-2xl text-left">
            <div className="bg-panel p-5">
              <p className="label-mono text-ink-mute">01</p>
              <p className="font-display font-bold text-[0.9375rem] text-ink tracking-tight mt-2">
                Results in plain language
              </p>
              <p className="text-[0.8125rem] text-ink-soft mt-1.5 leading-relaxed">
                Ask about your CGPA, per-course grades and what they mean.
              </p>
            </div>
            <div className="bg-panel p-5">
              <p className="label-mono text-ink-mute">02</p>
              <p className="font-display font-bold text-[0.9375rem] text-ink tracking-tight mt-2">
                Attendance alerts
              </p>
              <p className="text-[0.8125rem] text-ink-soft mt-1.5 leading-relaxed">
                Track attendance trends and get nudges before you fall behind.
              </p>
            </div>
            <div className="bg-panel p-5">
              <p className="label-mono text-ink-mute">03</p>
              <p className="font-display font-bold text-[0.9375rem] text-ink tracking-tight mt-2">
                Academic guidance
              </p>
              <p className="text-[0.8125rem] text-ink-soft mt-1.5 leading-relaxed">
                Course selection advice, timetables and semester planning help.
              </p>
            </div>
          </div>
        </div>

        {/* Disabled composer */}
        <div className="border-t border-line px-6 py-4 bg-paper">
          <div className="flex items-center gap-3 border border-line bg-panel pl-4 pr-2 py-2 opacity-50">
            <input
              type="text"
              disabled
              placeholder="Ask the assistant a question…"
              className="flex-1 bg-transparent outline-none text-[0.8125rem] text-ink placeholder:text-ink-mute disabled:cursor-not-allowed"
            />
            <button disabled className="btn-solid btn-pushable !py-2">
              <Send size={14} strokeWidth={2} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Chat;
