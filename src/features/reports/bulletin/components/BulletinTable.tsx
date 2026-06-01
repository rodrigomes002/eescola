import type { BulletinData } from "@/features/reports/bulletin/queries"
import type { GradePeriod } from "@prisma/client"

const PERIODS: Array<{ key: GradePeriod; label: string }> = [
  { key: "BIMESTER_1", label: "B1" },
  { key: "BIMESTER_2", label: "B2" },
  { key: "BIMESTER_3", label: "B3" },
  { key: "BIMESTER_4", label: "B4" },
]

const STATUS_STYLES: Record<
  BulletinData["rows"][number]["status"],
  string
> = {
  APROVADO: "bg-green-100 text-green-800",
  RECUPERAÇÃO: "bg-yellow-100 text-yellow-900",
  REPROVADO: "bg-red-100 text-red-800",
  "Sem dados": "bg-gray-100 text-gray-700",
}

export default function BulletinTable({ bulletin }: { bulletin: BulletinData }) {
  return (
    <div className="overflow-x-auto rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <table className="min-w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-3 py-3">Disciplina</th>
            {PERIODS.map((period) => (
              <th key={period.key} className="px-3 py-3 text-center">
                {period.label}
              </th>
            ))}
            <th className="px-3 py-3 text-center">Média</th>
            <th className="px-3 py-3 text-center">Frequência</th>
            <th className="px-3 py-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {bulletin.rows.map((row) => (
            <tr key={row.subjectId} className="hover:bg-gray-50">
              <td className="px-3 py-4 align-top">
                <p className="font-medium text-gray-900">{row.subjectName}</p>
              </td>
              {PERIODS.map((period) => (
                <td key={period.key} className="px-3 py-4 text-center align-top text-gray-700">
                  {row.grades[period.key] !== null
                    ? row.grades[period.key]!.toFixed(2).replace(".", ",")
                    : "—"}
                </td>
              ))}
              <td className="px-3 py-4 text-center align-top text-gray-900">
                {row.average !== null
                  ? row.average.toFixed(2).replace(".", ",")
                  : "—"}
              </td>
              <td className="px-3 py-4 text-center align-top text-gray-900">
                {row.frequency !== null ? `${row.frequency}%` : "—"}
              </td>
              <td className="px-3 py-4 text-center align-top">
                <span
                  className={[
                    "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                    STATUS_STYLES[row.status],
                  ].join(" ")}
                >
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
