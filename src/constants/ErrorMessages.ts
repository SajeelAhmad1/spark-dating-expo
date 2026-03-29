/**
 * Centralized copy for Zod / form validation (frontend only).
 */
export const ErrorMessages = Object.freeze({
  common: Object.freeze({
    required: 'This field is required.',
    invalid: 'Invalid value.',
  }),

  auth: Object.freeze({
    phoneRequired: 'Enter your phone number.',
    phoneInvalid: 'Invalid phone number',
    emailRequired: 'Enter your email address.',
    emailInvalid: 'Invalid email address.',
    passwordRequired: 'Enter your password.',
    passwordMin: 'Password must be at least 8 characters.',
    passwordMax: 'Password must be at most 128 characters.',
    otpDigit: 'Each digit must be a number.',
    otpIncomplete: 'Enter the full 4-digit code.',
  }),

  profile: Object.freeze({
    firstNameRequired: 'First name is required.',
    firstNameMax: 'First name must be at most 50 characters.',
    firstNameInvalid: 'Invalid first name',
    lastNameRequired: 'Last name is required.',
    lastNameMax: 'Last name must be at most 50 characters.',
    lastNameInvalid: 'Invalid last name',
    genderInvalid: 'Select a valid gender.',
    dayInvalid: 'Select a valid day.',
    monthInvalid: 'Select a valid month.',
    yearInvalid: 'Select a valid year.',
    bioMax: 'Bio must be at most 500 characters.',
    heightRequired: 'Select your height.',
    heightInvalid: 'Select a valid height.',
    bodyTypeRequired: 'Select your body type.',
    bodyTypeInvalid: 'Select a valid body type.',
    ethnicityRequired: 'Select your ethnicity.',
    ethnicityInvalid: 'Select a valid ethnicity.',
    birthdayRequired: 'Select your birthday.',
    birthdayInvalid: 'Enter a valid date.',
    birthdayFuture: 'Birthday cannot be in the future.',
    birthdayAge: 'You must be at least 18 years old.',
  }),

  onboarding: Object.freeze({
    phoneNationalRequired: 'Enter your mobile number.',
    phoneNationalInvalid: 'Enter 8–15 digits for your number.',
  }),

  interests: Object.freeze({
    min: 'Choose at least 3 interests.',
    max: 'You can select at most 5 interests.',
  }),

  upload: Object.freeze({
    minPhotos: 'Add at least one photo to continue.',
  }),

  messaging: Object.freeze({
    messageEmpty: 'Message cannot be empty.',
    messageMax: 'Message is too long (max 2000 characters).',
    captionMax: 'Caption is too long (max 500 characters).',
  }),

  search: Object.freeze({
    maxLength: 'Search text is too long.',
  }),
} as const);

export type ErrorMessagesType = typeof ErrorMessages;
