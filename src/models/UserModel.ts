export interface UserModel {
  email: string;
  password: string;
  user_type: string; // Asegúrate de que sea un `string`, no `string | undefined`
}
