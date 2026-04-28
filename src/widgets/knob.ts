import { IdleUpWidgetState } from "../core/ui";
import { Window, Widget, RoleType, EventArgs } from "../core/ui";
import { Text } from "../core/ui";

/**
 * Rotary Knob — drag to rotate or use arrow keys.
 * Arc spans 270° clockwise, starting at the 8-o'clock position.
 */
class Knob extends Widget {
    private _value: number = 0;       // 0–100
    private _size: number = 90;       // diameter in px
    private _knobLabel: string = "";

    private _fillPath!: any;
    private _indicator!: any;
    private _valueText!: Text;
    private _suffixText!: Text;
    private _labelEl!: Text;
    private _bgCircle!: any;

    private _isDragging: boolean = false;

    // Arc geometry: 270° range starting at 135° (8-o'clock in SVG coords)
    private readonly START = 135;
    private readonly RANGE = 270;

    // Theme colors (consistent with full toolkit)
    private readonly COLOR_TRACK    = "#E3F2FD";
    private readonly COLOR_FILL     = "#2196F3";
    private readonly COLOR_FILL_MAX = "#0D47A1";
    private readonly COLOR_BORDER   = "#1565C0";
    private readonly COLOR_BG       = "#FFFFFF";
    private readonly COLOR_TEXT     = "#212121";

    constructor(parent: Window) {
        super(parent);
        this.role = RoleType.none;
        this.render();
        this.setState(new IdleUpWidgetState());
        this.selectable = false;
        this.idleupState();
    }

    // ── Public API ─────────────────────────────────────────────────────────

    set value(v: number) {
        this._value = Math.max(0, Math.min(100, v));
        this.updateVisuals();
    }

    get value(): number {
        return this._value;
    }

    set size(s: number) {
        this._size = Math.max(s, 40);
        this.buildLayout();
    }

    get size(): number {
        return this._size;
    }

    set label(text: string) {
        this._knobLabel = text;
        if (this._labelEl) this._labelEl.text(text);
    }

    get label(): string {
        return this._knobLabel;
    }

    onChange(callback: (event: EventArgs) => void): void {
        this.attach(callback);
    }

    // ── Rendering ──────────────────────────────────────────────────────────

    render(): void {
        this._group = (this.parent as Window).window.group();
        this.outerSvg = this._group;

        // Global listeners added once so drag stays smooth when mouse leaves the knob
        document.addEventListener('mousemove', (e: MouseEvent) => {
            if (!this._isDragging) return;
            this.handleDrag(e);
        });
        document.addEventListener('mouseup', () => {
            this._isDragging = false;
        });

        this.buildLayout();
    }

    private buildLayout(): void {
        this._group.clear();

        const s = this._size;
        const cx = s / 2;
        const cy = s / 2;
        const outerR = s / 2 - 3;
        const sw = Math.max(6, Math.round(s * 0.13));   // arc stroke width
        const arcR = outerR - sw / 2;

        // ── Background circle ──────────────────────────────────────────────
        this._bgCircle = this._group.circle(s)
            .fill(this.COLOR_BG)
            .stroke({ color: this.COLOR_BORDER, width: 2 });

        // ── Track arc (full 270°, light blue) ─────────────────────────────
        this._group.path(this.arcPath(cx, cy, arcR, this.START, this.START + this.RANGE))
            .fill("none")
            .stroke({ color: this.COLOR_TRACK, width: sw, linecap: "round" });

        // ── Fill arc (value → angle) ───────────────────────────────────────
        this._fillPath = this._group
            .path(this.fillArcPath(cx, cy, arcR))
            .fill("none")
            .stroke({
                color: this._value >= 100 ? this.COLOR_FILL_MAX : this.COLOR_FILL,
                width: sw,
                linecap: "round"
            });

        // ── Indicator dot at the arc tip ──────────────────────────────────
        const dot = this.polarToCartesian(cx, cy, arcR, this.valueToAngle(this._value));
        this._indicator = this._group.circle(sw * 0.8)
            .fill(this.COLOR_BG)
            .stroke({ color: this.COLOR_BORDER, width: 1.5 })
            .cx(dot.x).cy(dot.y)
            .attr('pointer-events', 'none');

        // ── Value text (center) ────────────────────────────────────────────
        this._valueText = this._group
            .text(`${Math.round(this._value)}`)
            .font({ family: "Arial, sans-serif", size: Math.round(s * 0.24), weight: "700", anchor: "middle" })
            .fill(this.COLOR_TEXT)
            .attr({ "pointer-events": "none" });
        this._valueText.cx(cx).cy(cy - s * 0.06);

        // ── "%" suffix ────────────────────────────────────────────────────
        this._suffixText = this._group.text("%")
            .font({ family: "Arial, sans-serif", size: Math.round(s * 0.13), weight: "500", anchor: "middle" })
            .attr({ "pointer-events": "none" })
            .fill(this.COLOR_TEXT)
        this._suffixText.cx(cx).cy(cy + s * 0.18);

        // ── Label below circle ────────────────────────────────────────────
        this._labelEl = this._group.text(this._knobLabel)
            .font({ family: "Arial, sans-serif", size: 13, weight: "500", anchor: "middle" })
            .attr({ "pointer-events": "none" })
            .fill(this.COLOR_TEXT)
        this._labelEl.cx(cx).cy(s + 14);

        // ── Transparent hit circle ────────────────────────────────────────
        const hit = this._group.circle(s).opacity(0);
        hit.mousedown((e: MouseEvent) => {
            e.preventDefault();
            this._isDragging = true;
        });
        hit.mouseover(() => this._bgCircle.stroke({ color: this.COLOR_FILL, width: 2.5 }));
        hit.mouseout(() => this._bgCircle.stroke({ color: this.COLOR_BORDER, width: 2 }));

        this.width = s;
        this.height = s + 24;
    }

    private currentCenter(): { cx: number; cy: number } {
        return { cx: +this._bgCircle.cx(), cy: +this._bgCircle.cy() };
    }

    // ── Arc math ───────────────────────────────────────────────────────────

    private polarToCartesian(cx: number, cy: number, r: number, deg: number): { x: number; y: number } {
        const rad = (deg * Math.PI) / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    }

    /** SVG arc path from startDeg to endDeg, clockwise (sweep=1). */
    private arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
        const sweep = endDeg - startDeg;
        if (sweep <= 0) {
            const p = this.polarToCartesian(cx, cy, r, startDeg);
            return `M ${p.x} ${p.y}`;
        }
        const s = this.polarToCartesian(cx, cy, r, startDeg);
        const e = this.polarToCartesian(cx, cy, r, endDeg);
        const large = sweep > 180 ? 1 : 0;
        return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
    }

    private fillArcPath(cx: number, cy: number, r: number): string {
        if (this._value <= 0) {
            const p = this.polarToCartesian(cx, cy, r, this.START);
            return `M ${p.x} ${p.y}`;
        }
        return this.arcPath(cx, cy, r, this.START, this.valueToAngle(this._value));
    }

    private valueToAngle(v: number): number {
        return this.START + (v / 100) * this.RANGE;
    }

    // ── Drag interaction ───────────────────────────────────────────────────

    private mouseAngle(e: MouseEvent): number {
        const rect = (this._group.node as Element).getBoundingClientRect();
        const lx = e.clientX - rect.left - this._size / 2;
        const ly = e.clientY - rect.top - this._size / 2;
        let angle = (Math.atan2(ly, lx) * 180) / Math.PI;
        if (angle < 0) angle += 360;
        return angle;
    }

    private handleDrag(e: MouseEvent): void {
        let rel = this.mouseAngle(e) - this.START;
        if (rel < 0) rel += 360;

        // Dead zone: beyond RANGE snap to nearest endpoint
        if (rel > this.RANGE) {
            rel = rel < this.RANGE + (360 - this.RANGE) / 2 ? this.RANGE : 0;
        }

        const prev = this._value;
        this._value = Math.max(0, Math.min(100, (rel / this.RANGE) * 100));
        this.updateVisuals();

        if (Math.abs(this._value - prev) > 0.05) {
            this.raise(new EventArgs(this, null, { value: Math.round(this._value) }));
        }
    }

    // ── Visual update ──────────────────────────────────────────────────────

    private updateVisuals(): void {
        if (!this._fillPath || !this._valueText || !this._indicator || !this._bgCircle || !this._suffixText || !this._labelEl) return;

        const s = this._size;
        const { cx, cy } = this.currentCenter();
        const arcR = (s / 2 - 3) - Math.max(6, Math.round(s * 0.13)) / 2;

        this._fillPath
            .plot(this.fillArcPath(cx, cy, arcR))
            .stroke({
                color: this._value >= 100 ? this.COLOR_FILL_MAX : this.COLOR_FILL,
                width: Math.max(6, Math.round(s * 0.13)),
                linecap: "round"
            });

        const dot = this.polarToCartesian(cx, cy, arcR, this.valueToAngle(this._value));
        this._indicator.cx(dot.x).cy(dot.y);

        this._valueText.text(`${Math.round(this._value)}`);
        this._valueText.cx(cx).cy(cy - s * 0.06);
        this._suffixText.cx(cx).cy(cy + s * 0.18);
        this._labelEl.cx(cx).cy(+this._bgCircle.y() + s + 14);
    }

    override update(): void {
        if (this._fillPath) this.updateVisuals();
        super.update();
    }

    // ── State machine (no visual state changes — interaction is drag-based) ─

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
        const step = keyEvent.shiftKey ? 10 : 5;
        let next = this._value;
        if (keyEvent.key === "ArrowRight" || keyEvent.key === "ArrowUp") next = Math.min(100, this._value + step);
        else if (keyEvent.key === "ArrowLeft" || keyEvent.key === "ArrowDown") next = Math.max(0, this._value - step);
        else return;
        if (next !== this._value) {
            this._value = next;
            this.updateVisuals();
            this.raise(new EventArgs(this, null, { value: Math.round(this._value) }));
        }
    }
}

export { Knob };
