import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';



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
    cantidadPaquetes: 1,
    dimensiones: {
      valor: 0,
      unidad: 'cm'
    },
    fragil: false,
    cambio: false,
    excedeKilos: false,
    fecha: '',
    costo: 0,
    estado: 'por tomar',
    fechaTomado: null,
    conductor: '',
    usuario: '',
    codigo: '',
    image_url: '', // Asegúrate de incluir esta propiedad para la URL de la foto
    pagado: false,

  };

  comunas: string[] = [
    'La Cisterna', 
    'Ñuñoa', 
    'Providencia', 
    'Pedro Aguirre Cerda', 
    'Santiago', 
    'San Miguel', 
    'San Joaquín',
    'Cerrillos',
    'Cerro Navia',
    'Colina',
    'Conchalí',
    'El Bosque',
    'Huechuraba',
    'Independencia',
    'La Florida',
    'La Granja',
    'La Pintana',
    'La Reina',
    'Las Condes',
    'Lo Barnechea',
    'Lo Espejo',
    'Lo Prado',
    'Macul',
    'Maipú',
    'Padre Hurtado',
    'Peñalolén',
    'Pudahuel',
    'Puente Alto',
    'Quilicura',
    'Quinta Normal',
    'Recoleta',
    'Renca',
    'San Bernardo',
    'San Ramón',
    'Vitacura',
    'Estación Central'
  ];

  // Costos por comuna
  costosPorComuna: { [key: string]: number } = {
    'La Cisterna': 3500,
    'Ñuñoa': 2990,
    'Providencia': 3500,
    'Pedro Aguirre Cerda': 2500,
    'Santiago': 2990,
    'San Miguel': 2990,
    'San Joaquín': 2990,
    'Cerrillos': 3500,
    'Cerro Navia': 3500,
    'Colina': 4000,
    'Conchalí': 2990,
    'El Bosque': 3500,
    'Estación Central': 3500,
    'Huechuraba': 3500,
    'Independencia': 2990,
    'La Florida': 3500,
    'La Granja': 2990,
    'La Pintana': 3500,
    'La Reina': 3500,
    'Las Condes': 3500,
    'Lo Barnechea': 4000,
    'Lo Espejo': 3500,
    'Lo Prado': 3500,
    'Macul': 2990,
    'Maipú': 4000,
    'Pedro Hurtado': 4000,
    'Peñalolén': 3500,
    'Pudahuel': 4000,
    'Puente Alto': 4000,
    'Quilicura': 3500,
    'Quinta Normal': 3500,
    'Recoleta': 2990,
    'Renca': 3500,
    'San Bernardo': 4000,
    'San Ramón': 3500,
    'Vitacura': 3500,

  
  };





  telefonoInput: string = ''; // Input del teléfono sin el prefijo
  capturedPhoto: string = ''; // Variable para almacenar la URL de la foto capturada
  photoUrl: string = ''; // URL de la foto del pedido

  constructor(
    private readonly http: HttpClient,
    private readonly supabaseService: SupabaseService,
    private readonly router: Router,
    private readonly toastController: ToastController,
    private readonly alertController: AlertController,

  ) {}

  ngOnInit() {
    const user = this.supabaseService.getCurrentUser();
    this.pedido.usuario = user.email;
    this.pedido.codigo = this.generateUniqueCode();
    this.pedido.fecha = new Date().toISOString();
  }


  

    // Método para actualizar el costo cuando cambia la comuna
    onComunaChange(comuna: string) {
      if (this.costosPorComuna[comuna]) {
        this.pedido.costo = this.costosPorComuna[comuna];
        console.log('Costo actualizado según comuna:', this.pedido.costo);
        this.updateCosto(); // Llama a la función para actualizar el costo

      }
    }



// Función que verifica si todos los campos del acordeón de "Información del Pedido" están completos
get isInfoPedidoCompleta(): boolean {
  return (
    this.pedido.nombrePedido && 
    this.pedido.descripcionPedido && 
    this.pedido.direccionPedido && 
    this.pedido.direccionEntrega
  );
}

// Función que verifica si todos los campos del acordeón de "Información del Destinatario" están completos
get isInfoDestinatarioCompleta(): boolean {
  return (
    this.pedido.nombreDestinatario && 
    this.pedido.numeracionCasa && 
    this.pedido.vivienda && 
    this.pedido.comuna && 
    this.pedido.telefono
  );
}

// Función que verifica si todos los campos del acordeón de "Dimensiones" están completos
get isDimensionesCompleta(): boolean {
  return (
    this.pedido.dimensiones.alto && 
    this.pedido.dimensiones.ancho && 
    this.pedido.dimensiones.largo 
  );
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
      color: "#FF9500"
    });
    toast.present();
  }

  onTelefonoChange(value: string) {
    // Asegura que solo se ingresen 8 dígitos
    if (/^\d{0,8}$/.test(value)) {
      this.telefonoInput = value;
      this.pedido.telefono = '+569' + value;  // Actualiza el pedido con el nuevo número
    }
  }
  
  onDimensionesChange() {
    // Limitar el valor del alto a 80 si lo excede
    if (this.pedido.dimensiones.alto > 80) {
      this.pedido.dimensiones.alto = 80;
    }
  
    // Limitar el valor del ancho a 80 si lo excede
    if (this.pedido.dimensiones.ancho > 80) {
      this.pedido.dimensiones.ancho = 80;
    }
  
    // Limitar el valor del largo a 80 si lo excede
    if (this.pedido.dimensiones.largo > 80) {
      this.pedido.dimensiones.largo = 80;
    }
    this.updateCosto(); // Actualiza el costo cuando se cambian las dimensiones o la unidad
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
                this.photoUrl = publicURL ?? '';
                this.pedido.image_url = this.photoUrl; // Guarda la URL en el objeto pedido
                console.log('imagen url ', this.pedido.image_url);
              }
              this.onTelefonoChange(this.telefonoInput);
              const { data, error } = await this.supabaseService.addPedido(this.pedido);
              if (error) {
                console.error('Error al agregar pedido:', error);
              } else {
                console.log('Pedido agregado:', data);
                await this.showToast('Pedido agregado exitosamente', 'success');
                this.capturedPhoto = ''; // Limpiar la variable de la foto capturada
                this.router.navigate(['/menu/pedidos']);
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




  updateCosto() {
    // Validar que se haya ingresado al menos un paquete
    if (this.pedido.cantidadPaquetes <= 0) {
      console.error('Debe ingresar al menos un paquete');
      return; // Salir si la cantidad de paquetes es inválida
    }
  
    // Verificar que las dimensiones existan y sean mayores que cero
    if (!this.pedido.dimensiones || this.pedido.dimensiones.alto <= 0 || this.pedido.dimensiones.ancho <= 0 || this.pedido.dimensiones.largo <= 0) {
      console.error('Las dimensiones deben ser mayores que cero');
      return; // Salir si las dimensiones son inválidas
    }
  
    // Calcular el volumen en cm³
    let volumen = this.pedido.dimensiones.alto * this.pedido.dimensiones.ancho * this.pedido.dimensiones.largo;
  
    // Validar que el volumen no sea cero o negativo
    if (volumen <= 0) {
      console.error('El volumen calculado no puede ser cero o negativo');
      return; // Salir si el volumen es inválido
    }
  
    // Cálculo del costo por volumen 
    let dimensionCost = volumen * 0.002; // Ajusta el factor de costo si es necesario
  
    // Añadir el costo de la comuna si es aplicable
    let costoComuna = this.pedido.costo || 0;
  
    // Inicializar el costo base
    let cost = dimensionCost + costoComuna;
  
    // Verificar si TODAS las dimensiones exceden los 40 cm y añadir tarifa fija
    if (this.pedido.dimensiones.alto > 40 && this.pedido.dimensiones.ancho > 40 && this.pedido.dimensiones.largo > 40) {
      cost += 1500 // Tarifa fija por exceder los 40 cm en TODAS las dimensiones
      console.log('Tarifa fija por exceder los 40 cm en TODAS las dimensiones, por cada paquete');
    }
  
    // Aplicar los costos adicionales basados en las condiciones del pedido
    if (this.pedido.excedeKilos) {
      cost += 3000; // Costo adicional por exceder 2,5 kilos
    }
    if (this.pedido.fragil) {
      cost += 1000; // Costo adicional por ser frágil
    }
  
    // Calcular el costo total multiplicando por la cantidad de paquetes
    let totalCost = cost * this.pedido.cantidadPaquetes;
  
    // Asignar el costo total al pedido
    this.pedido.costoTotal = totalCost;
  
    console.log('Costo total actualizado:', this.pedido.costoTotal);
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



  async onFragilChange(event: any) {
    if (event.detail.checked) {
      const alert = await this.alertController.create({
        header: 'Advertencia',
        message: 'El paquete es frágil. Asegúrate de embalarlo correctamente, al seleccionar este campo la tarifa aumenta en 1000 CLP por paquete.',
        buttons: ['Entendido']
      });

      await alert.present();
    }
        // Llamar a la función que actualiza el costo
        this.updateCosto();
  }



  handleExcedeKilosChange() {
    // Mostrar advertencia si el checkbox está seleccionado
    if (this.pedido.excedeKilos) {
      this.presentPesoAlert();
    }
  
    // Actualizar el costo del pedido
    this.updateCosto();
  }
  
  async presentPesoAlert() {
    const alert = await this.alertController.create({
      header: 'Advertencia',
      message: 'El peso máximo por pedido no debe exceder los 5 kg, . Al exceder los 2,5 kg, existe tarifa adicional de 3000 CLP por paquete. Asegúrese de que su paquete esté dentro de los límites permitidos.',
      buttons: ['OK']
    });
  
    await alert.present();
  }









}




  




