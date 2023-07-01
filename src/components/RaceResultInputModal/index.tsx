"use client";

import { useCallback, useMemo, useState } from "react";
import { Portal } from "./portal";
import { Spinner } from "./spinner";

type Props = {
  onClose: (horses: string[]) => void;
};

export const RaceResultInputModal: React.FC<Props> = ({ onClose }) => {
  const [raceId, setRaceId] = useState("");
  const [loading, setLoading] = useState(false);

  const postRaceResult = useCallback(async () => {
    setLoading(true);
    await fetch("/api/races", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        raceId,
      }),
    })
      .then(async (res) => {
        if (res.status !== 200) {
          onClose(["error"]);
          return;
        }

        res
          .json()
          .then((results: { horse: { name: string } }[]) =>
            onClose(results.map((r) => r.horse.name))
          );
      })
      .catch((error) => {
        console.log(error);
        onClose(["error"]);
      });
  }, [raceId, onClose]);

  const canClick = useMemo(() => raceId !== "" && raceId.match(/^\d+$/), [raceId]);

  return (
    <Portal>
      <div
        className="absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-[rgba(0,0,0,0.5)]"
        onClick={() => !loading && onClose([])}
      >
        <div className="h-[300px] w-64 rounded-md bg-slate-50" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-end">
            <button className="btn-ghost btn-square btn text-3xl" onClick={() => onClose([])}>
              ×
            </button>
          </div>

          <div className="flex flex-col px-4">
            <label className="mt-2 flex flex-col">
              <span className="label">レースID</span>
              <input
                type="text"
                onChange={(e) => setRaceId(e.target.value)}
                className="input-bordered input"
              />
            </label>
          </div>

          <div className="my-8 text-center">
            <button
              className="btn-info btn w-[120px] text-slate-50 shadow-md"
              onClick={() => postRaceResult()}
              disabled={!canClick || loading}
            >
              登録する
            </button>
            {loading && <Spinner />}
          </div>
        </div>
      </div>
    </Portal>
  );
};
