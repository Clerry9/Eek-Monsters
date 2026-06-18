import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ColorPalette } from '../types';
import { Flame, TrendingUp } from 'lucide-react';

interface BattleHistoryChartProps {
  data: { distance: number; soldiers: number }[];
  palette: ColorPalette;
}

export default function BattleHistoryChart({ data, palette }: BattleHistoryChartProps) {
  // Gracefully fallback to some tutorial spikes if run ended too rapidly
  const chartData = data.length >= 2 ? data : [
    { distance: 0, soldiers: 1 },
    { distance: 100, soldiers: 3 },
    { distance: 200, soldiers: 8 },
    { distance: 300, soldiers: 2 },
    { distance: 400, soldiers: 12 }
  ];

  // Map palette stroke colors for Recharts vectors
  const strokeColor = palette.id === 'classic' ? '#ef4444' : 
                      palette.id === 'gameboy' ? '#9cff33' :
                      palette.id === 'synthwave' ? '#ff007f' :
                      palette.id === 'virtualboy' ? '#ef4444' : '#f5a623';

  const fillColor = palette.id === 'classic' ? 'rgba(239, 68, 68, 0.12)' : 
                    palette.id === 'gameboy' ? 'rgba(156, 255, 51, 0.12)' :
                    palette.id === 'synthwave' ? 'rgba(255, 0, 127, 0.12)' :
                    palette.id === 'virtualboy' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 166, 35, 0.12)';

  return (
    <div className={`w-full p-4 rounded-3xl border-2 text-left flex flex-col gap-3 relative overflow-hidden select-none font-mono ${palette.cardClass}`}>
      <div className="flex justify-between items-center mb-1 border-b border-slate-800/40 pb-2">
        <div className="flex items-center space-x-1.5">
          <TrendingUp className={`w-3.5 h-3.5 ${palette.hudTextClass}`} />
          <h4 className={`text-[9px] font-black uppercase tracking-wider ${palette.textClass}`}>
            PLATOON GROWTH MATRIX
          </h4>
        </div>
        <span className="text-[7.5px] text-slate-505 text-slate-500 font-bold uppercase leading-none">
          Live Progression Graph
        </span>
      </div>

      <div className="h-36 w-full text-[8.5px] font-sans pr-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#212529" strokeOpacity={0.45} />
            <XAxis 
              dataKey="distance" 
              stroke="#64748b" 
              tickSize={4}
              tickLine={false}
              tick={{ fontSize: 7, fontFamily: 'monospace' }}
              label={{ value: 'Distance (Meters)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 6.5, fontFamily: 'monospace' }}
            />
            <YAxis 
              stroke="#64748b" 
              allowDecimals={false}
              tickLine={false}
              tickSize={4}
              tick={{ fontSize: 7, fontFamily: 'monospace' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10, 15, 25, 0.96)',
                border: `1.5px solid ${strokeColor}`,
                borderRadius: '12px',
                padding: '6px 10px',
                fontFamily: 'monospace',
                fontSize: '8px',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}
              labelFormatter={(label) => `At depth: ${label}m`}
              formatter={(value) => [`${value} Clones`, 'Platoon Size']}
            />
            <Area 
              type="monotone" 
              dataKey="soldiers" 
              stroke={strokeColor} 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#gradientColor)"
              activeDot={{ r: 4, stroke: '#fff', strokeWidth: 1.5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Mini caption details */}
      <div className="flex justify-between text-[7px] text-slate-500 font-mono mt-0.5 border-t border-slate-800/40 pt-2 shrink-0">
        <span className="flex items-center gap-1">
          <Flame size={10} className="text-red-500 shrink-0" /> peak multiplier index
        </span>
        <span>real-time telemetry feed</span>
      </div>
    </div>
  );
}
