import type { ElementContent, RootContent } from "hast"
import { fromHtml } from "hast-util-from-html"


export type ElementType = RootContent & { type: 'element' }

export function quote(str: string): ElementType {
    return <ElementType> fromHtml(str, { fragment: true }).children[0]
}

export function quoteWithChildren(str: string, ...children: (ElementContent | null)[]): ElementType {
    const element = quote(str)
    element.children = <ElementContent[]> children.filter(Boolean)

    return element
}

export function addClass(element: RootContent, className: string): void {
    if (element.type !== 'element') {
        return
    }

    element.properties['class'] = (element.properties['class'] || '') + ' ' + className
}
