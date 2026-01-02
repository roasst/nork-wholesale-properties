import { useState } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface ProfitabilityCalculatorProps {
  actualCostPerProperty: number;
  monthlyProperties: number;
  monthlyCost: number;
}

export const ProfitabilityCalculator = ({
  actualCostPerProperty,
  monthlyProperties,
  monthlyCost,
}: ProfitabilityCalculatorProps) => {
  const [chargePerProperty, setChargePerProperty] = useState(0.05);
  const [starterPrice, setStarterPrice] = useState(29);
  const [starterLimit, setStarterLimit] = useState(100);
  const [proPrice, setProPrice] = useState(79);
  const [proLimit, setProLimit] = useState(500);
  const [enterprisePrice, setEnterprisePrice] = useState(199);

  const [starterTenants, setStarterTenants] = useState(0);
  const [proTenants, setProTenants] = useState(0);
  const [enterpriseTenants, setEnterpriseTenants] = useState(0);

  const usageBasedRevenue = monthlyProperties * chargePerProperty;
  const usageBasedProfit = usageBasedRevenue - monthlyCost;
  const usageBasedMargin = usageBasedRevenue > 0 ? (usageBasedProfit / usageBasedRevenue) * 100 : 0;

  const subscriptionRevenue =
    (starterTenants * starterPrice) +
    (proTenants * proPrice) +
    (enterpriseTenants * enterprisePrice);
  const subscriptionProfit = subscriptionRevenue - monthlyCost;
  const subscriptionMargin = subscriptionRevenue > 0 ? (subscriptionProfit / subscriptionRevenue) * 100 : 0;

  const suggestedMinPrice = actualCostPerProperty * 3;
  const breakEvenProperties = actualCostPerProperty > 0 ? monthlyCost / actualCostPerProperty : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="text-green-600" size={24} />
        <h3 className="text-lg font-semibold text-gray-900">Profitability Calculator</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Usage-Based Pricing</h4>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Charge Per Property
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={chargePerProperty}
                onChange={(e) => setChargePerProperty(parseFloat(e.target.value) || 0)}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-2 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Monthly Revenue:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(usageBasedRevenue)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Monthly Cost:</span>
              <span className="font-semibold text-red-600">{formatCurrency(monthlyCost)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="font-medium text-gray-900">Net Profit:</span>
              <span className={`font-bold ${usageBasedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(usageBasedProfit)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Profit Margin:</span>
              <span className={`font-semibold ${usageBasedMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {usageBasedMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Subscription Tier Pricing</h4>

          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Starter (${starterPrice}/mo)</label>
                <input
                  type="number"
                  value={starterTenants}
                  onChange={(e) => setStarterTenants(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="# tenants"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Limit</label>
                <input
                  type="number"
                  value={starterLimit}
                  onChange={(e) => setStarterLimit(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="props"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pro (${proPrice}/mo)</label>
                <input
                  type="number"
                  value={proTenants}
                  onChange={(e) => setProTenants(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="# tenants"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Limit</label>
                <input
                  type="number"
                  value={proLimit}
                  onChange={(e) => setProLimit(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="props"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Enterprise (${enterprisePrice}/mo)</label>
                <input
                  type="number"
                  value={enterpriseTenants}
                  onChange={(e) => setEnterpriseTenants(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="# tenants"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Limit</label>
                <input
                  type="text"
                  value="Unlimited"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Monthly Revenue:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(subscriptionRevenue)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Monthly Cost:</span>
              <span className="font-semibold text-red-600">{formatCurrency(monthlyCost)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="font-medium text-gray-900">Net Profit:</span>
              <span className={`font-bold ${subscriptionProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(subscriptionProfit)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Profit Margin:</span>
              <span className={`font-semibold ${subscriptionMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {subscriptionMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs text-blue-600 font-medium mb-1">Current Cost Per Property</p>
          <p className="text-2xl font-bold text-blue-900">${actualCostPerProperty.toFixed(4)}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-xs text-green-600 font-medium mb-1">Suggested Minimum Price (3x)</p>
          <p className="text-2xl font-bold text-green-900">${suggestedMinPrice.toFixed(4)}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-xs text-orange-600 font-medium mb-1">Breakeven Properties/Month</p>
          <p className="text-2xl font-bold text-orange-900">{Math.ceil(breakEvenProperties)}</p>
        </div>
      </div>
    </div>
  );
};
