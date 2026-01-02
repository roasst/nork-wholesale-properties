import { DailyMetrics } from '../hooks/useOwnerAnalytics';
import { formatCurrency } from '../../lib/utils';

interface CostBreakdownTableProps {
  dailyMetrics: DailyMetrics[];
}

export const CostBreakdownTable = ({ dailyMetrics }: CostBreakdownTableProps) => {
  const totals = dailyMetrics.reduce(
    (acc, day) => ({
      emails: acc.emails + day.emails,
      properties: acc.properties + day.properties,
      input_tokens: acc.input_tokens + day.input_tokens,
      output_tokens: acc.output_tokens + day.output_tokens,
      total_tokens: acc.total_tokens + day.total_tokens,
      cost: acc.cost + day.cost,
    }),
    { emails: 0, properties: 0, input_tokens: 0, output_tokens: 0, total_tokens: 0, cost: 0 }
  );

  const avgCostPerProperty = totals.properties > 0 ? totals.cost / totals.properties : 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Daily Cost Breakdown (Last 30 Days)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Emails
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Properties
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Input Tokens
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Output Tokens
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Tokens
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                GPT Cost
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost/Property
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dailyMetrics.map((day) => (
              <tr key={day.date} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {new Date(day.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {day.emails}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {day.properties}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                  {day.input_tokens.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                  {day.output_tokens.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {day.total_tokens.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                  {formatCurrency(day.cost)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {day.properties > 0 ? `$${day.cost_per_property.toFixed(4)}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                Totals
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                {totals.emails}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                {totals.properties}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                {totals.input_tokens.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                {totals.output_tokens.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                {totals.total_tokens.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-red-600">
                {formatCurrency(totals.cost)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                ${avgCostPerProperty.toFixed(4)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
