import { IdleUpWidgetState } from "../core/ui";
import { Window, Widget, RoleType, EventArgs } from "../core/ui";
import { Circle, Text } from "../core/ui";

interface RadioItem {
    outerCircle: any;
    innerDot: any;
    label: any;
    hitRect: any;
}

class RadioGroup extends Widget {
    private _options: string[] = ["Option 1", "Option 2"];
    private _selectedIndex: number = -1;
    private _itemHeight: number = 34;
    private _radioSize: number = 20;
    private _fontSize: number = 16;
    private _pressedIndex: number = -1;
    private _items: RadioItem[] = [];

    // Theme colors (consistent with Button / CheckBox)
    private readonly COLOR_IDLE        = "#2196F3";
    private readonly COLOR_HOVER       = "#42A5F5";
    private readonly COLOR_PRESSED     = "#0D47A1";
    private readonly COLOR_BORDER      = "#1565C0";
    private readonly COLOR_UNCHECKED   = "white";
    private readonly COLOR_HOVER_BG    = "#E3F2FD";
    private readonly COLOR_TEXT        = "#212121";

    constructor(parent: Window) {
        super(parent);
        this.role = RoleType.group;
        this.render();
        this.setState(new IdleUpWidgetState());
        this.selectable = false;
        this.idleupState();
    }

    set options(labels: string[]) {
        if (labels.length < 2) throw new Error("RadioGroup requires at least 2 options");
        this._options = [...labels];
        this._selectedIndex = -1;
        this.buildItems();
    }

    get options(): string[] {
        return [...this._options];
    }

    get selectedIndex(): number {
        return this._selectedIndex;
    }

    get selectedLabel(): string {
        return this._selectedIndex >= 0 ? this._options[this._selectedIndex] : "";
    }

    set fontSize(size: number) {
        this._fontSize = size;
        this.buildItems();
    }

    onChange(callback: (event: EventArgs) => void): void {
        this.attach(callback);
    }

    render(): void {
        this._group = (this.parent as Window).window.group();
        this.outerSvg = this._group;
        this.buildItems();
    }

    private buildItems(): void {
        this._group.clear();
        this._items = [];

        let maxLabelWidth = 0;

        this._options.forEach((optionText, index) => {
            const y = index * this._itemHeight;
            const r = this._radioSize / 2;
            const cx = r;
            const cy = y + r;

            const outerCircle = this._group.circle(this._radioSize)
                .fill(this.COLOR_UNCHECKED)
                .stroke({ color: this.COLOR_BORDER, width: 2 })
                .cx(cx).cy(cy);

            const innerDot = this._group.circle(this._radioSize * 0.48)
                .fill(this.COLOR_IDLE)
                .opacity(0)
                .cx(cx).cy(cy)
                .attr('pointer-events', 'none');

            const label = this._group.text(optionText)
                .font({ family: "Arial, sans-serif", size: this._fontSize, weight: "500", anchor: "start" })
                .fill(this.COLOR_TEXT)
                .x(this._radioSize + 8);
            label.cy(cy);
            maxLabelWidth = Math.max(maxLabelWidth, label.bbox().width);

            // Transparent hit-area for the whole row
            const evtRect = this._group.rect(this._radioSize + 16 + maxLabelWidth, this._itemHeight)
                .opacity(0)
                .move(0, y);

            this.wireItemEvents(evtRect, outerCircle, index);
            this._items.push({ outerCircle, innerDot, label, hitRect: evtRect });
        });

        this.height = this._options.length * this._itemHeight;
        this.width = this._radioSize + 16 + maxLabelWidth;
    }

    private wireItemEvents(evtRect: any, outerCircle: any, index: number): void {
        evtRect.mouseover(() => {
            outerCircle.fill(
                this._selectedIndex === index ? this.COLOR_HOVER : this.COLOR_HOVER_BG
            );
        });

        evtRect.mouseout(() => {
            outerCircle.fill(
                this._selectedIndex === index ? this.COLOR_IDLE : this.COLOR_UNCHECKED
            );
        });

        evtRect.mousedown((e: any) => {
            e.preventDefault();
            this._pressedIndex = index;
            outerCircle.fill(this.COLOR_PRESSED).stroke({ color: "#082E6C", width: 2 });
        });

        evtRect.mouseup(() => {
            if (this._pressedIndex === index) {
                this.selectItem(index);
            }
            this._pressedIndex = -1;
        });
    }

    private selectItem(index: number): void {
        this._selectedIndex = index;

        this._items.forEach((item, i) => {
            if (i === index) {
                item.outerCircle.fill(this.COLOR_IDLE).stroke({ color: this.COLOR_BORDER, width: 2 });
                item.innerDot.opacity(1);
            } else {
                item.outerCircle.fill(this.COLOR_UNCHECKED).stroke({ color: this.COLOR_BORDER, width: 2 });
                item.innerDot.opacity(0);
            }
        });

        this.raise(new EventArgs(this, null, index));
    }

    override update(): void {
        super.update();
    }

    idleupState(): void {}
    idledownState(): void {}
    pressedState(): void {}
    pressReleaseState(): void {}
    hoverState(): void {}
    hoverPressedState(): void {}
    pressedoutState(): void {}
    moveState(): void {}

    keyupState(keyEvent?: KeyboardEvent): void {
        if (!keyEvent) return;
        const n = this._options.length;
        if (keyEvent.key === "ArrowDown" || keyEvent.key === "ArrowRight") {
            this.selectItem(this._selectedIndex < 0 ? 0 : (this._selectedIndex + 1) % n);
        } else if (keyEvent.key === "ArrowUp" || keyEvent.key === "ArrowLeft") {
            this.selectItem(this._selectedIndex < 0 ? n - 1 : (this._selectedIndex - 1 + n) % n);
        }
    }
}

export { RadioGroup };
