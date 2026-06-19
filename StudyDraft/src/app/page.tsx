import Link from "next/link";
import { ArrowRight, TrendingUp, Users, FileText, BarChart3, CheckCircle } from "lucide-react";

const metrics = [
  {
    label: "Reports Generated",
    value: "12,400+",
    delta: "+12%",
    icon: FileText,
  },
  {
    label: "Active Users",
    value: "2,850",
    delta: "+8.3%",
    icon: Users,
  },
  {
    label: "Avg. Completion",
    value: "94%",
    delta: "+2.1%",
    icon: TrendingUp,
  },
  {
    label: "Templates Available",
    value: "80+",
    delta: "New",
    icon: BarChart3,
  },
];

const features = [
  {
    title: "Smart Templates",
    description: "Pre-built academic report templates tailored for your discipline.",
    stat: "80+",
    statLabel: "templates",
  },
  {
    title: "AI-Powered Writing",
    description: "Generate well-structured sections with context-aware AI assistance.",
    stat: "3x",
    statLabel: "faster drafts",
  },
  {
    title: "Reference Analysis",
    description: "Upload reference reports and replicate their structure and formatting.",
    stat: "95%",
    statLabel: "accuracy",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose a Template",
    description: "Select from a library of academic report templates or start from scratch.",
  },
  {
    number: "02",
    title: "Add Your Content",
    description: "Paste notes, upload files, or let AI help you brainstorm sections.",
  },
  {
    number: "03",
    title: "Generate & Refine",
    description: "AI drafts your report. Edit, tweak, and refine until it's perfect.",
  },
  {
    number: "04",
    title: "Export & Submit",
    description: "Download in your preferred format and submit with confidence.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-[60px] lg:py-[80px]">
        <div className="max-w-page mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-[60px] items-center">
            <div className="space-y-[20px]">
              <h1 className="font-polysans text-display leading-[0.91] tracking-[-1.32px] text-carbon max-w-[600px]">
                Create Better Reports Faster
              </h1>
              <p className="font-inter text-body leading-[1.5] text-graphite max-w-[480px]">
                StudyDraft helps students and researchers generate structured academic reports with the power of AI. Upload references, generate subtopics, and export professional documents.
              </p>
              <div className="flex items-center gap-[12px] pt-[8px]">
                <Link
                  href="/signup"
                  className="pill-button-filled inline-flex items-center gap-[8px]"
                >
                  Get Started Free <ArrowRight className="h-[15px] w-[15px]" />
                </Link>
                <Link
                  href="/login"
                  className="pill-button-outlined"
                >
                  Sign In
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative h-[400px]">
                {/* Back dashboard card */}
                <div className="absolute top-0 right-[20px] w-[85%] h-[320px] bg-paper rounded-cards p-[20px] flex flex-col shadow-[0_1px_3px_rgba(32,32,32,0.04),0_4px_12px_rgba(32,32,32,0.03)]">
                  <div className="flex items-center justify-between mb-[12px]">
                    <span className="font-inter text-[13px] font-medium text-slate">Report Activity</span>
                    <span className="font-inter text-[12px] text-slate">Last 7 days</span>
                  </div>
                  <div className="flex-1 flex items-end gap-[4px]">
                    {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-[4px]">
                        <div
                          className="w-full rounded-[3px] bg-signal-orange/20"
                          style={{ height: `${h}%` }}
                        />
                        <span className="font-inter text-[10px] text-slate">
                          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-[8px] pt-[8px] border-t border-chalk flex items-center justify-between">
                    <span className="font-inter text-[12px] text-graphite">Total: 445 reports</span>
                    <span className="font-inter text-[12px] font-medium text-carbon flex items-center gap-[4px]">
                      <TrendingUp className="h-[12px] w-[12px] text-signal-orange" />
                      +12.3%
                    </span>
                  </div>
                </div>
                {/* Front dashboard card */}
                <div className="absolute bottom-0 left-0 w-[85%] h-[280px] bg-paper rounded-cards p-[20px] shadow-[0_1px_3px_rgba(32,32,32,0.04),0_4px_12px_rgba(32,32,32,0.03)]">
                  <div className="flex items-center justify-between mb-[16px]">
                    <span className="font-inter text-[13px] font-medium text-slate">Top Subjects</span>
                    <span className="font-inter text-[12px] text-slate">Distribution</span>
                  </div>
                  <div className="space-y-[8px]">
                    {[
                      { label: "Computer Science", value: 35, color: "bg-signal-orange" },
                      { label: "Business", value: 25, color: "bg-sienna-bronze" },
                      { label: "Engineering", value: 20, color: "bg-carbon" },
                      { label: "Life Sciences", value: 12, color: "bg-graphite" },
                      { label: "Other", value: 8, color: "bg-slate" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-[8px]">
                        <span className="font-inter text-[12px] text-graphite w-[110px] truncate">{item.label}</span>
                        <div className="flex-1 h-[6px] rounded-full bg-fog overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.color}`}
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                        <span className="font-inter text-[12px] text-slate w-[28px] text-right">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Logo Strip */}
      <section className="py-[40px]">
        <div className="max-w-page mx-auto px-4 text-center space-y-[20px]">
          <p className="font-inter text-[13px] text-graphite">Trusted by 80+ partners</p>
          <div className="flex items-center justify-center gap-[40px] flex-wrap">
            {["ABB", "Olymel", "Cascades", "Angelcare", "Lightspeed", "Desjardins"].map((name) => (
              <span
                key={name}
                className="font-inter text-[18px] font-medium text-slate/60 tracking-[-0.01em]"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Metric KPI Cards */}
      <section className="py-[60px]">
        <div className="max-w-page mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="bg-paper rounded-cards p-[20px] space-y-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="font-inter text-[14px] font-medium text-slate">{metric.label}</span>
                    <Icon className="h-[16px] w-[16px] text-signal-orange" />
                  </div>
                  <div className="font-polysans text-[32px] font-normal leading-[1.19] tracking-[-0.64px] text-carbon">
                    {metric.value}
                  </div>
                  <div className="flex items-center gap-[4px]">
                    <span className="font-inter text-[12px] text-graphite">{metric.delta}</span>
                    <span className="font-inter text-[12px] text-slate">vs last month</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-[80px]">
        <div className="max-w-page mx-auto px-4 space-y-[40px]">
          <div className="max-w-[600px] space-y-[12px]">
            <h2 className="font-polysans text-subheading leading-[1.19] tracking-[-0.64px] text-carbon">
              Everything you need to ace your reports
            </h2>
            <p className="font-inter text-body leading-[1.5] text-graphite">
              From first draft to final submission — StudyDraft keeps you on track.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
            {features.map((feature, i) => (
              <div key={feature.title} className="bg-paper rounded-cards p-[24px] space-y-[16px]">
                {/* Mini chart area */}
                <div className="h-[60px] flex items-end gap-[2px]">
                  {[20, 35, 25, 50, 40, 65, 45, 70, 55, 80].map((h, j) => (
                    <div
                      key={j}
                      className="flex-1 rounded-[2px] bg-signal-orange/20"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <h3 className="font-inter text-[16px] font-medium text-carbon">{feature.title}</h3>
                <p className="font-inter text-[14px] leading-[1.43] text-graphite">
                  {feature.description}
                </p>
                <div className="flex items-center gap-[8px] pt-[4px]">
                  <span className="font-polysans text-[24px] font-normal leading-[1] text-signal-orange">
                    {feature.stat}
                  </span>
                  <span className="font-inter text-[13px] text-slate">{feature.statLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-[80px]">
        <div className="max-w-page mx-auto px-4 space-y-[40px]">
          <div className="text-center space-y-[12px]">
            <h2 className="font-polysans text-subheading leading-[1.19] tracking-[-0.64px] text-carbon">
              How it works
            </h2>
            <p className="font-inter text-body leading-[1.5] text-graphite max-w-[400px] mx-auto">
              Four simple steps from idea to finished report.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
            {steps.map((step, index) => (
              <div key={step.number} className="bg-paper rounded-cards p-[24px] space-y-[12px] relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-[28px] left-[calc(100%-8px)] w-[calc(100%-40px)] h-px border-t border-dashed border-chalk" />
                )}
                <span className="font-polysans text-[13px] font-normal text-signal-orange">
                  {step.number}
                </span>
                <h3 className="font-inter text-[16px] font-medium text-carbon">{step.title}</h3>
                <p className="font-inter text-[14px] leading-[1.43] text-graphite">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Product Preview */}
      <section className="py-[80px]">
        <div className="max-w-page mx-auto px-4">
          <div className="bg-paper rounded-cards p-[32px] space-y-[24px]">
            <div className="flex items-center justify-between">
              <h2 className="font-polysans text-subheading leading-[1.19] tracking-[-0.64px] text-carbon">
                Report Dashboard
              </h2>
              <Link
                href="/signup"
                className="pill-button-filled inline-flex items-center gap-[8px] text-[14px]"
              >
                Try it free <ArrowRight className="h-[14px] w-[14px]" />
              </Link>
            </div>
            {/* Dashboard mockup content */}
            <div className="grid lg:grid-cols-[200px_1fr] gap-[20px]">
              {/* Sidebar */}
              <div className="space-y-[16px]">
                {["Date", "Shop", "Supplier", "Product Category", "Brand", "Class", "Sex"].map((filter) => (
                  <div key={filter} className="flex items-center justify-between">
                    <span className="font-inter text-[13px] text-graphite">{filter}</span>
                    <span className="font-inter text-[11px] text-slate">▼</span>
                  </div>
                ))}
              </div>
              {/* Main content */}
              <div className="space-y-[20px]">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-[12px]">
                  {[
                    { label: "Draft", value: "12", delta: "+3" },
                    { label: "In Review", value: "8", delta: "-1" },
                    { label: "Completed", value: "24", delta: "+5" },
                    { label: "Exported", value: "18", delta: "+2" },
                  ].map((item) => (
                    <div key={item.label} className="bg-fog rounded-[8px] p-[12px] space-y-[4px]">
                      <span className="font-inter text-[12px] text-slate">{item.label}</span>
                      <div className="font-polysans text-[24px] font-normal leading-[1] text-carbon">
                        {item.value}
                      </div>
                      <span className="font-inter text-[11px] text-graphite">{item.delta} this week</span>
                    </div>
                  ))}
                </div>
                {/* Funnel chart */}
                <div className="space-y-[8px]">
                  <span className="font-inter text-[13px] font-medium text-slate">Conversion Funnel</span>
                  <div className="space-y-[4px]">
                    {[
                      { label: "Visitors", value: "2,400", pct: 100 },
                      { label: "Sign-ups", value: "890", pct: 37 },
                      { label: "Active", value: "445", pct: 18 },
                      { label: "Subscribed", value: "210", pct: 9 },
                    ].map((stage) => (
                      <div key={stage.label} className="flex items-center gap-[12px]">
                        <div
                          className="h-[28px] bg-signal-orange rounded-[4px] flex items-center px-[12px] transition-all"
                          style={{ width: `${stage.pct}%`, minWidth: "100px" }}
                        >
                          <span className="font-inter text-[12px] font-medium text-paper">{stage.label}</span>
                        </div>
                        <span className="font-inter text-[12px] text-carbon font-medium w-[40px]">{stage.value}</span>
                        <span className="font-inter text-[11px] text-slate">{stage.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-[80px]">
        <div className="max-w-page mx-auto px-4">
          <div className="bg-carbon rounded-cards p-[40px] text-center space-y-[16px]">
            <h2 className="font-polysans text-subheading leading-[1.19] tracking-[-0.64px] text-paper">
              Ready to draft your next report?
            </h2>
            <p className="font-inter text-body leading-[1.5] text-slate max-w-[400px] mx-auto">
              Join thousands of students who write better reports with StudyDraft.
            </p>
            <div className="pt-[8px]">
              <Link
                href="/signup"
                className="pill-button inline-flex items-center gap-[8px] bg-paper text-carbon hover:bg-fog text-[15px] font-medium"
              >
                Get Started Free <ArrowRight className="h-[15px] w-[15px]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-[40px] border-t border-chalk">
        <div className="max-w-page mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
            <div className="space-y-[8px]">
              <Link href="/" className="font-polysans text-[22px] font-normal tracking-[-0.02em] text-carbon">
                StudyDraft
              </Link>
              <p className="font-inter text-[13px] text-slate leading-[1.43]">
                Create structured academic reports faster with AI.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "Templates", "Pricing"] },
              { title: "Resources", links: ["Help Center", "Documentation", "Blog"] },
              { title: "Company", links: ["About", "Privacy", "Terms"] },
            ].map((group) => (
              <div key={group.title} className="space-y-[8px]">
                <h5 className="font-inter text-[13px] font-medium text-carbon">{group.title}</h5>
                <ul className="space-y-[4px]">
                  {group.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="font-inter text-[13px] text-slate hover:text-carbon transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-[20px] pt-[16px] border-t border-chalk text-center">
            <p className="font-inter text-[12px] text-slate">
              &copy; {new Date().getFullYear()} StudyDraft. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
