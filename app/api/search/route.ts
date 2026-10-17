import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/helpers/source";

export const { GET } = createFromSource(source);
