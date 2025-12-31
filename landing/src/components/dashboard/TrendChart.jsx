import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';

function TrendChart({ appointments }) {
    // Generar datos de los últimos 7 días
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push({
                date: date.toLocaleDateString('es-EC', { weekday: 'short', day: 'numeric' }),
                fullDate: date.toDateString()
            });
        }
        return days;
    };

    const last7Days = getLast7Days();

    // Contar citas por día
    const chartData = last7Days.map(day => {
        const dayAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.appointment_datetime);
            return aptDate.toDateString() === day.fullDate;
        });

        return {
            name: day.date,
            citas: dayAppointments.length,
            completadas: dayAppointments.filter(apt => apt.status === 'realizada').length,
            pendientes: dayAppointments.filter(apt => apt.status === 'pendiente').length,
        };
    });

    return (
        <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-neutral-900">Tendencia de Citas</h3>
                    <p className="text-xs text-neutral-500">Últimos 7 días</p>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorCitas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        style={{ fontSize: '12px', fontWeight: '600' }}
                    />
                    <YAxis
                        stroke="#64748b"
                        style={{ fontSize: '12px', fontWeight: '600' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '2px solid #e2e8f0',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="citas"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fill="url(#colorCitas)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export default TrendChart;