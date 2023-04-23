import "./styles.css";
import * as Tone from "tone";

const { useState, useEffect } = React;

//Fallback Values for Tone.JS to use.
let redChannel = 0;
let blueChannel = 255;
let greenChannel = 0;
//https://codepen.io/nakome/pen/ExjEqoV - React Colour Picker used as Eyedropper alternative. Created by CodePen user: Moncho Varela

// Home
const App = () => {
  // Fallback image
  const sampleImg = document.querySelector("#demo").src;
  const [colors, setColors] = useState([]);

  // This will grab the position of the cursor and start picking the colour.
  const getColorParams = (event, element, hasClick) => {
    let cords = getCords(event);
    let canvas = document.querySelector("#cs");
    let thumb = document.querySelector("img");

    useCanvas(canvas, thumb, () => {
      //This will grab the image data wether its the demo or user loaded one.
      let params = canvas.getContext("2d");
      params = params.getImageData(cords.x, cords.y, 1, 1);
      params = params.data;
      //Starts to grab the data for the colour based on cursor position, and converts it to hex.
      let bg = rgbToHex(params[0], params[1], params[2]);
      //When it has clicked/tapped, it will print out the selected colours RGB values to each channel for Tone.js to Use
      if (hasClick) setColors((colors) => [...colors, bg]);
      if (hasClick) {
        redChannel = params[0];
        blueChannel = params[1];
        greenChannel = params[2];
      }
      // add background in body
      if (element) element.style.background = bg;
    });
  };

  useEffect(() => {
    const inputFile = document.querySelector("#image-input");
    const displayFile = document.querySelector("img");
    const preview = document.querySelector(".preview");
    // getnerate image on select file
    generateImage(inputFile, displayFile);
    // click function
    displayFile.addEventListener(
      "click",
      (event) => {
        getColorParams(event, false, true);
      },
      false
    );

    // preview function mousemove
    displayFile.addEventListener(
      "mousemove",
      (event) => {
        getColorParams(event, preview, false);
      },
      false
    );
  }, []);

  let num = 0;
  return /*#__PURE__*/ React.createElement(
    "div",
    { className: "main" } /*#__PURE__*/,
    React.createElement(
      "div",
      { className: "container" },
      colors
        ? colors.map((item) => {
            let style = {
              backgroundColor: item
            };

            return /*#__PURE__*/ React.createElement(
              "div",
              {
                key: ++num,
                style: style,
                className: "color"
              } /*#__PURE__*/,
              React.createElement("span", null, item)
            );
          })
        : ""
    ) /*#__PURE__*/,

    React.createElement(
      "div",
      { className: "container" } /*#__PURE__*/,
      React.createElement("div", { className: "preview" }) /*#__PURE__*/,
      React.createElement("img", {
        src: sampleImg,
        id: "image-display",
        alt: ""
      }) /*#__PURE__*/,
      React.createElement("input", {
        type: "file",
        id: "image-input"
      }) /*#__PURE__*/,
      React.createElement(
        "label",
        { for: "image-input", id: "fake" },
        "Select Image"
      ) /*#__PURE__*/,
      /*We are basically also creating an element with React as well, just so its can be contained with the rest of the stuff */
      React.createElement("label", { id: "synth-play" }, "Play Synth")
    ) /*#__PURE__*/,

    React.createElement("canvas", { id: "cs" })
  );
};

ReactDOM.render(/*#__PURE__*/ React.createElement(App, null), window.root);

/** Functions
----------------------------*/
// get cordinates of mouse
function getCords(cords) {
  let x = 0,
    y = 0;
  // chrome
  if (cords.offsetX) {
    x = cords.offsetX;
    y = cords.offsetY;
  }
  // firefox
  else if (cords.layerX) {
    x = cords.layerX;
    y = cords.layerY;
  }
  return { x, y };
}

// canvas function
function useCanvas(el, image, callback) {
  el.width = image.width; // img width
  el.height = image.height; // img height
  // draw image in canvas tag
  el.getContext("2d").drawImage(image, 0, 0, image.width, image.height);
  return callback();
}
// This is only used to display the outputed colour in hexadecimal code
function rgbToHex(r, g, b) {
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);
  r.length == 1 ? "0" + r : r;
  g.length == 1 ? "0" + g : g;
  b.length == 1 ? "0" + b : b;
  return "#" + r + g + b;
}
// generate image on file select
function generateImage(inputFile, displayFile) {
  // demo img
  let imgInput = inputFile,
    db = window.localStorage;

  // check if exists image-base64
  if (!db.getItem("image-base64")) {
    let t = setTimeout(() => {
      db.setItem("image-base64", displayFile.getAttribute("src"));
      clearTimeout(t);
    }, 100);
  }

  // Restore image src from local storage
  const updateUi = () => {
    var t = setTimeout(() => {
      displayFile.src = db.getItem("image-base64");
      clearTimeout(t);
    }, 200);
  };

  // on select file render image preview
  const bindUi = () => {
    imgInput.addEventListener(
      "change",
      function () {
        if (this.files.length) {
          const reader = new FileReader();
          reader.onload = (e) => {
            db.setItem("image-base64", e.target.result);
            updateUi();
          };
          // generate image data uri
          reader.readAsDataURL(this.files[0]);
        }
      },
      false
    );
  };

  // update firdst
  updateUi();
  // select file
  bindUi();
}
//Tone.JS Synth Configoration
const synth = new Tone.MonoSynth().toDestination();

synth.volume.value = -12;

function playSynth(event) {
  //RedchannelCalculation - If it goes a curtain value, the pitch will change
  let redSynth = 0;
  if (redChannel >= 200 && redChannel <= 255) {
    redSynth = 6;
  }
  if (redChannel >= 155 && redChannel <= 200) {
    redSynth = 5;
  }
  if (redChannel >= 115 && redChannel <= 155) {
    redSynth = 4;
  }
  if (redChannel >= 90 && redChannel <= 115) {
    redSynth = 3;
  }
  if (redChannel >= 50 && redChannel <= 90) {
    redSynth = 2;
  }
  if (redChannel >= 0 && redChannel <= 50) {
    redSynth = 1;
  }

  //BluechannelCalculation - What is this doing is each time the Synth is played, it sets its oscillator type depending on the blue channel's value.

  if (blueChannel >= 215 && blueChannel <= 255) {
    synth.set({
      oscillator: {
        type: "sawtooth"
      }
    });
  }
  if (blueChannel >= 160 && blueChannel <= 215) {
    synth.set({
      oscillator: {
        type: "pulse"
      }
    });
  }
  if (blueChannel >= 130 && blueChannel <= 160) {
    synth.set({
      oscillator: {
        type: "triangle"
      }
    });
  }
  if (blueChannel >= 100 && blueChannel <= 130) {
    synth.set({
      oscillator: {
        type: "amsquare"
      }
    });
  }
  if (blueChannel >= 0 && blueChannel <= 100) {
    synth.set({
      oscillator: {
        type: "sine"
      }
    });
  }

  let greenNote = "C";
  if (greenChannel >= 210 && greenChannel <= 255) {
    greenNote = "A";
  }
  if (greenChannel >= 180 && greenChannel <= 210) {
    greenNote = "B";
  }
  if (greenChannel >= 150 && greenChannel <= 180) {
    greenNote = "G";
  }
  if (greenChannel >= 125 && greenChannel <= 150) {
    greenNote = "F";
  }
  if (greenChannel >= 95 && greenChannel <= 125) {
    greenNote = "E";
  }
  if (greenChannel >= 60 && greenChannel <= 95) {
    greenNote = "D";
  }
  if (greenChannel >= 0 && greenChannel <= 60) {
    greenNote = "C";
  }

  Tone.context.resume();
  console.log(
    "Red: " + redChannel + " Green: " + greenChannel + " Blue: " + blueChannel
  );
  //console.log(e.target.id);
  synth.triggerAttackRelease(greenNote + redSynth, "1.5");
}

//The function should be called directly into the synth-play element we created with React earlier
document.getElementById("synth-play").addEventListener("click", playSynth);
