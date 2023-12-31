//
//  index.tsx
//
//  The MIT License
//  Copyright (c) 2021 - 2024 O2ter Limited. All rights reserved.
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
import decompose from './language';

const _lang_map: Record<string, string> = {
  "zh-cn": "zh-hans",
  "zh-hk": "zh-hant",
  "zh-tw": "zh-hant",
};

const replace_pattern = (pattern: string, params: Record<string, any>) => pattern.replace(/\$\{\s*(\w+)\s*\}/g, (_, key) => `${params[key]}`);

export const localize = <T extends unknown, R extends unknown>(
  strings: Record<string, T>,
  params: Record<string, any>,
  userLocales: string[],
  selector: (x: T) => R
) => {

  if (_.isEmpty(strings)) return;

  const fetch = _.isEmpty(params) ? (tag: string) => selector(strings[tag]) : (tag: string): R => {
    const result = selector(strings[tag]);
    return _.isString(result) ? replace_pattern(result, params) as R : result;
  }

  const langs = userLocales.map(x => decompose(x.toLowerCase()));

  for (const { tag, language, script, region } of langs) {

    if (!_.isNil(selector(strings[tag]))) {
      return fetch(tag);
    }

    if (
      !_.isEmpty(script) &&
      !_.isNil(selector(strings[`${language}-${script}`]))
    ) {
      return fetch(`${language}-${script}`);
    }

    if (!_.isEmpty(region)) {
      const mapped = _lang_map[`${language}-${region}`];
      if (!_.isNil(selector(strings[mapped]))) {
        return fetch(mapped);
      }
    }

    if (!_.isNil(selector(strings[language]))) {
      return fetch(language);
    }
  }
}

export default localize;