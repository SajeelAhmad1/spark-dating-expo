import { MATCH_CIRCLE_SIZE } from '@/constants/match';

export const calculateMatchPhotoLayout = (width: number) => {
  const PHOTO_WIDTH = width * 0.40;
  const PHOTO_HEIGHT = PHOTO_WIDTH * 1.5;
  const CONTAINER_HEIGHT = PHOTO_HEIGHT + 120;
  const CIRCLE_SIZE = MATCH_CIRCLE_SIZE;

  return {
    PHOTO_WIDTH,
    PHOTO_HEIGHT,
    CONTAINER_HEIGHT,
    CIRCLE_SIZE,
  };
};

