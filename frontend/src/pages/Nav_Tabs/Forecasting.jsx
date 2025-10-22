import api from "../../api";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, Area
} from "recharts";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

const peso = new Intl.NumberFormat("en-PH");

function Forecasting() {
  const [department, setDepartment] = useState("CCIS");
  const [departments, setDepartments] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  // scenario sliders
  const [fxDelta, setFxDelta] = useState(0);     // PHP per USD (additive)
  const [infDelta, setInfDelta] = useState(0);   // percentage points (additive)
  const [wageDelta, setWageDelta] = useState(0); // index points (additive)
  const [deptPct, setDeptPct] = useState(0);     // overall +/- % (multiplicative)

  // driver sliders
  const [enrolledDelta, setEnrolledDelta] = useState(0); // adds to latest enrolled_FTE_dept
  const [programsDelta, setProgramsDelta] = useState(0); // adds to latest programLaunches_dept

  // fetch departments once
  useEffect(() => {
    const ac = new AbortController();
    api.get("/api/departments/", { signal: ac.signal })
      .then(res => (Array.isArray(res.data) ? res.data : []))
      .then(rows => {
        setDepartments(rows);
        if (rows.length && !rows.some(r => r.name === department)) {
          setDepartment(rows[0].name);
        }
      })
      .catch(err => {
        if (err?.name !== "CanceledError") console.error(err);
      });
    return () => ac.abort();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const payload = useMemo(() => ({
    Department: department,
    assumptions: {
      fxRate_delta: fxDelta,
      inflationPct_delta: infDelta,
      wageIndex_delta: wageDelta,
      dept_pct: deptPct,
    },
    drivers: {
      enrolled_FTE_delta: Math.round(enrolledDelta),
      programLaunches_delta: Math.round(programsDelta),
    },
  }), [department, fxDelta, infDelta, wageDelta, deptPct, enrolledDelta, programsDelta]);

  const fetchForecast = useCallback(async (signal) => {
    setLoading(true);
    try {
      const res = await api.post("/api/forecast/next-year/", payload, { signal });
      const rows = Array.isArray(res.data?.Forecast) ? res.data.Forecast : [];
      const mapped = rows.map((r) => {
        const p10 = Number(r.p10 ?? 0);
        const p50 = Number(r.p50 ?? 0);
        const p90 = Number(r.p90 ?? 0);
        return {
          date: r.date,        // "YYYY-MM"
          p10,
          p50,
          p90,
          band: Math.max(0, p90 - p10),
        };
      });
      setData(mapped);
    } catch (err) {
      if (err?.name !== "CanceledError" && err?.message !== "canceled") {
        console.error(err);
        setData([]);
      }
    } finally {
      setLoading(false);
    }
  }, [payload]);

  // Debounced effect: run whenever department or sliders change
  useEffect(() => {
    // cancel previous request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    // debounce 350ms
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      fetchForecast(abortRef.current.signal);
    }, 350);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchForecast]);

  const resetSliders = () => {
    setFxDelta(0);
    setInfDelta(0);
    setWageDelta(0);
    setDeptPct(0);
    setEnrolledDelta(0);
    setProgramsDelta(0);
    // fetch will auto-run via effect
  };

  return (
    <div className="p-6 space-y-6">
        <div className='flex flex-col gap-5'>
            {/* Header + Department select */}
            <div className="w-full flex items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold">Forecast: next 12 months</h1>
                <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="w-[260px]">
                    <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                    {departments.map((d) => (
                    <SelectItem key={d.name} value={d.name}>
                        {d.name}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
                <div className="ml-auto flex gap-2">
                <Button variant="secondary" onClick={resetSliders} disabled={loading}>
                    Reset
                </Button>
                </div>
            </div>

            {/* Chart */}
            {loading && <div className="text-sm text-muted-foreground">Loading…</div>}

            {!loading && data.length > 0 && (
                <div className="w-full h-[380px]">
                <ResponsiveContainer>
                    <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(v) => peso.format(Number(v))} />
                    <Tooltip formatter={(v) => peso.format(Number(v))} />
                    <Legend />

                    {/* Band: base at p10 + fill width (band) */}
                    <Area
                        type="monotone"
                        dataKey="p10"
                        stackId="band"
                        stroke="none"
                        fill="transparent"
                        connectNulls
                        isAnimationActive={false}
                    />
                    <Area
                        type="monotone"
                        dataKey="band"
                        stackId="band"
                        stroke="none"
                        fill="rgba(30,144,255,0.15)"
                        connectNulls
                        isAnimationActive={false}
                    />

                    <Line type="monotone" dataKey="p50" name="Median (p50)" stroke="#1f77b4" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="p10" name="p10" stroke="#888" strokeDasharray="4 4" dot={false} />
                    <Line type="monotone" dataKey="p90" name="p90" stroke="#888" strokeDasharray="4 4" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
                </div>
            )}

            {/* Scenario sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FX */}
                <div>
                <div className="flex justify-between mb-2">
                    <span className="font-medium">FX Δ (PHP per USD)</span>
                    <span className="tabular-nums">{fxDelta.toFixed(2)}</span>
                </div>
                <Slider
                    value={[fxDelta]}
                    onValueChange={(v) => setFxDelta(v[0] ?? 0)}
                    min={-5} max={5} step={0.1}
                    disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">Additive to fxRate_PHP_USD each month.</p>
                </div>

                {/* Inflation */}
                <div>
                <div className="flex justify-between mb-2">
                    <span className="font-medium">Inflation Δ (pp)</span>
                    <span className="tabular-nums">{infDelta.toFixed(2)}pp</span>
                </div>
                <Slider
                    value={[infDelta]}
                    onValueChange={(v) => setInfDelta(v[0] ?? 0)}
                    min={-3} max={3} step={0.1}
                    disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">Additive to inflationPct (percentage points).</p>
                </div>

                {/* Wage Index */}
                <div>
                <div className="flex justify-between mb-2">
                    <span className="font-medium">Wage Index Δ</span>
                    <span className="tabular-nums">{wageDelta.toFixed(3)}</span>
                </div>
                <Slider
                    value={[wageDelta]}
                    onValueChange={(v) => setWageDelta(v[0] ?? 0)}
                    min={-5} max={5} step={0.1}
                    disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">Additive to wageIndex.</p>
                </div>

                {/* Dept uplift */}
                <div>
                <div className="flex justify-between mb-2">
                    <span className="font-medium">Department Uplift (%)</span>
                    <span className="tabular-nums">{deptPct}%</span>
                </div>
                <Slider
                    value={[deptPct]}
                    onValueChange={(v) => setDeptPct(v[0] ?? 0)}
                    min={-50} max={50} step={1}
                    disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">Scales p10/p50/p90 by (1 + %/100).</p>
                </div>

                {/* Enrolled Students Δ */}
                <div>
                <div className="flex justify-between mb-2">
                    <span className="font-medium">Enrolled Students Δ</span>
                    <span className="tabular-nums">{enrolledDelta > 0 ? `+${enrolledDelta}` : enrolledDelta}</span>
                </div>
                <Slider
                    value={[enrolledDelta]}
                    onValueChange={(v) => setEnrolledDelta(Math.round(v[0] ?? 0))}
                    min={-1000} max={1000} step={10}
                    disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">Adds to latest enrolled_FTE_dept.</p>
                </div>

                {/* New Programs Δ */}
                <div>
                <div className="flex justify-between mb-2">
                    <span className="font-medium">New Programs Δ</span>
                    <span className="tabular-nums">{programsDelta > 0 ? `+${programsDelta}` : programsDelta}</span>
                </div>
                <Slider
                    value={[programsDelta]}
                    onValueChange={(v) => setProgramsDelta(Math.round(v[0] ?? 0))}
                    min={-5} max={10} step={1}
                    disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">Adds to latest programLaunches_dept.</p>
                </div>
            </div>

            {!loading && data.length === 0 && (
                <div className="text-sm text-muted-foreground">No data.</div>
            )}
        </div>
    </div>
  );
}

export default Forecasting;
