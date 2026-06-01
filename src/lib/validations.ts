// Re-exporta schemas de validação de cada feature para acesso centralizado
// Os schemas individuais ficam em src/features/*/schemas.ts

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }
