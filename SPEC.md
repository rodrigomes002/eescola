# SPEC.md — MVP Sistema Escolar

## 1. Visão do Produto

Criar um sistema escolar web, mobile-first, para pequenas escolas controlarem:

- Alunos
- Turmas
- Disciplinas
- Presença
- Notas
- Boletim simples

O objetivo do MVP é substituir controles manuais em planilhas por uma aplicação simples, responsiva e fácil de usar.

---

## 2. Objetivo do MVP

Permitir que uma escola consiga:

1. Cadastrar alunos
2. Cadastrar turmas
3. Cadastrar disciplinas
4. Vincular alunos às turmas
5. Lançar presença
6. Lançar notas
7. Visualizar boletim por aluno

---

## 3. Stack Técnica

- Next.js com App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Zod para validação
- Server Components por padrão
- Client Components apenas quando necessário
- Server Actions para formulários e mutações
- Route Handlers apenas para endpoints necessários

---

## 4. Perfis de Usuário

### ADMIN

Responsável pela configuração da escola.

Pode:

- Cadastrar alunos
- Cadastrar turmas
- Cadastrar disciplinas
- Vincular alunos às turmas
- Visualizar boletins

### PROFESSOR

Responsável por lançamentos acadêmicos.

Pode:

- Visualizar suas turmas
- Lançar presença
- Lançar notas
- Consultar boletim

### RESPONSAVEL

Perfil futuro, fora do MVP inicial.

Poderá:

- Visualizar notas
- Visualizar frequência
- Visualizar boletim

---

## 5. Escopo do MVP

### Incluído

- Login
- Dashboard simples
- Cadastro de alunos
- Cadastro de turmas
- Cadastro de disciplinas
- Vínculo aluno-turma
- Lançamento de presença
- Lançamento de notas
- Boletim simples

### Fora do MVP

- Mensalidades
- Matrícula online
- Comunicação com responsáveis
- Upload de documentos
- Multi-escola
- Relatórios avançados
- App nativo
- PWA offline
- Integração com WhatsApp

---

## 6. Regras de Negócio

### Aluno

- Um aluno deve ter nome obrigatório.
- Um aluno deve ter número de matrícula único.
- Um aluno pode estar ativo ou inativo.
- Um aluno pode estar vinculado a uma ou mais turmas.

### Turma

- Uma turma deve ter nome obrigatório.
- Uma turma pertence a um ano letivo.
- Uma turma pode ter vários alunos.
- Uma turma pode ter várias disciplinas.

### Disciplina

- Uma disciplina deve ter nome obrigatório.
- Uma disciplina pode ser usada em várias turmas.

### Presença

- O professor seleciona turma, disciplina e data.
- O sistema lista os alunos da turma.
- Para cada aluno, o professor marca:
  - PRESENTE
  - FALTA
  - JUSTIFICADO
- O status padrão deve ser PRESENTE.
- Não pode existir mais de um lançamento de presença para o mesmo aluno, turma, disciplina e data.

### Nota

- O professor seleciona turma, disciplina e bimestre.
- Cada aluno recebe uma nota de 0 a 10.
- A nota pode ter até 2 casas decimais.
- Não pode existir mais de uma nota para o mesmo aluno, turma, disciplina e bimestre.

### Boletim

- O boletim deve exibir notas por disciplina.
- O boletim deve calcular média por disciplina.
- O boletim deve calcular frequência por disciplina.
- O boletim deve exibir status final.

Regras de status:

- APROVADO: média maior ou igual a 6 e frequência maior ou igual a 75%.
- RECUPERAÇÃO: média maior ou igual a 4 e menor que 6.
- REPROVADO: média menor que 4 ou frequência menor que 75%.

---

## 7. Entidades

### User

```ts
type User = {
  id: string
  name: string
  email: string
  passwordHash: string
  role: "ADMIN" | "PROFESSOR" | "RESPONSAVEL"
  createdAt: Date
  updatedAt: Date
}
Student
type Student = {
  id: string
  name: string
  birthDate?: Date
  registrationNumber: string
  status: "ACTIVE" | "INACTIVE"
  createdAt: Date
  updatedAt: Date
}
Teacher
type Teacher = {
  id: string
  userId: string
  name: string
  createdAt: Date
  updatedAt: Date
}
ClassRoom
type ClassRoom = {
  id: string
  name: string
  schoolYear: number
  status: "ACTIVE" | "INACTIVE"
  createdAt: Date
  updatedAt: Date
}
Subject
type Subject = {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}
Enrollment
type Enrollment = {
  id: string
  studentId: string
  classRoomId: string
  createdAt: Date
}
Attendance
type Attendance = {
  id: string
  studentId: string
  classRoomId: string
  subjectId: string
  date: Date
  status: "PRESENT" | "ABSENT" | "JUSTIFIED"
  createdBy: string
  createdAt: Date
}
Grade
type Grade = {
  id: string
  studentId: string
  classRoomId: string
  subjectId: string
  period: "BIMESTER_1" | "BIMESTER_2" | "BIMESTER_3" | "BIMESTER_4"
  value: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}
8. Rotas da Aplicação
app/
  layout.tsx
  page.tsx

  login/
    page.tsx

  dashboard/
    page.tsx

  students/
    page.tsx
    new/
      page.tsx
    [id]/
      page.tsx

  classes/
    page.tsx
    new/
      page.tsx
    [id]/
      page.tsx

  subjects/
    page.tsx

  attendance/
    page.tsx
    launch/
      page.tsx

  grades/
    page.tsx
    launch/
      page.tsx

  reports/
    bulletin/
      page.tsx
9. Estrutura de Pastas
src/
  app/
    login/
    dashboard/
    students/
    classes/
    subjects/
    attendance/
    grades/
    reports/

  components/
    ui/
    layout/
    forms/
    tables/

  features/
    students/
      actions.ts
      queries.ts
      schemas.ts
      components/

    classes/
      actions.ts
      queries.ts
      schemas.ts
      components/

    subjects/
      actions.ts
      queries.ts
      schemas.ts
      components/

    attendance/
      actions.ts
      queries.ts
      schemas.ts
      components/

    grades/
      actions.ts
      queries.ts
      schemas.ts
      components/

    reports/
      bulletin/
        queries.ts
        components/

  lib/
    auth.ts
    db.ts
    permissions.ts
    validations.ts

  prisma/
    schema.prisma
10. Telas
Login

Campos:

E-mail
Senha

Critérios de aceite:

Deve validar campos obrigatórios.
Deve exibir erro para credenciais inválidas.
Deve redirecionar para /dashboard após login.
Dashboard

Para ADMIN:

Total de alunos
Total de turmas
Total de disciplinas
Presenças lançadas hoje

Para PROFESSOR:

Minhas turmas
Lançar presença
Lançar notas
Últimos lançamentos
Cadastro de Alunos

Campos:

Nome
Data de nascimento
Número de matrícula
Status

Critérios de aceite:

Nome é obrigatório.
Número de matrícula é obrigatório.
Número de matrícula deve ser único.
Ao salvar, redirecionar para /students.
A listagem deve permitir busca por nome.
Cadastro de Turmas

Campos:

Nome da turma
Ano letivo
Status

Critérios de aceite:

Nome é obrigatório.
Ano letivo é obrigatório.
Deve permitir vincular alunos à turma.
Cadastro de Disciplinas

Campos:

Nome da disciplina

Critérios de aceite:

Nome é obrigatório.
Não deve permitir disciplinas com nome vazio.
Lançamento de Presença

Fluxo:

Selecionar turma
Selecionar disciplina
Selecionar data
Listar alunos matriculados
Marcar status de cada aluno
Salvar lançamento

Critérios de aceite:

Todos os alunos ativos da turma devem aparecer.
Status padrão deve ser PRESENTE.
Não pode duplicar presença para mesmo aluno, turma, disciplina e data.
Deve exibir mensagem de sucesso após salvar.
Lançamento de Notas

Fluxo:

Selecionar turma
Selecionar disciplina
Selecionar bimestre
Listar alunos matriculados
Informar nota de cada aluno
Salvar lançamento

Critérios de aceite:

Nota não pode ser menor que 0.
Nota não pode ser maior que 10.
Nota pode ter até 2 casas decimais.
Não pode duplicar nota para mesmo aluno, turma, disciplina e bimestre.
Deve exibir mensagem de sucesso após salvar.
Boletim

Entrada:

Aluno
Turma
Ano letivo

Saída:

Disciplina	B1	B2	B3	B4	Média	Frequência	Status
Matemática	7	8	6	7	7.0	92%	Aprovado
Português	5	6	6	7	6.0	80%	Aprovado
História	4	5	5	5	4.75	70%	Reprovado

Critérios de aceite:

Deve calcular média por disciplina.
Deve calcular frequência por disciplina.
Deve exibir status final.
Deve ser legível no celular.
11. Permissões
ADMIN

Pode:

Criar alunos
Editar alunos
Criar turmas
Editar turmas
Criar disciplinas
Vincular alunos às turmas
Visualizar boletins
PROFESSOR

Pode:

Visualizar turmas vinculadas a ele
Lançar presença
Lançar notas
Visualizar boletins das suas turmas
RESPONSAVEL

Fora do MVP inicial.

No futuro, poderá:

Visualizar notas dos alunos vinculados
Visualizar frequência
Visualizar boletim
12. Server Actions
students/actions.ts
createStudent(input)
updateStudent(id, input)
deactivateStudent(id)
classes/actions.ts
createClassRoom(input)
updateClassRoom(id, input)
enrollStudent(classRoomId, studentId)
removeStudentFromClass(classRoomId, studentId)
subjects/actions.ts
createSubject(input)
updateSubject(id, input)
attendance/actions.ts
launchAttendance(input)
grades/actions.ts
launchGrades(input)
13. Route Handlers

Usar Route Handlers apenas quando necessário.

Endpoints sugeridos:

GET /api/students/search?query=ana

GET /api/classes/:id/students

GET /api/reports/bulletin?studentId=...&classRoomId=...
14. Validações
createStudentSchema
import { z } from "zod"

export const createStudentSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  birthDate: z.coerce.date().optional(),
  registrationNumber: z.string().min(1, "Matrícula é obrigatória"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
})
createClassRoomSchema
import { z } from "zod"

export const createClassRoomSchema = z.object({
  name: z.string().min(1, "Nome da turma é obrigatório"),
  schoolYear: z.coerce.number().int().min(2000),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
})
createSubjectSchema
import { z } from "zod"

export const createSubjectSchema = z.object({
  name: z.string().min(2, "Nome da disciplina é obrigatório"),
})
launchAttendanceSchema
import { z } from "zod"

export const launchAttendanceSchema = z.object({
  classRoomId: z.string().uuid(),
  subjectId: z.string().uuid(),
  date: z.coerce.date(),
  attendances: z.array(
    z.object({
      studentId: z.string().uuid(),
      status: z.enum(["PRESENT", "ABSENT", "JUSTIFIED"]),
    })
  ).min(1),
})
launchGradesSchema
import { z } from "zod"

export const launchGradesSchema = z.object({
  classRoomId: z.string().uuid(),
  subjectId: z.string().uuid(),
  period: z.enum([
    "BIMESTER_1",
    "BIMESTER_2",
    "BIMESTER_3",
    "BIMESTER_4",
  ]),
  grades: z.array(
    z.object({
      studentId: z.string().uuid(),
      value: z.coerce.number().min(0).max(10),
    })
  ).min(1),
})
15. Modelo Inicial do Prisma
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  role         UserRole
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  teacher      Teacher?
}

enum UserRole {
  ADMIN
  PROFESSOR
  RESPONSAVEL
}

model Student {
  id                 String        @id @default(uuid())
  name               String
  birthDate          DateTime?
  registrationNumber String        @unique
  status             StudentStatus @default(ACTIVE)
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  enrollments        Enrollment[]
  attendances        Attendance[]
  grades             Grade[]
}

enum StudentStatus {
  ACTIVE
  INACTIVE
}

model Teacher {
  id        String   @id @default(uuid())
  userId    String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id])
}

model ClassRoom {
  id          String          @id @default(uuid())
  name        String
  schoolYear  Int
  status      ClassRoomStatus @default(ACTIVE)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  enrollments Enrollment[]
  attendances Attendance[]
  grades      Grade[]
}

enum ClassRoomStatus {
  ACTIVE
  INACTIVE
}

model Subject {
  id          String       @id @default(uuid())
  name        String
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  attendances Attendance[]
  grades      Grade[]
}

model Enrollment {
  id          String   @id @default(uuid())
  studentId   String
  classRoomId String
  createdAt   DateTime @default(now())

  student     Student   @relation(fields: [studentId], references: [id])
  classRoom   ClassRoom @relation(fields: [classRoomId], references: [id])

  @@unique([studentId, classRoomId])
}

model Attendance {
  id          String           @id @default(uuid())
  studentId   String
  classRoomId String
  subjectId   String
  date        DateTime
  status      AttendanceStatus
  createdBy   String
  createdAt   DateTime         @default(now())

  student     Student          @relation(fields: [studentId], references: [id])
  classRoom   ClassRoom        @relation(fields: [classRoomId], references: [id])
  subject     Subject          @relation(fields: [subjectId], references: [id])

  @@unique([studentId, classRoomId, subjectId, date])
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  JUSTIFIED
}

model Grade {
  id          String      @id @default(uuid())
  studentId   String
  classRoomId String
  subjectId   String
  period      GradePeriod
  value       Decimal
  createdBy   String
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  student     Student     @relation(fields: [studentId], references: [id])
  classRoom   ClassRoom   @relation(fields: [classRoomId], references: [id])
  subject     Subject     @relation(fields: [subjectId], references: [id])

  @@unique([studentId, classRoomId, subjectId, period])
}

enum GradePeriod {
  BIMESTER_1
  BIMESTER_2
  BIMESTER_3
  BIMESTER_4
}
16. Critérios de Qualidade
Usar TypeScript.
Usar Server Components por padrão.
Usar Client Components apenas quando houver estado/interação no navegador.
Validar dados no servidor.
Usar Zod para schemas.
Usar Prisma para acesso ao banco.
Evitar overengineering.
Evitar criar API REST para tudo.
Componentes devem ser pequenos e reutilizáveis.
Layout deve ser mobile-first.
Mensagens de erro devem ser amigáveis.
Regras críticas devem ficar no servidor.
17. Ordem de Implementação
Setup do projeto
Configuração do Prisma e PostgreSQL
Layout base
Login simples
Dashboard
Cadastro de alunos
Cadastro de turmas
Cadastro de disciplinas
Vínculo aluno-turma
Lançamento de presença
Lançamento de notas
Boletim
Permissões
Ajustes mobile
Testes básicos
18. Tasks para IA
Task 1 — Setup inicial

Implemente o setup inicial do projeto com:

Next.js
TypeScript
Tailwind CSS
App Router
Estrutura src/
Estrutura features/
Estrutura components/
Prisma configurado
.env.example

Não implemente telas ainda.

Task 2 — Banco de dados

Implemente o schema.prisma completo com:

User
Student
Teacher
ClassRoom
Subject
Enrollment
Attendance
Grade

Inclua enums, relações e constraints únicas.

Task 3 — Cadastro de alunos

Implemente:

Página /students
Página /students/new
Server Action createStudent
Schema Zod
Listagem com busca simples
Tratamento de erro para matrícula duplicada
Task 4 — Cadastro de turmas

Implemente:

Página /classes
Página /classes/new
Server Action createClassRoom
Schema Zod
Listagem de turmas
Formulário mobile-first
Task 5 — Cadastro de disciplinas

Implemente:

Página /subjects
Server Action createSubject
Schema Zod
Listagem de disciplinas
Task 6 — Vínculo aluno-turma

Implemente:

Página /classes/[id]
Listagem de alunos da turma
Ação para vincular aluno
Ação para remover aluno da turma
Evitar vínculo duplicado
Task 7 — Lançamento de presença

Implemente:

Página /attendance/launch
Seleção de turma
Seleção de disciplina
Seleção de data
Listagem de alunos
Status padrão PRESENT
Server Action launchAttendance
Persistência em transação
Task 8 — Lançamento de notas

Implemente:

Página /grades/launch
Seleção de turma
Seleção de disciplina
Seleção de bimestre
Listagem de alunos
Input de nota
Server Action launchGrades
Validação de nota entre 0 e 10
Task 9 — Boletim

Implemente:

Página /reports/bulletin
Query getStudentBulletin
Cálculo de média
Cálculo de frequência
Status final
Tabela responsiva
19. Prompt Mestre para IA

Use este prompt para iniciar o desenvolvimento:

Atue como um Software Engineer Sr especializado em Next.js, TypeScript, Prisma e arquitetura de MVPs.

Vou desenvolver um MVP escolar mobile-first.

Use a SPEC.md como fonte de verdade.

Regras:
1. Não implemente tudo de uma vez.
2. Sempre proponha uma ordem de implementação.
3. Para cada etapa, gere código pequeno e revisável.
4. Use TypeScript.
5. Use Server Components por padrão.
6. Use Client Components apenas quando necessário.
7. Use Server Actions para formulários.
8. Use Route Handlers apenas quando fizer sentido.
9. Use Zod para validação.
10. Use Prisma para persistência.
11. Antes de codar, liste os arquivos que serão criados ou alterados.
12. Depois do código, explique como testar manualmente.
13. Não altere decisões da SPEC.md sem explicar o motivo.

Comece pela Task 1: setup inicial do projeto.
20. Princípio do MVP

Este MVP deve priorizar simplicidade.

Não criar arquitetura SaaS complexa no início.

Primeiro entregar:

Uma escola
Poucos perfis
Cadastro de alunos
Cadastro de turmas
Presença
Notas
Boletim

Depois evoluir para:

Responsáveis
Mensalidades
Comunicados
Multi-escola
PWA offline
Relatórios avançados