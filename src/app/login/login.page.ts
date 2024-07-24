import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async login() {
    const { user, error } = await this.supabaseService.signIn(this.email, this.password);
    if (error) {
      alert(error.message);
    } else {
      this.router.navigateByUrl('/menu');
    }
  }
  
}
