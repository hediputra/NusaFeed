import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, BarChart3, Clock } from 'lucide-react';
import { Article } from '../types.ts';

interface ArticleVolumeChartProps {
  articles: Article[];
  theme: 'light' | 'dark';
}

export default function ArticleVolumeChart({ articles, theme }: ArticleVolumeChartProps) {
  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    // Build 24 hour blocks
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 0, 0, 0);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
      
      const label = `${String(hourStart.getHours()).padStart(2, '0')}:00`;
      
      const count = articles.filter((art) => {
        const pubDate = new Date(art.publishedAt);
        return pubDate >= hourStart && pubDate < hourEnd;
      }).length;
      
      data.push({
        hour: label,
        jumlah: count,
      });
    }
    return data;
  }, [articles]);

  const totalLast24h = useMemo(() => {
    return chartData.reduce((acc, item) => acc + item.jumlah, 0);
  }, [chartData]);

  const peakHour = useMemo(() => {
    let max = 0;
    let label = '-';
    chartData.forEach(item => {
      if (item.jumlah > max) {
        max = item.jumlah;
        label = item.hour;
      }
    });
    return { label, max };
  }, [chartData]);

  const isDark = theme === 'dark';

  return (
    <div 
      id="article-volume-chart-container"
      className="bg-white dark:bg-gray-950 rounded-2xl border border-slate-200/90 dark:border-gray-850 p-5 md:p-6 shadow-sm transition-all duration-300"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 rounded-full p-1">
              <TrendingUp className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Analitik Publikasi
            </span>
          </div>
          <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white leading-tight">
            Volume Berita (24 Jam Terakhir)
          </h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Jumlah artikel berita baru yang berhasil disinkronisasi setiap jamnya dari seluruh media nasional.
          </p>
        </div>

        {/* Bento-style stats highlights inside the chart box */}
        <div className="flex items-center gap-3 self-start md:self-center">
          <div className="bg-slate-50 dark:bg-gray-900 px-3.5 py-2 rounded-xl border border-slate-100 dark:border-gray-850">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total 24J</p>
            <p className="text-base font-extrabold text-slate-800 dark:text-white mt-0.5">
              {totalLast24h} <span className="text-xs font-medium text-slate-500">berita</span>
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-gray-900 px-3.5 py-2 rounded-xl border border-slate-100 dark:border-gray-850">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Jam Terpadat</p>
            <p className="text-base font-extrabold text-slate-800 dark:text-white mt-0.5">
              {peakHour.label} <span className="text-xs font-normal text-slate-400">({peakHour.max})</span>
            </p>
          </div>
        </div>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="chartLineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDark ? '#1f2937' : '#e2e8f0'} 
              vertical={false}
            />
            <XAxis 
              dataKey="hour" 
              stroke={isDark ? '#6b7280' : '#94a3b8'} 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke={isDark ? '#6b7280' : '#94a3b8'} 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#030712' : '#ffffff',
                borderColor: isDark ? '#1f2937' : '#e2e8f0',
                borderRadius: '12px',
                color: isDark ? '#f3f4f6' : '#0f172a',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              labelClassName="font-bold text-indigo-600 dark:text-indigo-400"
              itemStyle={{ color: isDark ? '#f3f4f6' : '#1e293b' }}
              labelFormatter={(label) => `Jam ${label}`}
              formatter={(value: any) => [`${value} artikel`, 'Terbit']}
            />
            <Line
              type="monotone"
              dataKey="jumlah"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 4, stroke: '#6366f1', strokeWidth: 1, fill: isDark ? '#030712' : '#ffffff' }}
              activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2, fill: '#6366f1' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
