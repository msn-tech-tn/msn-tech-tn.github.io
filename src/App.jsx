import React, { useEffect, useMemo, useState } from "react";

function resolveInitialTheme(prefersDark, stored) {
  if (stored === "light" || stored === "dark") return stored;
  return prefersDark ? "dark" : "light";
}

function nextTheme(current) {
  return current === "dark" ? "light" : "dark";
}

export default function App() {
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;

  const [theme, setTheme] = useState(() => {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem("theme")
        : null;
    return resolveInitialTheme(prefersDark, stored);
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const services = useMemo(
    () => [
      {
        icon: "💻",
        title: "Application Development",
        description:
          "Custom web and mobile applications built with modern technologies.",
      },
      {
        icon: "🤖",
        title: "AI & Machine Learning",
        description:
          "Intelligent automation, chatbots, analytics and AI solutions.",
      },
      {
        icon: "🌐",
        title: "Web Design",
        description:
          "Modern websites that convert visitors into customers.",
      },
      {
        icon: "📈",
        title: "Digital Marketing",
        description:
          "SEO, social media marketing, analytics and growth strategies.",
      },
      {
        icon: "☁️",
        title: "Cloud Solutions",
        description:
          "Scalable cloud infrastructure and DevOps implementation.",
      },
      {
        icon: "🔒",
        title: "Cyber Security",
        description:
          "Security assessments and protection for your digital assets.",
      },
    ],
    []
  );

  const stats = [
    { value: "100+", label: "Projects Delivered" },
    { value: "50+", label: "Happy Clients" },
    { value: "10+", label: "Years Experience" },
    { value: "24/7", label: "Support" },
  ];

  const companyInfo = useMemo(
    () => ({
      name: "MSN Technologies",
      about:
        "MSN Technologies helps organizations accelerate growth through software engineering, AI innovation, cloud adoption, website development, and digital transformation.",
      contact: {
        email: "hr@msn-tech.com",
        address: "Collierville, Tennessee",
      },
      services,
      faq: [
        {
          question: "What services do you offer?",
          answer:
            "We offer Application Development, AI & Machine Learning, Web Design, Digital Marketing, Cloud Solutions, and Cyber Security.",
        },
        {
          question: "How can I contact you?",
          answer:
            "You can email hr@msn-tech.com for a consultation or inquiry.",
        },
        {
          question: "Where are you located?",
          answer: "We are based in Collierville, Tennessee.",
        },
      ],
    }),
    [services]
  );

  const normalizeQuestion = (text) =>
    text.toLowerCase().replace(/\s+/g, " ").trim();

  const [answerCache, setAnswerCache] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("msnChatCache") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("msnChatCache", JSON.stringify(answerCache));
    }
  }, [answerCache]);

  const getCachedAnswer = (question) => answerCache[normalizeQuestion(question)];

  const cacheAnswer = (question, answer) => {
    const key = normalizeQuestion(question);
    setAnswerCache((prev) => ({ ...prev, [key]: answer }));
  };

  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I can answer questions only about MSN Technologies. Ask me about our services, company information, or contact details.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [lastReadAssistantCount, setLastReadAssistantCount] = useState(1);

  useEffect(() => {
    if (isChatOpen) {
      setLastReadAssistantCount(
        chatMessages.filter((message) => message.role === "assistant").length
      );
    }
  }, [isChatOpen, chatMessages]);

  const unreadCount = isChatOpen
    ? 0
    : Math.max(
        0,
        chatMessages.filter((message) => message.role === "assistant").length -
          lastReadAssistantCount
      );

  const askBackend = async (question) => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || "Chat backend error");
    }

    const data = await response.json();
    return data.answer;
  };

  const answerFromKnowledgeBase = (question) => {
    const text = question.toLowerCase();

    const findService = (term) =>
      services.find((service) =>
        service.title.toLowerCase().includes(term)
      );

    if (text.includes("about") || text.includes("company") || text.includes("who are")) {
      return companyInfo.about;
    }

    if (text.includes("contact") || text.includes("email") || text.includes("address") || text.includes("location")) {
      return `You can email ${companyInfo.contact.email} or visit our office in ${companyInfo.contact.address}.`;
    }

    if (text.includes("services")) {
      return companyInfo.faq[0].answer;
    }

    for (const term of ["application", "development"]) {
      if (text.includes(term)) {
        const service = findService("application");
        if (service) return service.description;
      }
    }

    if (text.includes("machine learning") || text.includes("ai")) {
      const service = findService("machine");
      if (service) return service.description;
    }

    if (text.includes("web") || text.includes("design")) {
      const service = findService("web");
      if (service) return service.description;
    }

    if (text.includes("marketing")) {
      const service = findService("digital");
      if (service) return service.description;
    }

    if (text.includes("cloud")) {
      const service = findService("cloud");
      if (service) return service.description;
    }

    if (text.includes("security") || text.includes("cyber")) {
      const service = findService("cyber");
      if (service) return service.description;
    }

    if (text.includes("consultation") || text.includes("pricing") || text.includes("quote")) {
      return "Please email hr@msn-tech.com to schedule a consultation or request pricing information.";
    }

    if (text.includes("experience") || text.includes("years") || text.includes("clients")) {
      return "MSN Technologies has delivered over 100 projects for more than 50 happy clients with over 10 years of experience and 24/7 support.";
    }

    return "I can only share information about MSN Technologies, including our services, contact details, and company overview. Please ask a question about the company.";
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const userMessage = { role: "user", content: trimmed };
    const cachedAnswer = getCachedAnswer(trimmed);

    let answer = cachedAnswer;
    if (!answer) {
      setIsLoading(true);
      setChatError(null);
      try {
        answer = await askBackend(trimmed);
      } catch (error) {
        setChatError(error.message);
        answer = answerFromKnowledgeBase(trimmed);
      } finally {
        setIsLoading(false);
      }

      cacheAnswer(trimmed, answer);
    }

    const assistantMessage = {
      role: "assistant",
      content: answer,
    };

    setChatMessages((prev) => [...prev, userMessage, assistantMessage]);
    setChatInput("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg">MSN Technologies</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#services" className="hover:text-blue-600">
              Services
            </a>
            <a href="#about" className="hover:text-blue-600">
              About
            </a>
            <a href="#contact" className="hover:text-blue-600">
              Contact
            </a>
          </nav>

          <button
            type="button"
            onClick={() => setTheme((current) => nextTheme(current))}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="mx-auto max-w-7xl px-6 py-24 relative">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
              🚀 Trusted Technology Partner
            </div>

            <h1 className="mt-8 text-5xl font-extrabold leading-tight text-slate-950 dark:text-white md:text-7xl">
              Transform Your Business With
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                {' '}AI & Software Solutions
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-xl text-slate-600 dark:text-slate-300">
              We build intelligent applications, modern websites,
              AI-powered business solutions, and digital platforms
              that help organizations grow faster.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#contact"
                className="rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700"
              >
                Free Consultation
              </a>
              <a
                href="#services"
                className="rounded-xl border border-slate-300 px-8 py-4 font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                View Services
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <div className="grid gap-6 md:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-slate-900"
            >
              <div className="text-4xl font-bold text-blue-600">{item.value}</div>
              <div className="mt-2 text-slate-500">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {isChatOpen ? (
          <div className="w-[360px] max-w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">MSN Chat</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Answers only from company info
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 max-h-[340px] overflow-y-auto space-y-3 pr-1">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`rounded-3xl p-4 ${
                    message.role === "user"
                      ? "ml-auto max-w-[90%] bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                  }`}
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    {message.role === "user" ? "You" : "Assistant"}
                  </div>
                  <div className="mt-2 whitespace-pre-line">
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            {chatError ? (
              <div className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
                {chatError}
              </div>
            ) : null}

            {isLoading ? (
              <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Fetching answer from the backend...
              </div>
            ) : null}

            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask about our company..."
                className="min-w-0 flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-2xl bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Send
              </button>
            </form>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsChatOpen((open) => !open)}
          className="relative inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-white shadow-2xl transition hover:bg-blue-700"
        >
          <span>Chat</span>
          <span className="text-xs">MSN</span>
          {unreadCount > 0 ? (
            <span className="absolute -top-2 -right-2 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-red-500 px-2 text-xs font-semibold text-white">
              {unreadCount}
            </span>
          ) : null}
        </button>
      </div>

      <section id="services" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-4xl font-bold">Our Services</h2>
          <p className="mt-4 text-slate-500">
            End-to-end technology solutions for modern businesses.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="group rounded-3xl bg-white p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-xl dark:bg-slate-900"
            >
              <div className="text-5xl">{service.icon}</div>
              <h3 className="mt-6 text-xl font-bold">{service.title}</h3>
              <p className="mt-4 text-slate-500">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="mx-auto max-w-6xl px-6 pb-24 text-center">
        <h2 className="text-4xl font-bold">Why Choose MSN Technologies?</h2>
        <p className="mt-8 text-lg text-slate-600 dark:text-slate-300">
          We help organizations accelerate growth through software engineering,
          AI innovation, cloud adoption, website development, and digital transformation.
          Our focus is delivering practical technology solutions that create measurable business value.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <h2 className="text-4xl font-bold text-center">What Clients Say</h2>
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-slate-900">
            <div className="text-2xl">⭐⭐⭐⭐⭐</div>
            <p className="mt-4 text-slate-500">
              MSN Technologies delivered our platform ahead of schedule
              and exceeded expectations.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-slate-900">
            <div className="text-2xl">⭐⭐⭐⭐⭐</div>
            <p className="mt-4 text-slate-500">
              Excellent support, great communication and high-quality development work.
            </p>
          </div>
        </div>
      </section>

      <section id="contact" className="px-6 pb-24">
        <div className="mx-auto max-w-6xl rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-center text-white">
          <h2 className="text-4xl font-bold">Ready To Start Your Next Project?</h2>
          <p className="mt-4 text-lg text-blue-100">
            Let's discuss how technology can help your business grow.
          </p>
          <div className="mt-8 space-y-2">
            <div>📧 hr@msn-tech.com</div>
            <div>📍 Collierville, Tennessee</div>
          </div>
          <a
            href="mailto:hr@msn-tech.com"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-4 font-semibold text-blue-700"
          >
            Schedule Consultation
          </a>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div>© 2023 MSN Technologies. All rights reserved.</div>
          <a href="#" className="hover:text-blue-600">
            Back to top ↑
          </a>
        </div>
      </footer>
    </div>
  );
}
