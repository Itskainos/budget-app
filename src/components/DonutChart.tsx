"use client";

import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Star } from "lucide-react";

export function DonutChart({ data, total }: { data: { name: string, value: number, color: string }[], total: number }) {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-64" />;

  const displayData = data.length > 0 ? data : [{ name: "Empty", value: 1, color: "var(--secondary)" }];

  return (
    <div className="relative h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={displayData}
            cx="50%"
            cy="50%"
            innerRadius={95}
            outerRadius={115}
            paddingAngle={4}
            stroke="none"
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            cornerRadius={20}
          >
            {displayData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} opacity={data.length === 0 ? 0.2 : 1} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="w-12 h-12 bg-brand-coral rounded-full flex items-center justify-center mb-1 shadow-sm shadow-brand-coral/30">
          <Star className="w-6 h-6 text-white" fill="currentColor" />
        </div>
        <span className="text-4xl font-extrabold text-primary tracking-tight mt-1">Rs. {total.toFixed(0)}</span>
        <span className="text-secondary text-[10px] font-bold tracking-[0.2em] uppercase mt-1">Total Spent</span>
      </div>
    </div>
  );
}
