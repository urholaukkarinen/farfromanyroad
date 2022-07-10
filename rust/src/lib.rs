use std::cmp::Ordering;
use std::collections::HashMap;

use voronator::delaunator::Point;
use wasm_bindgen::prelude::*;

const OVERPASS_URL: &str = "https://overpass-api.de/api/interpreter";

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen(js_name = fetchRoadNodes)]
pub async fn fetch_road_nodes(
    min_lat: f64,
    min_lng: f64,
    max_lat: f64,
    max_lng: f64,
) -> Result<JsValue, String> {
    let mut params = HashMap::new();
    let query = format!(
        r#"
[out:json][timeout:3600];
(
  way["highway"]
  ["highway"!="track"]
  ["highway"!="path"]
  ({},{},{},{});
);
>;
out skel qt;
"#,
        min_lat, min_lng, max_lat, max_lng
    );

    params.insert("data", query);

    let client = reqwest::Client::new();
    let res = client.get(OVERPASS_URL).query(&params).send().await;

    match res {
        Ok(res) => Ok(JsValue::from_str(res.text().await.unwrap().as_str())),
        Err(e) => {
            let msg = format!("Failed to get points: {:?}", e);
            log(&msg);
            Err(msg)
        }
    }
}

#[wasm_bindgen(js_name = getFarthestPointFromSites)]
pub fn farthest_point_from_sites(sites: &[f32]) -> Vec<f64> {
    if sites.len() < 6 {
        return vec![];
    }

    let sites = sites
        .chunks(2)
        .map(|v| (v[0] as f64, v[1] as f64))
        .collect::<Vec<_>>();

    let mut min_x = f64::MAX;
    let mut min_y = f64::MAX;
    let mut max_x = f64::MIN;
    let mut max_y = f64::MIN;

    for site in &sites {
        min_x = site.0.min(min_x);
        max_x = site.0.max(max_x);
        min_y = site.1.min(min_y);
        max_y = site.1.max(max_y);
    }

    let voronoi =
        voronator::VoronoiDiagram::<Point>::from_tuple(&(min_x, min_y), &(max_x, max_y), &sites)
            .expect("Failed to build voronoi diagram");

    voronoi
        .circumcircles
        .iter()
        .filter(|circle| {
            circle.origin.x >= min_x
                && circle.origin.x < max_x
                && circle.origin.y >= min_y
                && circle.origin.y < max_y
        })
        .max_by(|a, b| {
            let a_shortest_distance = (a.origin.x - min_x)
                .min(max_x - a.origin.x)
                .min(a.origin.y - min_y)
                .min(max_y - a.origin.y)
                .min(a.radius);

            let b_shortest_distance = (b.origin.x - min_x)
                .min(max_x - b.origin.x)
                .min(b.origin.y - min_y)
                .min(max_y - b.origin.y)
                .min(b.radius);

            a_shortest_distance
                .partial_cmp(&b_shortest_distance)
                .unwrap_or(Ordering::Equal)
        })
        .map(|circle| [circle.origin.x, circle.origin.y])
        .unwrap_or_default()
        .to_vec()
}
