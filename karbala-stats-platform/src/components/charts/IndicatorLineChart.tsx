import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  labels: string[]
  values: number[]
  unit?: string
}

export default function IndicatorLineChart({ labels, values, unit }: Props) {
  const data = labels.map((label, i) => ({ label, value: values[i] }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fontFamily: 'Cairo' }} />
        <YAxis tick={{ fontSize: 12, fontFamily: 'Cairo' }} unit={unit ? ` ${unit}` : ''} />
        <Tooltip
          formatter={(v) => [typeof v === 'number' ? v.toLocaleString('ar-IQ') : v, 'القيمة']}
          labelFormatter={(l) => `الفترة: ${l}`}
          contentStyle={{ fontFamily: 'Cairo', direction: 'rtl' }}
        />
        <Line type="monotone" dataKey="value" stroke="#1a3c6e" strokeWidth={2.5} dot={{ fill: '#1a3c6e', r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
