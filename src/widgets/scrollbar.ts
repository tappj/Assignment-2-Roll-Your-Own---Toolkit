import { IdleUpWidgetState } from "../core/ui";
import { Window, Widget, RoleType, EventArgs } from "../core/ui";
import { Rect } from "../core/ui";

class ScrollBar extends Widget {
    private _barHeight: number = 200;
    private _barWidth: number = 24;
    private _buttonSize: number = 24;
    private _thumbHeight: number = 40;
    private _thumbPos: number = 0;       // px from top of track
    private readonly GAP = 2;            // visual gap between buttons and track

    private _trackRect!: Rect;
    private _thumb!: Rect;
    private _upBg!: Rect;
    private _downBg!: Rect;

    private _isDragging: boolean = false;
    private _dragStartY: number = 0;
    private _dragStartThumbPos: number = 0;

    // Theme colors (consistent with Button / CheckBox / RadioGroup)
    private readonly COLOR_TRACK        = "#E3F2FD";
    private readonly COLOR_TRACK_BORDER = "#BBDEFB";
    private readonly COLOR_THUMB_IDLE   = "#2196F3";
    private readonly COLOR_THUMB_HOVER  = "#42A5F5";
    private readonly COLOR_THUMB_PRESS  = "#0D47A1";
    private readonly COLOR_BTN_IDLE     = "#2196F3";
    private readonly COLOR_BTN_HOVER    = "#42A5F5";
    private readonly COLOR_BTN_PRESS    = "#0D47A1";
    private readonly COLOR_BORDER       = "#1565C0";

    constructor(parent: Window) {
        super(parent);
        this.role = RoleType.scrollbar;
        this.render();
        this.setState(new IdleUpWidgetState());
        this.selectable = false;
        this.idleupState();
    }

    set barHeight(h: number) {
        const saved = this.thumbPosition;
        this._barHeight = Math.max(h, 2 * this._buttonSize + 2 * this.GAP + this._thumbHeight + 20);
        this.buildLayout();
        const range = this.trackHeight - this._thumbHeight;
        this._thumbPos = range > 0 ? Math.max(0, Math.min(Math.round(saved * range), range)) : 0;
        this.updateThumbVisual();
    }

    get barHeight(): number {
        return this._barHeight;
    }

    /** Normalized thumb position: 0 = top, 1 = bottom */
    get thumbPosition(): number {
        const range = this.trackHeight - this._thumbHeight;
        return range > 0 ? this._thumbPos / range : 0;
    }

    private get trackHeight(): number {
        return this._barHeight - 2 * this._buttonSize - 2 * this.GAP;
    }

    private get trackTop(): number {
        return this._buttonSize + this.GAP;
    }

    onScroll(callback: (event: EventArgs) => void): void {
        this.attach(callback);
    }

    render(): void {
        this._group = (this.parent as Window).window.group();
        this.outerSvg = this._group;

        // Global listeners added once for smooth drag across the whole document
        document.addEventListener('mousemove', (e: MouseEvent) => {
            if (!this._isDragging) return;
            const deltaY = e.clientY - this._dragStartY;
            const range = this.trackHeight - this._thumbHeight;
            const newPos = Math.max(0, Math.min(this._dragStartThumbPos + deltaY, range));
            if (newPos === this._thumbPos) return;
            const dir = newPos > this._thumbPos ? "down" : "up";
            this._thumbPos = newPos;
            this.updateThumbVisual();
            this.raise(new EventArgs(this, null, { position: this.thumbPosition, direction: dir }));
        });

        document.addEventListener('mouseup', () => {
            if (this._isDragging) {
                this._isDragging = false;
                if (this._thumb) this._thumb.fill(this.COLOR_THUMB_IDLE);
            }
        });

        this.buildLayout();
    }

    private buildLayout(): void {
        this._group.clear();

        const bw = this._barWidth;
        const bs = this._buttonSize;
        const trackH = this.trackHeight;
        const trackY = this.trackTop;
        const thumbX = 2;
        const thumbW = bw - 4;
        const mid = bw / 2;

        // ── Up button ──────────────────────────────────────
        this._upBg = this._group.rect(bw, bs).radius(4)
            .fill(this.COLOR_BTN_IDLE)
            .stroke({ color: this.COLOR_BORDER, width: 1 });
        this._group.polygon(`${mid},5 ${bw - 5},${bs - 5} 5,${bs - 5}`)
            .fill("white").attr('pointer-events', 'none');
        const upEvt = this._group.rect(bw, bs).opacity(0);
        this.wireButton(upEvt, this._upBg, -1);

        // ── Track ──────────────────────────────────────────
        this._trackRect = this._group.rect(bw, trackH).radius(2)
            .fill(this.COLOR_TRACK)
            .stroke({ color: this.COLOR_TRACK_BORDER, width: 1 })
            .move(0, trackY);

        // ── Thumb ──────────────────────────────────────────
        this._thumb = this._group.rect(thumbW, this._thumbHeight).radius(4)
            .fill(this.COLOR_THUMB_IDLE)
            .move(thumbX, trackY + this._thumbPos);

        this._thumb.mouseover(() => {
            if (!this._isDragging) this._thumb.fill(this.COLOR_THUMB_HOVER);
        });
        this._thumb.mouseout(() => {
            if (!this._isDragging) this._thumb.fill(this.COLOR_THUMB_IDLE);
        });
        this._thumb.mousedown((e: MouseEvent) => {
            e.preventDefault();
            this._isDragging = true;
            this._dragStartY = e.clientY;
            this._dragStartThumbPos = this._thumbPos;
            this._thumb.fill(this.COLOR_THUMB_PRESS);
        });

        // ── Down button ────────────────────────────────────
        const downY = this._barHeight - bs;
        this._downBg = this._group.rect(bw, bs).radius(4)
            .fill(this.COLOR_BTN_IDLE)
            .stroke({ color: this.COLOR_BORDER, width: 1 })
            .move(0, downY);
        this._group.polygon(`${mid},${downY + bs - 5} ${bw - 5},${downY + 5} 5,${downY + 5}`)
            .fill("white").attr('pointer-events', 'none');
        const downEvt = this._group.rect(bw, bs).opacity(0).move(0, downY);
        this.wireButton(downEvt, this._downBg, 1);

        // ── Track click: jump thumb to clicked position ────
        this._trackRect.mousedown((e: MouseEvent) => {
            const groupTop = (this._group.node as Element).getBoundingClientRect().top;
            const relY = e.clientY - groupTop - trackY;
            const range = trackH - this._thumbHeight;
            const newPos = Math.max(0, Math.min(relY - this._thumbHeight / 2, range));
            if (newPos === this._thumbPos) return;
            const dir = newPos > this._thumbPos ? "down" : "up";
            this._thumbPos = newPos;
            this.updateThumbVisual();
            this.raise(new EventArgs(this, null, { position: this.thumbPosition, direction: dir }));
        });

        this.width = bw;
        this.height = this._barHeight;
    }

    private wireButton(evtRect: any, bg: Rect, direction: -1 | 1): void {
        evtRect.mouseover(() => bg.fill(this.COLOR_BTN_HOVER));
        evtRect.mouseout(() => bg.fill(this.COLOR_BTN_IDLE));
        evtRect.mousedown((e: any) => { e.preventDefault(); bg.fill(this.COLOR_BTN_PRESS); });
        evtRect.mouseup(() => {
            bg.fill(this.COLOR_BTN_HOVER);
            this.scrollBy(direction);
        });
    }

    private scrollBy(direction: -1 | 1): void {
        const step = Math.round(this._thumbHeight * 0.4);
        const range = this.trackHeight - this._thumbHeight;
        const newPos = Math.max(0, Math.min(this._thumbPos + direction * step, range));
        if (newPos === this._thumbPos) return;
        this._thumbPos = newPos;
        this.updateThumbVisual();
        this.raise(new EventArgs(this, null, {
            position: this.thumbPosition,
            direction: direction > 0 ? "down" : "up"
        }));
    }

    private updateThumbVisual(): void {
        if (this._thumb && this._trackRect) {
            this._thumb.y(+this._trackRect.y() + this._thumbPos);
        }
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
        if (keyEvent.key === "ArrowDown") this.scrollBy(1);
        else if (keyEvent.key === "ArrowUp") this.scrollBy(-1);
    }
}

export { ScrollBar };
