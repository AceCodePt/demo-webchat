import * as fs from "fs";
import * as glob from "glob";

const routes = glob.globSync("**/app/**/route.ts", {});

const constDef: string[] = [];
const typeDef: string[] = [];
const routeTypes: string[] = [];

function toConstDef(varName: string, path: string): string {
  if (path.includes("[")) {
    const vars = path.match(/(?!\[)[^\[\]]+(?=\])/g);

    return `export const ${varName} = (${vars!
      .map((x) => x + ":string")
      .join(",")}) => \`${path.replace(
      /\[\[?\.?\.?\.?([^\]]*)\]?\]/g,
      "$${$1}"
    )}\` as const`;
  }
  return `export const ${varName} = "${path}";`;
}

routes.forEach((route) => {
  const path = route
    .replace(/(app)\/?/g, "")
    // .replace(/([^\[]*)\[+[^\]]*\]+/g, "$1")
    .split("/")
    .slice(0, -1)
    .join("/")
    .replace(/\/$/g, "");
  if (!path) {
    return `export const ROOT="/"`;
  }

  const pathWithoutFileSuffix = route.replace(/\.tsx?/g, "");
  const varName = path.toUpperCase().replace(/[\[\]\/\-.]/g, "_");
  routeTypes.push(varName);
  constDef.push(toConstDef(varName, path));
  typeDef.push(`type ${varName} = {
  [key in Path<typeof ${varName}>]: Route<typeof import("./${pathWithoutFileSuffix}")>;
};`);
});

const template = `/* 
 * I was generated. DON'T TOUCH ME!
*/
import { type NextResponse } from "next/server";

${constDef.join("\n")}

type ResponseJson<
  path extends keyof ROUTES,
  method extends keyof ROUTES[path]
> = Omit<Response, "json"> & {
  json: () => Promise<
    ROUTES[path][method] extends NextResponse<infer B> ? B : undefined
  >;
};

type Path<P extends string | ((...args: string[]) => string)> = P extends (
  ...args: any[]
) => any
  ? ReturnType<P>
  : P;

export function getBaseUrl() {
  if (typeof origin !== "undefined") {
    return origin;
  }
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  const localHostUrl = \`localhost:\${process.env.PORT || 3000}\`;
  return \`\${protocol}://\${vercelUrl || localHostUrl}\`;
}

export async function fetchApi<
  P extends keyof ROUTES,
  M extends keyof ROUTES[P],
  R extends (RequestInit & { method?: M } & { searchParams?: URLSearchParams }) | undefined
>(input: P, init?: R) {
  const vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  const baseURL = new URL(input, getBaseUrl());
  if (process.env.NODE_ENV !== "development" && !vercelUrl) {
    console.warn(
      "You are trying to get stuff from localhost when NODE_ENV isn't development, baseURL:",
      baseURL
    );
  }

  if(init?.searchParams){
    baseURL.search = init.searchParams.toString();
  }

  return fetch(baseURL, init) as Promise<R extends { method: infer M }
    ? M extends keyof ROUTES[P]
      ? ResponseJson<P, M>
      : "GET" extends keyof ROUTES[P]
      ? ResponseJson<P, "GET">
      : never
    : "GET" extends keyof ROUTES[P]
    ? ResponseJson<P, "GET">
    : never>;
}

type BaseRouteFunction = (
  ...args: any[]
) => PromiseLike<NextResponse | Response> | NextResponse | Response;

type RouteReturnType<T extends BaseRouteFunction> = ReturnType<T> extends
  | NextResponse<infer Res>
  | Awaited<NextResponse<infer Res>>
  ? Res
  : Awaited<ReturnType<T>>;

type supportedTypes =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

type Route<T extends Record<string, unknown>> = {
  [key in supportedTypes & keyof T]: T[key] extends BaseRouteFunction
    ? RouteReturnType<T[key]>
    : "";
};

${typeDef.join("\n")}

type ROUTES = {} &
${routeTypes.join(" &\n")}
`;

fs.writeFileSync("./api-routes.ts", template);
