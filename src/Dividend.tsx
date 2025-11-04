import { motion } from "framer-motion";
import { useState } from "react";

export default function Dividend() {
  // ===== 狀態 =====
  const [inputA, setInputA] = useState("10000000");
  const [inputB, setInputB] = useState("50000000");
  const [inputC, setInputC] = useState("40000000");
  const [inputD] = useState("130"); // 固定
  const [majorHold, setMajorHold] = useState("60");
  const [minorHold, setMinorHold] = useState("0");

  // ===== 工具 =====
  const parseNumber = (str: string) => {
    const cleaned = (str || "").replace(/,/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };
  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      num
    );

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
    const totalProfit = (C * (A / B)) * (major / D);
    const minorProfit = minor > 0 && minor <= major ? (totalProfit * minor) / major : 0;
    const majorProfit = totalProfit - minorProfit;
    return { total: totalProfit, major: majorProfit, minor: minorProfit, valid: true };
  };

  const result = calculateProfit();

  return (
    <section className="relative min-h-screen py-12 md:py-16 px-4 md:px-8 bg-[#0a0a0a] text-white">
      {/* 標題 */}
      <div className="max-w-5xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-[clamp(28px,4.6vw,44px)] font-semibold tracking-wide"
        >
          股份分紅（核心公式）
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-2 text-zinc-300 text-sm md:text-base"
        >
          除了返水，股東還能參與「股份分紅」，與整體平台淨利掛勾。
        </motion.p>
      </div>

{/* 假設卡片（優化版） */}
<motion.div
  initial={{ opacity: 0, y: 10 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5, delay: 0.1 }}
  className="max-w-5xl mx-auto mt-8 md:mt-10 rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-sm shadow-lg shadow-black/30"
>
  <div className="p-6 md:p-8">
    {/* 標題列 */}
    <div className="mb-5 flex items-center gap-3">
      <div className="h-6 w-1.5 rounded-full bg-emerald-400/80" />
      <p className="text-white/90 font-semibold tracking-wide">假設</p>
      <span className="ml-auto text-xs text-white/50">示範數據</span>
    </div>

    {/* 清單：手機一欄／桌機兩欄 */}
    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* A */}
      <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3 border border-white/10">
        <dt className="text-white/80">A = 您這條線營業額</dt>
        <dd>
          <span className="inline-flex items-center rounded-lg bg-orange-400/15 text-orange-300 px-2.5 py-1 text-sm font-mono font-semibold">
            10,000,000
          </span>
        </dd>
      </div>

      {/* B */}
      <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3 border border-white/10">
        <dt className="text-white/80">B = 公司總營業額</dt>
        <dd>
          <span className="inline-flex items-center rounded-lg bg-red-400/15 text-red-300 px-2.5 py-1 text-sm font-mono font-semibold">
            50,000,000
          </span>
        </dd>
      </div>

      {/* C */}
      <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3 border border-white/10">
        <dt className="text-white/80">C = 平台淨利潤</dt>
        <dd>
          <span className="inline-flex items-center rounded-lg bg-sky-400/15 text-sky-300 px-2.5 py-1 text-sm font-mono font-semibold">
            40,000,000
          </span>
        </dd>
      </div>

      {/* D */}
      <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3 border border-white/10">
        <dt className="text-white/80">D = 總股份</dt>
        <dd>
          <span className="inline-flex items-center rounded-lg bg-purple-400/15 text-purple-300 px-2.5 py-1 text-sm font-semibold">
            <span className="font-mono mr-1">130</span>股
          </span>
        </dd>
      </div>

      {/* E（佔一欄，若想要置左可移除 md:col-span-2） */}
      <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3 border border-white/10 md:col-span-2">
        <dt className="text-white/80">E = 您持有</dt>
        <dd>
          <span className="inline-flex items-center rounded-lg bg-emerald-400/15 text-emerald-300 px-2.5 py-1 text-sm font-semibold">
            <span className="font-mono mr-1">60</span>股
          </span>
        </dd>
      </div>
    </dl>
  </div>
</motion.div>


      {/* 公式 */}
      <div className="max-w-5xl mx-auto text-center mt-10 md:mt-12">
        <p className="text-lg md:text-xl text-white/85 font-medium tracking-wider">
          A ÷ B × C ÷ D × E = F
        </p>
        <p className="mt-4 text-[17px] md:text-[20px] font-semibold tracking-wide">
          <span className="text-orange-400">10,000,000</span> ÷{" "}
          <span className="text-red-400">50,000,000</span> ×{" "}
          <span className="text-sky-400">40,000,000</span> ÷{" "}
          <span className="text-purple-400">130</span> ×{" "}
          <span className="text-emerald-400">60</span> ={" "}
          <span className="text-emerald-400">3,692,307.69</span>
        </p>
      </div>

      {/* 表單卡片 */}
      <div className="max-w-5xl mx-auto mt-10 md:mt-12 rounded-2xl border border-white/15 bg-white/8 backdrop-blur-sm shadow-xl shadow-black/30 p-6 md:p-8">
        <h3 className="text-center text-2xl md:text-3xl font-semibold mb-6">股東獲利試算</h3>

        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              label: "A（股東營業額）",
              hint: "整條線整體的打碼量",
              value: inputA,
              set: setInputA,
              col: "md:col-span-1",
            },
            {
              label: "B（總營業額）",
              hint: "整個 ATAS 所有玩家的打碼量",
              value: inputB,
              set: setInputB,
              col: "md:col-span-1",
            },
            {
              label: "C（淨利潤，可為負數）",
              hint: "整個 ATAS 所有輸贏計算後的淨利潤",
              value: inputC,
              set: setInputC,
              negative: parseNumber(inputC) < 0,
              col: "md:col-span-2",
            },
            {
              label: "D（股份總數）",
              hint: "固定為 130 股，不會調整",
              value: inputD,
              disabled: true,
              col: "md:col-span-1",
            },
            {
              label: "大股東持股",
              hint: "此線大股東擁有的股數",
              value: majorHold,
              set: setMajorHold,
              col: "md:col-span-1",
            },
            {
              label: "小股東持股",
              hint: "從大股東持股中分出的小股東股數",
              value: minorHold,
              set: setMinorHold,
              col: "md:col-span-2",
            },
          ].map((f, i) => (
            <div key={i} className={f.col}>
              <label className="block mb-2">
                <span className="font-semibold">{f.label}</span>
                <span className="text-xs text-zinc-400 ml-2">{f.hint}</span>
              </label>
              <input
                type="number"
                className={`w-full p-3 rounded-xl outline-none transition placeholder:text-zinc-500
                ${f.disabled
                    ? "bg-zinc-800 text-zinc-300 border border-white/20"
                    : f.negative
                      ? "bg-zinc-900 text-red-400 border border-red-400/40 focus:ring-2 focus:ring-red-500/60"
                      : "bg-zinc-900 text-white border border-white/20 focus:ring-2 focus:ring-emerald-400/60"
                  }`}
                value={f.value}
                onChange={(e) => f.set?.(e.target.value)}
                disabled={f.disabled}
              />
            </div>
          ))}
        </form>

        {/* 計算結果 */}
        <div className="mt-8 text-center text-base md:text-lg font-semibold">
          {result.valid ? (
            <>
              <p>
                總獲利 = <span className="text-emerald-400">{formatNumber(result.total)}</span>
              </p>
              <p className="mt-1">
                大股東獲利 = <span className="text-sky-400">{formatNumber(result.major)}</span>
              </p>
              <p className="mt-1">
                小股東獲利 = <span className="text-yellow-300">{formatNumber(result.minor)}</span>
              </p>
              <p className="text-zinc-400 text-xs mt-2">（檢查：大股東 + 小股東 = 總獲利）</p>
            </>
          ) : (
            <p className="text-red-500">⚠ 無效輸入，請確認 A ≤ B 且持股數正確</p>
          )}
        </div>
      </div>
    </section>
  );
}
