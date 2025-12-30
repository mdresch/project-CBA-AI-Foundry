import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../../utils/analytics';
import { useTheme } from '../../context/useTheme';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  Activity,
  Download,
  RefreshCw,
  Calendar,
  Filter
} from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  totalSessions: number;
  totalMessages: number;
  averageSessionDuration: number;
  averageMessagesPerSession: number;
  mostUsedModel: string;
  engagementRate: number;
  errorRate: number;
  topTemplates: Array<{ name: string; count: number }>;
  hourlyActivity: Array<{ hour: number; count: number }>;
  dailyActivity: Array<{ date: string; count: number }>;
  userBehavior: Array<{
    userId: string;
    totalSessions: number;
    totalMessages: number;
    averageSessionDuration: number;
    lastActive: string;
  }>;
}

export const AnalyticsDashboard: React.FC = () => {
  const { isDarkTheme } = useTheme();
  const { getAnalyticsData } = useAnalytics();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{
    start: Date;
    end: Date;
  }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const analyticsData = await getAnalyticsData(dateRange.start, dateRange.end);
      
      // Process the raw data into dashboard format
      const processedData = processAnalyticsData(analyticsData);
      setData(processedData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (rawData: any): AnalyticsData => {
    const { userBehavior, sessionAnalytics, events } = rawData;
    
    // Calculate metrics
    const totalUsers = new Set(userBehavior.map((u: any) => u.user_id)).size;
    const totalSessions = sessionAnalytics.length;
    const totalMessages = sessionAnalytics.reduce((sum: number, s: any) => sum + s.message_count, 0);
    const averageSessionDuration = sessionAnalytics.reduce((sum: number, s: any) => sum + (s.duration || 0), 0) / totalSessions;
    const averageMessagesPerSession = totalMessages / totalSessions;
    
    // Most used model
    const modelUsage = events
      .filter((e: any) => e.event_type === 'message_sent' && e.data?.model)
      .reduce((acc: any, e: any) => {
        acc[e.data.model] = (acc[e.data.model] || 0) + 1;
        return acc;
      }, {});
    const mostUsedModel = Object.keys(modelUsage).reduce((a, b) => 
      modelUsage[a] > modelUsage[b] ? a : b, 'Unknown'
    );

    // Engagement rate (sessions with > 5 messages)
    const engagedSessions = sessionAnalytics.filter((s: any) => s.message_count > 5).length;
    const engagementRate = (engagedSessions / totalSessions) * 100;

    // Error rate
    const errorEvents = events.filter((e: any) => e.event_type === 'error_occurred').length;
    const errorRate = (errorEvents / events.length) * 100;

    // Top templates
    const templateUsage = events
      .filter((e: any) => e.event_type === 'template_used' && e.data?.templateName)
      .reduce((acc: any, e: any) => {
        acc[e.data.templateName] = (acc[e.data.templateName] || 0) + 1;
        return acc;
      }, {});
    const topTemplates = Object.entries(templateUsage)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Hourly activity
    const hourlyActivity = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: events.filter((e: any) => {
        const hour = new Date(e.timestamp).getHours();
        return hour === i;
      }).length
    }));

    // Daily activity
    const dailyActivity = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      return {
        date: dateStr,
        count: events.filter((e: any) => 
          e.timestamp.startsWith(dateStr)
        ).length
      };
    }).reverse();

    // User behavior summary
    const userBehaviorSummary = userBehavior.map((u: any) => ({
      userId: u.user_id,
      totalSessions: u.total_sessions || 0,
      totalMessages: u.total_messages || 0,
      averageSessionDuration: u.average_session_duration || 0,
      lastActive: u.updated_at
    }));

    return {
      totalUsers,
      totalSessions,
      totalMessages,
      averageSessionDuration,
      averageMessagesPerSession,
      mostUsedModel,
      engagementRate,
      errorRate,
      topTemplates,
      hourlyActivity,
      dailyActivity,
      userBehavior: userBehaviorSummary
    };
  };

  const exportData = () => {
    if (!data) return;
    
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Users', data.totalUsers.toString()],
      ['Total Sessions', data.totalSessions.toString()],
      ['Total Messages', data.totalMessages.toString()],
      ['Average Session Duration', `${Math.round(data.averageSessionDuration / 1000)}s`],
      ['Average Messages Per Session', data.averageMessagesPerSession.toFixed(2)],
      ['Most Used Model', data.mostUsedModel],
      ['Engagement Rate', `${data.engagementRate.toFixed(2)}%`],
      ['Error Rate', `${data.errorRate.toFixed(2)}%`]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={`p-6 ${isDarkTheme ? 'bg-zinc-900 text-white' : 'bg-white text-gray-900'}`}>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`p-6 ${isDarkTheme ? 'bg-zinc-900 text-white' : 'bg-white text-gray-900'}`}>
        <div className="text-center">
          <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
          <p className="text-gray-500">No data available for the selected date range.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${isDarkTheme ? 'bg-zinc-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-gray-500">
              {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadAnalyticsData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportData} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className={`p-6 ${isDarkTheme ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">{data.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className={`p-6 ${isDarkTheme ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Sessions</p>
                <p className="text-2xl font-bold">{data.totalSessions}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className={`p-6 ${isDarkTheme ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Messages</p>
                <p className="text-2xl font-bold">{data.totalMessages}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </Card>

          <Card className={`p-6 ${isDarkTheme ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg Session Duration</p>
                <p className="text-2xl font-bold">{Math.round(data.averageSessionDuration / 1000)}s</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className={`p-6 ${isDarkTheme ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4">Engagement Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Engagement Rate</span>
                <span className="font-semibold">{data.engagementRate.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Messages/Session</span>
                <span className="font-semibold">{data.averageMessagesPerSession.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Error Rate</span>
                <span className="font-semibold">{data.errorRate.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Most Used Model</span>
                <span className="font-semibold">{data.mostUsedModel}</span>
              </div>
            </div>
          </Card>

          <Card className={`p-6 ${isDarkTheme ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4">Top Templates</h3>
            <div className="space-y-2">
              {data.topTemplates.map((template, index) => (
                <div key={template.name} className="flex justify-between">
                  <span className="truncate">{template.name}</span>
                  <span className="font-semibold">{template.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Activity Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className={`p-6 ${isDarkTheme ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4">Hourly Activity</h3>
            <div className="space-y-2">
              {data.hourlyActivity.map((hour) => (
                <div key={hour.hour} className="flex items-center">
                  <span className="w-12 text-sm">{hour.hour}:00</span>
                  <div className="flex-1 mx-2">
                    <div className="bg-gray-200 dark:bg-zinc-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(hour.count / Math.max(...data.hourlyActivity.map(h => h.count))) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-8 text-sm text-right">{hour.count}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className={`p-6 ${isDarkTheme ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4">Daily Activity (Last 30 Days)</h3>
            <div className="space-y-2">
              {data.dailyActivity.slice(-7).map((day) => (
                <div key={day.date} className="flex items-center">
                  <span className="w-20 text-sm">{new Date(day.date).toLocaleDateString()}</span>
                  <div className="flex-1 mx-2">
                    <div className="bg-gray-200 dark:bg-zinc-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(day.count / Math.max(...data.dailyActivity.map(d => d.count))) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-8 text-sm text-right">{day.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
