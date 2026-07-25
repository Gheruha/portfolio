import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  createMiddlewareClient,
  createRouteHandlerClient,
} from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/types/database.types';

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function requireSupabaseEnv() {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error(
    `Missing Supabase environment variables:
		- NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ?? 'undefined'}
		- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'set' : 'undefined'}
		- SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceRoleKey ? 'set' : 'undefined'}

		Make sure they are correctly set in your environment variables.`,
  );
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
  };
}

// Create a Supabase client for client-side use.
export const createSupabaseClientAnonymous = (): SupabaseClient<Database> => {
  const env = requireSupabaseEnv();
  return createClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
};

// Create a Supabase client for server-side use.
export const createSupabaseClientServiceRole = (): SupabaseClient<Database> => {
  const env = requireSupabaseEnv();
  return createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey);
};

// Create a Supabase client for middleware use.
export const createSupabaseClientMiddleware = (
  req: NextRequest,
  res: NextResponse,
): SupabaseClient<Database> => {
  requireSupabaseEnv();
  return createMiddlewareClient<Database>({
    req,
    res,
  }) as unknown as SupabaseClient<Database>;
};

// Create a Supabase client for API route or server-side use.
export const createSupabaseClientApi = async (): Promise<
  SupabaseClient<Database>
> => {
  requireSupabaseEnv();
  const cookieStore = cookies();
  return createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  }) as unknown as SupabaseClient<Database>;
};
