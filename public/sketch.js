let data;
let font;
let canvasP = 72;

let playlistLength;

let manual = false;

let energy = [];
let danceability = [];
let instrumentalness = [];
let years = [];

let spiral;

let colorA = [];
let colorB = [];

function preload() {
  font = loadFont('./assets/fonts/inter.otf', console.log("woo!"));
};

// p5.js setup function
function setup() {
  // setup canvas
  let cnv;
  pixelDensity(2.0);
  if (windowHeight < windowWidth) {
    cnv = createCanvas(windowHeight/100 * canvasP, windowHeight/100 * canvasP);
  } else {
    cnv = createCanvas(windowWidth/100 * canvasP, windowWidth/100 * canvasP);
  }
  cnv.parent('canvas');
  frameRate(30);
  colorMode(HSB);
  textAlign(CENTER);
  noStroke();
  noLoop();

  // setup radio buttons
  let radios = document.querySelectorAll('input[type=radio][name="manual"]');
  Array.prototype.forEach.call(radios, function(radio) {
     radio.addEventListener('change', changeRadio);
  });
  // reset to "auto"
  radios[0].checked = true;
  // make sure sliders are disabled
  document.querySelectorAll('.slider').forEach( function( s ) {
    s.disabled = true;
  });
}

// gets Spotify data
async function getData() {
  // fetch data from proxy server
  const api_url = '/api';
  const response = await fetch( api_url );
  data = await response.json();
}

function handlingData() {
  playlistLength = data.items.length;

  // let cummulativeEnergy = 0;
  for (let i = 0; i < playlistLength; i++) {
    energy[i] = data.songs[i].energy;
    danceability[i] = data.songs[i].danceability;
    instrumentalness[i] = data.songs[i].instrumentalness;
    years[i] = (data.items[i].track.album.release_date).substring(0, 4);
    // cummulativeEnergy = Math.round(( cummulativeEnergy + energy[i] + Number.EPSILON) * 10) / 10;
  };
  // const averageEnergy = cummulativeEnergy / playlistLength;

  energy.sort();
  const energyRange = energy[playlistLength - 1] - energy[0];
  // console.log( "lowest " + energy[0] + " | highest " + energy[playlistLength - 1] + " | range " + energyRange);

  let val = map(energyRange, 0, 1, 1, 25);
  spiral = Math.round(( val + Number.EPSILON) * 10) / 10;

  setSliders(8, 100, spiral, 17, 0.06, 0);

  // set colours of arrows:
  for (let i = 0; i < playlistLength; i++) {
    let year = years[i];

    if ( year < 1970 ) {
      // console.log( year + " | 60s" );
      colorA[i] = [39, 67, 83]; // "#D3A146"
    } else if ( year >= 1970 && year < 1980 ) {
      // console.log( year + " | 70s" );
      colorA[i] = [16, 100, 100]; // "#ff4500"
    } else if ( year >= 1980 && year < 1990 ) {
      // console.log( year + " | 80s" );
      colorA[i] = [227, 67, 87]; //"#4A6ADD"
    } else if ( year >= 1990 && year < 2000 ) {
      // console.log( year + " | 90s" );
      colorA[i] = [51, 13, 22]; // "#383731"
    } else if ( year >= 2000 && year < 2010 ) {
      // console.log( year + " | 00s" );
      colorA[i] = [116, 28, 47];// "#587756"
    } else if ( year >= 2010 && year < 2020 ) {
      // console.log( year + " | 10s" );
      colorA[i] = [45, 18, 91]; // "#E8DEBF"
    } else if ( year >= 2020 ) {
      // console.log( year + " | 20s" );
      colorA[i] = [304, 82, 100]; // "#FF2EF1" 255, 46, 241
    } else {
      // e.g. if year is "undefined":
      console.log( "Error! | year is '" + years[i] + "'" );
    }

    // set gradient colour of arrows:
    let cA = colorA[i];
    // define second gradient colour
    let cB = [227, 100, 87];
    // if song is very likely instrumental, then not use blue tint:
    if (instrumentalness[i] >= 0.6) {
      // a less saturated colour means most instrumental
      let x = Math.floor(instrumentalness[i] * 100);
      let saturation = map(x, 60, 100, 0, 100, true)
      cB = [cA[0], saturation, 100];
    }
    colorB[i] = cB;
  };
}

function btnClicked(e) {
  // get data from server
  getData()
    .then( function (response) {
      console.log( "Got playlist data.");
      // do something with the data
      handlingData();
      // call function to create song list
      addToList();
    })
    .then( function() {
      // draw something in canvas
      redraw();
    })
    .catch((error) => {
      console.log('An error has occurred: ' + error.message);
    });

  //enable radio buttons
  document.getElementById("manual-on").disabled = false;
  document.getElementById("manual-off").disabled = false;
  // hide button after getData is triggered
  toggleVisibility( document.getElementById("btnData") );
}

// p5.js draw function
function draw() {
  // only run after data is loaded:
  if (data) {
    let w = width;
    background(0, 0, 10);

    let r = document.getElementById("sliderR").value;
    let dist = document.getElementById("sliderDist").value;
    let turns = document.getElementById("sliderTurns").value;
    let fontsize = document.getElementById("sliderFontsize").value;
    let factor = document.getElementById("sliderFact").value;
    let angle = document.getElementById("sliderAngle").value;

    drawSpiral(w/r, w/dist, turns, w/fontsize, factor, angle);
    updateOutputs(r, dist, turns, fontsize, factor, angle);
  }
}

/*
 * use like this:
 * drawSpiral(w/r, w/dist, turns, w/fontsize, fontgrowth, angle);
 */
function drawSpiral(r, dist, turns, fontsize, factor, angle) {
  translate(width/2, height/2);
  rotate(angle);
  let theta = 0;
  push();
  for (let i = 0; i < playlistLength; i++) {
    // rotation for the group of chars, which affects the spacing between chars
    rotate(2 * PI / playlistLength * turns);
    push();
    translate(r * sin(theta), r * cos(theta));
    // rotation for individual arrow
    rotate(PI);

    // base color
    fill(colorA[i]);

    // font stuff
    textFont(font);
    textSize(fontsize); /* REMOVED * 1.75 */

    // adding gradient fill
    gradientFill( fontsize * 2 , fontsize * 2, colorA[i], colorB[i]);

    // adding glow effect
    let blur = 0;
    if (danceability[i] > 0.25) {
      blur = Math.floor( map( danceability[i], 0.25, 0.8, 0, 80, true ) );
      let glowColor = colorA[i];
      shadowGlow(blur, glowColor);
    }

    // draw arrow
    text("⬆", 0, 0);

    pop();

    // change fontsize and radius across spiral
    fontsize += fontsize * factor;
    r += dist;
  }
  pop();
}


/* ----------- DRAWING functions ----------------------------*/

/* draw a gradient fill */
function gradientFill(w, h, cA, cB, n) {
  let gradient = drawingContext.createLinearGradient(0, -h/2, 0, h/2);
  gradient.addColorStop(0, color(cA[0], cA[1], cA[2]));
  gradient.addColorStop(1, color(cB[0], cB[1], cB[2]));
  drawingContext.fillStyle = gradient;
}

/* add a shadow/glow effect */
function shadowGlow(b, c) {
  drawingContext.shadowBlur = b;
  drawingContext.shadowColor = color(c[0], c[1], c[2]);
}

/* function redrawing if window is resized */
function windowResized() {
  if (windowHeight < windowWidth) {
    resizeCanvas(windowHeight/100 * canvasP, windowHeight/100 * canvasP);
  } else {
    resizeCanvas(windowWidth/100 * canvasP, windowWidth/100 * canvasP);
  }
  redraw();
};


/* ----------- INTERFACE functions --- ----------------------*/

/* function that adds playlist items to a ul */
function addToList() {
  // for each song in the playlist do this...
  const ul = document.getElementById("tracklist");
  // position to add li elements
  let pos = 1;

  for ( let i = 0; i < playlistLength; i++ ){
    // create a ul tracklist element
    const li = document.createElement("li");
    li.classList.add("tracklist__li");

    // add a number
    const spanNum = document.createElement("span");
    spanNum.appendChild( document.createTextNode( i + 1 ) );
    spanNum.classList.add("number");
    li.appendChild( spanNum );

    // add data to li and ul elements
    const track = data.items[i].track.name;
    const playlistentry = track + " — " + data.items[i].track.artists[0].name;

    const spanEntry = document.createElement("span");
    spanEntry.classList.add("track");
    spanEntry.appendChild( document.createTextNode( playlistentry ) );

    li.appendChild( spanEntry );
    // ul.appendChild( li );

    // add color
    const divColor = document.createElement("div");
    let year = years[i];
    divColor.classList.add("color", "year" + year.slice(0, -1) + "0s");
    divColor.appendChild( document.createTextNode( year ) );
    li.appendChild( divColor );

    ul.insertBefore( li, ul.children[pos]);

    // add to position counter
    pos ++;
  }
}

/* visibility toggle function */
function toggleVisibility(element) {
  if (element.style.display === "none") {
    element.style.display = "block";
  } else {
    element.style.display = "none";
  }
}

/* functions to show/hide tracklist, controls etc. */
function toggleTracklist() {
  const btnShow = document.getElementById("showTracklist");
  const btnHide = document.getElementById("hideTracklist");
  toggleVisibility( btnHide );
  toggleVisibility( btnShow );

  const div = document.getElementById("tabTracklist");
  div.classList.toggle("active");

  const x = document.getElementById("tracklist");
  toggleVisibility( x );
}

function toggleControls() {
  const btnHide = document.getElementById("hideControls");
  const btnShow = document.getElementById("showControls");
  toggleVisibility( btnHide );
  toggleVisibility( btnShow );

  const div = document.getElementById("tabControls");
  div.classList.toggle("active");

  const x = document.getElementById("controls");
  toggleVisibility( x );
}

/* radio buttons functionality */
function changeRadio() {
  if ( this.value === 'true' ) {
    manual = true;
    /* enable Sliders */
    document.querySelectorAll('.slider').forEach( function(slider) {
      slider.disabled = false;
    });
    } else if ( this.value === 'false' ) {
    manual = false;

    // reset sliders
    setSliders(8, 100, spiral, 17, 0.06, 0);
    updateOutputs(8, 100, spiral, 17, 0.06, 0);

    // disable sliders
    document.querySelectorAll('.slider').forEach( function( s ) {
      s.disabled = true;
    });
  }
  redraw();
}

function sliderChange(event) {
  redraw();
}

function setSliders(r, dist, turns, fontsize, factor, angle) {

  const rSlider = document.getElementById("sliderR");
  rSlider.value = r;
  const distSlider = document.getElementById("sliderDist");
  distSlider.value = dist;
  const spiralSlider = document.getElementById("sliderTurns");
  spiralSlider.value = turns;
  const fontsizeSlider = document.getElementById("sliderFontsize");
  fontsizeSlider.value = fontsize;
  const factorSlider = document.getElementById("sliderFact");
  factorSlider.value = factor;
  const angleSlider = document.getElementById("sliderAngle");
  angleSlider.value = angle;
}

function updateOutputs(r, dist, turns, fontsize, factor, angle) {

  const rOutput = document.getElementById("rValue");
  rOutput.innerHTML = r;
  const distOutput = document.getElementById("distValue");
  distOutput.innerHTML = dist;
  const spiralOutput = document.getElementById("turnsValue");
  spiralOutput.innerHTML = turns;
  const fontsizeOutput = document.getElementById("fontValue");
  fontsizeOutput.innerHTML = fontsize;
  const factorOutput = document.getElementById("growthValue");
  factorOutput.innerHTML = factor;
  const angleOutput = document.getElementById("angleValue");
  angleOutput.innerHTML = angle;
}
