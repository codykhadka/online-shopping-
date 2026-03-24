import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { howToGuides, HowToGuide } from "../data/how-to-guides";
import { Button } from "../components/ui/button";
import {
  Clock,
  ChefHat,
  X,
  Send,
  Bot,
  User,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Lightbulb,
  Utensils,
  MessageCircle,
  Search,
  Loader2,
  Leaf,
} from "lucide-react";
import { toast } from "sonner";


const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";   

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  role: "user" | "assistant";
  text: string;
}

// ─── AI Knowledge Base ────────────────────────────────────────────────────────
const aiResponses: Record<string, string> = {
  rice: "To make perfect rice: use a 1:2 ratio of rice to water, rinse until clear, bring to a boil then simmer covered for 18-20 min. Never lift the lid! Rest 5 min before fluffing.",
  honey: "Always add honey to warm (not boiling) liquid to protect its natural enzymes. Our Pure Raw Honey is unprocessed and packed with antioxidants!",
  ghee: "A2 Cow Ghee has a ~485°F smoke point — perfect for roasting and frying. It adds a gorgeous nutty aroma to any dish.",
  tea: "For honey ginger tea: simmer ginger 5-10 min, let it cool slightly, then stir in honey. A lemon squeeze boosts vitamin C!",
  cooking: "Happy to help! Our honey, ghee, and jaggery can replace refined sugars and oils for a much healthier meal.",
  jaggery: "Replace sugar 1:1 with jaggery. Its deep molasses flavor is amazing in chai, desserts, or as a natural sweetener. Rich in iron!",
  mustard: "Cold-pressed mustard oil is ideal for Indian cooking, marinades, and even hair care. Its pungency mellows when heated.",
  peanut: "Our unsweetened peanut butter works great in smoothies, sauces, or on toast — 100% roasted peanuts, no additives!",
  default:
    "I'm your cooking assistant! Ask me how to use our organic products like honey, ghee, jaggery, or mustard oil. You can also ask about any guide on this page!",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const key of Object.keys(aiResponses)) {
    if (key !== "default" && lower.includes(key)) return aiResponses[key];
  }
  return aiResponses.default;
}

// ─── Difficulty Badge ─────────────────────────────────────────────────────────
function DifficultyBadge({ level }: { level: HowToGuide["difficulty"] }) {
  const colors = {
    Easy: "bg-green-100 text-green-700 border-green-200",
    Medium: "bg-amber-100 text-amber-700 border-amber-200",
    Hard: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${colors[level]}`}>
      {level}
    </span>
  );
}

// ─── Guide Detail Modal ───────────────────────────────────────────────────────
function GuideModal({ guide, onClose }: { guide: HowToGuide; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <motion.div
        initial={{ scale: 0.9, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-56 bg-green-50 overflow-hidden rounded-t-3xl shrink-0">
          <img src={guide.image} alt={guide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <div className="absolute bottom-4 left-6 right-14">
            <h2 className="text-2xl font-black text-white leading-tight">{guide.title}</h2>
            <div className="flex items-center gap-3 mt-2">
              <DifficultyBadge level={guide.difficulty} />
              <span className="flex items-center gap-1 text-white/80 text-xs font-semibold">
                <Clock size={12} /> {guide.timeToMake}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/35 backdrop-blur-sm rounded-full text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Ingredients */}
          {guide.ingredients && (
            <div>
              <h3 className="flex items-center gap-2 font-extrabold text-neutral-800 mb-3 text-base">
                <Utensils size={16} className="text-green-600" /> Ingredients
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {guide.ingredients.map((ing, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-neutral-600 bg-green-50 rounded-xl px-3 py-2 border border-green-100"
                  >
                    <span className="text-green-500 font-bold mt-0.5">•</span>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Steps */}
          <div>
            <h3 className="flex items-center gap-2 font-extrabold text-neutral-800 mb-3 text-base">
              <ChefHat size={16} className="text-green-600" /> How To Make
            </h3>
            <ol className="space-y-3">
              {guide.instructions.map((step, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex gap-3 items-start"
                >
                  <span className="shrink-0 size-6 rounded-full bg-green-600 text-white text-xs font-black flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-neutral-700 leading-relaxed">{step}</p>
                </motion.li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          <div>
            <h3 className="flex items-center gap-2 font-extrabold text-neutral-800 mb-3 text-base">
              <Lightbulb size={16} className="text-amber-500" /> Pro Tips
            </h3>
            <div className="space-y-2">
              {guide.tips.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3"
                >
                  <CheckCircle2 size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-900">{tip}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Guide Card ───────────────────────────────────────────────────────────────
function GuideCard({ guide, onClick }: { guide: HowToGuide; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -7, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      onClick={onClick}
      className="group bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-green-100/60 transition-shadow duration-300 flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-green-50">
        <img
          src={guide.image}
          alt={guide.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 right-3">
          <DifficultyBadge level={guide.difficulty} />
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white text-xs font-semibold">View Recipe</span>
          <ChevronRight size={12} className="text-white" />
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-extrabold text-neutral-900 text-base leading-snug mb-1.5 line-clamp-2">
          {guide.title}
        </h3>
        <p className="text-sm text-neutral-500 line-clamp-2 flex-grow leading-relaxed">
          {guide.shortDescription}
        </p>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
          <span className="flex items-center gap-1 text-xs text-neutral-400 font-semibold">
            <Clock size={12} /> {guide.timeToMake}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-green-600">
            <ChefHat size={12} />
            {guide.instructions.length} Steps
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Floating AI Chat ─────────────────────────────────────────────────────────
function FloatingAiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "👋 Hi! I'm your cooking assistant. Ask me about recipes, ingredients, or any guide on this page!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: getAIResponse(trimmed) },
      ]);
      setIsTyping(false);
    }, 950);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); sendMessage(); }
  };

  const suggestions = ["How to make honey tea?", "Tips for ghee roasting", "What is jaggery?"];

  return (
    <>
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="fixed bottom-24 right-5 z-[70] w-[340px] sm:w-[380px] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: "min(520px, 75vh)" }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-5 py-3.5 flex items-center gap-3 shrink-0">
              <div className="size-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-extrabold text-sm">Cooking Assistant</p>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-green-300 animate-pulse" />
                  <p className="text-green-100 text-xs">Always online</p>
                </div>
              </div>
              <Sparkles size={15} className="text-yellow-300 mr-1" />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/80"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-white px-4 py-3 space-y-3 min-h-0">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="size-7 rounded-full bg-green-100 flex items-center justify-center shrink-0 mb-0.5">
                      <Bot size={13} className="text-green-700" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-green-600 text-white rounded-br-sm font-medium"
                        : "bg-neutral-100 text-neutral-800 rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === "user" && (
                    <div className="size-7 rounded-full bg-green-600 flex items-center justify-center shrink-0 mb-0.5">
                      <User size={13} className="text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-2"
                >
                  <div className="size-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Bot size={13} className="text-green-700" />
                  </div>
                  <div className="bg-neutral-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="size-1.5 rounded-full bg-neutral-400 inline-block"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.14 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && (
              <div className="bg-white px-4 pt-1 pb-2 flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-full px-3 py-1.5 font-semibold transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="bg-white px-4 pb-4 pt-2 border-t border-neutral-100 shrink-0">
              <div className="flex items-center gap-2 bg-neutral-50 rounded-2xl border border-neutral-200 px-4 py-2 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about a recipe…"
                  className="flex-1 text-sm bg-transparent outline-none text-neutral-800 placeholder-neutral-400"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="size-8 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-neutral-200 disabled:text-neutral-400 text-white flex items-center justify-center transition-colors shrink-0"
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        className="fixed bottom-5 right-5 z-[70] size-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl shadow-green-600/40 flex items-center justify-center text-white transition-colors hover:from-green-400 hover:to-emerald-500"
        title={isOpen ? "Close AI Chat" : "Open AI Cooking Assistant"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.22 }}
            >
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              transition={{ duration: 0.22 }}
            >
              <MessageCircle size={22} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        {!isOpen && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-green-400"
            animate={{ scale: [1, 1.55], opacity: [0.6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </motion.button>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function HowToMake() {
  const [selectedGuide, setSelectedGuide] = useState<HowToGuide | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      return toast.error("Please enter a valid email address.");
    }

    setIsSubscribing(true);
    try {
      const res = await fetch(`${API_URL}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Welcome! Check your 'Identity' for a surprise incoming.", {
          description: "Owner notified. You're now part of the movement.",
          icon: <Leaf className="text-green-500" />
        });
        setNewsletterEmail("");
      } else {
        toast.error(data.error || "Subscription failure.");
      }
    } catch {
      toast.error("Network instability. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const filteredGuides = searchQuery.trim()
    ? howToGuides.filter((g) =>
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : howToGuides;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-neutral-50"
    >
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-green-700 via-emerald-600 to-teal-600 text-white pt-28 pb-24 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.18, 1], opacity: [0.18, 0.32, 0.18] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-32 -right-32 size-[550px] rounded-full bg-yellow-300/20 blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.22, 1], opacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="absolute -bottom-32 -left-32 size-[500px] rounded-full bg-teal-300/20 blur-3xl"
          />
          {/* dot grid */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-5 py-2 text-xs font-bold tracking-widest uppercase text-green-100 mb-6"
          >
            <ChefHat size={13} className="text-yellow-300" />
            Step-by-step cooking guides
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-5"
          >
            How To{" "}
            <span className="text-yellow-300 font-serif italic font-normal">Make</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-green-100/85 text-lg max-w-xl mx-auto leading-relaxed mb-10"
          >
            Beautiful, easy-to-follow recipes using our organic products. Click any card to explore the full guide.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-col items-center gap-5"
          >
            {/* Search Bar */}
            <div className="relative w-full max-w-lg">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  document.getElementById("guides")?.scrollIntoView({ behavior: "smooth" });
                }}
                placeholder="Search recipes… e.g. rice, honey, ghee"
                className="w-full pl-11 pr-10 py-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 text-white placeholder-white/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all shadow-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 text-white/70 transition-colors"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <Button
              size="lg"
              onClick={() =>
                document.getElementById("guides")?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-white text-green-700 hover:bg-green-50 font-extrabold rounded-full px-10 py-5 text-base shadow-xl shadow-black/20 transition-all hover:scale-105"
            >
              Explore Recipes
            </Button>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-14">
            <path d="M0,28 C360,56 1080,0 1440,28 L1440,56 L0,56 Z" fill="#f5f5f5" />
          </svg>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────────── */}
      <section className="bg-white border-b border-neutral-100">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-3 gap-4 text-center max-w-2xl mx-auto">
            {[
              { value: `${howToGuides.length}+`, label: "Recipes" },
              { value: "100%", label: "Organic Ingredients" },
              { value: "AI", label: "Cooking Assistant" },
            ].map((s) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
              >
                <p className="text-3xl font-black text-green-600">{s.value}</p>
                <p className="text-xs font-semibold text-neutral-500 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Guide Cards ───────────────────────────────────────────────── */}
      <section id="guides" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight mb-3">
              Browse Recipes
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="w-20 h-1 bg-green-500 rounded-full mx-auto mb-4 origin-left"
            />
            <p className="text-neutral-500 max-w-md mx-auto">
              Click any card to get full ingredients, step-by-step instructions, and pro tips.
            </p>
          </motion.div>

          {/* Active search tag */}
          {searchQuery.trim() && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-8 justify-center"
            >
              <span className="text-sm text-neutral-500">
                Showing results for{" "}
                <span className="font-bold text-neutral-800">"{searchQuery}"</span>
              </span>
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-red-400 hover:text-red-600 font-semibold flex items-center gap-1 transition-colors"
              >
                <X size={12} /> Clear
              </button>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {filteredGuides.length > 0 ? (
              <motion.div
                key={searchQuery}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="grid gap-7 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filteredGuides.map((guide, i) => (
                  <motion.div
                    key={guide.id}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: i * 0.08 }}
                  >
                    <GuideCard guide={guide} onClick={() => setSelectedGuide(guide)} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <div className="size-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <Search size={28} className="text-green-300" />
                </div>
                <p className="text-xl font-extrabold text-neutral-700 mb-2">No recipes found</p>
                <p className="text-neutral-400 text-sm mb-5">
                  We couldn't find any guide matching "{searchQuery}".
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-sm font-bold text-green-600 hover:text-green-500 underline underline-offset-2 transition-colors"
                >
                  Clear search
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Footer (same as Home page) ────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-[#062c16] py-24 overflow-hidden"
      >
        {/* Glowing orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] right-[10%] w-[32rem] h-[32rem] bg-green-400 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[-10%] left-[10%] w-[36rem] h-[36rem] bg-emerald-400/80 rounded-full blur-[120px]"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-5 text-white tracking-tight">
              Join the Organic Movement
            </h2>
            <p className="text-green-50/80 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
              Subscribe for exclusive access to seasonal harvests, healthy living guides, and member-only benefits.
            </p>
           <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row justify-center max-w-xl mx-auto gap-3">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={isSubscribing}
                className="px-6 py-4 bg-white/[0.08] border border-green-400/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white/[0.12] text-white placeholder-green-100/50 flex-1 transition-all shadow-sm backdrop-blur-md disabled:opacity-50"
              />
              <Button
                type="submit"
                disabled={isSubscribing}
                className="bg-green-500 hover:bg-green-400 text-green-950 rounded-xl px-8 py-6 font-extrabold shadow-lg shadow-green-500/20 shrink-0 transition-transform hover:scale-105 disabled:hover:scale-100"
              >
                {isSubscribing ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>Subscribe Now <Send size={18} className="ml-2" /></>
                )}
              </Button>
            </form>
          </motion.div>
          <div className="mt-20 pt-8 border-t border-green-800/40 text-sm text-green-300/50 font-medium">
            © {new Date().getFullYear()} danphe Organic. All rights reserved. Crafted carefully for nature.
          </div>
        </div>
      </motion.section>

      {/* ── Guide Detail Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedGuide && (
          <GuideModal guide={selectedGuide} onClose={() => setSelectedGuide(null)} />
        )}
      </AnimatePresence>

      {/* ── Floating AI Chat ──────────────────────────────────────────── */}
      <FloatingAiChat />
    </motion.div>
  );
}
