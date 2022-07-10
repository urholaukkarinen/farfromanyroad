<style src="./App.scss"/>

<script lang="ts">
    import {onMount} from "svelte";

    import {LeafletMap, Marker, TileLayer} from 'svelte-leafletjs';
    import {LatLng, MapOptions, Point} from 'leaflet';
    import {fetchRoadNodes, getFarthestPointFromSites} from "$wasm";
    import {locateControl} from './lib/LocateControl';

    const mapOptions: MapOptions = {
        center: [60.16952, 24.93545],
        zoom: 15,
        zoomControl: true,
    };

    const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const tileLayerOptions = {
        minZoom: 10,
        maxZoom: 20,
        maxNativeZoom: 19,
        attribution: "© OpenStreetMap contributors",
    };

    let leafletMap: LeafletMap;

    let nodesToAvoid: [LatLng] = [];
    let farthestNode: LatLng;

    let fetching = false;

    async function findFarthest() {
        fetching = true;
        farthestNode = undefined;

        let mapBounds = leafletMap.getMap().getBounds();

        let resp;
        try {
            resp = await fetchRoadNodes(mapBounds.getSouth(), mapBounds.getWest(), mapBounds.getNorth(), mapBounds.getEast());
            resp = JSON.parse(resp);
        } catch (e) {
            console.log(e);
            fetching = false;
            return;
        }

        nodesToAvoid = resp["elements"]
            .map(element => new LatLng(element["lat"], element["lon"]))
            .filter(latLng => mapBounds.contains(latLng));

        nodesToAvoid.push(
            mapBounds.getSouthEast(),
            mapBounds.getNorthWest(),
            mapBounds.getSouthWest(),
            mapBounds.getNorthEast(),
        );

        let coords = nodesToAvoid
            .map(latLng => leafletMap.getMap().latLngToLayerPoint(latLng))
            .flatMap(point => [point.x, point.y])

        let farthestLatLng = getFarthestPointFromSites(new Float32Array(coords))
        farthestNode = leafletMap.getMap().layerPointToLatLng(new Point(farthestLatLng[0], farthestLatLng[1]));

        fetching = false;
    }

    onMount(async () => {
        locateControl({
            locateAction: findFarthest
        }).addTo(leafletMap.getMap());
    })
</script>

<main>
    <LeafletMap bind:this={leafletMap} options={mapOptions}>
        <TileLayer url={tileUrl} options={tileLayerOptions}/>

        {#if farthestNode}
            <Marker latLng={farthestNode}/>
        {/if}
    </LeafletMap>
</main>