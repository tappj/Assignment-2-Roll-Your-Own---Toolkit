import { IdleUpWidgetState } from "../core/ui";
import { Window, Widget, RoleType, EventArgs } from "../core/ui";
import { Rect, Text } from "../core/ui";

type BarState = "empty" | "filling" | "complete";

class ProgressBar extends Widget {
    private _barWidth: number = 200;
    private _barHeight: number = 24;
    private _value: number = 0;           // 0–100

    private _trackRect!: Rect;
    private _fillRect!: Rect;
    private _pctLabel!: Text;

    private _barState: BarState = "empty";
    private _stateHandlers: ((event: EventArgs) => void)[] = [];

    // Theme colors (consistent with Button / CheckBox / RadioGroup / ScrollBar)
    private readonly COLOR_TRACK        = "#E3F2FD";
    private readonly COLOR_TRACK_BORDER = "#1565C0";
    private readonly COLOR_FILL         = "#2196F3";
    private readonly COLOR_FILL_DONE    = "#0D47A1";
    private readonly COLOR_TEXT         = "#212121";

    private readonly PAD = 3;  // inner gap between track stroke and fill

    constructor(parent: Window) {
        super(parent);
        this.role = RoleType.none;
        this.render();
        this.setState(new IdleUpWidgetState());
        this.selectable = false;
        this.idleupState();
    }

    // ── Public properties ──────────────────────────────────────────────────

    set barWidth(w: number) {
        this._barWidth = Math.max(w, 20);
        this.buildLayout();
    }

    get barWidth(): number {
        return this._barWidth;
    }

    set value(v: number) {
        const clamped = Math.max(0, Math.min(100, v));
        if (clamped === this._value) return;
        this._value = clamped;
        this.updateFill();
        this.checkStateChange();
    }

    get value(): number {
        return this._value;
    }

    /**
     * Increment the progress by `amount` (positive or negative).
     * Accepts any number; result is clamped to 0–100.
     */
    increment(amount: number): void {
        const prev = this._value;
        this._value = Math.max(0, Math.min(100, this._value + amount));
        if (this._value === prev) return;

        this.updateFill();
        this.raise(new EventArgs(this, null, {
            value: this._value,
            delta: this._value - prev
        }));
        this.checkStateChange();
    }

    // ── Event handlers ─────────────────────────────────────────────────────

    /** Fires every time the value changes via increment(). */
    onIncrement(callback: (event: EventArgs) => void): void {
        this.attach(callback);
    }

    /** Fires when the bar transitions between empty / filling / complete. */
    onStateChange(callback: (event: EventArgs) => void): void {
        this._stateHandlers.push(callback);
    }

    // ── Rendering ──────────────────────────────────────────────────────────

    render(): void {
        this._group = (this.parent as Window).window.group();
        this.outerSvg = this._group;
        this.buildLayout();
    }

    private buildLayout(): void {
        this._group.clear();

        const bw = this._barWidth;
        const bh = this._barHeight;
        const pad = this.PAD;
        const r = bh / 2;         // pill shape

        // Track
        this._trackRect = this._group.rect(bw, bh)
            .radius(r)
            .fill(this.COLOR_TRACK)
            .stroke({ color: this.COLOR_TRACK_BORDER, width: 2 });

        // Fill — starts at width 0, grows inside the track
        const fillW = this.computeFillWidth();
        this._fillRect = this._group.rect(fillW, bh - 2 * pad)
            .radius(r - pad)
            .fill(this._value >= 100 ? this.COLOR_FILL_DONE : this.COLOR_FILL)
            .move(pad, pad);

        // Percentage label to the right of the track
        this._pctLabel = this._group.text(`${Math.round(this._value)}%`)
            .font({ family: "Arial, sans-serif", size: 14, weight: "700", anchor: "start" })
            .attr({ "dominant-baseline": "central" })
            .fill(this.COLOR_TEXT)
            .x(bw + 8)
            .y(bh / 2);

        this.width = bw;
        this.height = bh;
    }

    private computeFillWidth(): number {
        const maxW = this._barWidth - 2 * this.PAD;
        return Math.max(0, (this._value / 100) * maxW);
    }

    private updateFill(): void {
        if (!this._fillRect || !this._pctLabel) return;
        const fillW = this.computeFillWidth();
        this._fillRect
            .width(fillW)
            .fill(this._value >= 100 ? this.COLOR_FILL_DONE : this.COLOR_FILL);
        this._pctLabel.text(`${Math.round(this._value)}%`);
    }

    private checkStateChange(): void {
        const next: BarState =
            this._value <= 0 ? "empty" :
            this._value >= 100 ? "complete" : "filling";

        if (next !== this._barState) {
            this._barState = next;
            const ev = new EventArgs(this, null, { state: this._barState, value: this._value });
            this._stateHandlers.forEach(h => h(ev));
        }
    }

    override update(): void {
        if (this._fillRect) this.updateFill();
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
    keyupState(): void {}
}

export { ProgressBar };
