
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, ClipboardCheck, DollarSign, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { clientsApi, serviceOrdersApi, appointmentsApi } from "@/services/api";

export default function Dashboard() {
  // Fetch data
  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: clientsApi.getAll,
  });

  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: serviceOrdersApi.getAll,
  });

  const { data: appointments } = useQuery({
    queryKey: ["appointments"],
    queryFn: appointmentsApi.getAll,
  });

  // Calculate stats
  const activeOrders = orders?.filter(order => order.status !== "Completado") || [];
  const pendingOrders = orders?.filter(order => order.status === "Pendiente") || [];
  const totalClients = clients?.length || 0;
  const newClientsThisMonth = clients?.filter(client => {
    const clientDate = new Date(client.created_at);
    const now = new Date();
    return clientDate.getMonth() === now.getMonth() && clientDate.getFullYear() === now.getFullYear();
  }).length || 0;

  const upcomingAppointments = appointments?.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);
    return appointmentDate >= now && appointmentDate <= oneWeekFromNow;
  }).length || 0;

  // Calculate earnings (mock data for now since we don't have real payment data)
  const currentMonthEarnings = 5240;

  // Stats
  const stats = [
    {
      title: "Órdenes Activas",
      value: activeOrders.length.toString(),
      icon: <ClipboardCheck className="h-6 w-6 text-notion-blue" />,
      description: `${pendingOrders.length} pendientes de revisión`,
    },
    {
      title: "Clientes Registrados",
      value: totalClients.toString(),
      icon: <UserRound className="h-6 w-6 text-notion-blue" />,
      description: `${newClientsThisMonth} nuevos este mes`,
    },
    {
      title: "Servicios Agendados",
      value: upcomingAppointments.toString(),
      icon: <CalendarDays className="h-6 w-6 text-notion-blue" />,
      description: "Próximos 7 días",
    },
    {
      title: "Ingresos del Mes",
      value: `$${currentMonthEarnings}`,
      icon: <DollarSign className="h-6 w-6 text-notion-blue" />,
      description: "+12% vs. mes anterior",
    },
  ];

  return (
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
                {orders?.slice(0, 4).map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-notion-border hover:bg-notion-lightgray"
                  >
                    <td className="px-4 py-3 text-sm">{order.order_number}</td>
                    <td className="px-4 py-3 text-sm">
                      {clients?.find(c => c.id === order.client_id)?.name || "Cliente"}
                    </td>
                    <td className="px-4 py-3 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
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
                {!orders || orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-sm text-center text-notion-gray">
                      No hay órdenes registradas
                    </td>
                  </tr>
                )}
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
  );
}
