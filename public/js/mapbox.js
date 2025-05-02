// /* eslint-disable */






 export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiaXR6bmlzaGFudHRndXB0YSIsImEiOiJjbTBsMW8xNWYwMTF3MnBzODI2eGhtZHk2In0.Sh3Prf8T1uHVAGV-ouCZyw';
   var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/itznishanttgupta/cm0ldgx6c00a101o39xau2vzb',
  scrollZoom : false
//   center:[-118.113491,34.111745],
//   zoom : 10,
//   intractive : false;
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
     // create a Marker
    const el = document.createElement("div");
    el.className = "marker";
    
    // Add a Marker
    new mapboxgl.Marker({
        element:el,
        anchor : "bottom"
    }).setLngLat(loc.coordinates).addTo(map);

    new mapboxgl.Popup({offset : 30}).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day} : ${loc.description}</p>`).addTo(map);

    // extend the map to be Fitt the Marker locations (Zoom out and Adjusting the map accoding to Cordinates);
    bounds.extend(loc.coordinates);
})

map.fitBounds(bounds,{
    padding:{
        top:200,
        right:150,
        bottom:200,
        left:100
    }
});

}


console.log("Hello map")