// importing local code, code we have written
import {IdleUpWidgetState, PressedWidgetState } from "../core/ui";
import {Window, Widget, RoleType, EventArgs} from "../core/ui";
// importing code from SVG.js library
import {Rect, Text, Box} from "../core/ui";

class Button extends Widget{
    private _rect!: Rect;
    private _text!: Text;
    private _input: string;
    private _fontSize: number;
    private _text_y!: number;
    private _text_x!: number;
    private defaultText: string = "Button";
    private defaultFontSize: number = 18;
    private defaultWidth: number = 80;
    private defaultHeight: number = 30;

    constructor(parent: Window){
        super(parent);
        this.height = this.defaultHeight;
        this.width = this.defaultWidth;
        this._input = this.defaultText;
        this._fontSize = this.defaultFontSize;
        this.role = RoleType.button;
        this.render();
        this.setState(new IdleUpWidgetState());
        this.selectable = false;
        this.idleupState();
    }

    set fontSize(size: number){
        this._fontSize = size;
        this.update();
    }

    set label(text: string){
        this._input = text;
        this.update();
    }

    get label(): string {
        return this._input;
    }

    set size(value: { width: number, height: number }){
        this.width = value.width;
        this.height = value.height;
        this.update();
    }

    get size(): { width: number, height: number } {
        return { width: this.width, height: this.height };
    }

    private positionText(){
        let box: Box = this._text.bbox();
        let rectX = +this._rect.x();
        let rectY = +this._rect.y();
        let rectW = +this._rect.width();
        let rectH = +this._rect.height();

        this._text.x(rectX + (rectW / 2) - (box.width / 2));
        this._text.y(rectY + (rectH / 2) - (box.height / 2));
    }

    render(): void {
        this._group = (this.parent as Window).window.group();

        // add drop shadow using raw SVG filter
        this._group.defs().svg(`
            <filter id="shadow" x="-25%" y="-25%" width="150%" height="150%">
                <feDropShadow dx="3" dy="4" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
            </filter>
        `);

        this._rect = this._group.rect(this.width, this.height);
        this._rect.stroke("#1565C0").attr('stroke-width', 2).radius(10);
        this._rect.attr('filter', 'url(#shadow)');

        this._text = this._group.text(this._input);
        this._text.font({ family: 'Arial, sans-serif', weight: '700' });

        this.outerSvg = this._group;
        let eventrect = this._group.rect(this.width, this.height).opacity(0).attr('id', 0);
        this.registerEvent(eventrect);
    }

    override update(): void {
        if(this._text != null){
            this._text.font('size', this._fontSize);
            this._text.text(this._input);
            this.positionText();
        }
        if(this._rect != null){
            this._rect.size(this.width, this.height);
            this._rect.fill(this._backcolor);
        }
        super.update();
    }

    pressReleaseState(): void {
        if (this.previousState instanceof PressedWidgetState)
            this.raise(new EventArgs(this));
        this._rect.fill("#42A5F5");
        this._rect.stroke("#1565C0");
        this._rect.attr('filter', 'url(#shadow)');
        this._text.fill("white");
    }

    onClick(callback: (event: EventArgs) => void): void {
        this.attach(callback);
    }

    idleupState(): void {
        this._backcolor = "#2196F3";
        this._rect.fill(this._backcolor);
        this._rect.stroke("#1565C0");
        this._rect.attr('filter', 'url(#shadow)');
        this._text.fill("white");
    }

    idledownState(): void { }

    pressedState(): void {
        this._rect.fill("#0D47A1");
        this._rect.stroke("#082E6C");
        this._rect.attr('filter', 'none');
        this._text.fill("white");
    }

    hoverState(): void {
        this._rect.fill("#42A5F5");
        this._rect.stroke("#1565C0");
        this._rect.attr('filter', 'url(#shadow)');
        this._text.fill("white");
    }

    hoverPressedState(): void {
        this._rect.fill("#0D47A1");
        this._rect.stroke("#082E6C");
        this._rect.attr('filter', 'none');
        this._text.fill("white");
    }

    pressedoutState(): void {
        this._rect.fill("#2196F3");
        this._rect.stroke("#1565C0");
        this._rect.attr('filter', 'url(#shadow)');
        this._text.fill("white");
    }

    moveState(): void { }

    keyupState(keyEvent?: KeyboardEvent): void {
        if (keyEvent && (keyEvent.key === "Enter" || keyEvent.key === " ")) {
            this.raise(new EventArgs(this));
        }
    }
}

export {Button}