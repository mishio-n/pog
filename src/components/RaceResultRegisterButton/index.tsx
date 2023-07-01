"use client";

import { useState } from "react";
import { RaceForm } from "../RaceResultInputModal";

const RaceResultButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen((p) => !p)}
        className="btn flex items-center rounded-full border-none bg-slate-50 px-3 py-0 shadow-sm shadow-slate-50"
      >
        <span className="text-lg text-transparent text-shadow">&#9999;&#65039;</span>
        <span className="font-bold text-accent">レース結果</span>
      </button>
      {open && <RaceForm onClose={() => setOpen(false)} />}
    </div>
  );
};

export default RaceResultButton;
