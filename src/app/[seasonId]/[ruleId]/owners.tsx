"use client";

import { range } from "@/lib/range";
import type { Owner } from "@prisma/client";
import gsap from "gsap";
import Link from "next/link";
import { createRef, useEffect, useRef } from "react";

type Props = {
  ownerWithPoints: (Owner & { totalPoint: number; totalDuplicateCount: number })[];
  basePath: string;
  isDuplicate: boolean;
};

export const Owners: React.FC<Props> = ({ ownerWithPoints, basePath, isDuplicate }) => {
  const pointRefs = useRef(
    range(0, ownerWithPoints.length - 1).map(() => createRef<HTMLSpanElement>())
  );

  // カウントアップアニメーション
  useEffect(() => {
    const firstPoint = Math.max(
      ...pointRefs.current.map((pointRef) => Math.abs(+(pointRef.current?.dataset.point ?? "0")))
    );
    for (const pointRef of pointRefs.current) {
      const point = +(pointRef.current?.dataset.point ?? "0");
      const obj = { count: 0 };
      gsap.to(obj, {
        count: point,
        ease: "power3.inOut",
        // ポイントに応じてアニメーション時間を変化させる
        duration: 3.6 * (Math.abs(point) / firstPoint),
        onUpdate: () => {
          // アニメーション中の画面遷移を考慮
          if (pointRef.current === null) {
            return;
          }
          pointRef.current.textContent = Math.floor(obj.count).toString();
        },
      });
    }
  }, []);

  return (
    <>
      {ownerWithPoints.map((owner, i) => (
        <Link href={`${basePath}/${owner.id}`} key={`owner-${owner.id}`}>
          <div
            className={`mt-4 flex max-w-sm items-center justify-between px-1 py-4 pb-0 ${
              i === 0
                ? "border-b-8 border-[#f7ef8e]"
                : i === 1
                ? "border-b-4 border-[#cdd5e0]"
                : "border-b-2 border-gray-300"
            }`}
          >
            <div className="card-title">{owner.name}</div>
            <div className="flex flex-row items-center gap-2">
              <div>
                <span
                  className="point font-mono text-xl font-bold"
                  data-point={owner.totalPoint}
                  ref={pointRefs.current[i]}
                >
                  {owner.totalPoint}
                </span>
                <span className="ml-2">ポイント</span>
              </div>
              {isDuplicate && (
                <div>
                  <span className="point font-mono text-xl font-bold">
                    {owner.totalDuplicateCount}
                  </span>
                  <span className="ml-2">被り</span>
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </>
  );
};
