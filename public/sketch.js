let prefersDarkScheme;

let data;
let font;
let canvasP = 72;
let manual = false;

let playlistLength;

let danceability = [];
let years = [];

// first color
let colorA = [];
// second color
let colorB = [];
// glow color
let colorG = [];

let spiral = [];

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
  
  /* dark mode stuff */
  prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  
  if (prefersDarkScheme.matches) {
    document.getElementById('labelDark').classList.toggle("show");
  } else {
    document.getElementById('labelLight').classList.toggle("show");
  }
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

  let energy = [];
  let instrumentalness = [];

  for (let i = 0; i < playlistLength; i++) {
    energy[i] = data.songs[i].energy;
    danceability[i] = data.songs[i].danceability;
    instrumentalness[i] = data.songs[i].instrumentalness;
    years[i] = (data.items[i].track.album.release_date).substring(0, 4);
  };

  let first = energy[0];
  let last = energy[playlistLength - 1];

  spiral[3] = 16; // fontsize
  spiral[5] = 0; // angle

  // console.log( "first: " + first + " | last: " + last );

  if (last < 0.2) {
    // console.log( "'Snail'");
    spiral[0] = 14;  // r
    spiral[1] = round(map(first, 0, 1, 100, 72, true)); // dist
    spiral[2] = round(map(first, 0.2, 1, 1, 2.7, true), 1); // spiral
    spiral[4] = 0.072; // growth

  } else if (last < 0.5) {
    // console.log( "'Duo'");
    spiral[0] = 14; // r
    spiral[1] = 82; // dist
    spiral[2] = round(map(first, 0, 1, 11.5, 13.7, true), 1); //spiral
    spiral[4] = 0.072; // growth

  } else if (last < 0.8) {
    // console.log( "'Trio'");
    spiral[0] = round(map(first, 0, 1, 8, 48, true)); // r

    if ( first < 0.5 ) {
      spiral[1] = round(map(first, 0, 0.5, 58, 80, true)); // dist
      spiral[2] = round(map(first, 0, 0.5, 8.6, 9.3, true), 1);
    } else {
      spiral[1] = round(map(first, 0.5, 1, 58, 74, true)); // dist
      spiral[2] = map(first, 0.5, 1, 8.1, 7.4);
    }
    spiral[3] = 14; // fontsize
    spiral[4] = 0.068; // growth

  } else if (last < 0.9) {
    // console.log( "'4er'" );

    if ( first < 0.25 ) {
      spiral[2] = 5.7;
    } else if ( first < 0.5 ) {
      spiral[2] = 5.8;
    } else if ( first < 0.75 ) {
      spiral[2] = 6.7;
    } else {
      spiral[2] = 6.8;
    }

    spiral[0] = round(map(first, 0, 1, 6, 32, true)); // r
    spiral[1] = round(map(first, 0, 1, 140, 72, true)); // dist
    spiral[4] = round(map(first, 0, 1, 0.05, 0.08, true), 2); // growth

  } else {
    // console.log( "'5er'" );
    spiral[0] = round(map(first, 0, 1, 6, 32, true)); // r
    spiral[1] = round(map(first, 0, 1, 140, 72, true)); // dist

    if ( last < 0.25 ) {
      spiral[2] = 9.6;
    } else if ( last < 0.5 ) {
      spiral[2] = 9.7;
    } else if ( last < 0.75 ) {
      spiral[2] = 10.3;
    } else {
      spiral[2] = 10.4; //4.5, 4.6, 3.8, 3.9
    }
    spiral[4] = round(map(last, 0, 1, 0.05, 0.08, true), 2); // growth
  }

  setSliders(spiral);

  // set colours of arrows and glow
  for (let i = 0; i < playlistLength; i++) {
    let year = years[i];

    if ( year < 1970 ) {
      // "#D3A146" – 60s
      colorA[i] = [39, 67, 83];
      colorG[i] = [39, 67, 83];
    } else if ( year >= 1970 && year < 1980 ) {
      // "#ff4500" – 70s
      colorA[i] = [16, 100, 100];
      colorG[i] = [16, 100, 100];
    } else if ( year >= 1980 && year < 1990 ) {
      //"#4A6ADD" – 80s
      colorA[i] = [227, 67, 87];
      colorG[i] = [227, 67, 87];
    } else if ( year >= 1990 && year < 2000 ) {
      // "#383731" – 90s
      colorA[i] = [51, 13, 22];
      colorG[i] = [227, 100, 60];
    } else if ( year >= 2000 && year < 2010 ) {
      // "#587756" – 00s
      colorA[i] = [116, 28, 47];
      colorG[i] = [116, 28, 47];
    } else if ( year >= 2010 && year < 2020 ) {
      // "#E8DEBF" – 10s
      colorA[i] = [45, 18, 91];
      colorG[i] = [45, 18, 91];
    } else if ( year >= 2020 ) {
      // "#FF2EF1" 255, 46, 241 – 20s
      colorA[i] = [304, 82, 100];
      colorG[i] = [304, 82, 100];
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

/* p5.js draw function */
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
 * drawSpiral(w/r, w/dist, turns, w/fontsize, fontincrease, angle);
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
    textSize(fontsize);

    // adding gradient fill
    gradientFill( fontsize * 1.25 , fontsize * 1.25, colorA[i], colorB[i]);

    // adding glow effect
    let blur = 0;
    if (danceability[i] > 0.25) {
      blur = Math.floor( map( danceability[i], 0.25, 0.8, 0, 80, true ) );
      shadowGlow(blur, colorG[i]);
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
  // hide placeholder test
  document.getElementById("placeholder").style.display="none";
  
  // for each song in the playlist do this...
  const ul = document.getElementById("tracklist");
  // position to add li elements
  let pos = 1;

  for ( let i = 0; i < playlistLength; i++ ){
    // create a ul element
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

    // add a span with the year and corresponding color
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
  
  document.getElementById("page").classList.toggle("locked");

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
  
  document.getElementById("page").classList.toggle("locked");

  const div = document.getElementById("tabControls");
  div.classList.toggle("active");

  const x = document.getElementById("controls");
  toggleVisibility( x );
}

function toggleMode() {
  let labelDark = document.getElementById('labelDark');
  let labelLight = document.getElementById('labelLight');

  // If the OS is set to dark mode...
  if (prefersDarkScheme.matches) {
    // ...then apply the .light-theme class to override those styles
    document.body.classList.toggle("light");
      
    labelDark.classList.toggle("show");
    labelLight.classList.toggle("show");
  } else {
    // ...apply the .dark-theme class to override the default light styles
    document.body.classList.toggle("dark");

    labelDark.classList.toggle("show");
    labelLight.classList.toggle("show");
  }
}

/* radio buttons functionality */
function changeRadio() {
  if ( this.value === 'true' ) {
    manual = true;
    // enable Sliders
    document.querySelectorAll('.slider').forEach( function(slider) {
      slider.disabled = false;
    });
  } else if ( this.value === 'false' ) {
    manual = false;

    // reset and disable sliders
    let c1 = 0;
    document.querySelectorAll('.slider').forEach( function( s ) {
      s.disabled = true;
      s.value = spiral[ c1 ],
      c1 ++;
    });

    // reset outputs
    updateOutputs(spiral[0], spiral[1], spiral[2], spiral[3], spiral[4], spiral[5]);
  }
  redraw();
}

function sliderChange(event) {
  redraw();
}

function setSliders(spiral) {
  let c = 0;
  document.querySelectorAll('.slider').forEach( function( s ) {
    s.value = spiral[ c ],
    c ++;
  });
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

/* shuffle function for testing */
function shufflewaffle(array) {
  let currentIndex = array.length,  randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}