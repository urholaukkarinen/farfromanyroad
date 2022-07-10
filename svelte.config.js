import sveltePreprocess from 'svelte-preprocess';

export default {
    compilerOptions: {},
    preprocess: [sveltePreprocess({
        typescript: true,
        scss: true
    })],
    experimental: {
        useVitePreprocess: true,
    }
};