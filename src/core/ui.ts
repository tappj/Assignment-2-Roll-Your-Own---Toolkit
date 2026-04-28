import { SVG, Svg, G, Container, Rect, Text, Box, Circle, Number, A } from '@svgdotjs/svg.js'

enum RoleType {
    button = "button",
    group = "group",
    heading = "heading",
    none = "none",
    scrollbar = "scrollbar",
    window = "window",
}

interface IAccessibility {
    set role(role: RoleType);
    get role(): RoleType;
}

interface WidgetState {
    /**
     * Handles the widget enter event.
     * 
     * @param component The widget being interacted with.
     */
    onEnter(component: Component): void;

    /**
     * Handles the widget leave event.
     * 
     * @param component The widget being interacted with.
     */
    onLeave(component: Component): void;

    /**
     * Handles the widget press event.
     * 
     * @param component The widget being interacted with.
     */
    onPress(component: Component): void;

    /**
     * Handles the widget release event.
     * 
     * @param component The widget being interacted with.
     */
    onRelease(component: Component): void;

    /**
     * Handles the mouse move within widget event.
     * 
     * @param component The widget being interacted with.
     */
    onMove(component: Component): void;

    /**
     * Handles the keyup event.
     * 
     * @param component The widget being interacted with.
     */
    onKeyup(component: Component): void;
}

class IdleUpWidgetState implements WidgetState {

    public onEnter(component: Component): void {
        if (component.parent.getState() instanceof IdleDownWidgetState){
            component.setState(new HoverPressedWidgetState());
            component.hoverPressedState();
        }else{
            component.setState(new HoverWidgetState());
            component.hoverState();
        }
    }

    public onLeave(component: Component): void { }

    public onPress(component: Component): void {
        component.setState(new IdleDownWidgetState());
        component.idledownState();
    }

    public onRelease(component: Component): void { }

    public onMove(component: Component): void {
    }
    public onKeyup(component: Component): void {
        component.keyupState();
    }
}

class IdleDownWidgetState implements WidgetState {

    public onEnter(component: Component): void { }
    public onLeave(component: Component): void { }
    public onPress(component: Component): void { }

    public onRelease(component: Component): void {
        component.setState(new IdleUpWidgetState());
        component.idleupState();
    }

    public onMove(component: Component): void {
        component.moveState();
    }
    public onKeyup(component: Component): void {
    }
}

class HoverWidgetState implements WidgetState {

    public onEnter(component: Component) {
    }

    public onLeave(component: Component) {
        component.setState(new IdleUpWidgetState());
        component.idleupState();
    }

    public onPress(component: Component) {
        component.setState(new PressedWidgetState());
        component.pressedState();
    }

    public onRelease(component: Component) {
    }

    public onMove(component: Component): void { }
    public onKeyup(component: Component): void {
    }
}

class HoverPressedWidgetState implements WidgetState {

    public onEnter(component: Component) { }

    public onLeave(component: Component) {
        component.setState(new IdleUpWidgetState());
        component.idleupState();
    }

    public onPress(component: Component) { }

    public onRelease(component: Component) {
        component.setState(new HoverWidgetState());
        component.hoverState();
    }

    public onMove(component: Component): void { }
    public onKeyup(component: Component): void {
    }
}

class PressedWidgetState implements WidgetState {

    public onEnter(component: Component) {
    }

    public onLeave(component: Component) {
        component.setState(new PressedOutWidgetState());
        component.pressedoutState();
    }

    public onPress(component: Component) {
    }

    public onRelease(component: Component) {
        component.setState(new HoverWidgetState());
        component.pressReleaseState();
    }

    public onMove(component: Component): void {
        if (component.isDraggable){
            component.setState(new DragWindowState());
            component.moveState();
        }
    }
    public onKeyup(component: Component): void {

    }
}

class PressedOutWidgetState implements WidgetState {

    public onEnter(component: Component) {
        component.setState(new PressedWidgetState());
        component.pressedState();
    }

    public onLeave(component: Component) { }

    public onPress(component: Component) { }

    public onRelease(component: Component) {
        component.setState(new IdleUpWidgetState());
        component.idleupState();
    }

    public onMove(component: Component): void {
        if (component.isDraggable){
            component.moveState();
        }
    }
    public onKeyup(component: Component): void {
    }
}

class DragWindowState implements WidgetState {
    onEnter(component: Component): void { }

    onLeave(component: Component): void {
        component.setState(new PressedOutWidgetState())
        component.pressedoutState();
    }
    onPress(component: Component): void { }

    onRelease(component: Component): void {
        component.setState(new HoverWidgetState());
        component.hoverState();
    }
    onMove(component: Component): void {
        component.moveState();        
    }
    onKeyup(component: Component): void { }
}

class KeypressWidgetState implements WidgetState{
    onEnter(component: Component): void { }
    onLeave(component: Component): void { }
    onPress(component: Component): void { }
    onRelease(component: Component): void { }
    onMove(component: Component): void { }
    onKeyup(component: Component): void {
        component.keyupState();
    }
}
/**
 * A simple class for passing event arguments containing an object, event, and an optional item reference.
 */
class EventArgs {
    private _event: any;
    private _obj: Component;
    private _itemRef: any;

    /**
     * Creates a new EventArgs instance.
     * @param obj The object associated with the event.
     * @param event (Optional) The event that occurred.
     * @param itemRef (Optional) A reference to the item associated with the event.
     */
    constructor(obj: Component, event?: any, itemRef?: any) {
        this._event = event;
        this._obj = obj;
        if (typeof itemRef !== 'undefined') {
            this._itemRef = itemRef;
        }
    }

    /**
     * Gets the event associated with the EventArgs instance.
     */
    get event(): any {
        return this._event;
    }

    /**
     * Gets the object associated with the EventArgs instance.
     */
    get obj(): any {
        return this._obj;
    }

    /**
     * Gets the item reference associated with the EventArgs instance.
     */
    get itemRef(): any {
        return this._itemRef;
    }
}

abstract class Component implements IAccessibility {
    public tabindex: number = 0;
    private _handlers: { (event: EventArgs): void; }[] = [];
    protected _isselectable: boolean;
    protected state: WidgetState;

    public previousState: WidgetState | null = null;
    public parent: Component;
    public outerSvg: Container;

    /**
     * flag true if widget needs to support a draggable state e.g., scrollbar
     */
    public isDraggable: boolean = false;

    /* accessibility properties */
    protected _role: RoleType = null;

    constructor() {
    }
    /*
        Accessibility is opinionated. If role is not set, throw error.
    */
    set role(role: RoleType) {
        this._role = role;
    }
    get role(): RoleType {
        return this._role;
    }

    /*
        Selectable is a flag to control whether or not a widget gets selected on a browser drag action.
        Generally, this should be set to false for widgets like a button, but true for widgets that support
        text input
    */
    set selectable(val: boolean) {
        this._isselectable = val;
    }

    get selectable() {
        return this._isselectable;
    }

    attach(handler: { (event: EventArgs): void }): void {
        this._handlers.push(handler);
    }

    raise(event: EventArgs) {
        this._handlers.slice(0).forEach(h => h(event));
    }

    move(x: number, y: number): void {
        if (this.outerSvg != null)
            this.outerSvg.move(x, y);
        this.update();
    }
    public getState() {
        return this.state;
    }
    public setState(state: WidgetState) {
        this.previousState = this.state;
        this.state = state;
    }

    /* override to handle graphical updates in derived widgets */
    protected update(): void {
        if (this.role != null)
            this.outerSvg.attr({
                role: this.role,
                tabindex: this.tabindex
            });
        else
            throw new Error('Aria Role not implemented.');
    }

    abstract idleupState(): void;
    abstract idledownState(): void;
    abstract pressedState(): void;
    abstract pressReleaseState(): void;
    abstract hoverState(): void;
    abstract hoverPressedState(): void;
    abstract pressedoutState(): void;
    abstract moveState(): void;
    abstract keyupState(keyEvent?: KeyboardEvent): void;
}

class Window extends Component {
    private _window: Svg;
    private observers: Array<(state:WidgetState) => void>;
    public keyEvent: KeyboardEvent | null = null;

    constructor(height: any, width: any) {
        super();
        let body = SVG().addTo('body').size(width, height);
        let rect = body.rect(width, height).fill("white").stroke("black")
          .attr({ 'stroke-width': 3 });
        this._window = SVG().addTo(body);
        this.outerSvg = this._window;
        this.registerEvent(body);
        // set Aria role
        this.role = RoleType.window;
        // set default state
        this.setState(new IdleUpWidgetState());
        this.observers = [];
    }

    public addObserver(observer: (state:WidgetState) => void) {
        this.observers.push(observer);
    }

    public removeObserver(observer: (state:WidgetState) => void) {
        const index = this.observers.indexOf(observer);
        if (index >= 0) {
            this.observers.splice(index, 1);
        }
    }

    private notifyObservers(state:WidgetState) {
        for (const observer of this.observers) {
            observer(state);
        }
    }

    protected registerEvent(obj: any): void {
        SVG(window).on('keyup', (event)=>{
            this.keyEvent = event as KeyboardEvent
            this.state.onKeyup(this);
        }, window);
        obj.mouseup((event: any) => {
            this.state.onRelease(this);
        });
        obj.mousedown((event: any) => {
            if (!this.selectable) {
                // prevents draggable text selection
                event.preventDefault();
            }
            this.state.onPress(this);
        });
        obj.mouseover((event: any) => {
        });
        obj.mouseout((event: any) => {
        });
        obj.mousemove((event: any) => {
            this.state.onMove(this);
        });
    }

    get window(): Svg {
        return this._window;
    }

    idleupState(): void {
        this.notifyObservers(this.getState());
    }

    idledownState(): void {
        this.notifyObservers(this.getState());
    }

    moveState(): void {
        this.notifyObservers(this.getState());
    }
    
    keyupState(): void { 
        this.notifyObservers(new KeypressWidgetState());
    }

    //required to fulfill inheritance requirements
    //but not implemented for the window component
    pressedState(): void { }
    pressReleaseState(): void { }
    hoverState(): void { }
    hoverPressedState(): void { }
    pressedoutState(): void { }
}

abstract class Widget extends Component {
    protected width: number;
    protected height: number;
    protected _forecolor: string;
    protected _backcolor: string;
    protected _group: G;
    protected _base: Svg;
    protected rawEvent: any;

    constructor(parent: Window) {
        super();
        this.parent = parent;
        this.selectable = true;

        this.registerWindowEvents();
    }

    
    protected registerWindowEvents(): void{
        (this.parent as Window).addObserver((state) => {
            //We only want to modify widget state outside of the 
            //widget for state transitions that occur outside of
            //the widget's bounds.
            if (state instanceof IdleUpWidgetState &&
                this.getState() instanceof PressedOutWidgetState){
                this.setState(new IdleUpWidgetState())
            }
            if (state instanceof IdleDownWidgetState){
                this.idledownState();
            }
            if (state instanceof KeypressWidgetState){
                this.keyupState((this.parent as Window).keyEvent);
            }
            if (this.state instanceof DragWindowState){
                this.moveState();
            }
        });
    }

    /**
     * Registers SVG.js event handlers for the given object.
     * @param obj The object to register event handlers for.
     * @returns void.
     * 
     * @description registerEvent serves as a coupling method
     * between the SVG.js library event handlers and the state
     * and observer patterns used by the toolkit. To gain access
     * to the source event data simply assign the event parameter 
     * to the current object using this and the rawEvent property.
     */
    protected registerEvent(obj: any): void {
        obj.mouseup((event: any) => {
            this.state.onRelease(this);
        });
        obj.mousedown((event: any) => {
            if (!this.selectable) {
                // prevents draggable text selection
                event.preventDefault();
            }
            this.state.onPress(this);
        });
        obj.mouseover((event: any) => {
            this.state.onEnter(this);
        });
        obj.mouseout((event: any) => {
            this.state.onLeave(this);
        });
        obj.mousemove((event: any) => {
            //mouse move events generate positional information
            //about the cursor, likely needed for widgets that track
            //cursor movement.
            this.rawEvent = event;
            this.state.onMove(this);
        });
    }

    set backcolor(color: string) {
        this._backcolor = color;
        this.update();
    }

    get backcolor(): string {
        return this._backcolor;
    }

    set forecolor(color: string) {
        this._forecolor = color;
    }

    get forecolor(): string {
        return this._forecolor;
    }

    abstract render(): void;
}

// local
export { Window, Widget, Component, IAccessibility, RoleType, EventArgs }
export { IdleUpWidgetState, IdleDownWidgetState, HoverWidgetState, HoverPressedWidgetState, PressedWidgetState, PressedOutWidgetState, DragWindowState };
// from svg.js
export { SVG, Svg, G, Rect, Container, Text, Box, Circle, Number };