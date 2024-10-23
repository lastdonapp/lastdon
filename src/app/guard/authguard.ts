import { inject } from "@angular/core";
import { CanActivateFn, Router} from "@angular/router";


export const demonGuard : CanActivateFn = () =>{
  const userStorage = localStorage.getItem('userType');
    const redirect = inject(Router)
   
  

    if (userStorage === 'normal') {
      return true ; 
    } else if (userStorage === 'conductor') {
      return true; 

    } else if (userStorage === 'admin') {
        return true; 

    }else {
      
      return redirect.navigate(['/login']);
    }
  }
   