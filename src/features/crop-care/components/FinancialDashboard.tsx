
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from './Toast';

interface FinancialData {
  revenue: {
    total: number;
    byMonth: { month: string; amount: number }[];
    byCrop: { crop: string; amount: number; percentage: number }[];
  };
  costs: {
    total: number;
    breakdown: { category: string; amount: number; percentage: number }[];
  };
  profit: {
    gross: number;
    net: number;
    margin: number;
    roi: number;
  };
  marketPrices: {
    current: number;
    trend: string;
    forecast: { month: string; price: number }[];
  };
  cashFlow: {
    month: string;
    income: number;
    expenses: number;
    net: number;
  }[];
}

interface FinancialDashboardProps {
  cropType: string;
  fieldSize: string;
  expectedYield?: number;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ cropType, fieldSize, expectedYield }) => {
  const toast = useToast();
  const [data, setData] = useState<FinancialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'month' | 'season' | 'year'>('season');

  useEffect(() => {
    // Simulate loading financial data
    setTimeout(() => {
      const fieldAcres = parseInt(fieldSize) || 50;
      const crop = cropType.toLowerCase();
      const isPotato = crop.includes('potato');
      // Yield per acre from the AI prediction, else a typical per-acre figure
      const yieldAmount = expectedYield || (isPotato ? 15 : crop.match(/corn|wheat|soy/) ? 150 : 10);

      // Approximate farm-gate prices per unit (CAD)
      let pricePerUnit = 5.5; // Default corn price per bushel
      if (isPotato) {
        pricePerUnit = 300; // per ton (Atlantic Canada table potatoes, approx.)
      } else if (crop.includes('wheat')) {
        pricePerUnit = 7.2; // per bushel
      } else if (cropType.toLowerCase().includes('soybean')) {
        pricePerUnit = 13.5; // per bushel
      } else if (cropType.toLowerCase().includes('corn')) {
        pricePerUnit = 5.5; // per bushel
      } else {
        // For vegetables/other crops measured in tons
        pricePerUnit = 450; // per ton (e.g., tomatoes, lettuce)
      }

      const currentMonth = new Date().getMonth(); // 0-11

      const totalRevenue = fieldAcres * yieldAmount * pricePerUnit;

      // Realistic cost per acre for modern farming
      const seedCost = fieldAcres * 135;           // Seeds & planting
      const fertilizerCost = fieldAcres * 220;     // Fertilizers & nutrients
      const pesticideCost = fieldAcres * 105;      // Pesticides & herbicides
      const laborCost = fieldAcres * 180;          // Labor (hired + management)
      const equipmentCost = fieldAcres * 195;      // Equipment, fuel, maintenance
      const irrigationCost = fieldAcres * 85;      // Water & irrigation
      const landCost = fieldAcres * 180;           // Land rent/mortgage
      const insuranceCost = fieldAcres * 45;       // Crop insurance
      const utilitiesCost = fieldAcres * 35;       // Utilities & misc

      const totalCosts = seedCost + fertilizerCost + pesticideCost + laborCost +
                        equipmentCost + irrigationCost + landCost + insuranceCost + utilitiesCost;

      // Generate monthly data
      const allMonths = [
        { month: 'Jan', amount: 0, income: 0, expenses: seedCost * 0.5 },
        { month: 'Feb', amount: 0, income: 0, expenses: fertilizerCost * 0.6 },
        { month: 'Mar', amount: totalRevenue * 0.05, income: totalRevenue * 0.05, expenses: irrigationCost * 0.3 },
        { month: 'Apr', amount: totalRevenue * 0.1, income: totalRevenue * 0.1, expenses: pesticideCost * 0.4 },
        { month: 'May', amount: totalRevenue * 0.15, income: totalRevenue * 0.15, expenses: laborCost * 0.2 },
        { month: 'Jun', amount: totalRevenue * 0.2, income: totalRevenue * 0.2, expenses: irrigationCost * 0.5 },
        { month: 'Jul', amount: totalRevenue * 0.25, income: totalRevenue * 0.25, expenses: laborCost * 0.5 },
        { month: 'Aug', amount: totalRevenue * 0.15, income: totalRevenue * 0.15, expenses: equipmentCost * 0.6 },
        { month: 'Sep', amount: totalRevenue * 0.08, income: totalRevenue * 0.08, expenses: laborCost * 0.2 },
        { month: 'Oct', amount: totalRevenue * 0.02, income: totalRevenue * 0.02, expenses: equipmentCost * 0.3 },
        { month: 'Nov', amount: 0, income: 0, expenses: landCost * 0.3 },
        { month: 'Dec', amount: 0, income: 0, expenses: insuranceCost }
      ];

      // Filter cash flow data based on timeframe (for Cash Flow Timeline chart only)
      let cashFlowData = allMonths;
      if (timeframe === 'month') {
        // Show only current month
        cashFlowData = [allMonths[currentMonth]];
      } else if (timeframe === 'season') {
        // Show March through October (growing season)
        cashFlowData = allMonths.slice(2, 10);
      }
      // 'year' shows all 12 months (default)

      setData({
        revenue: {
          total: totalRevenue,
          byMonth: allMonths, // Always show all months for revenue chart
          byCrop: [
            { crop: cropType, amount: totalRevenue, percentage: 100 }
          ]
        },
        costs: {
          total: totalCosts,
          breakdown: [
            { category: 'Seeds & Planting', amount: seedCost, percentage: (seedCost/totalCosts)*100 },
            { category: 'Fertilizers & Nutrients', amount: fertilizerCost, percentage: (fertilizerCost/totalCosts)*100 },
            { category: 'Pesticides & Herbicides', amount: pesticideCost, percentage: (pesticideCost/totalCosts)*100 },
            { category: 'Labor & Management', amount: laborCost, percentage: (laborCost/totalCosts)*100 },
            { category: 'Equipment & Fuel', amount: equipmentCost, percentage: (equipmentCost/totalCosts)*100 },
            { category: 'Irrigation & Water', amount: irrigationCost, percentage: (irrigationCost/totalCosts)*100 },
            { category: 'Land Rent/Mortgage', amount: landCost, percentage: (landCost/totalCosts)*100 },
            { category: 'Insurance', amount: insuranceCost, percentage: (insuranceCost/totalCosts)*100 },
            { category: 'Utilities & Misc', amount: utilitiesCost, percentage: (utilitiesCost/totalCosts)*100 }
          ]
        },
        profit: {
          gross: totalRevenue - totalCosts,
          net: totalRevenue - totalCosts - (totalRevenue * 0.05), // After 5% overhead/misc
          margin: totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0,
          roi: totalCosts > 0 ? ((totalRevenue - totalCosts) / totalCosts) * 100 : 0
        },
        marketPrices: {
          current: pricePerUnit,
          trend: 'up',
          forecast: [
            { month: 'Mar', price: pricePerUnit * 0.95 },
            { month: 'Apr', price: pricePerUnit * 0.98 },
            { month: 'May', price: pricePerUnit * 1.02 },
            { month: 'Jun', price: pricePerUnit * 1.05 },
            { month: 'Jul', price: pricePerUnit * 1.08 },
            { month: 'Aug', price: pricePerUnit * 1.03 }
          ]
        },
        cashFlow: cashFlowData.map(m => ({
          month: m.month,
          income: m.income,
          expenses: m.expenses,
          net: m.income - m.expenses
        }))
      });
      setIsLoading(false);
    }, 500);
  }, [cropType, fieldSize, expectedYield, timeframe]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading || !data) {
    return (
      <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/10">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-300 font-medium animate-pulse">Calculating financials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Key Metrics */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fas fa-dollar-sign text-2xl"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold">Financial Overview</h3>
              <p className="text-sm text-emerald-100">Revenue, Costs & Profitability</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                timeframe === 'month' ? 'bg-white text-emerald-600' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeframe('season')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                timeframe === 'season' ? 'bg-white text-emerald-600' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              Season
            </button>
            <button
              onClick={() => setTimeframe('year')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                timeframe === 'year' ? 'bg-white text-emerald-600' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              Year
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-xs text-emerald-100 uppercase font-bold mb-1">Total Revenue</p>
            <p className="text-2xl md:text-3xl font-bold">{formatCurrency(data.revenue.total)}</p>
            <div className="flex items-center gap-1 mt-1">
              <i className="fas fa-arrow-up text-green-300 text-xs"></i>
              <span className="text-xs text-emerald-100">+12% vs last season</span>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-xs text-emerald-100 uppercase font-bold mb-1">Total Costs</p>
            <p className="text-2xl md:text-3xl font-bold">{formatCurrency(data.costs.total)}</p>
            <div className="flex items-center gap-1 mt-1">
              <i className="fas fa-arrow-down text-green-300 text-xs"></i>
              <span className="text-xs text-emerald-100">-5% vs last season</span>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className={`backdrop-blur-sm rounded-xl p-4 ${
            data.profit.net >= 0 ? 'bg-white/10' : 'bg-red-500/20 border border-red-300/30'
          }`}>
            <p className="text-xs text-emerald-100 uppercase font-bold mb-1">Net Profit</p>
            <p className={`text-2xl md:text-3xl font-bold ${data.profit.net >= 0 ? '' : 'text-red-200'}`}>
              {formatCurrency(data.profit.net)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {data.profit.net >= 0 ? (
                <span className="text-xs text-emerald-100">{data.profit.margin.toFixed(1)}% margin</span>
              ) : (
                <span className="text-xs text-red-200">Operating at loss</span>
              )}
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className={`backdrop-blur-sm rounded-xl p-4 ${
            data.profit.roi >= 0 ? 'bg-white/10' : 'bg-red-500/20 border border-red-300/30'
          }`}>
            <p className="text-xs text-emerald-100 uppercase font-bold mb-1">ROI</p>
            <p className={`text-2xl md:text-3xl font-bold ${data.profit.roi >= 0 ? '' : 'text-red-200'}`}>
              {data.profit.roi.toFixed(1)}%
            </p>
            <div className="flex items-center gap-1 mt-1">
              {data.profit.roi >= 20 ? (
                <>
                  <i className="fas fa-chart-line text-green-300 text-xs"></i>
                  <span className="text-xs text-emerald-100">Strong return</span>
                </>
              ) : data.profit.roi >= 0 ? (
                <>
                  <i className="fas fa-minus text-yellow-300 text-xs"></i>
                  <span className="text-xs text-emerald-100">Modest return</span>
                </>
              ) : (
                <>
                  <i className="fas fa-exclamation-triangle text-red-300 text-xs"></i>
                  <span className="text-xs text-red-200">Negative return</span>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Timeline */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-6 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <i className="fas fa-chart-area text-emerald-400"></i>
              Cash Flow Timeline
            </h4>
            <span className="text-xs bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-2 py-1 rounded-full font-medium">
              {timeframe === 'month' ? 'Current Month' : timeframe === 'season' ? 'Growing Season' : 'Full Year'}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.cashFlow}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Income" />
              <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Breakdown Pie Chart */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-6 hover:shadow-2xl transition-shadow duration-300">
          <h4 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <i className="fas fa-chart-pie text-emerald-400"></i>
            Cost Breakdown
          </h4>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={250}>
              <PieChart>
                <Pie
                  data={data.costs.breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="amount"
                >
                  {data.costs.breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {data.costs.breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="flex-1 text-slate-300">{item.category}</span>
                  <span className="font-bold text-slate-100">{item.percentage.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-6 hover:shadow-2xl transition-shadow duration-300">
          <h4 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <i className="fas fa-chart-line text-emerald-400"></i>
            Monthly Revenue Distribution
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.revenue.byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Market Price Forecast */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-6 hover:shadow-2xl transition-shadow duration-300">
          <h4 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <i className="fas fa-trending-up text-emerald-400"></i>
            Market Price Forecast
          </h4>
          <div className="mb-4 bg-blue-500/20 backdrop-blur-md border border-blue-500/30 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-400 font-bold uppercase">Current Price</p>
              <p className="text-2xl font-bold text-blue-200">{formatCurrency(data.marketPrices.current)}</p>
            </div>
            <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-full">
              <i className="fas fa-arrow-up text-green-400 text-sm"></i>
              <span className="text-sm font-bold text-green-300">Trending Up</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data.marketPrices.forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${value.toFixed(1)}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                formatter={(value: number) => `$${value.toFixed(2)}`}
              />
              <Area type="monotone" dataKey="price" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Cost Table */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
        <div className="bg-white/5 backdrop-blur-md px-6 py-4 border-b border-white/10">
          <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <i className="fas fa-table text-emerald-400"></i>
            Detailed Cost Analysis
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 backdrop-blur-md">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">% of Total</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">Per Acre</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {data.costs.breakdown.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="text-sm font-medium text-slate-100">{item.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-slate-100">{formatCurrency(item.amount)}</td>
                  <td className="px-6 py-4 text-right text-sm text-slate-300">{item.percentage.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-right text-sm text-emerald-400 font-medium">
                    {formatCurrency(item.amount / parseInt(fieldSize))}
                  </td>
                </tr>
              ))}
              <tr className="bg-white/5 backdrop-blur-md font-bold">
                <td className="px-6 py-4 text-sm text-slate-100">Total Operating Costs</td>
                <td className="px-6 py-4 text-right text-sm text-slate-100">{formatCurrency(data.costs.total)}</td>
                <td className="px-6 py-4 text-right text-sm text-slate-100">100%</td>
                <td className="px-6 py-4 text-right text-sm text-emerald-400">
                  {formatCurrency(data.costs.total / parseInt(fieldSize))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Profitability Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center">
              <i className="fas fa-hand-holding-usd text-emerald-400"></i>
            </div>
            <h5 className="font-bold text-emerald-200">Break-Even Analysis</h5>
          </div>
          <p className="text-sm text-emerald-300 mb-2">
            You need to sell <span className="font-bold">{((data.costs.total / data.marketPrices.current) / parseInt(fieldSize)).toFixed(0)} {cropType.toLowerCase().includes('corn') ? 'bushels' : 'tons'}/acre</span> to break even.
          </p>
          <p className="text-xs text-emerald-400">
            Current projection: {expectedYield || 150} {cropType.toLowerCase().includes('corn') ? 'bushels' : 'tons'}/acre - {((expectedYield || 150) - ((data.costs.total / data.marketPrices.current) / parseInt(fieldSize))).toFixed(0)} above break-even!
          </p>
        </div>

        <div className="bg-blue-500/20 backdrop-blur-md border border-blue-500/30 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center">
              <i className="fas fa-piggy-bank text-blue-400"></i>
            </div>
            <h5 className="font-bold text-blue-200">Cost Optimization</h5>
          </div>
          <p className="text-sm text-blue-300 mb-2">
            Top opportunity: <span className="font-bold">Fertilizer costs</span> are {data.costs.breakdown[1].percentage.toFixed(0)}% of budget.
          </p>
          <p className="text-xs text-blue-400">
            Consider precision application to reduce by 10-15% while maintaining yield.
          </p>
        </div>

        <div className="bg-purple-500/20 backdrop-blur-md border border-purple-500/30 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center">
              <i className="fas fa-chart-line text-purple-400"></i>
            </div>
            <h5 className="font-bold text-purple-200">Revenue Opportunity</h5>
          </div>
          <p className="text-sm text-purple-300 mb-2">
            Market prices trending <span className="font-bold">+8% over next 3 months</span>.
          </p>
          <p className="text-xs text-purple-400">
            Consider storage options to capture higher prices post-harvest.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
