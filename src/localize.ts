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

const _lang_map: Record<string, string> = {
  "zh-cn": "zh-hans",
  "zh-hk": "zh-hant",
  "zh-tw": "zh-hant",
};

const replace_pattern = (pattern: string, params: Record<string, any>) => pattern.replace(/\$\{\s*(\w+)\s*\}/g, (_, key) => `${params[key]}`);

export const localize = <T extends unknown>(
  strings: Record<string, T>,
  params: Record<string, any>,
  userLocales: {
    languageCode: string;
    scriptCode: string | undefined;
  }[],
  selector: (x: T) => any
) => {

  if (_.isEmpty(strings)) return;

  for (const locale of userLocales) {

    if (!_.isEmpty(locale.languageCode) && !_.isEmpty(locale.scriptCode)) {

      let tag = `${locale.languageCode}-${locale.scriptCode}`.toLowerCase();
      tag = _lang_map[tag] ?? tag;

      if (!_.isNil(selector(strings[tag]))) {

        let result = selector(strings[tag]);

        if (params && _.isString(result)) {
          result = replace_pattern(result, params);
        }

        return result;
      }
    }

    if (!_.isEmpty(locale.languageCode)) {

      const languageCode = locale.languageCode.toLowerCase();

      if (!_.isNil(selector(strings[languageCode]))) {

        let result = selector(strings[languageCode]);

        if (params && _.isString(result)) {
          result = replace_pattern(result, params);
        }

        return result;
      }
    }
  }
}

export default localize;