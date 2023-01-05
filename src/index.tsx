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

const I18nContext = React.createContext({ preferredLocale: 'en', fallback: 'en' });
const i18n_update_event = new EventEmitter();

export const I18nProvider: React.FC<React.PropsWithChildren<{
  preferredLocale?: string;
  fallback?: string;
  onChange?: (locale: string) => void;
}>> = ({
  preferredLocale = 'en',
  fallback = 'en',
  onChange = () => {},
  children
}) => {

  const [_preferredLocale, setPreferredLocale] = React.useState(preferredLocale);

  React.useEffect(() => {
    i18n_update_event.addListener('update', setPreferredLocale);
    return () => { i18n_update_event.removeListener('update', setPreferredLocale); }
  }, [setPreferredLocale]);

  React.useEffect(() => { onChange(_preferredLocale); }, [_preferredLocale]);
  const value = React.useMemo(() => ({ preferredLocale: _preferredLocale, fallback }), [_preferredLocale, fallback]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

function _useUserLocales(i18nState?: { preferredLocale: string; fallback?: string; }) {

  const locales: string[] = [];

  if (i18nState?.preferredLocale) {
    locales.push(i18nState.preferredLocale);
  }

  if (globalThis.navigator) {

    const languages = navigator.languages;
    const language = navigator.language;

    if (languages) {
      for (const language of languages) {
        locales.push(language);
      }
    } else if (language) {
      locales.push(language);
    }
  }

  if (i18nState?.fallback) {
    locales.push(i18nState.fallback);
  }

  return locales;
}

export const useUserLocales = () => _useUserLocales(_.omit(React.useContext(I18nContext), 'fallback'));
export const setPreferredLocale = (locale: string) => i18n_update_event.emit('update', locale);

export const useLocalize = () => {
  const i18nState = React.useContext(I18nContext);
  return ({ ...strings }, params: Record<string, any> = {}) => _localize(strings, params,  _useUserLocales(i18nState), (x) => x);
}

export const LocalizationStrings = ({ ...strings }) => ({
  useLocalize() {
    const i18nState = React.useContext(I18nContext);
    return {
      string(key: _.PropertyPath, params: Record<string, any> = {}) {
        return _localize(strings, params, _useUserLocales(i18nState), (x) => _.get(x, key)) ?? key;
      }
    }
  }
});
