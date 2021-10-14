import fs from 'fs'
import _ from 'lodash'
import path from 'path'
import { ResourceTranslationMutations, TranslatableContent, TranslatableResource, Translation, TranslationMutation } from './types'

const debug = require('debug')('app')

type GenerateMutationsOptions = {
  targetLocale: string
  skipTranslated: boolean
}

function getTranslatableResourcesFromFile(file: string): TranslatableResource[] {
  const absolutePath = path.resolve(__dirname, '../', file)
  const edges = _.get(require(absolutePath), 'data.translatableResources.edges', [])
  const nodes = _.map(edges, (edge: any) => edge.node)
  return _.compact(nodes)
}

function translatableContentHasTranslations(content: TranslatableContent, translationsRef: Translation[] = []): boolean {
  const translation = _.find(translationsRef, translation => translation.key === content.key)

  if (!translation) return false
  if (translation.value === content.value) return false
  if (_.isEmpty(translation.value)) return false
  return true
}

function generateMutationsForResource(resource: TranslatableResource, { targetLocale, skipTranslated }: GenerateMutationsOptions) {
  const translations = resource.translations
  const mutations: ResourceTranslationMutations = {
    id: resource.resourceId,
    translations: [],
  }

  for (const translatable of resource.translatableContent) {
    // Ignore empty values (no need to translate them)
    if (_.isEmpty(translatable.value)) continue

    // Skip if translations are already created
    if (skipTranslated && translatableContentHasTranslations(translatable, translations)) continue

    const entry: TranslationMutation = {
      key: translatable.key,
      value: translatable.value,
      locale: targetLocale,
      translatableContentDigest: translatable.digest,
    }

    mutations.translations.push(entry)
  }

  const generated = mutations.translations.length
  const skipped = resource.translatableContent.length - generated

  debug(`Generating mutations for resource <${resource.resourceId}>... OK: Skipped=${skipped} Generated=${generated}`)

  return mutations
}

function generateMutations(resources: TranslatableResource[], { targetLocale, skipTranslated }: GenerateMutationsOptions): ResourceTranslationMutations[] {
  const mutations: ResourceTranslationMutations[] = []

  for (const resource of resources) {
    mutations.push(generateMutationsForResource(resource, { targetLocale, skipTranslated }))
  }

  debug(`Generating mutations for ${resources.length} translatable resources... OK`)

  return _.filter(mutations, entry => entry.translations.length > 0)
}

function writeMutationsToFile(mutations: ResourceTranslationMutations[], file = '.tmp/mutations.json'): string {
  const absolutePath = path.resolve(__dirname, '../', file)
  const directories = path.dirname(absolutePath)
  const stringToWrite = JSON.stringify(mutations, undefined, 2)

  fs.mkdirSync(directories, { recursive: true })
  fs.writeFileSync(absolutePath, stringToWrite, 'utf8')

  debug(`Writing mutations to file <${file}>... OK`)

  return stringToWrite
}

const resources = getTranslatableResourcesFromFile(process.argv[2])
const mutations = generateMutations(resources, { targetLocale: 'fr', skipTranslated: true })
const written = writeMutationsToFile(mutations, process.argv[3])

debug(written)
