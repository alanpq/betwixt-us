import { ctx, minAxis } from "./canvas.js"
import { mousePos, GetLeftMouse, GetLeftMouseUp, UnEatMouse } from "./input.js"
import { openCustomWindow, closeWindow } from "./ui/ui.js"
import { interactables } from "./interactables.js";
import { W, H } from "./canvas.js"
import { colors } from "./util/util.js";
import * as button from './ui/button.js'

const wireCols = [
    "red",
    "orange",
    "blue",
    "yellow"
]

let openObj = null;
let selectedWire = -1;
let focusedWire = -1;
let conns = [0, 1, 2, 3];
let revConns = [0, 0, 0, 0];
let connected = [false, false, false, false];
let remaining = 4;

export const wireTask = (interactable) => {
    console.log(interactable)
    connected = [false, false, false, false];
    selectedWire = -1;
    focusedWire = -1;
    remaining = 4;
    openObj = interactable;


    let rand = Math.floor(Math.random() * 24); //this.count equals to N!
    let res = [];
    let tmp = conns.slice(); // a copy of the original nums
    let d = 24; //the divisor is set to N! originally
    let i = 4; // i is used to get the next divisor
    while (i > 0) {
        d /= i;
        i--;
        res.push(tmp.splice(Math.floor(rand / d), 1)[0]); // we need to remove the number we picked, because next time we need to choose from N-1 numbers
        revConns[res[3 - i]] = 3 - i;
        rand %= d;
    }
    conns = res;
    openObj = interactable;
    openCustomWindow(drawWires);
}


export const drawWires = () => {
    UnEatMouse();
    const size = minAxis * .9;
    const x = (W - size) / 2;
    const y = (H - size) / 2;

    const ss = minAxis * 0.05;
    const visSize = ss * 1.5;

    ctx.fillStyle = "#111";
    ctx.fillRect(x, y, size, size);
    focusedWire = -1;
    for (let i = 0; i < 4; i++) {
        ctx.fillStyle = wireCols[i];
        const yy = y + (size / 4) * (i + 0.5);
        ctx.fillRect(x, yy - visSize / 2, visSize, visSize)
        ctx.fillStyle = wireCols[revConns[i]];
        ctx.fillRect(x + size - visSize, yy - visSize / 2, visSize, visSize)

        if (mousePos.y > yy - ss && mousePos.y < yy + ss) {
            if (mousePos.x > x && mousePos.x < x + ss * 2 && !connected[i] && GetLeftMouse(false)) {
                selectedWire = i;
            } else if (mousePos.x > x + size - ss * 2 && mousePos.x < x + size) {
                focusedWire = i;
            } else {
                focusedWire = -1;
            }
        }
    }
    // console.log(focusedWire)

    if (GetLeftMouseUp(false)) {
        // console.log('up')
        // console.log(selectedWire)
        // console.log(focusedWire)
        // console.log(conns)
        if (selectedWire != -1 && focusedWire != -1 && conns[selectedWire] == focusedWire) {
            connected[selectedWire] = true;
            remaining--;
            if (remaining == 0) {
                interactables[openObj].disabled = true;
                console.log("Task complete!")
                closeWindow();
            }
        }
        selectedWire = focusedWire = -1;
    }

    for (let i = 0; i < 4; i++) {
        if (!connected[i]) continue;
        ctx.strokeStyle = wireCols[i];
        ctx.lineWidth = ss * 1;
        ctx.beginPath();
        ctx.moveTo(x + visSize / 2, y + ((size / 4) * (i + 0.5)));
        ctx.lineTo(x + size - visSize / 2, y + ((size / 4) * (conns[i] + 0.5)))
        ctx.stroke();
    }

    if (selectedWire != -1) {
        ctx.strokeStyle = wireCols[selectedWire];
        // ctx.strokeStyle = "white";
        ctx.lineWidth = ss * 1;
        ctx.beginPath();
        ctx.moveTo(x + visSize / 2, y + ((size / 4) * (selectedWire + 0.5)));
        if (focusedWire != -1)
            ctx.lineTo(x + size - visSize / 2, y + ((size / 4) * (focusedWire + 0.5)))
        else
            ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
    }


    if (button.drawButton(ctx, "x", x + size - 10, y + 10, 25, 25, 1, 0, false, 0))
        closeWindow();

    ctx.fillRect(mousePos.x, mousePos.y, 10, 10);
}