import { AbstractControl, ValidatorFn } from '@angular/forms';

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    const value: string = control.value || '';
    if (!value) return null;
    const valid = value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value);
    return valid ? null : { invalidPassword: true };
  };
}

export function passwordMatchValidator(passwordKey: string, confirmKey: string): ValidatorFn {
  return (group: AbstractControl) => {
    const pass    = group.get(passwordKey)?.value;
    const confirm = group.get(confirmKey)?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  };
}
