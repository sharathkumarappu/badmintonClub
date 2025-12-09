/**
 * Form Validation Module
 * Provides client-side validation for registration and other forms
 */

class FormValidator {
  constructor(formId) {
    this.form = document.getElementById(formId);
    if (!this.form) {
      console.error(`Form with ID "${formId}" not found`);
      return;
    }
    this.setupValidation();
  }

  /**
   * Setup all validation event listeners
   */
  setupValidation() {
    // Display any server-side errors that may exist
    this.displayServerErrors();

    // Get all form fields
    const nameField = this.getField('nameField');
    const ageField = this.getField('ageField');
    const genderField = this.getField('genderField');
    const levelField = this.getField('levelField');
    const typeField = this.getField('typeField');
    const registrationDateField = this.getField('registrationDateField');
    const dowTuesday = this.getField('dowTuesday');
    const dowFriday = this.getField('dowFriday');

    // Add validation event listeners
    if (nameField) {
      nameField.addEventListener('blur', () => {
        const isValid = nameField.value.trim() !== '';
        this.validateField('name', isValid);
      });
      nameField.addEventListener('input', () => {
        if (nameField.value.trim() !== '') {
          this.hideError('name');
        }
      });
    }

    if (ageField) {
      ageField.addEventListener('blur', () => {
        const isValid = ageField.value !== '' && ageField.value > 0;
        this.validateField('age', isValid);
      });
      ageField.addEventListener('input', () => {
        if (ageField.value !== '' && ageField.value > 0) {
          this.hideError('age');
        }
      });
    }

    if (genderField) {
      genderField.addEventListener('change', () => {
        const isValid = genderField.value !== '';
        this.validateField('gender', isValid);
      });
    }

    if (levelField) {
      levelField.addEventListener('change', () => {
        const isValid = levelField.value !== '';
        this.validateField('level', isValid);
      });
    }

    if (typeField) {
      typeField.addEventListener('change', () => {
        const isValid = typeField.value !== '';
        this.validateField('type', isValid);
      });
    }

    if (registrationDateField) {
      registrationDateField.addEventListener('change', () => {
        const isValid = registrationDateField.value !== '';
        this.validateField('registrationDate', isValid);
      });
    }

    if (dowTuesday && dowFriday) {
      const checkDays = () => {
        const isValid = dowTuesday.checked || dowFriday.checked;
        this.validateField('dow', isValid);
      };
      dowTuesday.addEventListener('change', checkDays);
      dowFriday.addEventListener('change', checkDays);
      // Also validate on blur/focus loss
      dowTuesday.addEventListener('blur', checkDays);
      dowFriday.addEventListener('blur', checkDays);
    }

    // Form submission
    this.form.addEventListener('submit', (e) => this.validateForm(e));
  }

  /**
   * Display any server-side validation errors that may exist on page load
   */
  displayServerErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(errorEl => {
      // If the error message has content, show it (server-side error was returned)
      if (errorEl.textContent.trim() !== '') {
        errorEl.classList.add('show');
      }
    });
  }

  /**
   * Get a form field by ID
   */
  getField(fieldId) {
    return document.getElementById(fieldId);
  }

  /**
   * Validate a single field
   */
  validateField(fieldName, isValid) {
    if (isValid) {
      this.hideError(fieldName);
    } else {
      this.showError(fieldName);
    }
  }

  /**
   * Show error message for a field
   */
  showError(fieldName) {
    const errorId = this.getErrorId(fieldName);
    const errorEl = document.getElementById(errorId);
    const fieldEl = this.getFieldByName(fieldName);
    
    if (errorEl) {
      // Set default error message if empty
      if (!errorEl.textContent.trim()) {
        errorEl.textContent = this.getDefaultErrorMessage(fieldName);
      }
      errorEl.classList.add('show');
    }
    
    // Add error class to the input field for visual feedback
    if (fieldEl) {
      fieldEl.classList.add('has-error');
    }
  }

  /**
   * Hide error message for a field
   */
  hideError(fieldName) {
    const errorId = this.getErrorId(fieldName);
    const errorEl = document.getElementById(errorId);
    const fieldEl = this.getFieldByName(fieldName);
    
    if (errorEl) {
      errorEl.classList.remove('show');
    }
    
    // Remove error class from the input field
    if (fieldEl) {
      fieldEl.classList.remove('has-error');
    }
  }

  /**
   * Get field element by field name
   */
  getFieldByName(fieldName) {
    const fieldMap = {
      name: 'nameField',
      age: 'ageField',
      gender: 'genderField',
      level: 'levelField',
      type: 'typeField',
      registrationDate: 'registrationDateField',
      dow: 'dowTuesday' // Use first checkbox as reference
    };
    const fieldId = fieldMap[fieldName];
    return fieldId ? document.getElementById(fieldId) : null;
  }

  /**
   * Get error element ID based on field name
   */
  getErrorId(fieldName) {
    return `${fieldName}Error`;
  }

  /**
   * Get default error message for a field
   */
  getDefaultErrorMessage(fieldName) {
    const messages = {
      name: 'Name is required',
      age: 'Age is required and must be a valid positive number',
      gender: 'Gender must be selected',
      level: 'Level must be selected',
      type: 'Type must be selected',
      registrationDate: 'Registration date is required',
      dow: 'At least one day of the week must be selected'
    };
    return messages[fieldName] || 'This field is required';
  }

  /**
   * Validate entire form on submission
   */
  validateForm(e) {
    const nameField = this.getField('nameField');
    const ageField = this.getField('ageField');
    const genderField = this.getField('genderField');
    const levelField = this.getField('levelField');
    const typeField = this.getField('typeField');
    const registrationDateField = this.getField('registrationDateField');
    const dowTuesday = this.getField('dowTuesday');
    const dowFriday = this.getField('dowFriday');

    let hasErrors = false;

    // Validate each field
    if (!nameField || nameField.value.trim() === '') {
      this.showError('name');
      hasErrors = true;
    } else {
      this.hideError('name');
    }

    if (!ageField || ageField.value === '' || ageField.value <= 0) {
      this.showError('age');
      hasErrors = true;
    } else {
      this.hideError('age');
    }

    if (!genderField || genderField.value === '') {
      this.showError('gender');
      hasErrors = true;
    } else {
      this.hideError('gender');
    }

    if (!levelField || levelField.value === '') {
      this.showError('level');
      hasErrors = true;
    } else {
      this.hideError('level');
    }

    if (!typeField || typeField.value === '') {
      this.showError('type');
      hasErrors = true;
    } else {
      this.hideError('type');
    }

    if (!dowTuesday || (!dowTuesday.checked && !dowFriday.checked)) {
      this.showError('dow');
      hasErrors = true;
    } else {
      this.hideError('dow');
    }

    if (!registrationDateField || registrationDateField.value === '') {
      this.showError('registrationDate');
      hasErrors = true;
    } else {
      this.hideError('registrationDate');
    }

    if (hasErrors) {
      e.preventDefault();
      console.warn('Form submission blocked: Validation errors present');
    }
  }
}

// Initialize validation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new FormValidator('registrationForm');
});
