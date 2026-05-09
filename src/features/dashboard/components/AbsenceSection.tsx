import { useEffect, useState, useMemo, useCallback } from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import type { PieSectorShapeProps } from "recharts/types/polar/Pie";
import api from "@/lib/axios";
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Stats = {
  totalWorkingDays: number;
  totalWorkingHours: number;
  totalWorkingMinutes: number;
  totalOvertimeHours: number;
  totalOvertimeMinutes: number;
};

const chartConfig = {
  value: { label: "Value" },
  working_days: { label: "Working Days", color: "var(--chart-1)" },
  working_hours: { label: "Working Hours", color: "var(--chart-2)" },
  overtime_hours: { label: "Overtime Hours", color: "var(--chart-3)" },
} satisfies ChartConfig;

type MetricKey = "working_days" | "working_hours" | "overtime_hours";

export default function AbsenceSection() {
  const id = "absence-chart";
  const [stats, setStats] = useState<Stats | null>({
    totalWorkingDays: 0,
    totalWorkingHours: 0,
    totalWorkingMinutes: 0,
    totalOvertimeHours: 0,
    totalOvertimeMinutes: 0,
  });
  const [activeMetric, setActiveMetric] = useState<MetricKey>("working_days");

  useEffect(() => {
    api
      .get("/attendance/my-stats")
      .then((res) => setStats(res.data))
      .catch(() => {});

    console.log("fetching stats...");
    console.log(stats);
  }, []);

  const chartData = useMemo(() => {
    if (!stats) return [];

    const allZero =
      stats.totalWorkingDays === 0 &&
      stats.totalWorkingHours === 0 &&
      stats.totalOvertimeHours === 0;

    if (allZero) {
      return [
        {
          key: "working_days",
          label: "No data yet",
          value: 1,
          fill: "var(--muted)",
        },
        {
          key: "working_hours",
          label: "No data yet",
          value: 1,
          fill: "var(--muted)",
        },
        {
          key: "overtime_hours",
          label: "No data yet",
          value: 1,
          fill: "var(--muted)",
        },
      ];
    }

    return [
      {
        key: "working_days",
        label: "Working Days",
        value: stats.totalWorkingDays || 1,
        fill: "var(--color-working_days)",
      },
      {
        key: "working_hours",
        label: "Working Hours",
        value: stats.totalWorkingHours || 1,
        fill: "var(--color-working_hours)",
      },
      {
        key: "overtime_hours",
        label: "Overtime Hours",
        value: stats.totalOvertimeHours || 1,
        fill: "var(--color-overtime_hours)",
      },
    ];
  }, [stats]);

  const activeIndex = useMemo(
    () => chartData.findIndex((d) => d.key === activeMetric),
    [chartData, activeMetric],
  );

  const activeItem = chartData[activeIndex];

  const renderShape = useCallback(
    ({ index, outerRadius = 0, ...props }: PieSectorShapeProps) => {
      if (index === activeIndex) {
        return (
          <g>
            <Sector {...props} outerRadius={outerRadius + 10} />
            <Sector
              {...props}
              outerRadius={outerRadius + 15}
              innerRadius={outerRadius + 12}
            />
          </g>
        );
      }
      return <Sector {...props} outerRadius={outerRadius} />;
    },
    [activeIndex],
  );

  const fmt = (n: number) => String(n).padStart(2, "0");

  const isAllZero =
    stats?.totalWorkingDays === 0 &&
    stats?.totalWorkingHours === 0 &&
    stats?.totalOvertimeHours === 0;

  const centerLabel = () => {
    if (!stats) return "—";
    if (isAllZero) return "0";
    if (activeMetric === "working_days") return `${stats.totalWorkingDays}`;
    if (activeMetric === "working_hours")
      return `${fmt(stats.totalWorkingHours)}:${fmt(stats.totalWorkingMinutes)}`;
    return `${fmt(stats.totalOvertimeHours)}:${fmt(stats.totalOvertimeMinutes)}`;
  };

  const centerSub = () => {
    if (activeMetric === "working_days") return "days";
    return "hrs : min";
  };

  return (
    <div className="flex flex-col gap-4 items-center justify-center h-fit">
      <ChartStyle id={id} config={chartConfig} />

      {/* Dropdown */}
      <Select
        value={activeMetric}
        onValueChange={(v) => setActiveMetric(v as MetricKey)}
      >
        <SelectTrigger className="absolute z-10 top-11 right-10 w-fit rounded-xl">
          <SelectValue placeholder="Select metric" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {(
            ["working_days", "working_hours", "overtime_hours"] as MetricKey[]
          ).map((key) => (
            <SelectItem key={key} value={key} className="rounded-lg">
              <div className="text-xs">{chartConfig[key].label}</div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Chart */}
      <ChartContainer id={id} config={chartConfig} className="w-full">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="label"
            innerRadius={70}
            strokeWidth={5}
            shape={renderShape}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-white text-2xl font-bold"
                      >
                        {centerLabel()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 22}
                        className="fill-muted-foreground text-xs"
                      >
                        {centerSub()}
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
}
