import type { ComponentType } from "react";
import { HandIcon, type IconProps } from "./hand-icon";

export function SearchIcon({ className }: IconProps) {
  return (
    <HandIcon name="search" className={className}>
      <g data-part="lens">
        <path d="M10.6 4.2c3.5-.2 6.3 2.6 6.2 6.1-.1 3.4-2.9 6.2-6.4 6.1-3.4-.1-6.1-2.9-6-6.3.1-3.2 2.8-5.8 6.2-5.9" />
        <path d="M15.4 15.6c1.5 1.4 3 2.9 4.6 4.5" />
      </g>
    </HandIcon>
  );
}

export function BookIcon({ className }: IconProps) {
  return (
    <HandIcon name="book" className={className}>
      <path data-part="left" d="M12 6.9C9.2 5.2 6.2 4.8 3.2 5.6v12.5c3-.8 6-.4 8.8 1.3" />
      <path data-part="right" d="M12 6.9c2.8-1.7 5.8-2.1 8.8-1.3v12.5c-3-.8-6-.4-8.8 1.3V6.9" />
    </HandIcon>
  );
}

export function FolderIcon({ className }: IconProps) {
  return (
    <HandIcon name="folder" className={className}>
      <path d="M3.4 7.8v10.4c0 .9.6 1.5 1.5 1.5h14.3c.9 0 1.5-.6 1.5-1.5V9.6c0-.9-.6-1.5-1.5-1.5h-7.4L10 5.6c-.3-.4-.7-.6-1.2-.6H4.9c-.9 0-1.5.6-1.5 1.5z" />
      <path data-part="lid" d="M3.6 10.8c5.6-.4 11.3-.3 16.9.1" />
    </HandIcon>
  );
}

export function ChevronIcon({ className }: IconProps) {
  return (
    <HandIcon name="chevron" className={className}>
      <path d="M6.2 9.4c2 1.9 3.9 3.8 5.8 5.8 2-2 3.9-3.9 5.8-5.8" />
    </HandIcon>
  );
}

export function HouseIcon({ className }: IconProps) {
  return (
    <HandIcon name="house" className={className}>
      <path data-part="roof" d="M3.4 11.2C6.3 8.8 9.1 6.4 12 4.1c2.9 2.4 5.8 4.8 8.7 7.2" />
      <path d="M5.6 9.6v9.1c0 .6.4 1 1 1h10.9c.6 0 1-.4 1-1V9.5" />
      <path d="M10 19.6v-4.8c0-.6.4-1 1-1h2.1c.6 0 1 .4 1 1v4.9" />
    </HandIcon>
  );
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <HandIcon name="download" className={className}>
      <g data-part="arrow">
        <path d="M12 3.8c.1 3.7.1 7.3 0 11" />
        <path d="M7.6 10.8c1.5 1.4 3 2.9 4.4 4.4 1.5-1.5 3-3 4.5-4.5" />
      </g>
      <path d="M4.2 15.6v2.8c0 .9.7 1.6 1.6 1.6h12.5c.9 0 1.6-.7 1.6-1.6v-2.9" />
    </HandIcon>
  );
}

export function RocketIcon({ className }: IconProps) {
  return (
    <HandIcon name="rocket" className={className}>
      <g data-part="body">
        <path d="M12.3 15.2c-1.2-1.1-2.3-2.3-3.5-3.5 1.6-4.4 5.2-7.6 11-8 .1 5.8-3.4 9.6-7.5 11.5" />
        <path d="M8.8 11.7H5.4l2.4-3c.4-.5 1-.7 1.6-.7h2.4" />
        <path d="M12.3 15.2v3.4l3-2.4c.5-.4.7-1 .7-1.6v-2.4" />
        <path d="M15.1 7.9c.7 0 1.2.5 1.2 1.2s-.5 1.2-1.2 1.2-1.2-.5-1.2-1.2.5-1.2 1.2-1.2" />
      </g>
      <path data-part="flame" d="M7.2 16.8c-1.3.3-2.3 1.4-2.6 3.6 2.2-.3 3.3-1.3 3.6-2.6" />
    </HandIcon>
  );
}

export function PageIcon({ className }: IconProps) {
  return (
    <HandIcon name="page" className={className}>
      <path d="M14 3.6H7.2c-.9 0-1.6.7-1.6 1.6v13.6c0 .9.7 1.6 1.6 1.6h9.6c.9 0 1.6-.7 1.6-1.6V8z" />
      <path d="M13.8 3.7v3.7c0 .5.4.9.9.9h3.6" />
      <path data-part="draw" pathLength={1} d="M9 12.6c2-.1 4-.1 6 .1" />
      <path data-part="draw" pathLength={1} d="M9 16c1.5.1 2.9 0 4.4-.1" />
    </HandIcon>
  );
}

export function BulbIcon({ className }: IconProps) {
  return (
    <HandIcon name="bulb" className={className}>
      <path d="M9.2 16.6c0-1.6-1-2.4-1.8-3.6-.7-1-1.1-2.2-1-3.5.2-3 2.7-5.3 5.7-5.2 3 .1 5.3 2.6 5.2 5.6 0 1.3-.5 2.3-1.2 3.2-.8 1-1.6 1.8-1.6 3.5" />
      <path d="M9.4 19.3c1.7.1 3.5.1 5.2 0" />
      <path d="M10.4 21.4h3.2" />
      <g data-part="glow">
        <path d="M4.3 4.5l.9.8" />
        <path d="M19.7 4.5l-.9.8" />
        <path d="M2.6 10h1.1" />
        <path d="M20.3 10h1.1" />
      </g>
    </HandIcon>
  );
}

export function CompassIcon({ className }: IconProps) {
  return (
    <HandIcon name="compass" className={className}>
      <path d="M12 3.3c4.9-.1 8.8 3.8 8.7 8.7-.1 4.8-3.9 8.6-8.7 8.6-4.8 0-8.7-3.9-8.6-8.7.1-4.8 3.9-8.6 8.6-8.6" />
      <path data-part="needle" d="M15.6 8.4l-1.8 5.4-5.4 1.8 1.8-5.4z" />
    </HandIcon>
  );
}

export function CloudIcon({ className }: IconProps) {
  return (
    <HandIcon name="cloud" className={className}>
      <path
        data-part="drift"
        d="M7.2 18.6c-2.2 0-3.9-1.7-3.9-3.8 0-2 1.5-3.6 3.5-3.8.4-3 2.9-5.2 5.9-5.1 2.6 0 4.8 1.8 5.4 4.3 2 .2 3.6 1.9 3.5 4-.1 2.4-2 4.3-4.4 4.4-3.3.1-6.7.1-10 0"
      />
    </HandIcon>
  );
}

export function RouteIcon({ className }: IconProps) {
  return (
    <HandIcon name="route" className={className}>
      <path d="M6 15c1.2 0 2.1.9 2.1 2.1S7.2 19.2 6 19.2s-2.1-.9-2.1-2.1S4.8 15 6 15" />
      <path d="M18 4.8c1.2 0 2.1.9 2.1 2.1S19.2 9 18 9s-2.1-.9-2.1-2.1.9-2.1 2.1-2.1" />
      <path
        data-part="draw"
        pathLength={1}
        d="M8.2 17.1h7.4c1.7 0 3-1.3 3-3s-1.3-3-3-3H8.4c-1.7 0-3-1.3-3-3s1.3-3 3-3h7.4"
      />
    </HandIcon>
  );
}

export function PaletteIcon({ className }: IconProps) {
  return (
    <HandIcon name="palette" className={className}>
      <g data-part="tilt">
        <path d="M12 3.4c-4.8 0-8.7 3.8-8.6 8.6.1 4.6 3.8 8.4 8.4 8.6 1.3 0 2-.7 2-1.6 0-.5-.2-.9-.5-1.2-.3-.4-.5-.8-.5-1.3 0-.9.7-1.6 1.6-1.6h1.9c2.7 0 4.4-1.9 4.4-4.4.3-3.9-3.5-7.1-8.7-7.1" />
        <circle cx="7.6" cy="12" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="9.3" cy="7.9" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="14.2" cy="7.4" r="0.9" fill="currentColor" stroke="none" />
      </g>
    </HandIcon>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <HandIcon name="menu" className={className}>
      <path d="M4 7.2c5.4-.3 10.8-.2 16 0" />
      <path data-part="middle" d="M4 12c5.4.2 10.8.1 16-.1" />
      <path d="M4 16.8c5.4-.2 10.8-.1 16 .1" />
    </HandIcon>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <HandIcon name="close" className={className}>
      <g data-part="cross">
        <path d="M6 6.2c4 3.8 8 7.8 12 11.8" />
        <path d="M18 6c-4 4-8 8-12 12.1" />
      </g>
    </HandIcon>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <HandIcon name="sun" className={className}>
      <path d="M12 8.2c2.1 0 3.8 1.7 3.8 3.8s-1.7 3.8-3.8 3.8-3.8-1.7-3.8-3.8 1.7-3.8 3.8-3.8" />
      <g data-part="rays">
        <path d="M12 2.6v1.8" />
        <path d="M12 19.6v1.8" />
        <path d="M2.6 12h1.8" />
        <path d="M19.6 12h1.8" />
        <path d="M5.4 5.4l1.2 1.2" />
        <path d="M17.4 17.4l1.2 1.2" />
        <path d="M5.4 18.6l1.2-1.2" />
        <path d="M17.4 6.6l1.2-1.2" />
      </g>
    </HandIcon>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <HandIcon name="moon" className={className}>
      <path
        data-part="crescent"
        d="M19.6 14.6c-1 .4-2 .6-3.1.6-4.4 0-8-3.6-8-8 0-1.1.2-2.1.6-3.1-3.1 1.2-5.3 4.3-5.3 7.8 0 4.7 3.8 8.5 8.5 8.5 3.6 0 6.6-2.2 7.8-5.3"
      />
      <path data-part="glow" d="M18.2 3.6v2.6M16.9 4.9h2.6" />
    </HandIcon>
  );
}

/**
 * @name handIcons
 * @description Hand-drawn icons by name, used to resolve the `icon` field in
 * MDX frontmatter and `meta.json`. Names follow Lucide so content stays
 * portable.
 *
 * @example
 * const Icon = handIcons.Rocket
 */
export const handIcons = {
  BookOpen: BookIcon,
  Cloud: CloudIcon,
  Compass: CompassIcon,
  Download: DownloadIcon,
  FileText: PageIcon,
  Folder: FolderIcon,
  House: HouseIcon,
  Lightbulb: BulbIcon,
  Palette: PaletteIcon,
  Rocket: RocketIcon,
  Route: RouteIcon,
  Search: SearchIcon,
} satisfies Record<string, ComponentType<IconProps>>;

export type HandIconName = keyof typeof handIcons;

/**
 * @name isHandIconName
 * @description True when the name has a matching hand-drawn icon.
 *
 * @example
 * if (isHandIconName(name)) createElement(handIcons[name])
 */
export function isHandIconName(name: string): name is HandIconName {
  return Object.hasOwn(handIcons, name);
}
