// ── Match Data ─────────────────────────────────────────────
export type MatchProfile = {
  id: string;
  name: string;
  age: number;
  bio: string;
  image: string;
  images: string[];
};

const makeUserImages = (seed: string) =>
  Array.from({ length: 7 }, (_, i) => `https://picsum.photos/seed/${seed}-${i}/600/900`);

const USER_IMAGES_1 = makeUserImages("1");
const USER_IMAGES_2 = makeUserImages("2");
const USER_IMAGES_3 = makeUserImages("3");
const USER_IMAGES_4 = makeUserImages("4");
const USER_IMAGES_5 = makeUserImages("5");
const USER_IMAGES_6 = makeUserImages("6");
const USER_IMAGES_7 = makeUserImages("7");

export const MATCHES: MatchProfile[] = [
  {
    id: '1',
    name: 'Emma',
    age: 25,
    bio: 'Coffee lover ☕ | Travel enthusiast ✈️',
    images: USER_IMAGES_1,
    image: USER_IMAGES_1[0],
  },
  {
    id: '2',
    name: 'Sophia',
    age: 23,
    bio: 'Bookworm 📚 | Hiking addict 🏔️',
    images: USER_IMAGES_2,
    image: USER_IMAGES_2[0],
  },
  {
    id: '3',
    name: 'Olivia',
    age: 27,
    bio: 'Yoga & good vibes 🧘 | Dog mom 🐶',
    images: USER_IMAGES_3,
    image: USER_IMAGES_3[0],
  },
  {
    id: '4',
    name: 'Isabella',
    age: 24,
    bio: 'Chef in training 🍳 | Jazz lover 🎷',
    images: USER_IMAGES_4,
    image: USER_IMAGES_4[0],
  },
  {
    id: '5',
    name: 'Mia',
    age: 26,
    bio: 'Art & design 🎨 | Cinema obsessed 🎬',
    images: USER_IMAGES_5,
    image: USER_IMAGES_5[0],
  },
  {
    id: '6',
    name: 'Ava',
    age: 22,
    bio: 'Surfer girl 🏄 | Sunset chaser 🌅',
    images: USER_IMAGES_6,
    image: USER_IMAGES_6[0],
  },
  {
    id: '7',
    name: 'Luna',
    age: 28,
    bio: 'Photographer 📷 | City explorer 🗺️',
    images: USER_IMAGES_7,
    image: USER_IMAGES_7[0],
  },
];