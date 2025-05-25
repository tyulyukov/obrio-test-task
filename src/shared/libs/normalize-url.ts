import { loadEsm } from 'load-esm';

// NOTE: This is a workaround for the issue with the `normalize-url` package that doesn't support CJS
//  and setting the project to use esm was pain in the ass, especially with path-aliases
let normalizeUrl: typeof import('normalize-url').default;

(async () => {
  normalizeUrl = (
    await loadEsm<typeof import('normalize-url')>('normalize-url')
  ).default;
})();

export { normalizeUrl };
