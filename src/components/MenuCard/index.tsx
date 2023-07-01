import Link from "next/link";
import { ComponentProps } from "react";

type Props = {
  to: ComponentProps<typeof Link>["href"];
  title: string;
  strokeColor: string;
  strokeStyle: "solid" | "dotted";
};

export const MenuCard: React.FC<Props> = ({
  to,
  title,
  strokeColor = "bg-gray-500",
  strokeStyle,
}) => (
  <Link href={to}>
    <div className={`card max-w-sm shadow-xl`}>
      <div className="card-body flex-row items-center pl-5">
        <div className={`h-10 border-l-4 border-${strokeStyle} ${strokeColor}`} />
        <h2 className="card-title">{title}</h2>
      </div>
    </div>
  </Link>
);
