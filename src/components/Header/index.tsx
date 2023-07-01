import Link from "next/link";

export const Header: React.FC = () => {
  return (
    <header className="navbar sticky left-0 top-0 z-50 bg-[rgb(0,0,30)] text-neutral-content shadow-md shadow-gray-700">
      <Link
        href={"/"}
        className="inline-flex cursor-pointer items-center justify-center text-center text-xl font-bold normal-case text-white"
      >
        {
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/android-chrome-512x512.png"
            alt="icon"
            className="no-animation absolute left-2 top-0 h-[64px] w-[64px]"
          />
        }
        <span className="ml-[68px]">おうちPOG</span>
      </Link>
    </header>
  );
};
