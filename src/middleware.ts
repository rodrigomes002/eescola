import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/session"

// Rotas públicas (não precisam de autenticação)
const PUBLIC_ROUTES = ["/login"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permite rotas públicas
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Verifica sessão
  const token = request.cookies.get("eescola_session")?.value
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const session = await verifySession(token)
  if (!session) {
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("eescola_session")
    return response
  }

  return NextResponse.next()
}

export const config = {
  // Aplica o middleware a todas as rotas exceto assets estáticos e API interna do Next
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
