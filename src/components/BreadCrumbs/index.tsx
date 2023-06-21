import Link from "next/link";

type Path = {
  slug: string;
  label: string;
};

type Props = {
  paths: Path[];
};

export const BreadCrumbs: React.FC<Props> = ({ paths }) => {
  const subPaths = paths.reduce((result, path, i) => {
    if (i === 0) {
      result.push(path);
    } else {
      result.push({
        slug: `${result[i - 1].slug}/${path}`,
        label: path.label,
      });
    }

    return result;
  }, [] as Path[]);

  const cuurentPath = subPaths.pop();

  return (
    <div className="breadcrumbs text-sm">
      <ul>
        <li>
          <Link href={"/"}>TOP</Link>
        </li>
        {subPaths.map((path, i) => (
          <li key={`breadcrumb-${i}`}>
            <Link href={path.slug}>{path.label}</Link>
          </li>
        ))}
        <li>{cuurentPath?.label}</li>
      </ul>
    </div>
  );
};
