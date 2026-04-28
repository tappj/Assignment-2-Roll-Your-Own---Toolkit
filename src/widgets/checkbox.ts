import { IdleUpWidgetState, PressedWidgetState } from "../core/ui";
import { Window, Widget, RoleType, EventArgs } from "../core/ui";
import { Rect, Text, Box } from "../core/ui";
import { G, Svg } from "@svgdotjs/svg.js";

class CheckBox extends Widget {
    private _box!: Rect;
    private _checkmark!: any;
    private _label!: Text;
    private _labelText: string = "Check Box";
    private _checked: boolean = false;
    private _boxSize: number = 20;
    private _fontSize: number = 16;

    // Theme colors (consistent with Button)
    private readonly COLOR_IDLE       = "#2196F3";
    private readonly COLOR_HOVER      = "#42A5F5";
    private readonly COLOR_PRESSED    = "#0D47A1";
    private readonly COLOR_BORDER     = "#1565C0";
    private readonly COLOR_UNCHECKED_BG = "white";
    private readonly COLOR_TEXT       = "#212121";

    constructor(parent: Window) {
        super(parent);
        this.height = this._boxSize;
        this.width = this._boxSize;
        this.role = RoleType.button;
        this.render();
        this.setState(new IdleUpWidgetState());
        this.selectable = false;
        this.idleupState();
    }

    set label(text: string) {
        this._labelText = text;
        this.update();
    }

    get label(): string {
        return this._labelText;
    }

    set checked(val: boolean) {
        this._checked = val;
        this.update();
    }

    get checked(): boolean {
        return this._checked;
    }

    set fontSize(size: number) {
        this._fontSize = size;
        this.update();
    }

    onChange(callback: (event: EventArgs) => void): void {
        this.attach(callback);
    }

    private drawCheckmark(): void {
        this._checkmark.clear();
        if (this._checked) {
            const s = this._boxSize;
            const pad = 4;
            const boxX = +this._box.x();
            const boxY = +this._box.y();
            // mid-left to bottom-center
            this._checkmark
                .line(boxX + pad, boxY + s / 2, boxX + s * 0.4, boxY + s - pad)
                .stroke({ color: "white", width: 2.5, linecap: "round" });
            // bottom-center to top-right
            this._checkmark
                .line(boxX + s * 0.4, boxY + s - pad, boxX + s - pad, boxY + pad)
                .stroke({ color: "white", width: 2.5, linecap: "round" });
        }
    }

    private positionLabel(): void {
        const labelX = +this._box.x() + this._boxSize + 8;
        const labelY = +this._box.y() + this._boxSize / 2;
        this._label.x(labelX);
        this._label.cy(labelY);
    }

    render(): void {
        this._group = (this.parent as Window).window.group();

        this._box = this._group.rect(this._boxSize, this._boxSize)
            .radius(4)
            .fill(this.COLOR_UNCHECKED_BG)
            .stroke({ color: this.COLOR_BORDER, width: 2 });

        this._checkmark = this._group.group().attr('pointer-events', 'none');

        this._label = this._group.text(this._labelText)
            .font({ family: "Arial, sans-serif", size: this._fontSize, weight: "500", anchor: "start" })
            .fill(this.COLOR_TEXT);
        this.positionLabel();

        this.outerSvg = this._group;

        // Transparent event rect over box only
        const evtRect = this._group.rect(this._boxSize, this._boxSize).opacity(0);
        this.registerEvent(evtRect);
    }

    override update(): void {
        if (this._label) {
            this._label.text(this._labelText);
            this._label.font("size", this._fontSize);
            this.positionLabel();
        }
        if (this._box && this._checkmark) {
            this._backcolor = this._checked ? this.COLOR_IDLE : this.COLOR_UNCHECKED_BG;
            this._box.fill(this._backcolor).stroke({ color: this.COLOR_BORDER, width: 2 });
            this.drawCheckmark();
        }
        super.update();
    }

    idleupState(): void {
        this._backcolor = this._checked ? this.COLOR_IDLE : this.COLOR_UNCHECKED_BG;
        this._box.fill(this._backcolor).stroke({ color: this.COLOR_BORDER, width: 2 });
        this.drawCheckmark();
    }

    hoverState(): void {
        const base = this._checked ? this.COLOR_HOVER : "#E3F2FD";
        this._box.fill(base).stroke({ color: this.COLOR_BORDER, width: 2 });
    }

    pressedState(): void {
        this._box.fill(this.COLOR_PRESSED).stroke({ color: "#082E6C", width: 2 });
    }

    pressReleaseState(): void {
        if (this.previousState instanceof PressedWidgetState) {
            this._checked = !this._checked;
            this.raise(new EventArgs(this));
        }
        this.idleupState();
    }

    hoverPressedState(): void {
        this._box.fill(this.COLOR_PRESSED).stroke({ color: "#082E6C", width: 2 });
    }

    pressedoutState(): void {
        this.idleupState();
    }

    idledownState(): void { }
    moveState(): void { }
    keyupState(keyEvent?: KeyboardEvent): void {
        if (keyEvent && (keyEvent.key === "Enter" || keyEvent.key === " ")) {
            this._checked = !this._checked;
            this.raise(new EventArgs(this));
            this.idleupState();
        }
    }
}

export { CheckBox };
