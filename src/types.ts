export type TranslatableContent = {
  key: string
  value: string
  digest: string
  locale: string
}

export type Translation = {
  key: string
  value: string
  locale: string
}

export type TranslatableResource = {
  resourceId: string
  translatableContent: TranslatableContent[]
  translations: Translation[]
}

export type TranslationMutation = {
  key: string
  value: string
  locale: string
  translatableContentDigest: string
}

export type ResourceTranslationMutations = {
  id: string
  translations: TranslationMutation[]
}
