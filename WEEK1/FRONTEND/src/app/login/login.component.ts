import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {}

  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email, // Validate email format
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6), // Minimum length for password
    ]),
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;

      // Send login request to the backend
      this.http.post('http://localhost:3000/login', loginData).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          alert('Login successful');
          this.router.navigate(['/dashboard']); // Navigate to dashboard on successful login
        },
        error: (err) => {
          console.error('Error during login:', err);
          alert('Login failed. Please check your credentials.');
        },
      });
    } else {
      alert('Please fill in all the required fields.');
    }
  }

  get email() {
    return this.loginForm.get('email') as FormControl;
  }

  get password() {
    return this.loginForm.get('password') as FormControl;
  }
}
