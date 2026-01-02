import { Activity, AlertTriangle, CheckCircle, Image } from 'lucide-react';

interface SystemHealthMetricsProps {
  qualityMetrics: {
    avg_confidence: number;
    low_confidence_rate: number;
    image_match_rate: number;
    error_rate: number;
  };
}

export const SystemHealthMetrics = ({ qualityMetrics }: SystemHealthMetricsProps) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRateColor = (rate: number, isError = false) => {
    if (isError) {
      if (rate <= 5) return 'text-green-600 bg-green-100';
      if (rate <= 15) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    }
    if (rate >= 70) return 'text-green-600 bg-green-100';
    if (rate >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="text-blue-600" size={24} />
        <h3 className="text-lg font-semibold text-gray-900">System Health & Quality Metrics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-blue-600" size={20} />
            <p className="text-sm font-medium text-gray-600">Avg Confidence Score</p>
          </div>
          <p className={`text-3xl font-bold mb-1 ${getConfidenceColor(qualityMetrics.avg_confidence).split(' ')[0]}`}>
            {(qualityMetrics.avg_confidence * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">Target: &gt;80%</p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-orange-600" size={20} />
            <p className="text-sm font-medium text-gray-600">Low Confidence Rate</p>
          </div>
          <p className={`text-3xl font-bold mb-1 ${getRateColor(qualityMetrics.low_confidence_rate, true).split(' ')[0]}`}>
            {qualityMetrics.low_confidence_rate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">Target: &lt;10%</p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Image className="text-green-600" size={20} />
            <p className="text-sm font-medium text-gray-600">Image Match Rate</p>
          </div>
          <p className={`text-3xl font-bold mb-1 ${getRateColor(qualityMetrics.image_match_rate).split(' ')[0]}`}>
            {qualityMetrics.image_match_rate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">Target: &gt;70%</p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-red-600" size={20} />
            <p className="text-sm font-medium text-gray-600">Error Rate</p>
          </div>
          <p className={`text-3xl font-bold mb-1 ${getRateColor(qualityMetrics.error_rate, true).split(' ')[0]}`}>
            {qualityMetrics.error_rate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">Target: &lt;5%</p>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Quality Distribution</h4>
        <div className="flex gap-2">
          <div className="flex-1 bg-green-100 rounded-lg p-3 border border-green-200">
            <p className="text-xs text-green-700 font-medium mb-1">High Confidence (&gt;80%)</p>
            <p className="text-lg font-bold text-green-900">
              {(100 - qualityMetrics.low_confidence_rate - ((1 - qualityMetrics.avg_confidence) * 100)).toFixed(0)}%
            </p>
          </div>
          <div className="flex-1 bg-yellow-100 rounded-lg p-3 border border-yellow-200">
            <p className="text-xs text-yellow-700 font-medium mb-1">Medium (60-80%)</p>
            <p className="text-lg font-bold text-yellow-900">
              {((1 - qualityMetrics.avg_confidence) * 100).toFixed(0)}%
            </p>
          </div>
          <div className="flex-1 bg-red-100 rounded-lg p-3 border border-red-200">
            <p className="text-xs text-red-700 font-medium mb-1">Low (&lt;60%)</p>
            <p className="text-lg font-bold text-red-900">
              {qualityMetrics.low_confidence_rate.toFixed(0)}%
            </p>
          </div>
          <div className="flex-1 bg-gray-100 rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-700 font-medium mb-1">Errors</p>
            <p className="text-lg font-bold text-gray-900">
              {qualityMetrics.error_rate.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
