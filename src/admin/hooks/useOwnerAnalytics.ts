import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export interface DailyMetrics {
  date: string;
  emails: number;
  properties: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost: number;
  cost_per_property: number;
  cost_per_email: number;
}

export interface PlatformMetrics {
  platform: string;
  count: number;
  properties: number;
  avg_confidence: number;
  image_match_rate: number;
}

export interface AnalyticsSummary {
  today: {
    emails: number;
    properties: number;
    cost: number;
    cost_per_property: number;
    cost_per_email: number;
  };
  month: {
    emails: number;
    properties: number;
    cost: number;
    cost_per_property: number;
    cost_per_email: number;
  };
  allTime: {
    emails: number;
    properties: number;
    cost: number;
    cost_per_property: number;
    cost_per_email: number;
  };
  dailyMetrics: DailyMetrics[];
  platformMetrics: PlatformMetrics[];
  qualityMetrics: {
    avg_confidence: number;
    low_confidence_rate: number;
    image_match_rate: number;
    error_rate: number;
  };
}

export const useOwnerAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const todayMetrics = await fetchTodayMetrics();
      const monthMetrics = await fetchMonthMetrics();
      const allTimeMetrics = await fetchAllTimeMetrics();
      const dailyMetrics = await fetchDailyMetrics();
      const platformMetrics = await fetchPlatformMetrics();
      const qualityMetrics = await fetchQualityMetrics();

      setAnalytics({
        today: todayMetrics,
        month: monthMetrics,
        allTime: allTimeMetrics,
        dailyMetrics,
        platformMetrics,
        qualityMetrics,
      });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayMetrics = async () => {
    const { data, error } = await supabase
      .from('import_logs')
      .select('properties_created, gpt_cost_usd')
      .gte('created_at', new Date().toISOString().split('T')[0]);

    if (error) throw error;

    const emails = data?.length || 0;
    const properties = data?.reduce((sum, log) => sum + (log.properties_created || 0), 0) || 0;
    const cost = data?.reduce((sum, log) => sum + (log.gpt_cost_usd || 0), 0) || 0;

    return {
      emails,
      properties,
      cost,
      cost_per_property: properties > 0 ? cost / properties : 0,
      cost_per_email: emails > 0 ? cost / emails : 0,
    };
  };

  const fetchMonthMetrics = async () => {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('import_logs')
      .select('properties_created, gpt_cost_usd')
      .gte('created_at', firstDayOfMonth.toISOString());

    if (error) throw error;

    const emails = data?.length || 0;
    const properties = data?.reduce((sum, log) => sum + (log.properties_created || 0), 0) || 0;
    const cost = data?.reduce((sum, log) => sum + (log.gpt_cost_usd || 0), 0) || 0;

    return {
      emails,
      properties,
      cost,
      cost_per_property: properties > 0 ? cost / properties : 0,
      cost_per_email: emails > 0 ? cost / emails : 0,
    };
  };

  const fetchAllTimeMetrics = async () => {
    const { data, error } = await supabase
      .from('import_logs')
      .select('properties_created, gpt_cost_usd');

    if (error) throw error;

    const emails = data?.length || 0;
    const properties = data?.reduce((sum, log) => sum + (log.properties_created || 0), 0) || 0;
    const cost = data?.reduce((sum, log) => sum + (log.gpt_cost_usd || 0), 0) || 0;

    return {
      emails,
      properties,
      cost,
      cost_per_property: properties > 0 ? cost / properties : 0,
      cost_per_email: emails > 0 ? cost / emails : 0,
    };
  };

  const fetchDailyMetrics = async (): Promise<DailyMetrics[]> => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('import_logs')
      .select('*')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    const dailyMap = new Map<string, DailyMetrics>();

    data?.forEach((log) => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      const existing = dailyMap.get(date) || {
        date,
        emails: 0,
        properties: 0,
        input_tokens: 0,
        output_tokens: 0,
        total_tokens: 0,
        cost: 0,
        cost_per_property: 0,
      };

      existing.emails += 1;
      existing.properties += log.properties_created || 0;
      existing.input_tokens += log.gpt_input_tokens || 0;
      existing.output_tokens += log.gpt_output_tokens || 0;
      existing.total_tokens += log.gpt_total_tokens || 0;
      existing.cost += log.gpt_cost_usd || 0;

      dailyMap.set(date, existing);
    });

    const metrics = Array.from(dailyMap.values());
    metrics.forEach((m) => {
      m.cost_per_property = m.properties > 0 ? m.cost / m.properties : 0;
      m.cost_per_email = m.emails > 0 ? m.cost / m.emails : 0;
    });

    return metrics;
  };

  const fetchPlatformMetrics = async (): Promise<PlatformMetrics[]> => {
    const { data, error } = await supabase
      .from('import_logs')
      .select('email_platform_detected, properties_created, avg_confidence_score, image_match_rate');

    if (error) throw error;

    const platformMap = new Map<string, {
      count: number;
      properties: number;
      total_confidence: number;
      total_image_match: number;
      confidence_count: number;
      image_match_count: number;
    }>();

    data?.forEach((log) => {
      const platform = log.email_platform_detected || 'Unknown';
      const existing = platformMap.get(platform) || {
        count: 0,
        properties: 0,
        total_confidence: 0,
        total_image_match: 0,
        confidence_count: 0,
        image_match_count: 0,
      };

      existing.count += 1;
      existing.properties += log.properties_created || 0;

      if (log.avg_confidence_score != null) {
        existing.total_confidence += log.avg_confidence_score;
        existing.confidence_count += 1;
      }

      if (log.image_match_rate != null) {
        existing.total_image_match += log.image_match_rate;
        existing.image_match_count += 1;
      }

      platformMap.set(platform, existing);
    });

    return Array.from(platformMap.entries()).map(([platform, stats]) => ({
      platform,
      count: stats.count,
      properties: stats.properties,
      avg_confidence: stats.confidence_count > 0 ? stats.total_confidence / stats.confidence_count : 0,
      image_match_rate: stats.image_match_count > 0 ? stats.total_image_match / stats.image_match_count : 0,
    }));
  };

  const fetchQualityMetrics = async () => {
    const { data: extractionLogs, error: extractionError } = await supabase
      .from('property_extraction_logs')
      .select('overall_confidence, image_matched');

    if (extractionError) throw extractionError;

    const { data: importLogs, error: importError } = await supabase
      .from('import_logs')
      .select('status');

    if (importError) throw importError;

    const totalProperties = extractionLogs?.length || 0;
    const lowConfidenceCount = extractionLogs?.filter((log) => (log.overall_confidence || 0) < 0.6).length || 0;
    const imageMatchedCount = extractionLogs?.filter((log) => log.image_matched).length || 0;
    const avgConfidence = totalProperties > 0
      ? extractionLogs.reduce((sum, log) => sum + (log.overall_confidence || 0), 0) / totalProperties
      : 0;

    const totalImports = importLogs?.length || 0;
    const errorCount = importLogs?.filter((log) => log.status === 'partial' || log.status === 'failed').length || 0;

    return {
      avg_confidence: avgConfidence,
      low_confidence_rate: totalProperties > 0 ? (lowConfidenceCount / totalProperties) * 100 : 0,
      image_match_rate: totalProperties > 0 ? (imageMatchedCount / totalProperties) * 100 : 0,
      error_rate: totalImports > 0 ? (errorCount / totalImports) * 100 : 0,
    };
  };

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};
