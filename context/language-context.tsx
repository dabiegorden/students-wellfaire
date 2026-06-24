"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

type Lang = "en" | "tw";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  translating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

const CACHE_KEY = "cug_tw_cache";
const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "CODE",
  "PRE",
  "TEXTAREA",
]);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [translating, setTranslating] = useState(false);

  // english -> twi cache
  const cacheRef = useRef<Record<string, string>>({});
  // original english text per node, so we can restore
  const originalsRef = useRef<Map<Text, string>>(new Map());
  const placeholderOriginalsRef = useRef<Map<Element, string>>(new Map());
  const observerRef = useRef<MutationObserver | null>(null);
  const langRef = useRef<Lang>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) cacheRef.current = JSON.parse(stored);
      const savedLang = localStorage.getItem("cug_lang") as Lang | null;
      if (savedLang === "tw") setLangState("tw");
    } catch {
      /* ignore */
    }
  }, []);

  const persistCache = useCallback(() => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheRef.current));
    } catch {
      /* ignore */
    }
  }, []);

  const collectTextNodes = useCallback((root: Node): Text[] => {
    const nodes: Text[] = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const text = node.nodeValue?.trim() ?? "";
        if (!text || text.length < 2) return NodeFilter.FILTER_REJECT;
        if (/^[\d\s.,:%/+\-#$£€]+$/.test(text)) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (parent.closest("[data-no-translate]"))
          return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    let n = walker.nextNode();
    while (n) {
      nodes.push(n as Text);
      n = walker.nextNode();
    }
    return nodes;
  }, []);

  const translateBatch = useCallback(
    async (texts: string[]): Promise<Record<string, string>> => {
      const missing = texts.filter((t) => !(t in cacheRef.current));
      if (missing.length) {
        // de-dupe
        const unique = Array.from(new Set(missing));
        for (let i = 0; i < unique.length; i += 100) {
          const chunk = unique.slice(i, i + 100);
          try {
            const res = await fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ texts: chunk, target: "tw" }),
            });
            const data = await res.json();
            const translations: string[] = data.translations ?? chunk;
            chunk.forEach((src, idx) => {
              cacheRef.current[src] = translations[idx] ?? src;
            });
          } catch {
            chunk.forEach((src) => {
              cacheRef.current[src] = src;
            });
          }
        }
        persistCache();
      }
      return cacheRef.current;
    },
    [persistCache],
  );

  const applyTwi = useCallback(
    async (root: Node) => {
      const nodes = collectTextNodes(root);
      const placeholders = (root instanceof Element || root instanceof Document
        ? Array.from((root as Element | Document).querySelectorAll("[placeholder]"))
        : []) as Element[];

      const toTranslate: string[] = [];

      nodes.forEach((node) => {
        const raw = node.nodeValue ?? "";
        const trimmed = raw.trim();
        if (!originalsRef.current.has(node)) {
          originalsRef.current.set(node, raw);
        }
        toTranslate.push(trimmed);
      });

      placeholders.forEach((el) => {
        const ph = el.getAttribute("placeholder") ?? "";
        if (ph.trim()) {
          if (!placeholderOriginalsRef.current.has(el)) {
            placeholderOriginalsRef.current.set(el, ph);
          }
          toTranslate.push(ph.trim());
        }
      });

      if (!toTranslate.length) return;
      const cache = await translateBatch(toTranslate);
      if (langRef.current !== "tw") return;

      nodes.forEach((node) => {
        const original = originalsRef.current.get(node) ?? node.nodeValue ?? "";
        const trimmed = original.trim();
        const translated = cache[trimmed];
        if (translated && translated !== trimmed) {
          node.nodeValue = original.replace(trimmed, translated);
        }
      });

      placeholders.forEach((el) => {
        const original = placeholderOriginalsRef.current.get(el) ?? "";
        const translated = cache[original.trim()];
        if (translated) el.setAttribute("placeholder", translated);
      });
    },
    [collectTextNodes, translateBatch],
  );

  const restoreEnglish = useCallback(() => {
    originalsRef.current.forEach((original, node) => {
      try {
        node.nodeValue = original;
      } catch {
        /* node detached */
      }
    });
    placeholderOriginalsRef.current.forEach((original, el) => {
      try {
        el.setAttribute("placeholder", original);
      } catch {
        /* detached */
      }
    });
    originalsRef.current = new Map();
    placeholderOriginalsRef.current = new Map();
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem("cug_lang", next);
    } catch {
      /* ignore */
    }
  }, []);

  // React to language changes
  useEffect(() => {
    langRef.current = lang;

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (lang === "tw") {
      setTranslating(true);
      applyTwi(document.body).finally(() => setTranslating(false));

      const observer = new MutationObserver((mutations) => {
        if (langRef.current !== "tw") return;
        for (const m of mutations) {
          m.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              applyTwi(node);
            } else if (node.nodeType === Node.TEXT_NODE) {
              applyTwi(node.parentElement ?? document.body);
            }
          });
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      observerRef.current = observer;
    } else {
      restoreEnglish();
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, translating }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
