"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Camera, Upload } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const schema = z.object({
  sede_id: z.string().min(1, "Selecciona sede"),
  ubicacion_id: z.string().min(1, "Selecciona ubicación"),
  categoria_id: z.string().min(1, "Selecciona categoría"),
  subcategoria_id: z.string().optional(),
  serie: z.string().min(1, "Serie requerida"),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  cantidad: z.string().min(1, "Cantidad requerida"),
  imagen_url: z.string().optional(),
});

type ElementoFormData = z.infer<typeof schema>;

type CategoriaOption = { id: number; nombre: string };
type SubcategoriaOption = { id: number; nombre: string; categoria_id: number };
type UbicacionOption = { id: number; codigo: string; nombre: string; sede_id: number };
type SedeOption = { id: number; nombre: string; ciudad: string; municipio: string | null };

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean;
  sedes: SedeOption[];
  categorias: CategoriaOption[];
  subcategorias: SubcategoriaOption[];
  ubicaciones: UbicacionOption[];
  defaultValues?: Partial<ElementoFormData>;
  hiddenFields?: Record<string, string | number>;
  onClose?: () => void;
};

export function ElementoUpsertDialog({
  serverAction,
  create = true,
  sedes,
  categorias,
  subcategorias,
  ubicaciones,
  defaultValues,
  hiddenFields,
  onClose,
}: Props) {
  // El modal siempre empieza cerrado, se abre al hacer clic en el botón
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(defaultValues?.imagen_url || "");
  const [imageTouched, setImageTouched] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
  const [cameraCapturedFile, setCameraCapturedFile] = useState<File | null>(null);
  const [cameraCapturedPreviewUrl, setCameraCapturedPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ElementoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sede_id: defaultValues?.sede_id || "",
      ubicacion_id: defaultValues?.ubicacion_id || "",
      categoria_id: defaultValues?.categoria_id || "",
      subcategoria_id: defaultValues?.subcategoria_id || "",
      serie: defaultValues?.serie || "",
      marca: defaultValues?.marca || "",
      modelo: defaultValues?.modelo || "",
      cantidad: defaultValues?.cantidad || "1",
      imagen_url: defaultValues?.imagen_url || "",
    },
  });

  // Reinicializar formulario cuando cambian los defaultValues
  useEffect(() => {
    if (defaultValues) {
      reset({
        sede_id: defaultValues.sede_id || "",
        ubicacion_id: defaultValues.ubicacion_id || "",
        categoria_id: defaultValues.categoria_id || "",
        subcategoria_id: defaultValues.subcategoria_id || "",
        serie: defaultValues.serie || "",
        marca: defaultValues.marca || "",
        modelo: defaultValues.modelo || "",
        cantidad: defaultValues.cantidad || "1",
        imagen_url: defaultValues.imagen_url || "",
      });
      setImageUrl(defaultValues.imagen_url || "");
      setImageTouched(false);
    }
  }, [defaultValues, reset]);

  // Filtrar ubicaciones por sede seleccionada
  const selectedSedeId = watch("sede_id");
  const filteredUbicaciones = ubicaciones.filter(
    (u) => u.sede_id === parseInt(selectedSedeId || "0")
  );

  // Filtrar subcategorías por categoría seleccionada
  const selectedCategoriaId = watch("categoria_id");
  const filteredSubcategorias = subcategorias.filter(
    (sub) => sub.categoria_id === parseInt(selectedCategoriaId || "0")
  );

  const hasExistingImage = useMemo(() => Boolean(imageUrl), [imageUrl]);
  const hasPendingImage = Boolean(pendingImageFile && pendingPreviewUrl);

  // Sube un archivo a R2 y devuelve la URL pública. No actualiza el form por sí solo:
  // se usa para subir "solo cuando se guarda" (submit).
  const uploadImageToR2 = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/uploads/images", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error || "Error subiendo imagen");
      return json.url;
    } finally {
      setUploadingImage(false);
    }
  };

  // Cámara: captura real (en vez de depender de `capture`, que algunos navegadores ignoran).
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play().catch(() => {});
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo acceder a la cámara";
      setCameraError(msg);
    }
  };

  const openCamera = () => {
    // Fallback si el navegador no soporta acceso a cámara.
    if (!navigator?.mediaDevices?.getUserMedia) {
      cameraInputRef.current?.click();
      return;
    }

    // Reiniciar estado de captura previa
    if (cameraCapturedPreviewUrl) URL.revokeObjectURL(cameraCapturedPreviewUrl);
    setCameraCapturedPreviewUrl(null);
    setCameraCapturedFile(null);
    setCameraError(null);
    setCameraOpen(true);
  };

  useEffect(() => {
    if (!cameraOpen) {
      stopCamera();
      // Cleanup preview capturada si el usuario cierra el diálogo
      if (cameraCapturedPreviewUrl) URL.revokeObjectURL(cameraCapturedPreviewUrl);
      setCameraCapturedPreviewUrl(null);
      setCameraCapturedFile(null);
      return;
    }

    void startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOpen]);

  const setPendingFromFile = (file: File) => {
    // Si ya había una imagen pendiente, liberamos el objectURL.
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    const preview = URL.createObjectURL(file);
    setPendingImageFile(file);
    setPendingPreviewUrl(preview);
    setImageTouched(true);
  };

  const captureFromCamera = async () => {
    const video = videoRef.current;
    if (!video) return;

    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, w, h);

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob) return;

    const file = new File([blob], `elemento_${Date.now()}.jpg`, { type: "image/jpeg" });

    if (cameraCapturedPreviewUrl) URL.revokeObjectURL(cameraCapturedPreviewUrl);
    setCameraCapturedFile(file);
    setCameraCapturedPreviewUrl(URL.createObjectURL(file));

    // Congelamos la cámara para que el usuario revise la foto antes de aprobarla.
    stopCamera();
  };

  const retryCamera = async () => {
    if (cameraCapturedPreviewUrl) URL.revokeObjectURL(cameraCapturedPreviewUrl);
    setCameraCapturedPreviewUrl(null);
    setCameraCapturedFile(null);
    await startCamera();
  };

  const acceptCameraPhoto = () => {
    if (!cameraCapturedFile) return;
    setPendingFromFile(cameraCapturedFile);
    setCameraOpen(false);
  };

  const onSubmit = async (data: ElementoFormData) => {
    try {
      const formData = new FormData();

      // Agregar campos del formulario en el orden correcto
      formData.append("ubicacion_id", data.ubicacion_id);
      formData.append("categoria_id", data.categoria_id);
      if (data.subcategoria_id)
        formData.append("subcategoria_id", data.subcategoria_id);
      formData.append("serie", data.serie);
      if (data.marca) formData.append("marca", data.marca);
      if (data.modelo) formData.append("modelo", data.modelo);
      formData.append("cantidad", data.cantidad);
      if (data.imagen_url) formData.append("imagen_url", data.imagen_url);

      // Imagen (Cloudflare R2):
      // - Si hay una imagen pendiente (vista previa), se sube SOLO al guardar.
      // - Si no hay pendiente, usamos la URL existente (o vacío si se quitó).
      if (create || imageTouched) {
        let finalUrl = imageUrl;
        if (pendingImageFile) {
          try {
            finalUrl = await uploadImageToR2(pendingImageFile);
            setImageUrl(finalUrl);
            toast.success("Imagen subida a Cloudflare R2");
          } catch (e) {
            const msg = e instanceof Error ? e.message : "Error subiendo imagen";
            toast.error(msg);
            throw e;
          } finally {
            // Limpiar pendiente en cualquier caso (si falló, el usuario puede reintentar seleccionando otra)
            if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
            setPendingPreviewUrl(null);
            setPendingImageFile(null);
          }
        }

        formData.append("imagen_url", finalUrl);
      }

      // Agregar campos ocultos
      if (hiddenFields) {
        Object.entries(hiddenFields).forEach(([name, value]) => {
          formData.append(name, String(value));
        });
      }

      const promise = serverAction(formData);

      await toast.promise(promise, {
        loading: create ? "Creando elemento..." : "Actualizando elemento...",
        success: create
          ? "Elemento creado exitosamente"
          : "Elemento actualizado exitosamente",
        error: "Error al procesar el formulario",
      });

      reset();
      setImageUrl("");
      setImageTouched(false);
      if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
      setPendingPreviewUrl(null);
      setPendingImageFile(null);
      setOpen(false);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const btnText = create ? "Crear" : "Editar";
  const title = create ? "Crear elemento" : "Editar elemento";
  const submitText = create ? "Crear" : "Guardar cambios";

  return (
    <>
      {create && <Button onClick={() => setOpen(true)}>{btnText}</Button>}
      {!create && <Button variant="outline" size="sm" onClick={() => setOpen(true)}>{btnText}</Button>}
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) setCameraOpen(false);
        if (!isOpen) {
          // Cleanup de preview pendiente al cerrar el modal
          if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
          setPendingPreviewUrl(null);
          setPendingImageFile(null);
          setImagePickerOpen(false);
        }
        if (!isOpen && onClose) onClose();
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
            {/* Imagen del elemento (R2) */}
            <div className="grid gap-2">
              <Label>Imagen del elemento</Label>
              {/* Un solo "card" clickeable: tomar o subir, y aquí mismo se ve la vista previa */}
              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => setImagePickerOpen(true)}
                className="w-full text-left rounded-md border p-3 hover:bg-muted/40 transition-colors disabled:opacity-60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">Tomar o subir foto</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {uploadingImage ? "Subiendo..." : "Opciones"}
                  </div>
                </div>

                <div className="mt-3">
                  {hasPendingImage ? (
                    <div className="rounded-md overflow-hidden border bg-background">
                      <img
                        src={pendingPreviewUrl ?? ""}
                        alt="Vista previa"
                        className="w-full h-auto"
                      />
                    </div>
                  ) : hasExistingImage ? (
                    <div className="rounded-md overflow-hidden border bg-background">
                      <img src={imageUrl} alt="Imagen del elemento" className="w-full h-auto" />
                    </div>
                  ) : (
                    <div className="rounded-md border bg-muted/30 px-3 py-6 text-center text-sm text-muted-foreground">
                      Sin imagen
                    </div>
                  )}
                </div>
              </button>

              {/* Inputs ocultos para tomar/subir (los dispara el selector) */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                disabled={uploadingImage}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  // Permite volver a seleccionar la misma foto
                  e.currentTarget.value = "";
                  if (file) setPendingFromFile(file);
                }}
              />
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingImage}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.currentTarget.value = "";
                  if (file) setPendingFromFile(file);
                }}
              />
            </div>

            {/* Sede */}
            <div className="grid gap-1">
              <Label htmlFor="sede_id">Sede</Label>
              <Select
                value={watch("sede_id")}
                onValueChange={(value) => {
                  setValue("sede_id", value);
                  setValue("ubicacion_id", ""); // Reset ubicación al cambiar sede
                }}
                disabled={sedes.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    sedes.length === 0 
                      ? "No hay sedes disponibles" 
                      : "Selecciona sede"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {sedes.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      <p className="font-medium">No hay sedes disponibles</p>
                      <p className="text-xs mt-1">
                        Crea sedes en la configuración del sistema
                      </p>
                    </div>
                  ) : (
                    sedes.map((sede) => (
                      <SelectItem key={sede.id} value={sede.id.toString()}>
                        {sede.nombre} - {sede.ciudad}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.sede_id && (
                <p className="text-red-500 text-sm">
                  {errors.sede_id.message}
                </p>
              )}
            </div>

            {/* Ubicación */}
            <div className="grid gap-1">
              <Label htmlFor="ubicacion_id">Ubicación</Label>
              <Select
                value={watch("ubicacion_id") || undefined}
                onValueChange={(value) =>
                  setValue("ubicacion_id", value || "")
                }
                disabled={!selectedSedeId || filteredUbicaciones.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedSedeId 
                      ? "Primero selecciona una sede" 
                      : filteredUbicaciones.length === 0 
                        ? "No hay ubicaciones disponibles" 
                        : "Selecciona ubicación"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredUbicaciones.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      <p className="font-medium">
                        {!selectedSedeId 
                          ? "Selecciona una sede primero" 
                          : "No hay ubicaciones disponibles"}
                      </p>
                      <p className="text-xs mt-1">
                        {!selectedSedeId 
                          ? "Debes seleccionar una sede para ver sus ubicaciones" 
                          : "Crea ubicaciones para esta sede en la configuración"}
                      </p>
                    </div>
                  ) : (
                    filteredUbicaciones.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.codigo} - {u.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.ubicacion_id && (
                <p className="text-red-500 text-sm">
                  {errors.ubicacion_id.message}
                </p>
              )}
            </div>

            {/* Categoría */}
            <div className="grid gap-1">
              <Label htmlFor="categoria_id">Categoría</Label>
              <Select
                value={watch("categoria_id")}
                onValueChange={(value) => {
                  setValue("categoria_id", value);
                  setValue("subcategoria_id", ""); // Reset subcategoría
                }}
                disabled={categorias.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    categorias.length === 0 
                      ? "No hay categorías disponibles" 
                      : "Selecciona categoría"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {categorias.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      <p className="font-medium">No hay categorías disponibles</p>
                      <p className="text-xs mt-1">
                        Crea categorías en la configuración del sistema
                      </p>
                    </div>
                  ) : (
                    categorias.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.categoria_id && (
                <p className="text-red-500 text-sm">
                  {errors.categoria_id.message}
                </p>
              )}
            </div>

            {/* Subcategoría */}
            <div className="grid gap-1">
              <Label htmlFor="subcategoria_id">Subcategoría</Label>
              <Select
                value={watch("subcategoria_id") || undefined}
                onValueChange={(value) =>
                  setValue("subcategoria_id", value || "")
                }
                disabled={!selectedCategoriaId || filteredSubcategorias.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedCategoriaId 
                      ? "Primero selecciona una categoría" 
                      : filteredSubcategorias.length === 0 
                        ? "No hay subcategorías disponibles" 
                        : "Selecciona subcategoría"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubcategorias.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      <p className="font-medium">
                        {!selectedCategoriaId 
                          ? "Selecciona una categoría primero" 
                          : "No hay subcategorías disponibles"}
                      </p>
                      <p className="text-xs mt-1">
                        {!selectedCategoriaId 
                          ? "Debes seleccionar una categoría para ver sus subcategorías" 
                          : "Crea subcategorías para esta categoría en la configuración"}
                      </p>
                    </div>
                  ) : (
                    filteredSubcategorias.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.subcategoria_id && (
                <p className="text-red-500 text-sm">
                  {errors.subcategoria_id.message}
                </p>
              )}
            </div>

            {/* Serie */}
            <div className="grid gap-1">
              <Label htmlFor="serie">Serie</Label>
              <Input
                id="serie"
                type="text"
                placeholder="Ej: MIC-00023 / PROY-0102"
                {...register("serie")}
              />
              {errors.serie && (
                <p className="text-red-500 text-sm">{errors.serie.message}</p>
              )}
            </div>

            {/* Marca y Modelo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  type="text"
                  placeholder="Ej: Shure / Epson / Yamaha"
                  {...register("marca")}
                />
                {errors.marca && (
                  <p className="text-red-500 text-sm">{errors.marca.message}</p>
                )}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  type="text"
                  placeholder="Ej: SM58 / EB-X41"
                  {...register("modelo")}
                />
                {errors.modelo && (
                  <p className="text-red-500 text-sm">
                    {errors.modelo.message}
                  </p>
                )}
              </div>
            </div>

            {/* Cantidad */}
            <div className="grid gap-1">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                {...register("cantidad")}
              />
              {errors.cantidad && (
                <p className="text-red-500 text-sm">
                  {errors.cantidad.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  if (onClose) onClose();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {submitText}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Selector de origen (un solo punto de entrada) */}
      <Dialog open={imagePickerOpen} onOpenChange={setImagePickerOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Agregar foto</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Button
              type="button"
              onClick={() => {
                setImagePickerOpen(false);
                openCamera();
              }}
              disabled={uploadingImage}
            >
              <Camera className="h-4 w-4 mr-2" />
              Tomar foto
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setImagePickerOpen(false);
                uploadInputRef.current?.click();
              }}
              disabled={uploadingImage}
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir desde el dispositivo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cámara: diálogo independiente (preview + capturar). */}
      <Dialog
        open={cameraOpen}
        onOpenChange={(v) => {
          setCameraOpen(v);
          if (!v) stopCamera();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tomar foto</DialogTitle>
          </DialogHeader>

          {cameraError ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                No se pudo abrir la cámara: {cameraError}
              </p>
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={() => cameraInputRef.current?.click()}>
                  Intentar con cámara del sistema
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setCameraOpen(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <>
                {cameraCapturedPreviewUrl ? (
                  <div className="space-y-3">
                    <div className="rounded-md overflow-hidden border">
                      <img
                        src={cameraCapturedPreviewUrl}
                        alt="Vista previa"
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => void retryCamera()}>
                        Repetir
                      </Button>
                      <Button type="button" size="sm" onClick={acceptCameraPhoto}>
                        Usar esta foto
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-md overflow-hidden border bg-black">
                      <video ref={videoRef} className="w-full h-auto" playsInline muted />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setCameraOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="button" size="sm" onClick={() => void captureFromCamera()}>
                        Tomar
                      </Button>
                    </div>
                  </div>
                )}
              </>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
