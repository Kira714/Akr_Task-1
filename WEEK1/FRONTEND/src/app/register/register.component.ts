import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  registerForm: FormGroup = new FormGroup({
    firstname: new FormControl('', [Validators.required, Validators.minLength(2)]),
    lastname: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    mobile: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]{10}$'), // Ensures exactly 10 digits
    ]),
    gender: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8), // Minimum 8 characters
      Validators.pattern(
        '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}'
      ), // At least one uppercase, one lowercase, one number, and one special character
    ]),
  });

  onSubmit() {
    if (this.registerForm.valid) {
      const userData = this.registerForm.value;
      this.http.post('http://localhost:3000/register', userData).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          alert('Registration successful');
        },
        error: (err) => {
          console.error('Error during registration:', err);
          alert('Registration failed');
        },
      });
    } else {
      console.log('Form is not valid');
    }
  }

  // Getters for form controls
  get firstname(): FormControl {
    return this.registerForm.get('firstname') as FormControl;
  }
  get lastname(): FormControl {
    return this.registerForm.get('lastname') as FormControl;
  }
  get email(): FormControl {
    return this.registerForm.get('email') as FormControl;
  }
  get mobile(): FormControl {
    return this.registerForm.get('mobile') as FormControl;
  }
  get gender(): FormControl {
    return this.registerForm.get('gender') as FormControl;
  }
  get password(): FormControl {
    return this.registerForm.get('password') as FormControl;
  }
}
