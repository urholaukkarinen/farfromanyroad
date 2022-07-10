import App from './App.svelte'
import initWasm from '$wasm';
import 'leaflet/dist/leaflet.css';

const init = async () => {
    await initWasm();

    const app = new App({
        target: document.getElementById('app'),
    });
};

init();