import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { File, Files, Folder } from "fumadocs-ui/components/files";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Popup, PopupContent, PopupTrigger } from "fumadocs-twoslash/ui";
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
import { Release } from "@/modules/changelog/components/release";
import { CodeBlock } from "./components/code-block";
import { CodeTab, CodeTabs, CodeTabsList, CodeTabsTrigger } from "./components/code-tabs";
import { TypeTable } from "./components/type-table";

/**
 * @name mdxComponents
 * @description Components available in every MDX page: the Fumadocs defaults
 * plus tabs, steps, accordions, file trees, type tables, changelog releases,
 * the site icons, the custom code block and the Twoslash hover popups.
 *
 * @example
 * <MDX components={mdxComponents} />
 */
export const mdxComponents: MDXComponents = {
  ...defaultMdxComponents,
  pre: CodeBlock,
  CodeBlockTab: CodeTab,
  CodeBlockTabs: CodeTabs,
  CodeBlockTabsList: CodeTabsList,
  CodeBlockTabsTrigger: CodeTabsTrigger,
  Accordion,
  Accordions,
  File,
  Files,
  Folder,
  Popup,
  PopupContent,
  PopupTrigger,
  Release,
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
