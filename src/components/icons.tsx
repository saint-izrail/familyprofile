// Set ikon SVG inline (stroke konsisten). Semua dekoratif kecuali diberi label.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
    ...props,
  };
}

export const IconHome = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M10 21v-6h4v6" /></svg>
);
export const IconTree = (p: IconProps) => (
  <svg {...base(p)}><rect x="9" y="3" width="6" height="4" rx="1" /><rect x="3" y="17" width="6" height="4" rx="1" /><rect x="15" y="17" width="6" height="4" rx="1" /><path d="M12 7v4M6 17v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M12 11v2" /></svg>
);
export const IconList = (p: IconProps) => (
  <svg {...base(p)}><path d="M9 6h12M9 12h12M9 18h12" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></svg>
);
export const IconUsers = (p: IconProps) => (
  <svg {...base(p)}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
export const IconUser = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);
export const IconPhoto = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="m21 16-5-5L5 21" /></svg>
);
export const IconPlus = (p: IconProps) => (<svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>);
export const IconEdit = (p: IconProps) => (<svg {...base(p)}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>);
export const IconTrash = (p: IconProps) => (<svg {...base(p)}><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M10 11v6M14 11v6" /></svg>);
export const IconSearch = (p: IconProps) => (<svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>);
export const IconSun = (p: IconProps) => (<svg {...base(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>);
export const IconMoon = (p: IconProps) => (<svg {...base(p)}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" /></svg>);
export const IconChevronRight = (p: IconProps) => (<svg {...base(p)}><path d="m9 6 6 6-6 6" /></svg>);
export const IconChevronDown = (p: IconProps) => (<svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>);
export const IconArrowRight = (p: IconProps) => (<svg {...base(p)}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>);
export const IconArrowLeft = (p: IconProps) => (<svg {...base(p)}><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>);
export const IconZoomIn = (p: IconProps) => (<svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3M11 8v6M8 11h6" /></svg>);
export const IconZoomOut = (p: IconProps) => (<svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3M8 11h6" /></svg>);
export const IconExpand = (p: IconProps) => (<svg {...base(p)}><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>);
export const IconHeart = (p: IconProps) => (<svg {...base(p)}><path d="M12 21s-7-4.6-9.4-8.4C1 9.8 2.3 6.5 5.5 6.5c1.9 0 3.2 1.1 3.9 2.2C10.1 7.6 11.4 6.5 13.3 6.5c3.2 0 4.5 3.3 2.9 6.1C20.6 16.4 12 21 12 21Z" /></svg>);
export const IconSparkle = (p: IconProps) => (<svg {...base(p)}><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="M12 7c.6 2.8 2.2 4.4 5 5-2.8.6-4.4 2.2-5 5-.6-2.8-2.2-4.4-5-5 2.8-.6 4.4-2.2 5-5Z" /></svg>);
export const IconLock = (p: IconProps) => (<svg {...base(p)}><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>);
export const IconUpload = (p: IconProps) => (<svg {...base(p)}><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></svg>);
export const IconClose = (p: IconProps) => (<svg {...base(p)}><path d="M18 6 6 18M6 6l12 12" /></svg>);
export const IconExternal = (p: IconProps) => (<svg {...base(p)}><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></svg>);
export const IconCalendar = (p: IconProps) => (<svg {...base(p)}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>);
export const IconCheck = (p: IconProps) => (<svg {...base(p)}><path d="M20 6 9 17l-5-5" /></svg>);
export const IconLogout = (p: IconProps) => (<svg {...base(p)}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>);
export const IconMenu = (p: IconProps) => (<svg {...base(p)}><path d="M4 6h16M4 12h16M4 18h16" /></svg>);
export const IconCrown = (p: IconProps) => (<svg {...base(p)}><path d="M3 8l3.5 9h11L21 8l-5 4-4-6-4 6-5-4Z" /><path d="M5 20h14" /></svg>);
export const IconLeaf = (p: IconProps) => (<svg {...base(p)}><path d="M11 20A7 7 0 0 1 4 13c0-5 4.5-9 16-9 0 9-4 16-9 16Z" /><path d="M4 20c4-6 7-8 12-9" /></svg>);
