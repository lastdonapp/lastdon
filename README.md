# Lastdon - Aplicación de Transporte de Paquetes

![Lastdon Logo](url-del-logo)  <!-- Si tienes un logo, añade la URL aquí -->

**Lastdon** es una aplicación móvil que facilita el transporte de paquetes permitiendo una interacción rápida entre usuarios y conductores. Desarrollada con Ionic, Lastdon proporciona una solución eficiente y segura para gestionar envíos, asegurando que tus productos lleguen a su destino de manera rápida, confiable y segura.

## Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Contribución](#contribución)
- [Licencia](#licencia)
- [Contacto](#contacto)

## Descripción

En Lastdon nos enorgullece ofrecer un servicio de transporte para envíos con Mercado Plex, diseñado para simplificar y agilizar tus entregas. Nos esforzamos por brindarte una experiencia excepcional en cada envío, asegurando que tus productos lleguen a su destino de manera rápida, segura y confiable.

## Características

- **Registro y Login:** Registro de usuarios y conductores, y acceso seguro mediante autenticación.
- **Gestión de Pedidos:** Los usuarios pueden crear y gestionar sus pedidos, incluyendo detalles completos del envío.
- **Menú del Conductor:** Los conductores pueden ver, aceptar y gestionar los pedidos disponibles.
- **Historial de Pedidos:** Acceso al historial de envíos realizados.
- **Pagos:** Gestión de pagos directamente desde la aplicación.
- **Perfil de Usuario:** Gestión de la información personal y cambio de contraseña.

## Tecnologías Utilizadas

- **Ionic Framework**: Para el desarrollo de la interfaz de usuario y la lógica de la aplicación.
- **Angular**: Framework utilizado en conjunto con Ionic para el desarrollo frontend.
- **Supabase**: Backend para la gestión de la base de datos y autenticación.
- **Capacitor**: Para la integración nativa con dispositivos móviles.
- **Google Maps API**: Para la localización y visualización de ubicaciones.

## Requisitos Previos

Antes de empezar, asegúrate de tener instaladas las siguientes herramientas:

- Node.js (versión actual)
- Ionic CLI (versión actual)
- Android Studio (para pruebas en dispositivos móviles)

## Instalación

Sigue estos pasos para instalar el proyecto:

1. Clona el repositorio desde GitHub:
   ```bash
   git clone https://github.com/lastdonapp/lastdon.git

2. Navega al directorio del proyecto e instala las dependencias:
   ```bash
   cd lastdon
   npm install

4. Configura las variables de entorno según sea necesario.

## Uso

1. Para iniciar el proyecto en modo de desarrollo, utiliza el siguiente comando:
    ```bash
    ionic serve
  
Para probar el proyecto en un dispositivo móvil, abre el proyecto en Android Studio y conéctalo a un dispositivo o emulador.

## Estructura del Proyecto



1. La estructura principal del proyecto es la siguiente:
   ```bash
   
    lastdon/
    ├── src/
    │   ├── app/
    │   │   ├── change-password-modal/
    │   │   ├── conductor-menu/
    │   │   │   ├── agregar-pedidos/
    │   │   │   ├── detalles-pedido/
    │   │   │   ├── mis-pedidos/
    │   │   │   └── perfil/
    │   │   ├── login/
    │   │   ├── menu/
    │   │   │   ├── agregar-pedidos/
    │   │   │   ├── contacto/
    │   │   │   ├── historial/
    │   │   │   ├── informacion/
    │   │   │   ├── pagos/
    │   │   │   └── perfil/
    │   │   ├── register/
    │   │   ├── services/
    │   │   ├── shared/
    │   │   └── environments/
    │   └── assets/
    └── ...

## Contribucion
Para contribuir al proyecto:

1. Haz un fork del repositorio.
2. Crea una nueva rama (git checkout -b feature/nueva-funcionalidad).
3. Realiza tus cambios y escribe pruebas si es necesario.
4. Envía un pull request.
