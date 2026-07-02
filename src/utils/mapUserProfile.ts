import type { PublicUser } from '@/features/users/schema'

export type InterestChip = { name: string; icon: string | null }

export function mapInterestLabels(interests: unknown): InterestChip[] {
  if (!Array.isArray(interests)) return []

  return interests
    .map((entry) => {
      if (typeof entry === 'string') return { name: entry.trim(), icon: null }

      if (!entry || typeof entry !== 'object') return null

      const item = entry as {
        name?: string
        icon?: string | null
        interest?: { name?: string; icon?: string | null }
      }

      const interest = item.interest ?? item
      const name = interest.name?.trim()
      if (!name) return null

      const rawIcon = interest.icon ?? null
      return { name, icon: typeof rawIcon === 'string' ? rawIcon : null }
    })
    .filter(Boolean) as InterestChip[]
}

function photoToUrl(photo: unknown): string | null {
  if (!photo) return null
  if (typeof photo === 'string') return photo
  if (typeof photo === 'object' && photo && 'url' in photo) {
    return String((photo as { url: string }).url)
  }
  return null
}

export function mapPublicUserToProfile(user: PublicUser) {
  const profile = user.profile
  const photos = (profile?.photos ?? []).map(photoToUrl).filter(Boolean) as string[]
  const dob = profile?.dob
  const age = dob
    ? Math.floor(
        (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
      )
    : 0
  const loc = user.location as { lat?: number; lng?: number } | null | undefined

  const showAge = profile?.showAge !== false

  return {
    id: user.id,
    name:
      `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim() || 'User',
    age: showAge ? age : null,
    images: photos,
    bio: profile?.bio ?? '',
    bio2: profile?.bio ?? '',
    height: profile?.height ? `${profile.height} cm` : '',
    gender: profile?.gender
      ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)
      : '',
    location:
      loc?.lat != null && loc?.lng != null
        ? { lat: loc.lat, lng: loc.lng }
        : { lat: 0, lng: 0 },
    attributes: profile?.ethnicity ? [profile.ethnicity] : [],
    interests: mapInterestLabels(user.interests) as InterestChip[],
  }
}
