import { useLanguage } from '@/i18n/LanguageContext'
import { oceanStrings } from '../i18n'
import type { OceanStrings } from '../i18n'

/** The 3D Lab's strings in the language the visitor picked in the site's switch. */
export function useOceanStrings(): OceanStrings {
  const { lang } = useLanguage()
  return oceanStrings[lang]
}
