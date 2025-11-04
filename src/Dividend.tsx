"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react"; // ⬅️ 多了 useEffect


// ===== 小工具：格式化 =====
const fmt = (n: number, digits = 2) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);

// ===== Hook：平滑數字跳動（CountUp）=====
function useCountUp(target: number, duration = 600) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = value;
    const delta = target - from;

    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(from + delta * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}

// ===== 元件：結果卡（會微光 + 會跳動）=====
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

  return (
    <motion.div
      key={title + value}
      initial={{ boxShadow: "0 0 0 rgba(0,0,0,0)", scale: 1 }}
      animate={{
        boxShadow: [
          "0 0 0 rgba(0,0,0,0)",
          "0 0 24px rgba(34,197,94,0.12)",
          "0 0 0 rgba(0,0,0,0)",
        ],
        scale: [1, 1.01, 1],
      }}
      transition={{ duration: 0.8 }}
      className="rounded-xl border border-white/10 bg-black/30 p-4 text-center"
    >
      <p className="text-sm text-white/70">{title}</p>
      <p className={`font-mono text-lg mt-1 ${colorClass}`}>{fmt(animated)}</p>
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

  // ===== 工具 =====
  const parseNumber = (str: string) => {
    const cleaned = (str || "").replace(/,/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  // ===== 計算公式 =====
  const calculateProfit = () => {
    const A = parseNumber(inputA);
    const B = parseNumber(inputB);
    const C = parseNumber(inputC);
    const D = parseNumber(inputD);
    const major = parseNumber(majorHold);
    const minor = parseNumber(minorHold);

    if (A < 0 || B <= 0 || D <= 0 || major <= 0 || A > B) {
      return { total: 0, major: 0, minor: 0, valid: false };
    }

    const totalProfit = C * (A / B) * (major / D);
    const minorProfit = minor > 0 && minor <= major ? (totalProfit * minor) / major : 0;
    const majorProfit = totalProfit - minorProfit;

    return { total: totalProfit, major: majorProfit, minor: minorProfit, valid: true };
  };

  const result = calculateProfit();

  // ===== 小元件：欄位與數字卡 =====
 return (
    <section className="relative min-h-screen py-12 md:py-16 px-4 md:px-8 bg-[#0a0a0a] text-white overflow-hidden">
  
    {/* 背景光暈 + 細噪點層 */}
    <div aria-hidden
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_-10%,rgba(255,255,255,.06),transparent)]"
    />
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.08]"
      style={{
        backgroundImage: `url(${noiseUrl})`,
        backgroundRepeat: "repeat",
        backgroundSize: "256px 256px",
        backgroundPosition: "0 0",
      }}
    />

      {/* 標題區（單一版） */}
<div className="max-w-6xl mx-auto">
      {/* Logo 與標題疊加 */}
  <div className="relative w-full flex justify-center items-center mt-10 mb-4">
      {/* 背景 Logo：用 BASE_URL 確保 GitHub Pages 子路徑正常 */}
    <img
      src={logoUrl} // <= 這裡用你上面宣告的 logoUrl
      alt="ATAS Logo"
      className="absolute w-[280px] md:w-[360px] opacity-[0.15] blur-[1px] select-none pointer-events-none"
    />

      {/* 單一標題（放上層） */}
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
        <p className="text-lg md:text-xl text-white/85 font-medium tracking-wider">A ÷ B × C ÷ D × E = F</p>
        <p className="mt-4 text-[17px] md:text-[20px] font-semibold tracking-wide">
          <span className="text-orange-400">10,000,000</span> ÷{" "}
          <span className="text-red-400">50,000,000</span> ×{" "}
          <span className="text-sky-400">40,000,000</span> ÷{" "}
          <span className="text-purple-400">130</span> × <span className="text-emerald-400">60</span> ={" "}
          <span className="text-emerald-400">3,692,307.69</span>
        </p>
      </div>

{/* 表單卡片（雙欄對齊版） */}
<div className="max-w-5xl mx-auto mt-10 md:mt-12 rounded-2xl border border-white/15 bg-white/8 backdrop-blur-sm shadow-xl shadow-black/30 p-6 md:p-8">
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
        className="w-full p-3 rounded-xl bg-zinc-900 text-white border border-white/20 focus:ring-2 focus:ring-emerald-400/60 outline-none"
      />
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
        className="w-full p-3 rounded-xl bg-zinc-900 text-white border border-white/20 focus:ring-2 focus:ring-emerald-400/60 outline-none"
      />
    </div>

    <div>
      <label className="block mb-2">
        <span className="font-semibold">C（淨利潤，可為負數）</span>
        <span className="text-xs text-zinc-400 ml-2">整個 ATAS 所有輸贏計算後的淨利潤</span>
      </label>
      <input
        type="number"
        value={inputC}
        onChange={(e) => setInputC(e.target.value)}
        className={`w-full p-3 rounded-xl outline-none transition placeholder:text-zinc-500 ${
          parseNumber(inputC) < 0
            ? "bg-zinc-900 text-red-400 border border-red-400/40 focus:ring-2 focus:ring-red-500/60"
            : "bg-zinc-900 text-white border border-white/20 focus:ring-2 focus:ring-emerald-400/60"
        }`}
      />
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
        onChange={(e) => setMajorHold(e.target.value)}
        className="w-full p-3 rounded-xl bg-zinc-900 text-white border border-white/20 focus:ring-2 focus:ring-emerald-400/60 outline-none"
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
        onChange={(e) => setMinorHold(e.target.value)}
        className="w-full p-3 rounded-xl bg-zinc-900 text-white border border-white/20 focus:ring-2 focus:ring-emerald-400/60 outline-none"
      />
      {parseNumber(minorHold) > parseNumber(majorHold) && (
        <p className="mt-1 text-xs text-red-400">小股東持股不可大於大股東持股</p>
      )}
    </div>
  </form>

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
  <p className="text-zinc-400 text-xs mt-3 text-center">
    （檢查：大股東 + 小股東 = 總獲利）
  </p>
) : null}

</div>
    </section>
  );
}
