import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaMicrosoft, FaAmazon, FaGoogle } from 'react-icons/fa';
import { Copy, Check, Terminal, Code2, Play, Sparkles, ArrowRight } from 'lucide-react';
import ProductSwitcher from './ProductSwitcher';
import FeatureIndicators from './FeatureIndicators';

const HERO_CODE_SNIPPETS = {
  python: {
    lang: "Python",
    command: "pip install forgeql",
    code: `import requests

DB_URL = "http://localhost:8080"
headers = {"Authorization": "Bearer admin-secret-key"}

# Execute FQL Point Lookup
response = requests.post(f"{DB_URL}/api/query", json={
    "fql": "GET users 101"
}, headers=headers)

print(response.json())`
  },
  node: {
    lang: "Node.js",
    command: "npx forgeql",
    code: `const axios = require('axios');

const DB_URL = 'http://localhost:8080';
const headers = { Authorization: 'Bearer admin-secret-key' };

// Insert Record into B+ Tree Slotted Page
const res = await axios.post(\`\${DB_URL}/api/query\`, {
  action: "insert",
  table: "users",
  data: { id: 101, name: "Satoshi", role: "ADMIN" }
}, { headers });

console.log(res.data);`
  },
  fql: {
    lang: "FQL Query",
    command: "forgeql start",
    code: `// Forge Query Syntax (FQL) Payload
{
  "action": "vector_search",
  "table": "embeddings",
  "vector": [0.12, 0.85, 0.43, -0.21],
  "k": 5,
  "where": {
    "category": "hardware"
  }
}`
  },
  java: {
    lang: "Java Maven",
    command: "java -jar forgeql-api-0.2.0.jar",
    code: `// Java Spring Boot Integration
@RestController
public class QueryController {
    @Value("\${forgeql.url}")
    private String dbUrl;

    @GetMapping("/users/{id}")
    public String getUser(@PathVariable int id) {
        String payload = """
            { "fql": "GET users " + id }
        """;
        return restTemplate.postForObject(dbUrl + "/query", req, String.class);
    }
}`
  }
};

export default function Hero({
  heroData,
  subsystems,
  activeSubsystemIdx,
  onChangeSubsystem,
  onOpenStudio,
  onOpenDocs
}) {
  const [activeCodeTab, setActiveCodeTab] = useState('python');
  const [copiedCode, setCopiedCode] = useState(false);

  const currentSubsystem = subsystems[activeSubsystemIdx] || subsystems[0];
  const activeSnippet = HERO_CODE_SNIPPETS[activeCodeTab];

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section className="w-full flex flex-col items-center justify-center py-6 z-10 my-auto">
      <div className="mx-auto w-full max-w-[980px] text-center flex flex-col items-center justify-center">
        
        {/* ── High-Legibility Developer Trust Badge ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center mb-6"
        >
          <div className="flex items-center">
            <div className="trust-avatar-1 w-[clamp(36px,4.5vw,42px)] h-[clamp(36px,4.5vw,42px)] rounded-full bg-trustBg border border-white/50 p-[5px] flex items-center justify-center shrink-0 shadow-md">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#111]">
                <FaMicrosoft className="text-[13px] sm:text-[15px]" />
              </div>
            </div>
            <div className="trust-avatar-2 w-[clamp(36px,4.5vw,42px)] h-[clamp(36px,4.5vw,42px)] rounded-full bg-trustBg border border-white/50 p-[5px] flex items-center justify-center shrink-0 shadow-md">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#111]">
                <FaAmazon className="text-[13px] sm:text-[15px]" />
              </div>
            </div>
            <div className="trust-avatar-3 w-[clamp(36px,4.5vw,42px)] h-[clamp(36px,4.5vw,42px)] rounded-full bg-trustBg border border-white/50 p-[5px] flex items-center justify-center shrink-0 shadow-md">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#111]">
                <FaGoogle className="text-[13px] sm:text-[15px]" />
              </div>
            </div>
          </div>

          <div className="h-[clamp(36px,4.5vw,42px)] rounded-full bg-trustBg border border-white/50 flex items-center ml-[-15px] pl-6 pr-5 shadow-md">
            <span className="text-white font-semibold text-[clamp(12px,1.4vw,14px)] tracking-tight whitespace-nowrap">
              Production Power for High-Concurrency AI &amp; Data Workloads
            </span>
          </div>
        </motion.div>

        {/* ── Subsystem Selector ── */}
        <ProductSwitcher
          subsystems={subsystems}
          activeIndex={activeSubsystemIdx}
          onChangeIndex={onChangeSubsystem}
        />

        {/* ── Crisp Bold Retro Dot-Matrix Headline ── */}
        <div className="headline my-3 overflow-hidden">
          <motion.h1
            key={currentSubsystem.headline}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-white text-[clamp(32px,6.4vw,84px)] leading-[1.06] tracking-[-0.04em] max-[720px]:tracking-[-0.08px] max-[420px]:tracking-[-0.09em] whitespace-normal sm:whitespace-nowrap uppercase font-extrabold drop-shadow-md"
          >
            {currentSubsystem.headline.split('\n').map((line, idx) => (
              <span key={idx} className="block">
                {line}
              </span>
            ))}
          </motion.h1>
        </div>

        {/* ── High-Contrast Bolder Subhead ── */}
        <motion.p
          key={currentSubsystem.subhead}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-[min(620px,94%)] text-white/90 font-medium leading-[1.6] text-[clamp(15px,1.65vw,20px)] my-4 drop-shadow-sm"
        >
          {currentSubsystem.subhead}
        </motion.p>

        {/* ── Bold Feature Indicators ── */}
        <FeatureIndicators indicators={currentSubsystem.indicators} />

        {/* ── Bolder Action CTAs ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-4 mt-6 mb-10"
        >
          <button
            onClick={onOpenStudio}
            className="rounded-full bg-white text-black font-bold text-[clamp(14px,1.6vw,15.5px)] px-[clamp(24px,3.2vw,32px)] py-[clamp(12px,1.8vh,15px)] shadow-glowCta transition-all duration-300 hover:-translate-y-[2px] hover:scale-[1.02] active:translate-y-0 flex items-center gap-2.5"
          >
            <Play className="w-4 h-4 fill-black" /> Explore Forge Studio
          </button>

          <button
            onClick={onOpenDocs}
            className="rounded-full bg-[#28282a] text-white hover:text-white border border-white/30 font-semibold text-[clamp(14px,1.6vw,15.5px)] px-[clamp(22px,2.8vw,28px)] py-[clamp(12px,1.8vh,15px)] transition-all duration-200 hover:bg-[#323234] hover:-translate-y-[1px] shadow-sm"
          >
            Read Documentation
          </button>
        </motion.div>

        {/* ── Bolder Quick Start Code Console ── */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="w-full max-w-2xl bg-[#0c0c0e]/95 backdrop-blur-2xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl text-left my-2"
        >
          {/* Code Console Header */}
          <div className="bg-black/80 px-4 py-3 border-b border-white/15 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full p-1 text-xs font-mono">
              {Object.keys(HERO_CODE_SNIPPETS).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveCodeTab(key)}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                    activeCodeTab === key ? 'bg-white text-black font-bold shadow-sm' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {HERO_CODE_SNIPPETS[key].lang}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-orange-400 font-bold border border-orange-500/30 bg-orange-500/15 px-2.5 py-0.5 rounded-full">
                {activeSnippet.command}
              </span>
              <button
                onClick={() => handleCopyCode(activeSnippet.code)}
                className="p-1.5 text-white/70 hover:text-white transition-colors"
                title="Copy code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-orange-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Code Console Body */}
          <div className="p-4 font-mono text-xs sm:text-sm text-orange-400 font-bold leading-relaxed overflow-x-auto bg-black/90">
            <pre className="whitespace-pre-wrap">{activeSnippet.code}</pre>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
