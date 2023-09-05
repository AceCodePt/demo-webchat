"use server";
import { Database } from "@/types";
import {
  createMiddlewareClient,
  createRouteHandlerClient,
  createServerComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const supabaseRoute = () =>
  createRouteHandlerClient<Database>({
    cookies: cookies,
  });

export const supabaseServer = () =>
  createServerComponentClient<Database>({
    cookies: cookies,
  });

export const supabaseMiddleware = (req: NextRequest, res: NextResponse) =>
  createMiddlewareClient<Database>({
    req,
    res,
  });
