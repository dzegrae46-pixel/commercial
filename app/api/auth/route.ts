import {
  AccountAuthenticationError,
  createAccount,
  isSignedIn,
  revokeSession,
  sessionCookie,
  signIn,
} from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Impossible de gérer le compte.";
  return Response.json({ error: message }, { status: error instanceof AccountAuthenticationError ? error.status : 500 });
}

export function GET(request: Request) {
  return Response.json({ signedIn: isSignedIn(request) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    const input = await request.json() as { action?: unknown; password?: unknown };
    const session = input.action === "sign-up" ? createAccount(input.password) : signIn(input.password);
    return Response.json(
      { signedIn: true },
      { status: input.action === "sign-up" ? 201 : 200, headers: { "Set-Cookie": sessionCookie(session.token) } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export function DELETE(request: Request) {
  return Response.json({ signedIn: false }, { headers: { "Set-Cookie": revokeSession(request) } });
}
