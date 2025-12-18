import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Navigation, Building2, Clock, Phone, FileText, Download, Info } from "lucide-react";
import { DocumentoGenerado } from "@/lib/foconGenerators";
import { Partida } from '@/types/requisicion';

const UBICACIONES_PREDEFINIDAS = [
  {
    nombre: "Almacén General",
    direccion: "Av. Industria Militar 1055, Lomas de Sotelo, Miguel Hidalgo, 11200 Ciudad de México, CDMX",
    horario: "Lunes a Viernes de 9:00 a 15:00 hrs",
    contacto: "Jefe de Almacén - Ext. 1234",
  },
  {
    nombre: "Oficinas Administrativas (Piso 3)",
    direccion: "Av. Paseo de la Reforma 135, Tabacalera, Cuauhtémoc, 06030 Ciudad de México, CDMX",
    horario: "Lunes a Viernes de 9:00 a 18:00 hrs",
    contacto: "Recepción Administrativa - Ext. 5678",
  },
];

// --- COMPONENTE DEL MODAL DE MAPA ---
interface ModalEntregaProps {
  ubicacionesGuardadas: any[];
  onGuardar: (ubicaciones: any[]) => void;
}

const ModalEntregaConMapa: React.FC<ModalEntregaProps> = ({ ubicacionesGuardadas, onGuardar }) => {
  const [open, setOpen] = useState(false);
  const [nuevaUbicacion, setNuevaUbicacion] = useState({
    sede: "", direccion: "", referencia: "", horario: "", contacto: "",
  });

  const cargarPredefinida = (nombreSede: string) => {
    const encontrada = UBICACIONES_PREDEFINIDAS.find(u => u.nombre === nombreSede);
    if (encontrada) {
      setNuevaUbicacion({
        sede: encontrada.nombre,
        direccion: encontrada.direccion,
        referencia: "",
        horario: encontrada.horario,
        contacto: encontrada.contacto
      });
    }
  };

  const handleGuardar = () => {
    if (!nuevaUbicacion.sede || !nuevaUbicacion.direccion) return;
    onGuardar([...ubicacionesGuardadas, nuevaUbicacion]);
    setOpen(false);
    setNuevaUbicacion({ sede: "", direccion: "", referencia: "", horario: "", contacto: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-auto py-4 border-dashed flex flex-col gap-2 hover:border-primary group transition-all">
          <MapPin className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
          <span className="text-muted-foreground text-xs font-bold group-hover:text-primary">
            {ubicacionesGuardadas.length > 0 
              ? `${ubicacionesGuardadas.length} Ubicación(es) definida(s) - Clic para editar` 
              : "Definir lugar de entrega y condiciones"}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary font-bold text-lg border-b pb-2">Lugar de entrega</DialogTitle>
          <DialogDescription>
            Indique la dirección exacta y condiciones para la recepción de los bienes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Sede predefinida</Label>
              <Select onValueChange={cargarPredefinida}>
                <SelectTrigger><SelectValue placeholder="Seleccione una opción..." /></SelectTrigger>
                <SelectContent>
                  {UBICACIONES_PREDEFINIDAS.map((u, idx) => (
                    <SelectItem key={idx} value={u.nombre}>{u.nombre}</SelectItem>
                  ))}
                  <SelectItem value="otra">Otra ubicación externa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 pt-2 border-t">
              <div>
                <Label className="text-sm font-medium flex items-center gap-2"><Building2 className="h-3 w-3"/> Dirección completa</Label>
                <Textarea 
                  value={nuevaUbicacion.direccion} 
                  onChange={(e) => setNuevaUbicacion({...nuevaUbicacion, direccion: e.target.value})} 
                  className="h-20 resize-none"
                  placeholder="Calle, Número, Colonia, C.P., Municipio/Alcaldía, Estado"
                />
              </div>
              <div>
                <Label className="text-sm font-medium flex items-center gap-2"><Navigation className="h-3 w-3"/> Referencias</Label>
                <Input 
                  value={nuevaUbicacion.referencia} 
                  onChange={(e) => setNuevaUbicacion({...nuevaUbicacion, referencia: e.target.value})}
                  placeholder="Portón verde, Entre calles..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2"><Clock className="h-3 w-3"/> Horario</Label>
                  <Input 
                    value={nuevaUbicacion.horario} 
                    onChange={(e) => setNuevaUbicacion({...nuevaUbicacion, horario: e.target.value})}
                    placeholder="Lun-Vie 9:00-15:00"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2"><Phone className="h-3 w-3"/> Contacto</Label>
                  <Input 
                    value={nuevaUbicacion.contacto} 
                    onChange={(e) => setNuevaUbicacion({...nuevaUbicacion, contacto: e.target.value})}
                    placeholder="Nombre / Extensión"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* MAPA REAL */}
          <div className="h-full min-h-[300px] bg-muted/30 rounded-md border flex flex-col items-center justify-center text-muted-foreground relative overflow-hidden">
             {!nuevaUbicacion.direccion ? (
               <>
                 <MapPin className="h-12 w-12 opacity-30 mb-2"/>
                 <span className="text-xs font-medium tracking-wide">Ingrese una dirección</span>
                 <span className="text-[10px]">(El mapa aparecerá aquí)</span>
               </>
             ) : (
               <iframe
                 width="100%"
                 height="100%"
                 style={{ border: 0 }}
                 loading="lazy"
                 allowFullScreen
                 src={`https://maps.google.com/maps?q=${encodeURIComponent(nuevaUbicacion.direccion)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
               ></iframe>
             )}
          </div>
        </div>
        <DialogFooter className="mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleGuardar} className="bg-primary hover:bg-primary/90 text-primary-foreground">Guardar ubicación</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- COMPONENTE PRINCIPAL ---

interface Paso2Props {
  datosGenerales: any;
  setDatosGenerales: (datos: any) => void;
  folioGenerado: string;
  guardarBorrador: () => void;
  setPaso: (paso: number) => void;
  documentosGenerados: DocumentoGenerado[];
  partidas: Partida[];
}

const Paso2_DatosGenerales: React.FC<Paso2Props> = ({
  datosGenerales,
  setDatosGenerales,
  folioGenerado,
  guardarBorrador,
  setPaso,
  documentosGenerados,
  partidas
}) => {
  
  const descargarDocumento = (doc: DocumentoGenerado) => {
    if (doc.blob) {
      const url = URL.createObjectURL(doc.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.nombre;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    if (partidas && partidas.length > 0) {
      const partidasDetectadas = partidas.map(p => String(p.cucop).substring(0, 5));
      const unicas = Array.from(new Set(partidasDetectadas)).sort();
      const stringPartidas = unicas.join(',');
      if (datosGenerales.partidaPresupuestal !== stringPartidas) {
        setDatosGenerales((prev: any) => ({ ...prev, partidaPresupuestal: stringPartidas }));
      }
    } else {
      if (datosGenerales.partidaPresupuestal !== "") {
        setDatosGenerales((prev: any) => ({ ...prev, partidaPresupuestal: "" }));
      }
    }
  }, [partidas]);

  const listaPartidasSeleccionadas = datosGenerales.partidaPresupuestal 
    ? datosGenerales.partidaPresupuestal.split(',').filter(Boolean) 
    : [];

  return (
    <Card>
      <CardHeader className="border-b border-border bg-muted/30">
        <CardTitle className="text-2xl text-primary">Paso 2: Datos Generales</CardTitle>
        <CardDescription>Formato FO-CON-03 (Parte 1). Folio: <strong>{folioGenerado}</strong></CardDescription>
      </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <Label className="text-sm font-medium">Fecha de elaboración</Label>
              <Input 
                type="date" 
                value={datosGenerales.fechaElaboracion} 
                onChange={(e) => setDatosGenerales({ ...datosGenerales, fechaElaboracion: e.target.value })} 
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Tipo de contratación</Label>
              <Select value={datosGenerales.tipoContratacion} onValueChange={(val) => setDatosGenerales({ ...datosGenerales, tipoContratacion: val })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adjudicacion">Adjudicación Directa</SelectItem>
                  <SelectItem value="invitacion">Invitación a cuando menos tres personas</SelectItem>
                  <SelectItem value="licitacion">Licitación Pública Nacional</SelectItem>
                  <SelectItem value="licitacion-internacional">Licitación Pública Internacional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ÁREAS (READONLY) */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Área solicitante</Label>
                <Input value={datosGenerales.areaSolicitante} disabled className="mt-1 bg-muted" />
              </div>
              <div>
                <Label className="text-sm font-medium">Solicitante</Label>
                <Input value={datosGenerales.solicitante} disabled className="mt-1 bg-muted" />
              </div>
            </div>

            {/* PARTIDAS PRESUPUESTALES (AUTOMÁTICAS) */}
            <div className="md:col-span-2 bg-muted/30 border p-4 rounded-md">
              <Label className="text-sm font-medium text-primary flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4"/> Partidas presupuestales afectadas
              </Label>
              
              <div className="flex flex-wrap gap-2 min-h-[30px]">
                {listaPartidasSeleccionadas.length > 0 ? (
                  listaPartidasSeleccionadas.map((idPartida: string) => (
                    <Badge key={idPartida} variant="outline" className="px-3 py-1 rounded-full">
                      <span className="font-mono font-bold text-primary mr-2">{idPartida}</span>
                      <span className="text-[10px] text-muted-foreground tracking-wide">Partida Específica</span>
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                    <Info className="h-4 w-4"/> No se han agregado bienes en el paso anterior.
                  </p>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 italic border-t pt-2">
                * Estas partidas se calculan automáticamente según los bienes seleccionados.
              </p>
            </div>

            {/* LUGAR DE ENTREGA */}
            <div className="md:col-span-2">
              <Label className="text-sm font-medium mb-1 block">Lugar y condiciones de entrega</Label>
              
              <ModalEntregaConMapa 
                ubicacionesGuardadas={datosGenerales.lugarEntrega || []}
                onGuardar={(ubicaciones) => setDatosGenerales({ ...datosGenerales, lugarEntrega: ubicaciones })}
              />

              {datosGenerales.lugarEntrega && datosGenerales.lugarEntrega.length > 0 && (
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {datosGenerales.lugarEntrega.map((loc: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 border border-l-4 border-l-primary/50 rounded-md bg-card shadow-sm">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-bold">{loc.sede}</p>
                        <p className="text-xs text-muted-foreground">{loc.direccion}</p>
                        <div className="flex flex-wrap gap-4 mt-1 text-[10px] text-muted-foreground font-medium">
                           {loc.horario && <span className="flex items-center gap-1"><Clock className="h-3 w-3"/> {loc.horario}</span>}
                           {loc.contacto && <span className="flex items-center gap-1"><Phone className="h-3 w-3"/> {loc.contacto}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* DESCARGAS */}
          {documentosGenerados.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mt-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Download className="h-4 w-4" /> Formatos Generados
              </h4>
              <div className="flex flex-wrap gap-2">
                {documentosGenerados.map((doc, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => descargarDocumento(doc)}
                    className="text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    {doc.codigo}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* NAVEGACIÓN */}
          <div className="flex justify-between pt-6 border-t mt-6">
            <Button variant="outline" onClick={() => setPaso(1)}>
              Regresar
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={guardarBorrador}>
                Guardar Borrador
              </Button>
              <Button 
                onClick={() => setPaso(3)} 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Continuar
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>
  );
};

export default Paso2_DatosGenerales;