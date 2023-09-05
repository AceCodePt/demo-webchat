/* 
 * I was generated. DON'T TOUCH ME!
*/
import { type NextResponse } from "next/server";

export const AUTH_CALLBACK = "auth/callback";
export const API_MESSAGE = "api/message";
export const API_LOGIN = "api/login";

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
  const localHostUrl = `localhost:${process.env.PORT || 3000}`;
  return `${protocol}://${vercelUrl || localHostUrl}`;
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

type AUTH_CALLBACK = {
  [key in Path<typeof AUTH_CALLBACK>]: Route<typeof import("./app/auth/callback/route")>;
};
type API_MESSAGE = {
  [key in Path<typeof API_MESSAGE>]: Route<typeof import("./app/api/message/route")>;
};
type API_LOGIN = {
  [key in Path<typeof API_LOGIN>]: Route<typeof import("./app/api/login/route")>;
};

type ROUTES = {} &
AUTH_CALLBACK &
API_MESSAGE &
API_LOGIN
