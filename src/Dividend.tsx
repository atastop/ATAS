"use client";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo, useRef } from "react";

// ===== 小工具：格式化（快取 NumberFormat，減少重建）=====
const _formatters = new Map<number, Intl.NumberFormat>();
const fmt = (n: number, digits = 2) => {
  let f = _formatters.get(digits);
  if (!f) {
    f = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    _formatters.set(digits, f);
  }
  return f.format(n);
};


// ===== Hook：平滑數字跳動（CountUp）===== 
function useCountUp(target: number, duration = 600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const from = value; // 使用當前 value 作為初始數字
    const delta = target - from; // 目標數字減去初始數字，得到變化量
    const startTime = performance.now();
    
    const intervalId = setInterval(() => {
      const timeElapsed = performance.now() - startTime;
      if (timeElapsed < duration) {
        setValue(from + (delta * (timeElapsed / duration))); // 按比例更新數字
      } else {
        setValue(target); // 當動畫完成後，直接顯示目標數字
        clearInterval(intervalId); // 清除定時器
      }
    }, 16); // 每 16 毫秒更新一次
    
    return () => clearInterval(intervalId);  // 結束時清除 interval
  }, [target, duration]); // 監聽 target 和 duration 變化

  return value;
}

  // ===== 元件：結果卡（值為負時轉紅色）=====
  function StatCard({
    title,
    value,
    colorClass,
  }: {
    title: string;
    value: number;
    colorClass: string; // e.g. "text-emerald-400"
  }) {
    const animated = useCountUp(value ?? 0, 700);
    const isNegative = value < 0;

    const boxClass =
      isNegative
        ? "border-red-400/40 bg-red-500/10"
        : "border-white/10 bg-background-black";

    const valueClass =
      isNegative ? "text-red-400" : colorClass;

    return (
      <motion.div
        key={title + value}
        initial={{ boxShadow: "0 0 0 rgba(0,0,0,0)", scale: 1 }}
        animate={{
          boxShadow: [
            "0 0 0 rgba(0,0,0,0)",
            isNegative ? "0 0 24px rgba(248,113,113,0.20)" : "0 0 24px rgba(34,197,94,0.12)",
            "0 0 0 rgba(0,0,0,0)",
          ],
          scale: [1, 1.01, 1],
        }}
        transition={{ duration: 0.8 }}
        className={`rounded-xl border p-4 text-center transition-colors ${boxClass}`}
      >
        <p className="text-sm text-text-white-light">{title}</p>
        <p className={`font-mono text-lg mt-1 ${valueClass}`}>{fmt(animated)}</p>
      </motion.div>
    );
  }

export default function Dividend() {
  // ===== 狀態 =====
  const logoUrl = import.meta.env.BASE_URL + "atas-logo.png";
  const noiseUrl = import.meta.env.BASE_URL + "noise.png";
  const [inputA, setInputA] = useState("10000000");
  const [inputB, setInputB] = useState("50000000");
  const [inputC, setInputC] = useState("40000000");
  const inputD = "130"; // 固定
  const [majorHold, setMajorHold] = useState("60");
  const [minorHold, setMinorHold] = useState("0");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);


    // 把目前狀態做成網址參數字串
  const buildQueryString = () =>
    new URLSearchParams({
      a: inputA, b: inputB, c: inputC, d: inputD,
      major: majorHold, minor: minorHold,
    }).toString();

    const syncTimer = useRef<number | null>(null);

    useEffect(() => {
      // 防抖：400ms 內最後一次變動才寫入網址
      if (syncTimer.current) window.clearTimeout(syncTimer.current);
      syncTimer.current = window.setTimeout(() => {
        const qs = buildQueryString();
        const url = `${location.pathname}?${qs}`;
        history.replaceState(null, "", url);
      }, 400);

      return () => {
        if (syncTimer.current) window.clearTimeout(syncTimer.current);
      };
      // 監聽所有會影響網址的欄位
    }, [inputA, inputB, inputC, inputD, majorHold, minorHold]);

  // ===== 業務設定（可調）=====
  const MIN_RESERVE = 5; // 大股東至少需保留的股數（以後改這裡就好）


  // 驗證小股東持股邏輯：>大股東 = 錯誤；差額 < MIN_RESERVE = 警告
  const validateMinorHold = () => {
  const major = parseNumber(majorHold);
  const minor = parseNumber(minorHold);

  if (minor > major) {
    return { valid: false, warn: false, message: "小股東持股不可大於大股東持股" };
  }
  if (minor > 0 && major - minor < MIN_RESERVE) {
    // 例：major=60, minor=56~60 → 差額 < 5
    return { valid: true, warn: true, message: `⚠ 大股東需保留至少 ${MIN_RESERVE} 股` };
  }
  return { valid: true, warn: false, message: "" };
};
  
// ===== 輸入淨化與夾限 =====
  const toInt = (str: string) => {
  const n = Math.floor(parseNumber(str));
  return isNaN(n) ? 0 : Math.max(0, n);
};
  const toIntAllowNegative = (str: string) => {
  const n = Math.floor(parseNumber(str));
  return isNaN(n) ? 0 : n; // 可為負
};
// 大股東不可超過 D
useEffect(() => {
  const major = toInt(majorHold);
  const d = toInt(inputD);
  if (major > d) setMajorHold(String(d));
}, [majorHold, inputD]);

// 小股東不可超過大股東
useEffect(() => {
  const minor = toInt(minorHold);
  const major = toInt(majorHold);
  if (minor > major) setMinorHold(String(major));
}, [minorHold, majorHold]);


  // ===== 工具 =====
  const parseNumber = (str: string) => {
    const cleaned = (str || "").replace(/,/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  // ===== 佔比（A/B）計算，0~100 夾限 =====
  const ratioAB = useMemo(() => {
  const A = parseNumber(inputA);
  const B = parseNumber(inputB);
  if (B <= 0) return 0;
  const r = (A / B) * 100;
  return Math.max(0, Math.min(100, r));
}, [inputA, inputB]);


  // ===== 計算公式 =====
    const calculateProfit = () => {
    const A = parseNumber(inputA);
    const B = parseNumber(inputB);
    const C = parseNumber(inputC);
    const D = parseNumber(inputD);
    const major = parseNumber(majorHold);
    const minor = parseNumber(minorHold);

    if (A <= 0 || B <= 0 || D <= 0 || major <= 0 || A > B) {
      return { total: 0, major: 0, minor: 0, valid: false };
    }

    const totalProfit = C * (A / B) * (major / D);
    const minorProfit = minor > 0 && minor <= major ? (totalProfit * minor) / major : 0;
    const majorProfit = totalProfit - minorProfit;

    return { total: totalProfit, major: majorProfit, minor: minorProfit, valid: true };
  };

    const result = useMemo(calculateProfit, [inputA, inputB, inputC, inputD, majorHold, minorHold]); 

  // ===== 初始：如果網址帶參數就還原狀態 =====
useEffect(() => {
  const q = new URLSearchParams(location.search);
  const a = q.get("a"); 
  const b = q.get("b"); 
  const c = q.get("c");
  const major = q.get("major"); 
  const minor = q.get("minor");

  if (a) setInputA(a);
  if (b) setInputB(b);
  if (c) setInputC(c);
  // d 是固定 130（inputD 常數），不覆蓋
  if (major) setMajorHold(major);
  if (minor) setMinorHold(minor);
}, []);

  // ===== 小元件：欄位與數字卡 =====
 return (
    <section className="relative min-h-screen py-12 md:py-16 px-4 md:px-8 bg-[#0a0a0a] text-white overflow-hidden">
  
    {/* 背景光暈 + 細噪點層 */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0
             bg-[radial-gradient(80%_60%_at_50%_0%,rgba(255,255,255,.12),transparent)]"
    />

    {/* 噪點層（不混合，改用透明度） */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-10"
      style={{
      backgroundImage: `url(${noiseUrl})`,
      backgroundRepeat: "repeat",
      backgroundSize: "256px 256px",
    }}
    />
      {/* 標題區（單一版） */}
<div className="max-w-6xl mx-auto">
      {/* Logo 與標題疊加（更穩定） */}
<div className="relative isolate w-full flex justify-center items-center mt-10 mb-4">
  {/* 背景 Logo */}
  <img
    src={logoUrl}
    alt=""
    aria-hidden="true"
    className="absolute z-0 w-[260px] md:w-[360px] opacity-[0.16] md:blur-[1px] pointer-events-none select-none"
    style={{ WebkitFilter: 'blur(0px)' }} // iOS 小螢幕避免 blur 問題
    loading="eager"
    decoding="sync"
  />

  {/* 標題 */}
  <motion.h1
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="relative z-10 text-[clamp(28px,4.6vw,44px)] font-semibold tracking-wide text-white text-center"
  >
    股份試算（核心公式）
  </motion.h1>
</div>

  {/* 副標（只保留一份） */}
  <motion.p
    initial={{ opacity: 0, y: 6 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: 0.05 }}
    className="mt-2 text-zinc-300 text-sm md:text-base text-center"
  >
    ATAS 股份分紅模擬器，用以展示平台分潤邏輯與股東收益分配方式。
  </motion.p>
</div>

      {/* 假設卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-6xl mx-auto mt-8 md:mt-10 rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-sm shadow-lg shadow-black/30"
      >
        <div className="p-6 md:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-6 w-1.5 rounded-full bg-emerald-400/80" />
            <p className="text-white/90 font-semibold tracking-wide">假設</p>
            <span className="ml-auto text-xs text-white/50">示範數據</span>
          </div>

          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { k: "A = 您這條線營業額", v: "10,000,000", tone: "orange" },
              { k: "B = 公司總營業額", v: "50,000,000", tone: "red" },
              { k: "C = 平台淨利潤", v: "40,000,000", tone: "sky" },
              { k: "D = 總股份", v: "130 股", tone: "purple" },
              { k: "E = 您持有", v: "60 股", tone: "emerald", span2: true },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex items-center justify-between rounded-xl bg-black/20 px-4 py-3 border border-white/10 ${
                  item.span2 ? "md:col-span-2" : ""
                }`}
              >
                <dt className="text-white/80">{item.k}</dt>
                <dd>
                  <span
                    className={`inline-flex items-center rounded-lg px-2.5 py-1 text-sm font-mono font-semibold ${
                      item.tone === "orange"
                        ? "bg-orange-400/15 text-orange-300"
                        : item.tone === "red"
                        ? "bg-red-400/15 text-red-300"
                        : item.tone === "sky"
                        ? "bg-sky-400/15 text-sky-300"
                        : item.tone === "purple"
                        ? "bg-purple-400/15 text-purple-300"
                        : "bg-emerald-400/15 text-emerald-300"
                    }`}
                  >
                    {item.v}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </motion.div>

      {/* 公式展示 */}
      <div className="max-w-6xl mx-auto text-center mt-10 md:mt-12">
      <p className="text-lg md:text-xl text-white/[0.85] font-medium tracking-wider">A ÷ B × C ÷ D × E = F</p>
        <p className="mt-4 text-[17px] md:text-[20px] font-semibold tracking-wide">
          <span className="text-orange-400">10,000,000</span> ÷{" "}
          <span className="text-red-400">50,000,000</span> ×{" "}
          <span className="text-sky-400">40,000,000</span> ÷{" "}
          <span className="text-purple-400">130</span> × <span className="text-emerald-400">60</span> ={" "}
          <span className="text-emerald-400">3,692,307.69</span>
        </p>
      </div>

{/* 表單卡片（雙欄對齊版） */}
<div className="max-w-5xl mx-auto mt-10 md:mt-12 rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-sm shadow-xl shadow-black/30 p-6 md:p-8">
  <h3 className="text-center text-2xl md:text-3xl font-semibold mb-6">股東獲利試算</h3>

  <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label className="block mb-2">
        <span className="font-semibold">A（股東營業額）</span>
        <span className="text-xs text-zinc-400 ml-2">整條線整體的打碼量</span>
      </label>
          <input
            type="number"
            value={inputA}
            onChange={(e) => setInputA(e.target.value)}
            onFocus={() => setFocusedField("A")}
            onBlur={() => setFocusedField(null)}
            className={`w-full p-3 rounded-xl bg-zinc-900 text-white border outline-none transition-all duration-300
              ${
                focusedField === "A"
                  ? "border-emerald-400/80 ring-2 ring-emerald-400/30"
                  : "border-white/20"
              }`}
          />

      <p className="mt-1 text-xs text-zinc-400">
      預覽：{fmt(parseNumber(inputA), 0)}
      </p>
     </div>

    <div>
      <label className="block mb-2">
        <span className="font-semibold">B（總營業額）</span>
        <span className="text-xs text-zinc-400 ml-2">整個 ATAS 所有玩家的打碼量</span>
      </label>
      <input
        type="number"
        value={inputB}
        onChange={(e) => setInputB(e.target.value)}
        onFocus={() => setFocusedField("B")}
        onBlur={() => setFocusedField(null)}
        className={`w-full p-3 rounded-xl bg-zinc-900 text-white border outline-none transition-all duration-300
          ${
            focusedField === "B"
              ? "border-emerald-400/80 ring-2 ring-emerald-400/30"
              : "border-white/20"
          }`}
      />

      <p className="mt-1 text-xs text-zinc-400">
      預覽：{fmt(parseNumber(inputB), 0)}
      </p>

      {parseNumber(inputA) > parseNumber(inputB) && (
      <p className="mt-1 text-xs text-red-400">⚠ A 不能大於 B，請確認數值。</p>
      )}
    {/* 進度條（A/B） */}
    <div className="mt-2">
      <div className="h-2.5 w-full rounded-full bg-white/[0.06] overflow-hidden border border-white/10">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-sky-400 transition-all duration-700 ease-out"
          style={{ width: `${ratioAB}%` }}
          aria-label="A/B 佔比進度條"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Number.isFinite(ratioAB) ? Number(ratioAB.toFixed(2)) : 0}
          role="progressbar"
        />
      </div>
      <div className="mt-1 text-[11px] text-zinc-400">
        佔比：{ratioAB.toFixed(2)}%
        </div>
      </div>
    </div>

    <div>
      <label className="block mb-2">
        <span className="font-semibold">C（淨利潤，可為負數）</span>
        <span className="text-xs text-zinc-400 ml-2">整個 ATAS 所有輸贏計算後的淨利潤</span>
      </label>
      <input
        type="text" // 改成 text，允許「-」開頭
        value={inputC}
        onChange={(e) => {
          const val = e.target.value.trim();

          // ✅ 若只輸入 "-" 或空白，暫時保留不轉數字
          if (val === "" || val === "-") {
            setInputC(val);
            return;
          }

          // ✅ 其他情況才轉為數字
          setInputC(String(toIntAllowNegative(val)));
        }}
        onFocus={() => setFocusedField("C")}
        onBlur={() => setFocusedField(null)}
        className={`w-full p-3 rounded-xl bg-zinc-900 text-white border outline-none transition-all duration-300
          ${
            focusedField === "C"
              ? "border-emerald-400/80 ring-2 ring-emerald-400/30"
              : "border-white/20"
          }`}
      />


      <p className="mt-1 text-xs text-zinc-400">
      預覽：{fmt(parseNumber(inputC), 0)}
      </p>

      <p className="mt-1 text-xs text-zinc-400">
        提醒：C 可為負數（整體輸贏後的淨利），為負時卡片數字會跟著變動。
      </p>

    </div>

    <div>
      <label className="block mb-2">
        <span className="font-semibold">D（股份總數）</span>
        <span className="text-xs text-zinc-400 ml-2">固定為 130 股，不會調整</span>
      </label>
      <input
        type="number"
        value={inputD}
        disabled
        className="w-full p-3 rounded-xl bg-zinc-800 text-zinc-300 border border-white/20 outline-none"
      />
    </div>

    <div>
      <label className="block mb-2">
        <span className="font-semibold">大股東持股</span>
        <span className="text-xs text-zinc-400 ml-2">此線大股東擁有的股數</span>
      </label>
      <input
        type="number"
        value={majorHold}
        onChange={(e) => setMajorHold(String(toInt(e.target.value)))}
        onFocus={() => setFocusedField("major")}
        onBlur={() => setFocusedField(null)}
        className={`w-full p-3 rounded-xl bg-zinc-900 text-white border outline-none transition-all duration-300
          ${
            focusedField === "major"
              ? "border-emerald-400/80 ring-2 ring-emerald-400/30"
              : "border-white/20"
          }`}
      />
    </div>

    <div>
      <label className="block mb-2">
        <span className="font-semibold">小股東持股</span>
        <span className="text-xs text-zinc-400 ml-2">從大股東持股中分出的小股東股數</span>
      </label>
      <input
        type="number"
        value={minorHold}
        onChange={(e) => setMinorHold(String(toInt(e.target.value)))}
        onFocus={() => setFocusedField("minor")}
        onBlur={() => setFocusedField(null)}
        className={`w-full p-3 rounded-xl bg-zinc-900 text-white border outline-none transition-all duration-300
          ${(() => {
            const c = validateMinorHold();
            if (!c.valid) return focusedField === "minor"
              ? "border-red-400/80 ring-2 ring-red-400/30"
              : "border-red-400/60";
            if (c.warn)  return focusedField === "minor"
              ? "border-amber-400/80 ring-2 ring-amber-400/30"
              : "border-amber-400/50";
            return focusedField === "minor"
              ? "border-emerald-400/80 ring-2 ring-emerald-400/30"
              : "border-white/20";
          })()}`}
      />

        {(() => {
    const check = validateMinorHold();
    if (!check.valid) {
      return <p className="mt-1 text-xs text-red-400">{check.message}</p>;
    }
    if (check.warn) {
      return <p className="mt-1 text-xs text-amber-400">{check.message}</p>;
    }
    return null;
  })()}
    </div>
  </form>

  {/* 快速操作 */}
<div className="mt-6 flex flex-wrap items-center gap-3">
  <button
    type="button"
    onClick={() => {
      setInputA("10000000");
      setInputB("50000000");
      setInputC("40000000");
      // inputD 固定 130，不動
      setMajorHold("60");
      setMinorHold("0");
    }}
    className="px-3 py-2 rounded-lg border border-white/15 bg-white/10 hover:bg-white/15"
  >
    ↺ 重置為示範值
  </button>

  <div className="text-xs text-zinc-400 ml-2">常用預設：</div>
  <div className="flex flex-wrap gap-2">
    {[
      { label: "60/55", major: "60", minor: "55" },
      { label: "60/50", major: "60", minor: "50" },
      { label: "90/80", major: "90", minor: "80" },
    ].map((p) => (
      <button
        key={p.label}
        type="button"
        onClick={() => { setMajorHold(p.major); setMinorHold(p.minor); }}
        className="px-2.5 py-1.5 rounded-md border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] text-xs"
      >
        {p.label}
      </button>
    ))}
  </div>
</div>

  {/* 結果顯示（三等分 + 動畫） */}
<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
  {result.valid ? (
    <>
      <StatCard title="總獲利" value={result.total} colorClass="text-emerald-400" />
      <StatCard title="大股東獲利" value={result.major} colorClass="text-sky-400" />
      <StatCard title="小股東獲利" value={result.minor} colorClass="text-amber-300" />
    </>
  ) : (
    <div className="md:col-span-3 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-center text-red-300">
      ⚠ 無效輸入，請確認 A ≤ B、持股數為正，且 D {">"} 0
    </div>
  )}
</div>

{result.valid ? (
  <>
    <p className="text-zinc-400 text-xs mt-3 text-center">
      （檢查：大股東 + 小股東 = 總獲利）
    </p>

    {/* ←← 移到 p 外面 */}
    <div className="mt-4 flex justify-center">
      <button
        onClick={() => {
          const p = new URLSearchParams({
            a: inputA, b: inputB, c: inputC, d: inputD,
            major: majorHold, minor: minorHold,
          }).toString();
          const url = `${location.origin}${import.meta.env.BASE_URL}?${p}`;
          navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          });
        }}
        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15"
      >
        🔗 複製目前試算連結
      </button>
    </div>
  </>
) : null}

</div>
    {copied && (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg
                      bg-emerald-500/90 text-white text-sm shadow-lg shadow-emerald-500/30
                      animate-in fade-in zoom-in duration-200">
        ✅ 已複製分享連結
      </div>
    )}

    </section>
  );
}
