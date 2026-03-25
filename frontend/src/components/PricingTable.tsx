import type { PricingRule } from '../types'

const typeLabel: Record<PricingRule['passenger_type'], string> = {
  adult: 'Adult',
  child: 'Child',
  senior: 'Senior',
}

interface Props {
  rules: PricingRule[]
}

export default function PricingTable({ rules }: Props) {
  if (rules.length === 0) return null

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-brand-50 text-brand-800">
          <th className="text-left px-4 py-2 rounded-tl font-medium">Passenger</th>
          <th className="text-left px-4 py-2 font-medium">Season</th>
          <th className="text-right px-4 py-2 rounded-tr font-medium">Price (CAD)</th>
        </tr>
      </thead>
      <tbody>
        {rules.map((rule, i) => (
          <tr
            key={i}
            className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <td className="px-4 py-2 font-medium text-gray-800 capitalize">
              {typeLabel[rule.passenger_type]}
            </td>
            <td className="px-4 py-2 text-gray-500">
              {rule.season_label ?? '—'}
            </td>
            <td className="px-4 py-2 text-right font-semibold text-brand-700">
              CA${rule.price_cad}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
