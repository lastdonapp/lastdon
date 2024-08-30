import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-agregar-pedidos',
  templateUrl: './agregar-pedidos.page.html',
  styleUrls: ['./agregar-pedidos.page.scss'],
})
export class AgregarPedidosPage implements OnInit {
  sugerenciasPedido: any[] = [];
  sugerenciasEntrega: any[] = [];
  sugerencias: any[] = []; // Para almacenar las sugerencias
  pedido: any = {
    nombrePedido: '',
    descripcionPedido: '',
    direccionPedido: '',
    direccionEntrega: '',
    nombreDestinatario: '',
    numeracionCasa: '',
    vivienda: '',
    comuna: '',
    telefono: '+569',
    cantidadPaquetes: 0,
    dimensiones: {
      valor: 0,
      unidad: 'metros'
    },
    fragil: false,
    cambio: false,
    excede10Kilos: false,
    fecha: '',
    costo: 0,
    estado: 'por tomar',
    fechaTomado: null,
    conductor: '',
    usuario: '',
    codigo: '',
    image_url: '', // Asegúrate de incluir esta propiedad para la URL de la foto
    pagado: false
  };

  comunas: string[] = [
    'Alhué', 'Buin', 'Calera de Tango', 'Cerrillos', 'Cerro Navia',
    'Colina', 'Conchalí', 'Curacaví', 'El Bosque', 'Estación Central',
    'Huechuraba', 'Independencia', 'Isla de Maipo', 'La Cisterna', 'La Florida', 
    'La Granja', 'La Pintana', 'La Reina', 'Lampa', 'Las Condes', 
    'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 
    'María Pinto', 'Melipilla', 'Ñuñoa', 'Padre Hurtado', 'Paine', 
    'Pedro Aguirre Cerda', 'Peñaflor', 'Peñalolén', 'Pirque', 'Providencia', 
    'Pudahuel', 'Puente Alto', 'Quilicura', 'Quinta Normal', 'Recoleta', 
    'Renca', 'San Bernardo', 'San Joaquín', 'San José de Maipo', 'San Miguel', 
    'San Pedro', 'San Ramón', 'Santiago', 'Talagante', 'Tiltil', 
    'Vitacura'
];

  telefonoInput: string = ''; // Input del teléfono sin el prefijo
  capturedPhoto: string = ''; // Variable para almacenar la URL de la foto capturada
  photoUrl: string = ''; // URL de la foto del pedido

  constructor(
    private http: HttpClient,
    private supabaseService: SupabaseService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    const user = this.supabaseService.getCurrentUser();
    this.pedido.usuario = user.email;
    this.pedido.codigo = this.generateUniqueCode();
    this.pedido.fecha = new Date().toISOString();
  }

  async takePhoto() {
    try {
      // Captura la foto
      const photo: any = await this.supabaseService.takePicture();
      if (photo) {
        this.createImageFromBlob(photo);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  }

  private createImageFromBlob(photo: Blob) {
    const reader = new FileReader();
    reader.onloadend = () => {
      this.capturedPhoto = reader.result as string;
    };
    reader.readAsDataURL(photo);
  }

  private async convertBlobToFile(blob: Blob, fileName: string): Promise<File> {
    return new Promise<File>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const file = new File([blob], fileName, { type: blob.type });
        resolve(file);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: color
    });
    toast.present();
  }

  onTelefonoChange(value: string) {
    // Asegura que solo se ingresen 8 dígitos
    if (/^\d{0,8}$/.test(value)) {
      this.telefonoInput = value;
      this.pedido.telefono = '+569' + value;  // Actualiza el pedido con el nuevo número
    }
    console.log('Número de teléfono actualizado:', value);
    console.log('Número de teléfono actualizado:', this.telefonoInput);
  }
  
  onDimensionesChange() {
    // Actualiza el costo cuando se cambian las dimensiones o la unidad
    this.updateCosto();
  }



  async onSubmit() {
    try {
      const alert = await this.alertController.create({
        header: 'Confirmar Acción',
        message: '¿Está seguro de confirmar esta acción?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              console.log('Pedido cancelado por el usuario');
            }
          },
          {
            text: 'Confirmar',
            handler: async () => {
              if (this.capturedPhoto) {
                // Genera un nombre único para el archivo usando un timestamp
                const timestamp = new Date().getTime();
                const filePath = `photos/photo-${timestamp}.jpeg`;
  
                // Convertir el Data URL a un blob
                const blob = await fetch(this.capturedPhoto).then(res => res.blob());
  
                // Convertir el blob en un archivo
                const file = await this.convertBlobToFile(blob, filePath);
  
                // Subir la foto al bucket de Supabase
                const { error: uploadError } = await this.supabaseService.uploadImage(file, filePath);
  
                if (uploadError) {
                  throw new Error(`Upload error: ${uploadError.message}`);
                }
  
                // Obtener la URL de la foto subida
                const { publicURL, error: urlError } = await this.supabaseService.getImageUrl(filePath);
  
                if (urlError) {
                  throw new Error(`URL fetch error: ${urlError}`);
                }
  
                // Guardar la URL de la foto
                this.photoUrl = publicURL || '';
                this.pedido.image_url = this.photoUrl; // Guarda la URL en el objeto pedido
                console.log('imagen url ', this.pedido.image_url);
              }
  
              this.pedido.costo 
              this.onTelefonoChange(this.telefonoInput);
              const { data, error } = await this.supabaseService.addPedido(this.pedido);
              if (error) {
                console.error('Error al agregar pedido:', error);
              } else {
                console.log('Pedido agregado:', data);
                await this.showToast('Pedido agregado exitosamente', 'success');
                this.capturedPhoto = ''; // Limpiar la variable de la foto capturada
                this.router.navigate(['/menu']);
              }
            }
          }
        ]
      });
  
      await alert.present();
    } catch (error) {
      console.error('Error inesperado:', error);
    }
  }



  calculateCost() {
    let cost = 1000; // Costo base por paquete
  
    if (this.pedido.excede10Kilos) {
      cost += 2000; // Costo adicional por exceder 10 kilos
    }
    if (this.pedido.fragil) {
      cost += 1000; // Costo adicional por ser frágil
    }
    if (this.pedido.cambio) {
      cost += 500; // Costo adicional por requerir cambio
    }
  
    return cost; // Retorna el costo calculado por paquete
  }

  updateCosto() {
    let baseCost = this.calculateCost();
  
    // Calcular el volumen en metros cúbicos
    let volumen = this.pedido.dimensiones.alto * this.pedido.dimensiones.ancho * this.pedido.dimensiones.largo;
  
    // Ajustar el volumen según la unidad
    if (this.pedido.dimensiones.unidad === 'centimetros') {
      volumen /= 1000000; // Convertir cm³ a m³
    }
  
    let dimensionCost = volumen * 5000; // Costo por volumen (ajustar según necesidad)
  
    // Cálculo del costo total considerando la cantidad de paquetes
    let totalCost = (baseCost + dimensionCost) * this.pedido.cantidadPaquetes;
  
    // Asigna el costo calculado al pedido
    this.pedido.costo = totalCost;
  }

  generateUniqueCode() {
    return 'PED-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
 
  buscarDirecciones(query: string): Observable<any> {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}`;
    return this.http.get(url).pipe(
      map((response: any) => response.features)
    );
  }

  onDireccionPedidoChange(event: any) {
    const value = event.target.value;
    if (value.length > 2) {
      this.buscarDirecciones(value).subscribe((results: any) => {
        this.sugerenciasPedido = results;
      });
    } else {
      this.sugerenciasPedido = [];
    }
  }

  onDireccionEntregaChange(event: any) {
    const value = event.target.value;
    if (value.length > 2) {
      this.buscarDirecciones(value).subscribe((results: any) => {
        this.sugerenciasEntrega = results;
      });
    } else {
      this.sugerenciasEntrega = [];
    }
  }

  seleccionarDireccionPedido(sugerencia: any) {
    this.pedido.direccionPedido = sugerencia.properties.name;
    this.sugerenciasPedido = [];
  }

  seleccionarDireccionEntrega(sugerencia: any) {
    this.pedido.direccionEntrega = sugerencia.properties.name;
    this.sugerenciasEntrega = [];
  }




  



}
