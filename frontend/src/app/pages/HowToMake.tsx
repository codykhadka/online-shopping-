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
import "@/styles/HowToMake.css";


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
    <span className={`difficulty-badge ${level}`}>
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
      className="guide-modal-overlay"
      onClick={onClose}
    >
      <div className="guide-modal-backdrop" />
      <motion.div
        initial={{ scale: 0.9, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="guide-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="guide-modal-header-img">
          <img src={guide.image} alt={guide.title} />
          <div className="overlay" />
          <div className="guide-modal-header-content">
            <h2 className="title">{guide.title}</h2>
            <div className="meta">
              <DifficultyBadge level={guide.difficulty} />
              <span className="time">
                <Clock size={12} /> {guide.timeToMake}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="guide-modal-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        <div className="guide-modal-body">
          {/* Ingredients */}
          {guide.ingredients && (
            <div>
              <h3 className="guide-modal-section-title">
                <Utensils size={16} className="icon" /> Ingredients
              </h3>
              <ul className="guide-modal-ingredients-grid">
                {guide.ingredients.map((ing, i) => (
                  <li
                    key={i}
                    className="guide-modal-ingredient"
                  >
                    <span className="dot">•</span>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Steps */}
          <div>
            <h3 className="guide-modal-section-title">
              <ChefHat size={16} className="icon" /> How To Make
            </h3>
            <ol className="guide-modal-steps">
              {guide.instructions.map((step, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="guide-modal-step"
                >
                  <span className="number">
                    {i + 1}
                  </span>
                  <p className="text">{step}</p>
                </motion.li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          <div>
            <h3 className="guide-modal-section-title">
              <Lightbulb size={16} className="icon" style={{ color: '#f59e0b' }} /> Pro Tips
            </h3>
            <div className="guide-modal-tips">
              {guide.tips.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="guide-modal-tip"
                >
                  <CheckCircle2 size={15} className="icon" />
                  <p className="text">{tip}</p>
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
      className="guide-card"
    >
      <div className="guide-card-image-wrapper">
        <img
          src={guide.image}
          alt={guide.title}
          className="guide-card-image"
        />
        <div className="guide-card-image-overlay" />
        <div className="guide-card-difficulty-badge">
          <DifficultyBadge level={guide.difficulty} />
        </div>
        <div className="guide-card-view-recipe">
          <span className="text">View Recipe</span>
          <ChevronRight size={12} className="icon" />
        </div>
      </div>
      <div className="guide-card-content">
        <h3 className="guide-card-title">
          {guide.title}
        </h3>
        <p className="guide-card-desc">
          {guide.shortDescription}
        </p>
        <div className="guide-card-footer">
          <span className="info time">
            <Clock size={12} /> {guide.timeToMake}
          </span>
          <span className="info steps">
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
            className="ai-chat-panel"
            style={{ maxHeight: "min(520px, 75vh)" }}
          >
            {/* Header */}
            <div className="ai-chat-header">
              <div className="icon-wrapper">
                <Bot size={18} className="icon" />
              </div>
              <div className="text-group">
                <p className="title">Cooking Assistant</p>
                <div className="status">
                  <span className="dot" />
                  <p className="text">Always online</p>
                </div>
              </div>
              <Sparkles size={15} className="sparkle-icon" />
              <button
                onClick={() => setIsOpen(false)}
                className="close-btn"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="ai-chat-messages">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`ai-chat-message ${msg.role}`}
                >
                  {msg.role === "assistant" && (
                    <div className="avatar">
                      <Bot size={13} className="icon" />
                    </div>
                  )}
                  <div
                    className="bubble"
                  >
                    {msg.text}
                  </div>
                  {msg.role === "user" && (
                    <div className="avatar">
                      <User size={13} className="icon" />
                    </div>
                  )}
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="ai-chat-typing-indicator"
                >
                  <div className="avatar">
                    <Bot size={13} className="icon" />
                  </div>
                  <div className="bubble">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="dot"
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
              <div className="ai-chat-suggestions">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="ai-chat-suggestion-btn"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="ai-chat-input-area">
              <div className="ai-chat-input-wrapper">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about a recipe…"
                  className="ai-chat-input"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="ai-chat-send-btn"
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
        className="ai-chat-toggle-btn"
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
            className="ai-chat-pulse"
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
      className="how-to-make-page"
    >
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="htm-hero-section">
        {/* Background decorations */}
        <div className="htm-hero-decorations">
          <motion.div
            animate={{ scale: [1, 1.18, 1], opacity: [0.18, 0.32, 0.18] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="htm-hero-blob1"
          />
          <motion.div
            animate={{ scale: [1, 1.22, 1], opacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="htm-hero-blob2"
          />
          {/* dot grid */}
          <div
            className="htm-hero-dot-grid"
            style={{
              backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="htm-hero-content">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="htm-hero-badge"
          >
            <ChefHat size={13} className="icon" />
            Step-by-step cooking guides
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="htm-hero-title"
          >
            How To{" "}
            <span className="highlight">Make</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="htm-hero-subtitle"
          >
            Beautiful, easy-to-follow recipes using our organic products. Click any card to explore the full guide.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="htm-hero-actions"
          >
            {/* Search Bar */}
            <div className="htm-search-wrapper">
              <Search
                size={18}
                className="icon"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  document.getElementById("guides")?.scrollIntoView({ behavior: "smooth" });
                }}
                placeholder="Search recipes… e.g. rice, honey, ghee"
                className="htm-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="htm-search-clear-btn"
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
              className="htm-explore-btn"
            >
              Explore Recipes
            </Button>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="htm-wave-divider">
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-14">
            <path d="M0,28 C360,56 1080,0 1440,28 L1440,56 L0,56 Z" fill="#f5f5f5" />
          </svg>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────────── */}
      <section className="htm-stats-strip">
        <div className="htm-stats-content">
          <div className="htm-stats-grid">
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
                className="htm-stat-item"
              >
                <p className="value">{s.value}</p>
                <p className="label">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Guide Cards ───────────────────────────────────────────────── */}
      <section id="guides" className="py-20">
        <div className="htm-guides-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="htm-guides-header"
          >
            <h2 className="htm-guides-title">
              Browse Recipes
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="htm-guides-underline"
            />
            <p className="htm-guides-subtitle">
              Click any card to get full ingredients, step-by-step instructions, and pro tips.
            </p>
          </motion.div>

          {/* Active search tag */}
          {searchQuery.trim() && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="htm-active-search"
            >
              <span className="text">
                Showing results for{" "}
                <span className="query">"{searchQuery}"</span>
              </span>
              <button
                onClick={() => setSearchQuery("")}
                className="clear-btn"
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
                className="htm-guides-grid"
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
                className="htm-empty-guides"
              >
                <div className="icon-wrapper">
                  <Search size={28} className="icon" />
                </div>
                <p className="title">No recipes found</p>
                <p className="subtitle">
                  We couldn't find any guide matching "{searchQuery}".
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="clear-search"
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
