import { Mail, DollarSign, TrendingUp, Package } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { MetricCard } from '../components/MetricCard';
import { CostBreakdownTable } from '../components/CostBreakdownTable';
import { ProfitabilityCalculator } from '../components/ProfitabilityCalculator';
import { SystemHealthMetrics } from '../components/SystemHealthMetrics';
import { PlatformAnalytics } from '../components/PlatformAnalytics';
import { useOwnerAnalytics } from '../hooks/useOwnerAnalytics';
import { formatCurrency } from '../../lib/utils';

export const OwnerAnalytics = () => {
  const { analytics, loading, error } = useOwnerAnalytics();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7CB342] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !analytics) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load analytics: {error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Owner Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Cost tracking, profitability analysis, and system health metrics</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <div className="text-yellow-600 mt-0.5">⚠️</div>
          <div>
            <p className="font-medium text-yellow-900">Owner Access Only</p>
            <p className="text-sm text-yellow-700">This dashboard is only visible to account owners. Tenant users cannot access this information.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <MetricCard
              title="Emails Processed Today"
              value={analytics.today.emails}
              icon={Mail}
              color="blue"
            />
            <MetricCard
              title="Properties Imported Today"
              value={analytics.today.properties}
              icon={Package}
              color="green"
            />
            <MetricCard
              title="Today's GPT Cost"
              value={formatCurrency(analytics.today.cost)}
              icon={DollarSign}
              color="red"
            />
            <MetricCard
              title="Cost Per Property"
              value={analytics.today.properties > 0 ? `$${analytics.today.cost_per_property.toFixed(4)}` : '-'}
              subtitle={analytics.today.properties > 0 ? `${analytics.today.properties} properties` : 'No properties'}
              icon={TrendingUp}
              color="orange"
            />
            <MetricCard
              title="Cost Per Email"
              value={analytics.today.emails > 0 ? `$${analytics.today.cost_per_email.toFixed(4)}` : '-'}
              subtitle={analytics.today.emails > 0 ? `${analytics.today.emails} emails` : 'No emails'}
              icon={TrendingUp}
              color="purple"
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">This Month's Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <MetricCard
              title="Emails This Month"
              value={analytics.month.emails}
              icon={Mail}
              color="blue"
            />
            <MetricCard
              title="Properties This Month"
              value={analytics.month.properties}
              icon={Package}
              color="green"
            />
            <MetricCard
              title="Monthly GPT Cost"
              value={formatCurrency(analytics.month.cost)}
              icon={DollarSign}
              color="red"
            />
            <MetricCard
              title="Cost Per Property"
              value={analytics.month.properties > 0 ? `$${analytics.month.cost_per_property.toFixed(4)}` : '-'}
              subtitle={analytics.month.properties > 0 ? `${analytics.month.properties} properties` : 'No properties'}
              icon={TrendingUp}
              color="orange"
            />
            <MetricCard
              title="Cost Per Email"
              value={analytics.month.emails > 0 ? `$${analytics.month.cost_per_email.toFixed(4)}` : '-'}
              subtitle={analytics.month.emails > 0 ? `${analytics.month.emails} emails` : 'No emails'}
              icon={TrendingUp}
              color="purple"
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">All Time Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <MetricCard
              title="Total Emails Processed"
              value={analytics.allTime.emails}
              icon={Mail}
              color="blue"
            />
            <MetricCard
              title="Total Properties"
              value={analytics.allTime.properties}
              icon={Package}
              color="green"
            />
            <MetricCard
              title="Total GPT Spend"
              value={formatCurrency(analytics.allTime.cost)}
              icon={DollarSign}
              color="red"
            />
            <MetricCard
              title="Lifetime Cost Per Property"
              value={analytics.allTime.properties > 0 ? `$${analytics.allTime.cost_per_property.toFixed(4)}` : '-'}
              subtitle={analytics.allTime.properties > 0 ? `${analytics.allTime.properties} properties` : 'No properties'}
              icon={TrendingUp}
              color="orange"
            />
            <MetricCard
              title="Lifetime Cost Per Email"
              value={analytics.allTime.emails > 0 ? `$${analytics.allTime.cost_per_email.toFixed(4)}` : '-'}
              subtitle={analytics.allTime.emails > 0 ? `${analytics.allTime.emails} emails` : 'No emails'}
              icon={TrendingUp}
              color="purple"
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cost Breakdown</h2>
          <CostBreakdownTable dailyMetrics={analytics.dailyMetrics} />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profitability Analysis</h2>
          <ProfitabilityCalculator
            actualCostPerProperty={analytics.month.cost_per_property}
            monthlyProperties={analytics.month.properties}
            monthlyCost={analytics.month.cost}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health</h2>
          <SystemHealthMetrics qualityMetrics={analytics.qualityMetrics} />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Platform Performance</h2>
          <PlatformAnalytics platformMetrics={analytics.platformMetrics} />
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export & Reporting</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => alert('Export Cost Report feature coming soon')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Export Cost Report (CSV)
            </button>
            <button
              onClick={() => alert('Export for Accounting feature coming soon')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Export for Accounting (CSV)
            </button>
            <button
              onClick={() => alert('Export Tenant Report feature coming soon')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Export Tenant Report (CSV)
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Note: Export features will be available in a future update. These will allow you to download detailed cost breakdowns for accounting and tax purposes.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};
