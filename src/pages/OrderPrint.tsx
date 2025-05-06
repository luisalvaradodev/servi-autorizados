
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
  const [totalParts, setTotalParts] = useState(0);
  const [totalLabor, setTotalLabor] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [iva, setIva] = useState(0);
  const [total, setTotal] = useState(0);
  
  // Fetch order data
  const { data: order, isLoading: isLoadingOrder } = useQuery({
    queryKey: ["order", id],
    queryFn: () => serviceOrdersApi.getById(id!),
    enabled: !!id,
  });
  
  // Fetch client data
  const { data: client, isLoading: isLoadingClient } = useQuery({
    queryKey: ["client", order?.client_id],
    queryFn: () => clientsApi.getById(order!.client_id),
    enabled: !!order?.client_id,
  });
  
  // Fetch appliance type
  const { data: applianceTypes, isLoading: isLoadingApplianceTypes } = useQuery({
    queryKey: ["applianceTypes"],
    queryFn: applianceTypesApi.getAll,
  });
  
  // Fetch brand
  const { data: brands, isLoading: isLoadingBrands } = useQuery({
    queryKey: ["brands"],
    queryFn: brandsApi.getAll,
  });
  
  // Fetch service parts
  const { data: serviceParts = [], isLoading: isLoadingServiceParts } = useQuery({
    queryKey: ["serviceParts", id],
    queryFn: () => serviceOrdersApi.getServiceParts(id!),
    enabled: !!id,
  });
  
  // Fetch service labor
  const { data: serviceLabor = [], isLoading: isLoadingServiceLabor } = useQuery({
    queryKey: ["serviceLabor", id],
    queryFn: () => serviceOrdersApi.getServiceLabor(id!),
    enabled: !!id,
  });
  
  // Calculate totals
  useEffect(() => {
    if (serviceParts.length > 0 || serviceLabor.length > 0) {
      const partsTotal = serviceParts.reduce(
        (sum, part) => sum + part.unit_price * part.quantity, 
        0
      );
      
      const laborTotal = serviceLabor.reduce(
        (sum, labor) => sum + labor.rate * labor.hours, 
        0
      );
      
      const calculatedSubtotal = partsTotal + laborTotal;
      const calculatedIva = calculatedSubtotal * 0.16; // 16% IVA
      const calculatedTotal = calculatedSubtotal + calculatedIva;
      
      setTotalParts(partsTotal);
      setTotalLabor(laborTotal);
      setSubtotal(calculatedSubtotal);
      setIva(calculatedIva);
      setTotal(calculatedTotal);
    }
  }, [serviceParts, serviceLabor]);
  
  // Helper to get appliance type name
  const getApplianceTypeName = (id: string) => {
    if (!applianceTypes) return "Desconocido";
    const type = applianceTypes.find(t => t.id === id);
    return type ? type.name : "Desconocido";
  };
  
  // Helper to get brand name
  const getBrandName = (id: string) => {
    if (!brands) return "Desconocida";
    const brand = brands.find(b => b.id === id);
    return brand ? brand.name : "Desconocida";
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const isLoading = isLoadingOrder || isLoadingClient || isLoadingApplianceTypes || isLoadingBrands;
  
  if (isLoading) {
    return <div className="flex justify-center p-8">Cargando datos de la orden...</div>;
  }
  
  if (!order || !client) {
    return <div className="flex justify-center p-8">No se encontró la orden de servicio</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Botones visibles solo en pantalla (no en impresión) */}
        <div className="flex gap-2 mb-4 print:hidden">
          <Button
            variant="outline"
            onClick={() => navigate(`/orders/${id}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>
        
        {/* Documento para imprimir */}
        <div
          ref={printRef}
          className="bg-white p-8 rounded-md shadow-sm"
        >
          {/* Encabezado */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-notion-blue">
                ServiceScribe
              </h1>
              <p className="text-sm text-notion-gray">Av. Tecnología 567, Col. Industrial</p>
              <p className="text-sm text-notion-gray">Ciudad de México, CP 54321</p>
              <p className="text-sm text-notion-gray">Tel: 555-987-6543</p>
              <p className="text-sm text-notion-gray">contacto@servicescribe.com</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold">Orden de Servicio</h2>
              <p className="text-lg font-semibold text-notion-blue">{order.order_number}</p>
              <p className="text-sm text-notion-gray">
                Fecha: {format(new Date(order.created_at), "dd/MM/yyyy", { locale: es })}
              </p>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          {/* Información del cliente */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Información del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><span className="font-medium">Nombre:</span> {client.name}</p>
                <p><span className="font-medium">Teléfono:</span> {client.phone || "No disponible"}</p>
                <p><span className="font-medium">Email:</span> {client.email || "No disponible"}</p>
              </div>
              <div>
                <p><span className="font-medium">Dirección:</span> {client.address || "No disponible"}</p>
              </div>
            </div>
          </div>
          
          {/* Información del electrodoméstico */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Datos del Electrodoméstico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><span className="font-medium">Tipo:</span> {getApplianceTypeName(order.appliance_type)}</p>
                <p><span className="font-medium">Marca:</span> {getBrandName(order.brand_id)}</p>
                <p><span className="font-medium">Modelo:</span> {order.model || "No disponible"}</p>
              </div>
              <div>
                <p><span className="font-medium">N° Serie:</span> {order.serial_number || "No disponible"}</p>
                <p><span className="font-medium">Tipo de servicio:</span> {order.service_type}</p>
                <p><span className="font-medium">Estado:</span> {order.status}</p>
              </div>
            </div>
          </div>
          
          {/* Problema reportado */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Problema Reportado</h3>
            <p className="border p-3 rounded-md">{order.problem_description}</p>
          </div>
          
          {/* Observaciones */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Observaciones</h3>
            <p className="border p-3 rounded-md">{order.observations || "Sin observaciones adicionales"}</p>
          </div>
          
          {/* Recibido/Diagnóstico/Trabajo a realizar */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Diagnóstico y Trabajo Realizado</h3>
            <div className="h-24 border p-3 rounded-md">
              {serviceLabor.length > 0 ? (
                <ul className="list-disc list-inside">
                  {serviceLabor.map((labor) => (
                    <li key={labor.id}>{labor.description}</li>
                  ))}
                </ul>
              ) : (
                "Sin trabajos registrados"
              )}
            </div>
          </div>
          
          {/* Materiales/Repuestos */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Materiales y Repuestos Utilizados</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Descripción</th>
                  <th className="text-center py-2">Cantidad</th>
                  <th className="text-right py-2">Precio</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {serviceParts.length > 0 ? (
                  serviceParts.map((part) => (
                    <tr key={part.id} className="border-b">
                      <td className="py-2">{part.description}</td>
                      <td className="text-center py-2">{part.quantity}</td>
                      <td className="text-right py-2">${part.unit_price.toFixed(2)}</td>
                      <td className="text-right py-2">${(part.quantity * part.unit_price).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b">
                    <td colSpan={4} className="py-2 text-center">No hay repuestos registrados</td>
                  </tr>
                )}
                
                {serviceLabor.length > 0 && (
                  <>
                    <tr className="border-b">
                      <td colSpan={4} className="font-medium pt-4 pb-2">Mano de Obra</td>
                    </tr>
                    {serviceLabor.map((labor) => (
                      <tr key={labor.id} className="border-b">
                        <td className="py-2">{labor.description}</td>
                        <td className="text-center py-2">{labor.hours} hrs</td>
                        <td className="text-right py-2">${labor.rate.toFixed(2)}/hora</td>
                        <td className="text-right py-2">${(labor.hours * labor.rate).toFixed(2)}</td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="py-2"></td>
                  <td className="text-right font-medium py-2">Subtotal:</td>
                  <td className="text-right py-2">${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={2}></td>
                  <td className="text-right font-medium py-2">IVA (16%):</td>
                  <td className="text-right py-2">${iva.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={2}></td>
                  <td className="text-right font-medium py-2">Total:</td>
                  <td className="text-right font-bold py-2">${total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {/* Firmas */}
          <div className="grid grid-cols-2 gap-8 mt-12">
            <div className="text-center">
              <div className="border-t pt-2">
                <p className="font-medium">Técnico</p>
                <p className="text-sm">______________________</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t pt-2">
                <p className="font-medium">Cliente</p>
                <p className="text-sm">{client.name}</p>
              </div>
            </div>
          </div>
          
          {/* Pie de página */}
          <div className="mt-12 text-center text-sm text-notion-gray">
            <p>Gracias por confiar en nuestros servicios</p>
            <p>www.servicescribe.com | 555-987-6543</p>
          </div>
        </div>
      </div>
    </div>
  );
}
