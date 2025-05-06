import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { serviceOrdersApi, clientsApi, applianceTypesApi, brandsApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function OrderPrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [totals, setTotals] = useState({
    subtotal: 0,
    iva: 0,
    total: 0,
  });

  // Fetch data
  const { data: order } = useQuery({
    queryKey: ["order", id],
    queryFn: () => serviceOrdersApi.getById(id!),
    enabled: !!id,
  });

  const { data: client } = useQuery({
    queryKey: ["client", order?.client_id],
    queryFn: () => clientsApi.getById(order!.client_id),
    enabled: !!order?.client_id,
  });

  const { data: serviceParts = [] } = useQuery({
    queryKey: ["serviceParts", id],
    queryFn: () => serviceOrdersApi.getServiceParts(id!),
    enabled: !!id,
  });

  const { data: serviceLabor = [] } = useQuery({
    queryKey: ["serviceLabor", id],
    queryFn: () => serviceOrdersApi.getServiceLabor(id!),
    enabled: !!id,
  });

  // Fetch appliance types and brands
  const { data: applianceTypes } = useQuery({
    queryKey: ["applianceTypes"],
    queryFn: applianceTypesApi.getAll,
  });

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: brandsApi.getAll,
  });

  // Calculate totals
  useEffect(() => {
    const partsTotal = serviceParts.reduce((sum, part) => sum + part.unit_price * part.quantity, 0);
    const laborTotal = serviceLabor.reduce((sum, labor) => sum + labor.rate * labor.hours, 0);
    const subtotal = partsTotal + laborTotal;
    
    setTotals({
      subtotal,
      iva: subtotal * 0.16,
      total: subtotal * 1.16,
    });
  }, [serviceParts, serviceLabor]);

  // Helper functions
  const getApplianceTypeName = (id: string) => {
    return applianceTypes?.find(t => t.id === id)?.name || "No especificado";
  };

  const getBrandName = (id: string) => {
    return brands?.find(b => b.id === id)?.name || "Genérica";
  };

  const handlePrint = () => window.print();

  if (!order || !client) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-2 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto text-[13px]">
        {/* Action Buttons */}
        <div className="print:hidden mb-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/orders/${id}`)} className="mr-2">
            <ArrowLeft className="h-3 w-3 mr-1" />Volver
          </Button>
          <Button size="sm" onClick={handlePrint}>
            <Printer className="h-3 w-3 mr-1" />Imprimir
          </Button>
        </div>

        {/* Printable Document */}
        <div ref={printRef} className="bg-white p-6 print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-lg font-bold">ServiAutorizados</h1>
              <p className="text-[11px] text-gray-600">Av. Libertador, Caracas<br/>
              RIF: J-40123456-7 | Tel: (0212) 555-1234</p>
            </div>
            <div className="text-right">
              <h2 className="font-bold">ORDEN #{order.order_number}</h2>
              <p className="text-[11px]">{format(new Date(order.created_at), "dd/MM/yyyy", { locale: es })}</p>
            </div>
          </div>

          {/* Client & Appliance Info */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="font-semibold">Cliente:</p>
              <p>{client.name}<br/>
              {client.legal_id && `C.I./RIF: ${client.legal_id}`}<br/>
              {client.phone && `Tel: ${client.phone}`}</p>
            </div>
            <div>
              <p className="font-semibold">Equipo:</p>
              <p>
                {getApplianceTypeName(order.appliance_type)}<br/>
                {getBrandName(order.brand_id)} | {order.model}<br/>
                Serie: {order.serial_number || 'N/A'}
              </p>
            </div>
          </div>

          {/* Problem & Diagnosis */}
          <div className="mb-3">
            <p className="font-semibold">Problema reportado:</p>
            <p className="border rounded p-2 text-[12px] min-h-[40px]">
              {order.problem_description || "Sin descripción"}
            </p>
          </div>

          {/* Work Details */}
          <div className="mb-2">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-1 border">Descripción</th>
                  <th className="p-1 border w-12">Cant.</th>
                  <th className="p-1 border w-20">P.Unit</th>
                  <th className="p-1 border w-20">Total</th>
                </tr>
              </thead>
              <tbody>
                {serviceParts.map((part) => (
                  <tr key={part.id}>
                    <td className="p-1 border">{part.description}</td>
                    <td className="p-1 border text-center">{part.quantity}</td>
                    <td className="p-1 border text-right">Bs. {part.unit_price.toFixed(2)}</td>
                    <td className="p-1 border text-right">Bs. {(part.quantity * part.unit_price).toFixed(2)}</td>
                  </tr>
                ))}
                {serviceLabor.map((labor) => (
                  <tr key={labor.id} className="bg-gray-50">
                    <td className="p-1 border">{labor.description}</td>
                    <td className="p-1 border text-center">{labor.hours}h</td>
                    <td className="p-1 border text-right">Bs. {labor.rate.toFixed(2)}</td>
                    <td className="p-1 border text-right">Bs. {(labor.hours * labor.rate).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-3 gap-2 max-w-xs ml-auto mb-3">
            <div className="col-span-2 text-right">Subtotal:</div>
            <div className="text-right">Bs. {totals.subtotal.toFixed(2)}</div>
            <div className="col-span-2 text-right">IVA (16%):</div>
            <div className="text-right">Bs. {totals.iva.toFixed(2)}</div>
            <div className="col-span-2 text-right font-bold">TOTAL:</div>
            <div className="text-right font-bold">Bs. {totals.total.toFixed(2)}</div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-2 border-t">
            <div className="text-center">
              <p className="text-[11px] mb-1">Firma del Técnico</p>
              <div className="h-12 border-b"></div>
            </div>
            <div className="text-center">
              <p className="text-[11px] mb-1">Firma del Cliente</p>
              <div className="h-12 border-b"></div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-2 text-center text-[10px] text-gray-600">
            <p>Documento válido como factura de acuerdo al Art. 14 de la Ley ISLR</p>
            <p>serviautorizados.com | Horario: L-V 8am-5pm</p>
          </div>
        </div>
      </div>
    </div>
  );
};