import {Window} from "./core/ui"
import {Button} from "./widgets/button"
import {Heading} from "./widgets/heading"

let w = new Window(window.innerHeight - 10, '100%');

let lbl1 = new Heading(w);
lbl1.text = "Button Demo";
lbl1.tabindex = 1;
lbl1.fontSize = 24;
lbl1.move(40, 40);

let btn = new Button(w);
btn.tabindex = 2;
btn.label = "Click Me";
btn.fontSize = 16;
btn.size = { width: 120, height: 44 };
btn.move(40, 100);

let clickCount = 0;
btn.onClick(() => {
    clickCount++;
    lbl1.text = `Button clicked ${clickCount} time${clickCount === 1 ? '' : 's'}!`;
});