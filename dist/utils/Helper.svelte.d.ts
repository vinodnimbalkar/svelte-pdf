export function onPrint(url: string): void;
export function calcRT(paraBody: string): number | undefined;
export function getPageText(pageNum: Integer, PDFDocumentInstance: PDFDocument): Promise<any>;
export function savePDF(fileUrl: string, data: string, name?: string): Promise<void>;
/** @typedef {typeof __propDef.props}  HelperProps */
/** @typedef {typeof __propDef.events}  HelperEvents */
/** @typedef {typeof __propDef.slots}  HelperSlots */
export default class Helper extends SvelteComponent<{
    [x: string]: never;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type HelperProps = typeof __propDef.props;
export type HelperEvents = typeof __propDef.events;
export type HelperSlots = typeof __propDef.slots;
import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: never;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
