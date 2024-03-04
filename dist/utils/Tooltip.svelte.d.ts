/** @typedef {typeof __propDef.props}  TooltipProps */
/** @typedef {typeof __propDef.events}  TooltipEvents */
/** @typedef {typeof __propDef.slots}  TooltipSlots */
export default class Tooltip extends SvelteComponent<{
    class?: string | undefined;
    classes?: string | undefined;
    show?: boolean | undefined;
    timeout?: null | undefined;
}, {
    mouseenter: MouseEvent;
    mouseleave: MouseEvent;
    focus: FocusEvent;
    blur: FocusEvent;
} & {
    [evt: string]: CustomEvent<any>;
}, {
    'icon-button': {};
    default: {};
}> {
}
export type TooltipProps = typeof __propDef.props;
export type TooltipEvents = typeof __propDef.events;
export type TooltipSlots = typeof __propDef.slots;
import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        class?: string | undefined;
        classes?: string | undefined;
        show?: boolean | undefined;
        timeout?: null | undefined;
    };
    events: {
        mouseenter: MouseEvent;
        mouseleave: MouseEvent;
        focus: FocusEvent;
        blur: FocusEvent;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        'icon-button': {};
        default: {};
    };
};
export {};
