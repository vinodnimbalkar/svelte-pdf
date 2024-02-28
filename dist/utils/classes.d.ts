export default function utils(color: any, defaultDepth?: number): {
    bg: (depth: any) => string;
    border: (depth: any) => string;
    txt: (depth: any) => string;
    caret: (depth: any) => string;
};
export function filterProps(reserved: any, props: any): {};
export class ClassBuilder {
    constructor(classes: any, defaultClasses: any);
    defaults: any;
    classes: any;
    flush(): this;
    extend(...fns: any[]): this;
    get(): any;
    replace(classes: any, cond?: boolean): this;
    remove(classes: any, cond?: boolean): this;
    add(className: any, cond: boolean | undefined, defaultValue: any): this;
}
