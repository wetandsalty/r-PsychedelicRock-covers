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
  // font = loadFont('./assets/fonts/redditfont.ttf', console.log("woo!"));
};

// gets Spotify data from the server
async function getData() {
  // fetch data from proxy server
  const api_url = '/api';
  const response = await fetch( api_url );
  data = await response.json();
}

// p5.js setup function
function setup() {
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

  /* set up radio buttons */
  let radios = document.querySelectorAll('input[type=radio][name="manual"]');
  Array.prototype.forEach.call(radios, function(radio) {
     radio.addEventListener('change', changeRadio);
  });
}

function handlingData() {
  playlistLength = data.items.length;
  let cummulativeEnergy = 0;

  for (let i = 0; i < playlistLength; i++) {
    energy[i] = data.songs[i].energy;
    danceability[i] = data.songs[i].danceability;
    instrumentalness[i] = data.songs[i].instrumentalness;
    years[i] = (data.items[i].track.album.release_date).substring(0, 4);

    cummulativeEnergy = Math.round(( cummulativeEnergy + energy[i] + Number.EPSILON) * 10) / 10;
  };

  const averageEnergy = cummulativeEnergy / playlistLength;
  spiral = Math.round(( 25/cummulativeEnergy + Number.EPSILON) * 10) / 10;
  console.log( "total " + cummulativeEnergy + " | average " + averageEnergy + " | spiral " + spiral );

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
  // hide button after getData is triggered
  toggleVisibility( document.getElementById("btnData") );
}

// p5.js draw function
function draw() {
  let w = width;
  background(0, 0, 10);
  translate(width/2, height/2);

  if (data) {
    // only run after data is loaded
    let r = document.getElementById("sliderR").value;
    let dist = document.getElementById("sliderDist").value;
    let turns = document.getElementById("sliderTurns").value;
    let fontsize = document.getElementById("sliderFontsize").value;
    let factor = document.getElementById("sliderFact").value;
    let angle = document.getElementById("sliderAngle").value;

    let output1 = document.getElementById("rValue");
    output1.innerHTML = r;
    let output2 = document.getElementById("distValue");
    output2.innerHTML = dist;
    let output3 = document.getElementById("turnsValue");
    output3.innerHTML = turns;
    let output4 = document.getElementById("fontValue");
    output4.innerHTML = fontsize;
    let output5 = document.getElementById("growthValue");
    output5.innerHTML = factor;
    let output6 = document.getElementById("angleValue");
    output6.innerHTML = angle;

    if (manual) {
      drawSpiral(w/r, w/dist, turns, w/fontsize, factor, angle);
    } else {
      drawSpiral(w/8, w/100, spiral, w/24, 0.06, 0);
    }
  }
}

/*
 * use like this:
 * drawSpiral(w/r, w/dist, turns, w/fontsize, fontgrowth, angle);
 */
function drawSpiral(r, dist, turns, fontsize, factor, angle) {
  rotate(angle);
  let theta = 0;
  push();
  for (let i = 0; i < playlistLength; i++) {
    // rotation for the group of chars, which affects the spacing between chars
    rotate(2 * PI / playlistLength * turns);
    push();
    translate(r * sin(theta), r * cos(theta));
    // rotation for individual letter
    rotate(PI);

    /* for some reason if I remove this the arrow is black */
    fill(colorA[i]);

    /* font settings */
    textFont(font);
    // textSize( fontsize + fontsize * energy[i] );
    textSize( fontsize * 1.75 );

    /* adding gradient fill */
    gradientFill( fontsize * 2 , fontsize * 2, colorA[i], colorB[i]);

    /* adding glow effect */
    let glow = 0;
    if (danceability[i] > 0.25) {
      glow = Math.floor( map( danceability[i], 0.25, 0.8, 0, 80, true ) );
      let glowColor = colorA[i];
      // CHANGE?
      shadowGlow( glow, glowColor );
    }
    text("⬆", 0, 0);
    // text("\uF34D", 0, 0);

    pop();

    fontsize += fontsize * factor;
    r += dist;
  }
  pop();
}


/* ----------- DRAWING functions ----------------------------*/

/* function redrawing if window is resized */
function windowResized() {
  if (windowHeight < windowWidth) {
    resizeCanvas(windowHeight/100 * canvasP, windowHeight/100 * canvasP);
  } else {
    resizeCanvas(windowWidth/100 * canvasP, windowWidth/100 * canvasP);
  }
  redraw();
};

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


/* ----------- INTERFACE functionality ----------------------*/

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

/* general visibility toggle function */
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

function toggleCntrls() {
  const btnHide = document.getElementById("hideCntrls");
  const btnShow = document.getElementById("showCntrls");
  toggleVisibility( btnHide );
  toggleVisibility( btnShow );

  const div = document.getElementById("tabCntrls");
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

    let spiralSlider = document.getElementById('sliderTurns');
    spiralSlider.value = spiral;

    /* disable sliders */
    document.querySelectorAll('.slider').forEach( function( s ) {
      s.disabled = true;
    });
  }
  redraw();
}

function sliderChange(event) {
  redraw();
}
