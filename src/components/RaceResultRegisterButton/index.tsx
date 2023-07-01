"use client";

import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { RaceResultInputModal } from "../RaceResultInputModal";

export const RaceResultRegisterButton: React.FC = () => {
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
      {open && (
        <RaceResultInputModal
          onClose={(horses) => {
            setOpen(false);
            horses.forEach((horse) => {
              if (horse === "error") {
                toast.error("登録エラーです");
              } else {
                toast.success(`${horse}の結果が登録されました`);
              }
            });
          }}
        />
      )}
      <div className="absolute top-64 flex justify-center">
        <Toaster />
      </div>
    </div>
  );
};
