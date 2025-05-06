
import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer } from "lucide-react";

// Datos simulados de la orden para imprimir
const orderData = {
  id: "OS-2023-042",
  date: "15/05/2023",
  status: "En proceso",
  client: {
    name: "María Rodríguez",
    phone: "555-123-4567",
    email: "maria.rodriguez@ejemplo.com",
    address: "Av. Independencia 1234, Col. Centro, Ciudad de México, CP 12345",
  },
  appliance: {
    type: "Refrigerador",
    brand: "Samsung",
    model: "RT38K5982BS",
    serialNumber: "SN12345678",
    problem: "No enfría correctamente, emite sonidos fuertes y la puerta no sella bien.",
  },
  service: {
    type: "domicilio",
    urgency: "normal",
    observations: "Cliente menciona que el problema comenzó hace aproximadamente 2 semanas. Ya intentó desconectarlo y volverlo a conectar sin éxito.",
    technician: "Carlos Méndez",
  },
  companyInfo: {
    name: "ServiceScribe",
    address: "Av. Tecnología 567, Col. Industrial",
    city: "Ciudad de México, CP 54321",
    phone: "555-987-6543",
    email: "contacto@servicescribe.com",
    website: "www.servicescribe.com",
  },
};

export default function OrderPrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = () => {
    window.print();
  };
  
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
                {orderData.companyInfo.name}
              </h1>
              <p className="text-sm text-notion-gray">{orderData.companyInfo.address}</p>
              <p className="text-sm text-notion-gray">{orderData.companyInfo.city}</p>
              <p className="text-sm text-notion-gray">Tel: {orderData.companyInfo.phone}</p>
              <p className="text-sm text-notion-gray">{orderData.companyInfo.email}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold">Orden de Servicio</h2>
              <p className="text-lg font-semibold text-notion-blue">{orderData.id}</p>
              <p className="text-sm text-notion-gray">Fecha: {orderData.date}</p>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          {/* Información del cliente */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Información del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><span className="font-medium">Nombre:</span> {orderData.client.name}</p>
                <p><span className="font-medium">Teléfono:</span> {orderData.client.phone}</p>
                <p><span className="font-medium">Email:</span> {orderData.client.email}</p>
              </div>
              <div>
                <p><span className="font-medium">Dirección:</span> {orderData.client.address}</p>
              </div>
            </div>
          </div>
          
          {/* Información del electrodoméstico */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Datos del Electrodoméstico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><span className="font-medium">Tipo:</span> {orderData.appliance.type}</p>
                <p><span className="font-medium">Marca:</span> {orderData.appliance.brand}</p>
                <p><span className="font-medium">Modelo:</span> {orderData.appliance.model}</p>
              </div>
              <div>
                <p><span className="font-medium">N° Serie:</span> {orderData.appliance.serialNumber}</p>
                <p><span className="font-medium">Técnico asignado:</span> {orderData.service.technician}</p>
              </div>
            </div>
          </div>
          
          {/* Problema reportado */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Problema Reportado</h3>
            <p className="border p-3 rounded-md">{orderData.appliance.problem}</p>
          </div>
          
          {/* Observaciones */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Observaciones</h3>
            <p className="border p-3 rounded-md">{orderData.service.observations}</p>
          </div>
          
          {/* Recibido/Diagnóstico/Trabajo a realizar */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Diagnóstico y Trabajo a Realizar</h3>
            <div className="h-24 border p-3 rounded-md">
              {/* Espacio en blanco para llenar manualmente */}
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
                {/* Filas vacías para llenar manualmente */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b h-8">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="py-2"></td>
                  <td className="text-right font-medium py-2">Subtotal:</td>
                  <td className="border-b"></td>
                </tr>
                <tr>
                  <td colSpan={2}></td>
                  <td className="text-right font-medium py-2">IVA:</td>
                  <td className="border-b"></td>
                </tr>
                <tr>
                  <td colSpan={2}></td>
                  <td className="text-right font-medium py-2">Total:</td>
                  <td className="border-b"></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {/* Firmas */}
          <div className="grid grid-cols-2 gap-8 mt-12">
            <div className="text-center">
              <div className="border-t pt-2">
                <p className="font-medium">Técnico</p>
                <p className="text-sm">{orderData.service.technician}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t pt-2">
                <p className="font-medium">Cliente</p>
                <p className="text-sm">{orderData.client.name}</p>
              </div>
            </div>
          </div>
          
          {/* Pie de página */}
          <div className="mt-12 text-center text-sm text-notion-gray">
            <p>Gracias por confiar en nuestros servicios</p>
            <p>{orderData.companyInfo.website} | {orderData.companyInfo.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
