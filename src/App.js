import { useRef, useEffect } from "react";
import "./styles.css";

let cnv, ctx;
let car1, car2;
let prevDelta,
  td = 0,
  t1 = 0,
  t2 = 0,
  oldOffset = 0,
  newOffset = 0,
  offsetDelta = 0;

let keyPress = {
  a: "R",
  d: "R"
};

let movement = "L0",
  rev = false;

function countPosition(next) {
  if (next > cnv.width) return next % cnv.width;
  if (next < 0) return cnv.width + next;
  return next;
}

class Car {
  x;
  y;
  w;
  h;
  xOffset = 0;

  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  printAll = () => {
    console.log(this.x, this.y);
  };
}

let Vf1 = 60,
  V01 = 0,
  tE1 = 1;

let Vm = 0;

let Vbrak = Vf1,
  tbrak = 1;

let a1 = Vf1 / tE1,
  a2 = Vbrak / tbrak;

function renderCar(delta) {
  ctx.clearRect(0, 0, cnv.width, cnv.height);
  try {
    if (delta && prevDelta) {
      td = delta - prevDelta;
    }
    prevDelta = delta;

    if (keyPress.a === "A" && movement === "L0") {
      movement = "A";
      oldOffset = 0;
      rev = true;
    }
    if (keyPress.d === "A" && movement === "L0") {
      movement = "A";
      oldOffset = 0;
      rev = false;
    }
    if (movement === "D" || movement === "Dslow") {
      if ((!rev && Vm > 0) || (rev && Vm > 0)) {
        a2 = Vbrak / tbrak;
        t2 += td / 1000;

        newOffset = (t2 * (2 * Vbrak - a2 * t2)) / 2;
        offsetDelta = newOffset - oldOffset;
      } else {
        offsetDelta = 0;
        oldOffset = 0;
        V01 = Vm;
        t1 = 0;
        t2 = 0;
        tE1 = 1;
        movement = "L0";
      }
    }
    if (movement === "A" || movement === "Lmax") {
      t1 += td / 1000;
      a1 = Vf1 / tE1;

      if (offsetDelta >= 15) {
        movement = "Lmax";
        offsetDelta = 15;
      } else {
        newOffset = (t1 * (2 * V01 + a1 * t1)) / 2;
        offsetDelta = newOffset - oldOffset;
      }
    }

    car1.x = countPosition(rev ? car1.x - offsetDelta : car1.x + offsetDelta);
    car2.x = car1.x - cnv.width;

    oldOffset = newOffset;

    if (movement === "A") {
      Vm = V01 + a1 * t1;
    }
    if (movement === "D" || movement === "Dslow") {
      Vm = Vbrak - a2 * t2;
    }

    ctx.beginPath();
    ctx.rect(car1.x, car1.y, car1.w, car1.h);
    ctx.rect(car2.x, car2.y, car2.w, car2.h);
    ctx.stroke();

    window.requestAnimationFrame(renderCar);
  } catch (err) {
    console.log("We've got an error in canvas");
    return;
  }
}

function cancelAllAnimFrame() {
  let id = window.requestAnimationFrame(() => {
    for (let i = id; i >= id - 500; i--) {
      window.cancelAnimationFrame(id);
    }
  });
}

export default function App() {
  const canvasRef = useRef();
  useEffect(() => {
    cnv = canvasRef.current;
    ctx = cnv.getContext("2d");

    let stdW = 100,
      stdH = 100;

    let stdX = cnv.width / 2 - 50,
      stdY = cnv.height / 2 - 50;
    car1 = new Car(stdX, stdY, stdW, stdH);
    car2 = new Car(stdX - cnv.width, stdY, stdW, stdH);

    window.addEventListener("keydown", (e) => {
      if (e.keyCode === 65) {
        if (keyPress.a === "R") {
          keyPress.a = "P";
        }
        if (keyPress.a === "P") {
          if (movement === "L0") {
            movement = "A";
            oldOffset = 0;
            rev = true;
          } else if (movement === "D") {
            if (rev) {
              movement = "A";
              V01 = Vm;
              t1 = 0;
              t2 = 0;
              oldOffset = 0;
            }
          } else if (movement === "Dslow") {
            if (rev) {
              movement = "A";
              V01 = Vm;
              t1 = 0;
              t2 = 0;
              oldOffset = 0;
            } else {
              movement = "D";
              oldOffset = 0;
              t2 = 0;
              tbrak = Vm / 200;
              Vbrak = Vm;
            }
          } else if (movement === "A" || movement === "Lmax") {
            if (!rev) {
              movement = "D";
              oldOffset = 0;
              t2 = 0;
              Vbrak = Vm;
              tbrak = Vm / 250;
            }
          }
          keyPress.a = "A";
        }
      }
      if (e.keyCode === 68) {
        if (keyPress.d === "R") {
          keyPress.d = "P";
        }
        if (keyPress.d === "P") {
          if (movement === "L0") {
            movement = "A";
            oldOffset = 0;
            rev = false;
          } else if (movement === "D") {
            if (!rev) {
              movement = "A";
              V01 = Vm;
              t1 = 0;
              t2 = 0;
              oldOffset = 0;
            }
          } else if (movement === "Dslow") {
            if (rev) {
              movement = "D";
              oldOffset = 0;
              t2 = 0;
              tbrak = Vm / 200;
              Vbrak = Vm;
            } else {
              movement = "A";
              V01 = Vm;
              t1 = 0;
              t2 = 0;
              oldOffset = 0;
            }
          } else if (movement === "A" || movement === "Lmax") {
            if (rev) {
              movement = "D";
              oldOffset = 0;
              t2 = 0;
              Vbrak = Vm;
              tbrak = Vm / 250;
            }
          }
          keyPress.d = "A";
        }
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.keyCode === 65) {
        if (keyPress.a === "A") {
          if (rev && (movement === "A" || movement === "Lmax")) {
            movement = "Dslow";
            oldOffset = 0;
            Vbrak = Vm;
            tbrak = Vm / 30;
            t2 = 0;
          } else {
            if (!rev && movement === "D") {
              movement = "Dslow";
              oldOffset = 0;
              Vbrak = Vm;
              tbrak = Vm / 30;
              t2 = 0;
            }
          }
          keyPress.a = "R";
        }
      }
      if (e.keyCode === 68) {
        if (keyPress.d === "A") {
          if (!rev && (movement === "A" || movement === "Lmax")) {
            movement = "Dslow";
            oldOffset = 0;
            Vbrak = Vm;
            tbrak = Vm / 30;
            t2 = 0;
          } else {
            if (rev && movement === "D") {
              movement = "Dslow";
              oldOffset = 0;
              Vbrak = Vm;
              tbrak = Vm / 30;
              t2 = 0;
            }
          }
          keyPress.d = "R";
        }
      }
    });
    cancelAllAnimFrame();
    renderCar();
  }, []);
  return (
    <div className="App">
      <canvas width={500} height={700} ref={canvasRef}></canvas>
    </div>
  );
}
