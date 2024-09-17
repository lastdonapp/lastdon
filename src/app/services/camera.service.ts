// src/app/services/camera.service.ts
import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 100,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });

    const response = await fetch(image.webPath!);
    const blob = await response.blob();

    return blob;
  }
}
