import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { File, Files, Folder } from "fumadocs-ui/components/files";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { TypeTable } from "fumadocs-ui/components/type-table";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import {
  BookIcon,
  CloudIcon,
  CompassIcon,
  DownloadIcon,
  PageIcon,
  PaletteIcon,
  RocketIcon,
  RouteIcon,
  SearchIcon,
} from "@/shared/icons/icons";

/**
 * @name mdxComponents
 * @description Components available in every MDX page: the Fumadocs defaults
 * plus tabs, steps, accordions, file trees, type tables and the site icons.
 *
 * @example
 * <MDX components={mdxComponents} />
 */
export const mdxComponents: MDXComponents = {
  ...defaultMdxComponents,
  Accordion,
  Accordions,
  File,
  Files,
  Folder,
  Step,
  Steps,
  Tab,
  Tabs,
  TypeTable,
  BookIcon,
  CloudIcon,
  CompassIcon,
  DownloadIcon,
  PageIcon,
  PaletteIcon,
  RocketIcon,
  RouteIcon,
  SearchIcon,
};
