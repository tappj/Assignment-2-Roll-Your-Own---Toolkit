// importing local code, code we have written
import {Window, Widget, RoleType} from "../core/ui";
// importing code from SVG.js library
import {Rect} from "../core/ui";

class Template extends Widget{
    private _rect: Rect;
    private defaultWidth: number = 80;
    private defaultHeight: number = 30;

    constructor(parent:Window){
        super(parent);
        // set defaults
        this.height = this.defaultHeight;
        this.width = this.defaultWidth;
        // set Aria role
        this.role = RoleType.none;
        //TODO:
        // set default state!

        // render widget
        this.render();
    }

    render(): void {
        this._group = (this.parent as Window).window.group();
        // Set the outer svg element 
        this.outerSvg = this._group;
        // Add a transparent rect on top of text to prevent selection cursor
        this._group.rect(this.width, this.height).opacity(0).attr('id', 0);

        this.backcolor = "silver";
        // register objects that should receive event notifications.
        // for this widget, we want to know when the group or rect objects
        // receive events
        this.registerEvent(this.outerSvg);
    }

    //TODO: give the states something to do! Use these methods to control the visual appearance of your
    //widget
    idleupState(): void {
        throw new Error("Method not implemented.");
    }
    idledownState(): void {
        throw new Error("Method not implemented.");
    }
    pressedState(): void {
        throw new Error("Method not implemented.");
    }
    pressReleaseState(): void {
        throw new Error("Method not implemented.");
    }
    hoverState(): void {
        throw new Error("Method not implemented.");
    }
    hoverPressedState(): void {
        throw new Error("Method not implemented.");
    }
    pressedoutState(): void {
        throw new Error("Method not implemented.");
    }
    moveState(): void {
        throw new Error("Method not implemented.");
    }
    keyupState(): void {
        throw new Error("Method not implemented.");
    }
}

export {Template}