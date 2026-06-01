import { redirect } from "next/navigation"

// A raiz redireciona para o dashboard (ou login quando auth estiver implementado)
export default function RootPage() {
  redirect("/dashboard")
}
