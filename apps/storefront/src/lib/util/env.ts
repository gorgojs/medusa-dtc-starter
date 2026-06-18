export const getBaseURL = () => {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000"
}

export const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "ru"
