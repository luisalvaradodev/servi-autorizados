
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, ClipboardCheck, DollarSign, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Datos demo para el dashboard
const stats = [
  {
    title: "Órdenes Activas",
    value: "24",
    icon: <ClipboardCheck className="h-6 w-6 text-notion-blue" />,
    description: "8 pendientes de revisión",
  },
  {
    title: "Clientes Registrados",
    value: "126",
    icon: <UserRound className="h-6 w-6 text-notion-blue" />,
    description: "12 nuevos este mes",
  },
  {
    title: "Servicios Agendados",
    value: "18",
    icon: <CalendarDays className="h-6 w-6 text-notion-blue" />,
    description: "Próximos 7 días",
  },
  {
    title: "Ingresos del Mes",
    value: "$5,240",
    icon: <DollarSign className="h-6 w-6 text-notion-blue" />,
    description: "+12% vs. mes anterior",
  },
];

// Datos de órdenes recientes para el dashboard
const recentOrders = [
  {
    id: "OS-2023-042",
    client: "María Rodríguez",
    appliance: "Refrigerador Samsung",
    date: "15/05/2023",
    status: "En proceso",
  },
  {
    id: "OS-2023-041",
    client: "Juan Pérez",
    appliance: "Lavadora Whirlpool",
    date: "14/05/2023",
    status: "Pendiente",
  },
  {
    id: "OS-2023-040",
    client: "Ana García",
    appliance: "Microondas LG",
    date: "13/05/2023",
    status: "Completado",
  },
  {
    id: "OS-2023-039",
    client: "Carlos López",
    appliance: "Estufa Mabe",
    date: "12/05/2023",
    status: "Completado",
  },
];

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="notion-heading">Panel de Control</h1>
          <Button className="notion-button">
            <Link to="/orders/new">Nueva Orden</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="notion-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-notion-gray mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="notion-card">
          <CardHeader>
            <CardTitle>Órdenes Recientes</CardTitle>
            <CardDescription>
              Últimas órdenes de servicio registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-notion-border">
                    <th className="px-4 py-2 text-left text-xs font-medium text-notion-gray">
                      Nº Orden
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-notion-gray">
                      Cliente
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-notion-gray">
                      Electrodoméstico
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-notion-gray">
                      Fecha
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-notion-gray">
                      Estado
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-notion-gray">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-notion-border hover:bg-notion-lightgray"
                    >
                      <td className="px-4 py-3 text-sm">{order.id}</td>
                      <td className="px-4 py-3 text-sm">{order.client}</td>
                      <td className="px-4 py-3 text-sm">{order.appliance}</td>
                      <td className="px-4 py-3 text-sm">{order.date}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            order.status === "Completado"
                              ? "bg-green-100 text-green-800"
                              : order.status === "En proceso"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Link
                          to={`/orders/${order.id}`}
                          className="text-notion-blue hover:underline"
                        >
                          Ver detalles
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <Link
                to="/orders"
                className="text-sm text-notion-blue hover:underline"
              >
                Ver todas las órdenes
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
