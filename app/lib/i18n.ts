import type {I18nBase} from '@shopify/hydrogen';

export function getLocaleFromRequest(request: Request): I18nBase {
  return {language: 'EN', country: 'US'};
}
