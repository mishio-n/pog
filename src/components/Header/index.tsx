import Link from "next/link";

export const Header: React.FC = () => {
  return (
    <header className="navbar sticky left-0 top-0 z-50 bg-neutral text-neutral-content shadow-md shadow-gray-700">
      <Link href={"/"} className="btn-ghost no-animation btn text-xl normal-case text-white">
        おうちPOG
      </Link>
    </header>
  );
};
