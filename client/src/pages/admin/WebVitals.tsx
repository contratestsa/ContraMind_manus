import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RUMMetric {
  id: number;
  metricName: string;
  metricValue: number;
  metricRating: string;
  metricDelta: number | null;
  metricId: string | null;
  navigationType: string | null;
  url: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
}

interface MetricStats {
  name: string;
  count: number;
  avgValue: number;
  goodCount: number;
  needsImprovementCount: number;
  poorCount: number;
}

export default function WebVitalsPage() {
  const [metrics, setMetrics] = useState<RUMMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/rum/metrics?limit=100');
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.data);
      } else {
        setError(data.error || 'Failed to fetch metrics');
      }
    } catch (err) {
      setError('Network error while fetching metrics');
      console.error('[WebVitals] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // Calculate statistics
  const stats: Record<string, MetricStats> = {};
  metrics.forEach(metric => {
    if (!stats[metric.metricName]) {
      stats[metric.metricName] = {
        name: metric.metricName,
        count: 0,
        avgValue: 0,
        goodCount: 0,
        needsImprovementCount: 0,
        poorCount: 0,
      };
    }
    
    const stat = stats[metric.metricName];
    stat.count++;
    stat.avgValue += metric.metricValue;
    
    if (metric.metricRating === 'good') stat.goodCount++;
    else if (metric.metricRating === 'needs-improvement') stat.needsImprovementCount++;
    else if (metric.metricRating === 'poor') stat.poorCount++;
  });

  // Calculate averages
  Object.values(stats).forEach(stat => {
    stat.avgValue = stat.count > 0 ? Math.round(stat.avgValue / stat.count) : 0;
  });

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'needs-improvement': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'poor': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatValue = (name: string, value: number) => {
    if (name === 'CLS') {
      return (value / 1000).toFixed(3); // CLS is stored as int, convert back to decimal
    }
    return `${value}ms`;
  };

  const getTrendIcon = (delta: number | null) => {
    if (delta === null || delta === 0) return <Minus className="h-4 w-4" />;
    if (delta > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    return <TrendingDown className="h-4 w-4 text-green-500" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Web Vitals (RUM)</h1>
            <p className="text-muted-foreground">Real User Monitoring - Core Web Vitals Metrics</p>
          </div>
          <Button onClick={fetchMetrics} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
            <CardContent className="pt-6">
              <p className="text-red-800 dark:text-red-300">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {Object.values(stats).map(stat => (
            <Card key={stat.name}>
              <CardHeader>
                <CardTitle>{stat.name}</CardTitle>
                <CardDescription>{stat.count} measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-4">
                  {formatValue(stat.name, stat.avgValue)}
                </div>
                <div className="flex gap-2 text-sm">
                  <Badge className="bg-green-100 text-green-800">
                    Good: {stat.goodCount}
                  </Badge>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Needs Improvement: {stat.needsImprovementCount}
                  </Badge>
                  <Badge className="bg-red-100 text-red-800">
                    Poor: {stat.poorCount}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Metrics Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Measurements</CardTitle>
            <CardDescription>Last 100 metrics collected from users</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading metrics...</div>
            ) : metrics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No metrics collected yet. Visit some pages to start collecting data.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Delta</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Nav Type</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.map(metric => (
                      <TableRow key={metric.id}>
                        <TableCell className="font-medium">{metric.metricName}</TableCell>
                        <TableCell>{formatValue(metric.metricName, metric.metricValue)}</TableCell>
                        <TableCell>
                          <Badge className={getRatingColor(metric.metricRating)}>
                            {metric.metricRating}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(metric.metricDelta)}
                            {metric.metricDelta !== null && Math.abs(metric.metricDelta)}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={metric.url || undefined}>
                          {metric.url ? new URL(metric.url).pathname : '-'}
                        </TableCell>
                        <TableCell>{metric.navigationType || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(metric.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Web Vitals Targets Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Target Thresholds (p75)</CardTitle>
            <CardDescription>From QUALITY_GATES.md</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="font-semibold">LCP (Largest Contentful Paint)</div>
                <div className="text-sm text-muted-foreground">≤ 2.5 seconds (2500ms)</div>
              </div>
              <div>
                <div className="font-semibold">CLS (Cumulative Layout Shift)</div>
                <div className="text-sm text-muted-foreground">≤ 0.1</div>
              </div>
              <div>
                <div className="font-semibold">INP (Interaction to Next Paint)</div>
                <div className="text-sm text-muted-foreground">≤ 200ms</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

