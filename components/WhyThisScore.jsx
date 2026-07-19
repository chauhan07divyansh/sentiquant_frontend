// WhyThisScore.jsx — displays the `why` object from analyze_swing_trading_stock.
// Drop into your components folder. Expects the `why` field from the API:
//   why = { verdict, in_favor[], against[], watch_outs[], context[] }
// Answers Reddit #6 (explain why), #5 (bull/bear disagreement), #7 (plain language).

import React from "react";

export default function WhyThisScore({ why, score, signal }) {
  if (!why) return null;

  const { verdict, in_favor = [], against = [], watch_outs = [], context = [] } = why;

  // Color the verdict headline by direction (matches your score bands)
  const verdictColor =
    score >= 60 ? "text-green-600" :
    score >= 45 ? "text-amber-600" :
    "text-red-600";

  const Row = ({ icon, text, tone }) => (
    <li className="flex gap-2 items-start py-1">
      <span className={`mt-0.5 shrink-0 font-bold ${tone}`}>{icon}</span>
      <span className="text-sm text-gray-700 leading-snug">{text}</span>
    </li>
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900">Why this score?</h3>
        <span className={`text-sm font-semibold ${verdictColor}`}>{verdict}</span>
      </div>

      {/* In favor */}
      {in_favor.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-700 mb-1">
            In its favor
          </p>
          <ul className="space-y-0.5">
            {in_favor.map((t, i) => <Row key={i} icon="+" text={t} tone="text-green-600" />)}
          </ul>
        </div>
      )}

      {/* Against */}
      {against.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700 mb-1">
            Weighing against it
          </p>
          <ul className="space-y-0.5">
            {against.map((t, i) => <Row key={i} icon="−" text={t} tone="text-red-600" />)}
          </ul>
        </div>
      )}

      {/* Watch-outs */}
      {watch_outs.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1">
            Watch out for
          </p>
          <ul className="space-y-0.5">
            {watch_outs.map((t, i) => <Row key={i} icon="!" text={t} tone="text-amber-600" />)}
          </ul>
        </div>
      )}

      {/* Context (muted) */}
      {context.length > 0 && (
        <div>
          <ul className="space-y-0.5">
            {context.map((t, i) => <Row key={i} icon="·" text={t} tone="text-gray-400" />)}
          </ul>
        </div>
      )}

      {/* Honest footer — sets expectations, reinforces transparency */}
      <p className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 leading-relaxed">
        This breakdown shows the main technical and news signals behind the score.
        It’s an explanation of the analysis, not investment advice.
      </p>
    </div>
  );
}

/* ── USAGE ──────────────────────────────────────────────
   On your stock analysis page, wherever you render the score:

     import WhyThisScore from "@/components/WhyThisScore";
     ...
     <WhyThisScore why={data.why} score={data.swing_score} signal={data.trading_plan?.entry_signal} />

   `data` is the object from your analyze endpoint. The `why` field is now
   included automatically by the backend. If an older cached result lacks
   `why`, the component renders nothing (the `if (!why) return null` guard),
   so it degrades gracefully.
─────────────────────────────────────────────────────── */
