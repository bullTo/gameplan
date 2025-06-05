import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAnalytics } from '@/api/admin';
import { Loader2, Users, Zap, ListChecks } from 'lucide-react';
import { LineChart } from '@mui/x-charts/LineChart';
// Make sure emotion is properly imported
import '@emotion/react';
import '@emotion/styled';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getAnalytics('30d');
        setAnalytics(data);
      } catch (err) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#0EADAB]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        <h2 className="text-lg font-medium mb-2">Error Loading Dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const { userStats, subscriptionStats, promptStats, trackerStats } = analytics;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Users"
          value={userStats.totalUsers}
          description={`${userStats.newUsers} new in last 30 days`}
          icon={<Users className="h-5 w-5" />}
          color="blue"
        />
        <SummaryCard
          title="Subscription Plans"
          value={
            <div className="flex flex-col text-sm">
              <span>Free: {subscriptionStats.subscriptionCounts.free || 0}</span>
              <span>Pro: {subscriptionStats.subscriptionCounts.core || 0}</span>
              <span>Elite: {(subscriptionStats.subscriptionCounts.pro || 0) + (subscriptionStats.subscriptionCounts.elite || 0)}</span>
            </div>
          }
          description="Current distribution"
          icon={<Users className="h-5 w-5" />}
          color="purple"
        />
        <SummaryCard
          title="Prompt Usage"
          value={promptStats.totalPrompts}
          description={`${promptStats.promptsInPeriod} in last 30 days`}
          icon={<Zap className="h-5 w-5" />}
          color="yellow"
        />
        <SummaryCard
          title="Tracker Usage"
          value={trackerStats.totalPicks}
          description={`${trackerStats.picksInPeriod} in last 30 days`}
          icon={<ListChecks className="h-5 w-5" />}
          color="green"
        />
      </div>

      {/* User Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>New user registrations over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            {userStats.userGrowth.length > 0 ? (
              <UserGrowthChart data={userStats.userGrowth} />
            ) : (
              <p className="text-muted-foreground">No user growth data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
            <CardDescription>Current user subscription plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <SubscriptionChart data={subscriptionStats.subscriptionCounts} />
            </div>
          </CardContent>
        </Card>

        {/* Prompt Usage by Sport */}
        <Card>
          <CardHeader>
            <CardTitle>Prompt Usage by Sport</CardTitle>
            <CardDescription>Distribution of prompts by sport</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <SportDistributionChart data={promptStats.promptsBySport} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracker Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Tracker Statistics</CardTitle>
          <CardDescription>Pick status distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1B1C25] p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Pending</div>
              <div className="text-2xl font-bold">{trackerStats.picksByStatus.pending || 0}</div>
            </div>
            <div className="bg-[#1B1C25] p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Hits</div>
              <div className="text-2xl font-bold text-green-500">{trackerStats.picksByStatus.hit || 0}</div>
            </div>
            <div className="bg-[#1B1C25] p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Misses</div>
              <div className="text-2xl font-bold text-red-500">{trackerStats.picksByStatus.miss || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Summary Card Component
function SummaryCard({ title, value, description, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
    purple: 'bg-purple-500/10 text-purple-500',
    red: 'bg-red-500/10 text-red-500',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className={`p-2 rounded-full ${colorClasses[color] || colorClasses.blue}`}>
            {icon}
          </div>
        </div>
        <div className="text-2xl font-bold mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// Placeholder Chart Components
// In a real implementation, you would use a charting library like Recharts or Chart.js
function UserGrowthChart({ data }) {
  // If no data, show a message
  if (!data || data.length === 0) {
    return <p className="text-muted-foreground">No user growth data available</p>;
  }

  // Generate sample data if needed for testing
  const sampleData = [];
  if (data.length < 2) {
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - (30 - i));
      sampleData.push({
        date: date.toISOString(),
        count: Math.floor(Math.random() * 5) + 1
      });
    }
  }

  // Use real data if available, otherwise use sample data
  const chartData = data.length >= 2 ? data : sampleData;

  // Format data for MUI X Charts
  const xLabels = chartData.map(item => {
    const date = new Date(item.date);
    return date.getDate(); // Day of month
  });

  const yValues = chartData.map(item => item.count);

  // Find min and max for y-axis
  const maxCount = Math.max(...yValues);
  const yAxisMax = Math.ceil(maxCount * 1.2); // Add 20% padding

  // Format tooltip data
  const valueFormatter = (value, context) => {
    if (context.type === 'data') {
      const dataIndex = context.dataIndex;
      const date = new Date(chartData[dataIndex].date);
      return `${date.toLocaleDateString()}: ${value} users`;
    }
    return value;
  };

  // Log data for debugging
  console.log('Chart data:', chartData);
  console.log('X labels:', xLabels);
  console.log('Y values:', yValues);

  return (
    <div className="w-full h-[250px]">
      <div style={{ width: '100%', height: '100%' }}>
        <LineChart
          margin={{ top: 20, right: 20, bottom: 30, left: 40 }}
          series={[
            {
              data: yValues,
              label: 'New Users',
              color: '#0EADAB',
              showMark: true,
              valueFormatter,
              curve: "linear",
              // Make the label white
              labelStyle: {
                fill: 'white',
              },
            },
          ]}
          xAxis={[
            {
              data: xLabels,
              scaleType: 'point',
              valueFormatter: (value) => `Day ${value}`,
              tickLabelStyle: {
                fontSize: 12,
                fill: 'white', // Make x-axis labels white
              },
              label: 'Day',
              labelStyle: {
                fill: 'white', // Make x-axis title white
              },
            },
          ]}
          yAxis={[
            {
              min: 0,
              max: yAxisMax,
              tickLabelStyle: {
                fontSize: 12,
                fill: 'white', // Make y-axis labels white
              },
              label: 'Users',
              labelStyle: {
                fill: 'white', // Make y-axis title white
              },
            },
          ]}
          sx={{
            '.MuiLineElement-root': {
              strokeWidth: 3,
            },
            '.MuiMarkElement-root': {
              stroke: 'white',
              strokeWidth: 2,
              r: 5,
              fill: '#0EADAB',
            },
            '.MuiChartsAxis-tickLabel': {
              fontSize: '0.75rem',
              fill: 'white', // Ensure all tick labels are white
            },
            '.MuiChartsAxis-tick': {
              stroke: 'rgba(255, 255, 255, 0.5)', // Lighter white for ticks
            },
            '.MuiChartsAxis-line': {
              stroke: 'rgba(255, 255, 255, 0.5)', // Lighter white for axis lines
            },
            '.MuiChartsLegend-label': {
              fill: 'white', // White legend text
            },
            '.MuiChartsLegend-series': {
              fill: 'white', // White legend elements
            },
            '.MuiChartsAxis-label': {
              fill: 'white', // White axis labels
              fontSize: '0.8rem',
            },
            width: '100%',
            height: '100%',
          }}
          tooltip={{ trigger: 'item' }}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
        />
      </div>

      {/* Custom Legend */}
      <div className="flex justify-center mt-2 text-xs text-muted-foreground">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#0EADAB] rounded-full mr-1"></div>
          <span>New user registrations</span>
        </div>
      </div>
    </div>
  );
}

function SubscriptionChart({ data }) {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    return <p className="text-muted-foreground">No subscription data available</p>;
  }

  const colors = {
    free: 'bg-blue-500',
    core: 'bg-purple-500',
    pro: 'bg-yellow-500',
    elite: 'bg-green-500'
  };

  // Map subscription plan names for display
  const planNames = {
    free: 'Free',
    core: 'Pro',
    pro: 'Pro',
    elite: 'Elite'
  };

  return (
    <div className="h-full flex flex-col justify-center">
      <div className="w-full h-8 flex rounded-md overflow-hidden mb-4">
        {Object.entries(data).map(([plan, count]) => (
          <div
            key={plan}
            className={`${colors[plan] || 'bg-gray-500'}`}
            style={{ width: `${(count / total) * 100}%` }}
            title={`${plan}: ${count} users (${Math.round((count / total) * 100)}%)`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {Object.entries(data).map(([plan, count]) => (
          <div key={plan} className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${colors[plan] || 'bg-gray-500'} mr-2`} />
            <span>{planNames[plan] || plan}: </span>
            <span className="font-medium ml-1">{count} ({Math.round((count / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SportDistributionChart({ data }) {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    return <p className="text-muted-foreground">No sport distribution data available</p>;
  }

  const colors = {
    NBA: 'bg-orange-500',
    MLB: 'bg-blue-500',
    NFL: 'bg-green-500',
    NHL: 'bg-purple-500'
  };

  return (
    <div className="h-full flex flex-col justify-center">
      <div className="w-full h-8 flex rounded-md overflow-hidden mb-4">
        {Object.entries(data).map(([sport, count]) => (
          <div
            key={sport}
            className={`${colors[sport] || 'bg-gray-500'}`}
            style={{ width: `${(count / total) * 100}%` }}
            title={`${sport}: ${count} prompts (${Math.round((count / total) * 100)}%)`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {Object.entries(data).map(([sport, count]) => (
          <div key={sport} className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${colors[sport] || 'bg-gray-500'} mr-2`} />
            <span>{sport}: </span>
            <span className="font-medium ml-1">{count} ({Math.round((count / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
