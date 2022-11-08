//
//  index.tsx
//
//  The MIT License
//  Copyright (c) 2021 - 2022 O2ter Limited. All rights reserved.
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//

import _ from 'lodash';
import React from 'react';
import EventEmitter from 'events';

import _localize from './localize';

const I18nContext = React.createContext({ preferredLocale: 'en' });
const i18n_update_event = new EventEmitter();

export const I18nProvider: React.FC<React.PropsWithChildren<{
  preferredLocale?: string;
  onChange?: (locale: string) => void;
}>> = ({
  preferredLocale = 'en',
  onChange = () => {},
  children
}) => {

    const [_preferredLocale, setPreferredLocale] = React.useState(preferredLocale);

    React.useEffect(() => {
      i18n_update_event.addListener('update', setPreferredLocale);
      return () => { i18n_update_event.removeListener('update', setPreferredLocale); }
    }, [setPreferredLocale]);

    React.useEffect(() => { onChange(_preferredLocale); }, [_preferredLocale]);
    const value = React.useMemo(() => ({ preferredLocale: _preferredLocale }), [_preferredLocale]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
  };

function getLanguagePartFromCode(code: string) {
  if (!_.isString(code) || code.indexOf('-') < 0) return code;
  return code.split('-')[0];
}

function getScriptPartFromCode(code: string) {
  if (!_.isString(code) || code.indexOf('-') < 0) return;
  return code.split('-')[1];
}

function _useUserLocales(i18nState?: { preferredLocale: string; }) {

  const locales = [];

  if (i18nState?.preferredLocale) {

    locales.push({
      languageCode: getLanguagePartFromCode(i18nState.preferredLocale),
      scriptCode: getScriptPartFromCode(i18nState.preferredLocale),
    });
  }

  if (globalThis.navigator) {

    const languages = navigator.languages;
    const language = navigator.language;

    if (languages) {

      for (const language of languages) {

        locales.push({
          languageCode: getLanguagePartFromCode(language),
          scriptCode: getScriptPartFromCode(language),
        });
      }

    } else if (language) {

      locales.push({
        languageCode: getLanguagePartFromCode(language),
        scriptCode: getScriptPartFromCode(language),
      });
    }
  }

  return locales;
}

export const useUserLocales = () => _useUserLocales(React.useContext(I18nContext));
export const setPreferredLocale = (locale: string) => i18n_update_event.emit('update', locale);

const default_locales = [
  { languageCode: 'en', scriptCode: undefined },
];

export const useLocalize = (
  { ...strings },
  params: Record<string, any> = {}
) => _localize(strings, params,  _useUserLocales(React.useContext(I18nContext)).concat(default_locales), (x) => x);

export const LocalizationStrings = ({ ...strings }) => ({

  useLocalize() {

    const i18nState = React.useContext(I18nContext);

    return {

      string(key: _.PropertyPath, params: Record<string, any> = {}) {
        return _localize(strings, params, _useUserLocales(i18nState).concat(default_locales), (x) => _.get(x, key)) ?? key;
      }
    }
  }
});
