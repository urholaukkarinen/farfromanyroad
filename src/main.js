import App from './App.svelte'
import initWasm from '$wasm';
import 'leaflet/dist/leaflet.css';
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css'

const init = async () => {
    await initWasm();

    const app = new App({
        target: document.getElementById('app'),
    });
};

init();