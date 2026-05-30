// Daftar silsilah bertingkat (mirip outline bernomor). Server component.
import Link from "next/link";
import type { TreeMember } from "@/lib/members";

const STYLES = [
  "text-lg md:text-xl font-extrabold gold-text font-serif",
  "text-base font-bold text-primary-deep",
  "text-[15px] font-semibold text-secondary",
  "text-sm font-medium text-ink",
];

function Row({ m, depth }: { m: TreeMember; depth: number }) {
  const cls = STYLES[Math.min(depth, STYLES.length - 1)];
  return (
    <li>
      <Link
        href={`/anggota/${m.id}`}
        style={{ paddingLeft: `${depth * 1.4}rem` }}
        className="group flex items-baseline gap-2 rounded-lg py-1.5 pr-2 transition-colors hover:bg-primary/5"
      >
        {m.number && (
          <span className="shrink-0 font-mono text-xs text-muted">{m.number}</span>
        )}
        <span className={`${cls} underline-offset-2 decoration-gold/50 group-hover:underline`}>
          {m.name}
          {m.spouseName && ` + ${m.spouseName}`}
          {m.isDeceased && <span className="font-normal text-muted"> (alm)</span>}
        </span>
      </Link>
      {m.children.length > 0 && (
        <ul>
          {m.children.map((c) => (
            <Row key={c.id} m={c} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function MemberList({ roots }: { roots: TreeMember[] }) {
  return (
    <ul className="flex flex-col">
      {roots.map((r) => (
        <Row key={r.id} m={r} depth={0} />
      ))}
    </ul>
  );
}
