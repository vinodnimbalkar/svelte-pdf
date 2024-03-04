/** @typedef {typeof __propDef.props}  PdfViewerProps */
/** @typedef {typeof __propDef.events}  PdfViewerEvents */
/** @typedef {typeof __propDef.slots}  PdfViewerSlots */
export default class PdfViewer extends SvelteComponent<{
    data: any;
    url: any;
    scale?: number | undefined;
    mode?: string | undefined;
    pageNum?: number | undefined;
    flipTime?: number | undefined;
    showButtons?: string[] | undefined;
    showBorder?: boolean | undefined;
    totalPage?: number | undefined;
    downloadFileName?: string | undefined;
}, {
    keydown: KeyboardEvent;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type PdfViewerProps = typeof __propDef.props;
export type PdfViewerEvents = typeof __propDef.events;
export type PdfViewerSlots = typeof __propDef.slots;
import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        data: any;
        url: any;
        scale?: number | undefined;
        mode?: string | undefined;
        pageNum?: number | undefined;
        flipTime?: number | undefined;
        showButtons?: string[] | undefined;
        showBorder?: boolean | undefined;
        totalPage?: number | undefined;
        downloadFileName?: string | undefined;
    };
    events: {
        keydown: KeyboardEvent;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
