// store/signupStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CompleteProfileDto } from '@/features/profile/schema';

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface PhotoSlot {
  uri: string;
  cloudinaryUrl: string;
  publicId: string;
  isUploading: boolean;
  uploadError: string | null;
}

export interface SignupFormData {
  // Step 1 – Profile
  firstName: string;
  lastName: string;
  gender: string;
  day: string;
  month: string;
  year: string;
  bio: string;

  // Step 2 – Physical Attributes
  height: string;
  ethnicity: string;

  // Step 3 – Interests
  interests: string[];

  // Step 4 – Photos (fixed 4 slots)
  photos: (PhotoSlot | null)[];
}

interface SignupStore {
  form: SignupFormData;

  /**
   * Merge any subset of top-level form fields.
   * Works for all steps — no separate setProfile / setPhysical / setInterests needed.
   */
  patch: (fields: Partial<SignupFormData>) => void;

  /** Replace an entire photo slot by index */
  setPhoto: (index: number, slot: PhotoSlot | null) => void;

  /**
   * Partially update a single photo slot.
   * Used to set cloudinaryUrl / isUploading / uploadError after upload completes.
   */
  patchPhoto: (index: number, update: Partial<PhotoSlot>) => void;

  /** Wipe everything back to initial state (e.g. after successful signup) */
  reset: () => void;

  /**
   * Returns a clean, serialisable payload ready for the backend API.
   * Call this inside your react-query useMutation.
   * Only photos that are fully uploaded (no errors, not in progress) are included.
   */
  // getPayload: () => Omit<SignupFormData, 'photos'> & { photoUrls: string[] };
    getPayload: () => CompleteProfileDto;
}

// ─── Initial state ──────────────────────────────────────────────────────────────

const initialForm: SignupFormData = {
  firstName: '',
  lastName: '',
  gender: 'male',
  day: '24',
  month: 'May',
  year: '1999',
  bio: '',
  height: '',
  ethnicity: '',
  interests: [],
  photos: [null, null, null, null],
};

// ─── Store ──────────────────────────────────────────────────────────────────────

export const useSignupStore = create<SignupStore>()(
  devtools(
    (set, get) => ({
      form: initialForm,

      patch: (fields) =>
        set(
          (state) => ({ form: { ...state.form, ...fields } }),
          false,
          'signup/patch',
        ),

      setPhoto: (index, slot) =>
        set(
          (state) => {
            const photos = [...state.form.photos];
            photos[index] = slot;
            return { form: { ...state.form, photos } };
          },
          false,
          'signup/setPhoto',
        ),

      patchPhoto: (index, update) =>
        set(
          (state) => {
            const photos = [...state.form.photos];
            const existing = photos[index];
            if (!existing) return state;
            photos[index] = { ...existing, ...update };
            return { form: { ...state.form, photos } };
          },
          false,
          'signup/patchPhoto',
        ),

      reset: () => set({ form: initialForm }, false, 'signup/reset'), 

      getPayload: (): CompleteProfileDto => {
        const { photos: photoSlots, day, month, year, height, gender, ...rest } =
          get().form;

        // Only include successfully uploaded photos — send as {url, publicId} objects
        const photos = photoSlots
          .filter(
            (s): s is PhotoSlot =>
              s !== null &&
              !!s.cloudinaryUrl &&
              !!s.publicId &&
              !s.isUploading &&
              !s.uploadError,
          )
          .map((s) => ({ url: s.cloudinaryUrl, publicId: s.publicId }));

        // Format DOB as YYYY-MM-DD string
        const dob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        return {
          ...rest,
          dob,
          height: Number(height),
          photos,
          gender: gender.toLowerCase() as 'male' | 'female' | 'other',
        };
      },
    }),
    { name: 'SignupStore' },
  ),
);

// ─── Selectors ──────────────────────────────────────────────────────────────────
// Import and use these in components to avoid creating new function refs on each render.

export const selectForm = (s: SignupStore) => s.form;
export const selectPatch = (s: SignupStore) => s.patch;
export const selectPhotos = (s: SignupStore) => s.form.photos;
export const selectInterests = (s: SignupStore) => s.form.interests;
export const selectGetPayload = (s: SignupStore) => s.getPayload;

/** True while at least one photo is mid-upload — use to disable the submit button */
export const selectIsAnyPhotoUploading = (s: SignupStore) =>
  s.form.photos.some((p) => p?.isUploading);
