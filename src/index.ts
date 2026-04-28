import { Window } from "./core/ui"
import { Button } from "./widgets/button"
import { Heading } from "./widgets/heading"
import { CheckBox } from "./widgets/checkbox"
import { RadioGroup } from "./widgets/radiogroup"
import { ScrollBar } from "./widgets/scrollbar"
import { ProgressBar } from "./widgets/progressbar"
import { Knob } from "./widgets/knob"

let w = new Window(Math.max(window.innerHeight - 10, 900), '100%');

const COL1 = 40;   // Button · CheckBox · RadioGroup
const COL2 = 340;  // ScrollBar · ProgressBar
const COL3 = 640;  // Knob (custom)

// ════════════════════════════════════════════════════════
// COLUMN 1
// ════════════════════════════════════════════════════════

// ── Button ────────────────────────────────────────────────────────────────
let btnHeading = new Heading(w);
btnHeading.text = "Button Demo";
btnHeading.fontSize = 22;
btnHeading.move(COL1, 40);

let btn = new Button(w);
btn.tabindex = 1;
btn.label = "Click Me";
btn.fontSize = 16;
btn.size = { width: 130, height: 44 };
btn.move(COL1, 80);

let clickCount = 0;
btn.onClick(() => {
    clickCount++;
    btnHeading.text = `Clicked ${clickCount} time${clickCount === 1 ? "" : "s"}!`;
    console.log(`Button clicked — count: ${clickCount}`);
});

// ── CheckBox ──────────────────────────────────────────────────────────────
let cbHeading = new Heading(w);
cbHeading.text = "CheckBox Demo";
cbHeading.fontSize = 22;
cbHeading.move(COL1, 160);

let cb1 = new CheckBox(w);
cb1.label = "Enable notifications";
cb1.fontSize = 15;
cb1.move(COL1, 200);

let cb2 = new CheckBox(w);
cb2.label = "Subscribe to newsletter";
cb2.fontSize = 15;
cb2.move(COL1, 234);

cb1.onChange(() => console.log(`CheckBox "Enable notifications" → checked: ${cb1.checked}`));
cb2.onChange(() => console.log(`CheckBox "Subscribe to newsletter" → checked: ${cb2.checked}`));

// ── Radio Button ──────────────────────────────────────────────────────────
let rgHeading = new Heading(w);
rgHeading.text = "Radio Button Demo";
rgHeading.fontSize = 22;
rgHeading.move(COL1, 290);

let rg = new RadioGroup(w);
rg.options = ["Red", "Green", "Blue", "Yellow"];
rg.fontSize = 15;
rg.move(COL1, 328);

rg.onChange((e) =>
    console.log(`RadioGroup changed → index: ${e.itemRef}, label: "${rg.selectedLabel}"`)
);

// ════════════════════════════════════════════════════════
// COLUMN 2
// ════════════════════════════════════════════════════════

// ── ScrollBar ─────────────────────────────────────────────────────────────
let sbHeading = new Heading(w);
sbHeading.text = "ScrollBar Demo";
sbHeading.fontSize = 22;
sbHeading.move(COL2, 40);

let sb = new ScrollBar(w);
sb.barHeight = 260;
sb.move(COL2, 80);

sb.onScroll((e) =>
    console.log(`ScrollBar moved → position: ${e.itemRef.position.toFixed(2)}, direction: ${e.itemRef.direction}`)
);

// ── Progress Bar ──────────────────────────────────────────────────────────
let pbHeading = new Heading(w);
pbHeading.text = "Progress Bar Demo";
pbHeading.fontSize = 22;
pbHeading.move(COL2, 380);

let pb = new ProgressBar(w);
pb.barWidth = 230;
pb.move(COL2, 418);

let incrBtn = new Button(w);
incrBtn.label = "+10";
incrBtn.fontSize = 14;
incrBtn.size = { width: 72, height: 36 };
incrBtn.move(COL2, 458);

let resetBtn = new Button(w);
resetBtn.label = "Reset";
resetBtn.fontSize = 14;
resetBtn.size = { width: 72, height: 36 };
resetBtn.move(COL2 + 82, 458);

incrBtn.onClick(() => pb.increment(10));
resetBtn.onClick(() => { pb.value = 0; });

pb.onIncrement((e) =>
    console.log(`ProgressBar incremented → value: ${e.itemRef.value}, delta: +${e.itemRef.delta}`)
);
pb.onStateChange((e) =>
    console.log(`ProgressBar state changed → "${e.itemRef.state}" at ${e.itemRef.value}`)
);

// ════════════════════════════════════════════════════════
// COLUMN 3 — Custom Widget: Knob
// ════════════════════════════════════════════════════════

let knobHeading = new Heading(w);
knobHeading.text = "Custom: Knob";
knobHeading.fontSize = 22;
knobHeading.move(COL3, 40);

let subLabel = new Heading(w);
subLabel.text = "Drag or use arrow keys";
subLabel.fontSize = 13;
subLabel.move(COL3, 72);

let knob1 = new Knob(w);
knob1.size = 100;
knob1.label = "Volume";
knob1.move(COL3, 110);

let knob2 = new Knob(w);
knob2.size = 100;
knob2.label = "Bass";
knob2.value = 40;
knob2.move(COL3, 260);

let knob3 = new Knob(w);
knob3.size = 100;
knob3.label = "Treble";
knob3.value = 70;
knob3.move(COL3, 410);

knob1.onChange((e) => console.log(`Knob "Volume" → value: ${e.itemRef.value}`));
knob2.onChange((e) => console.log(`Knob "Bass" → value: ${e.itemRef.value}`));
knob3.onChange((e) => console.log(`Knob "Treble" → value: ${e.itemRef.value}`));
