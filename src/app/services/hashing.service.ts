export class HashingService {

  // Función para convertir un string a un array de bytes
  private async stringToBytes(str: string): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    return encoder.encode(str);
  }

  // Función para hashear una contraseña usando SHA-256
  public async hashPassword(password: string, salt: string): Promise<string> {
    const passwordBytes = await this.stringToBytes(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Función para verificar una contraseña hasheada
  public async verifyPassword(password: string, salt: string, hashedPassword: string): Promise<boolean> {
    const hashedInputPassword = await this.hashPassword(password, salt);
    return hashedInputPassword === hashedPassword;
  }
}
