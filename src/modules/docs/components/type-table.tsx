import { highlight } from "fumadocs-core/highlight";
import { TypeTable as BaseTypeTable } from "fumadocs-ui/components/type-table";
import type { ComponentProps, ReactNode } from "react";
import { formatType } from "../utils/format-type";

type Prop = {
  type: string;
  description?: ReactNode;
  typeDescription?: string;
  typeDescriptionLink?: string;
  default?: string;
  required?: boolean;
  deprecated?: boolean;
  parameters?: { name: string; description: ReactNode }[];
  returns?: ReactNode;
};

type Props = Omit<ComponentProps<typeof BaseTypeTable>, "type"> & {
  type: Record<string, Prop>;
};

const themes = { light: "github-light", dark: "github-dark-default" };

function highlightCode(code: string, inline: boolean) {
  return highlight(code, {
    lang: "ts",
    themes,
    components: {
      pre: ({ children }) =>
        inline ? (
          <span className="prop-code">{children}</span>
        ) : (
          <div className="prop-code">{children}</div>
        ),
    },
  });
}

async function resolveProp(name: string, prop: Prop) {
  const full = prop.typeDescription ?? formatType(prop.type, name);
  const [type, typeDescription, defaultValue] = await Promise.all([
    highlightCode(prop.type, true),
    full ? highlightCode(full, false) : undefined,
    prop.default ? highlightCode(prop.default, true) : undefined,
  ]);

  return { ...prop, type, typeDescription, default: defaultValue };
}

/**
 * @name TypeTable
 * @description Props table whose rows expand to show the full type as
 * highlighted TypeScript: unions one member per line, plus the default value
 * and function signatures. Short types are highlighted in the row itself.
 *
 * @example
 * <TypeTable type={{ mode: { type: "'light' | 'dark'", default: "'light'" } }} />
 */
export async function TypeTable({ type, ...props }: Props) {
  const entries = await Promise.all(
    Object.entries(type).map(
      async ([name, prop]) => [name, await resolveProp(name, prop)] as const,
    ),
  );

  return <BaseTypeTable type={Object.fromEntries(entries)} {...props} />;
}
