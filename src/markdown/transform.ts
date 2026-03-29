import type { ElementContent, Root, RootContent } from "hast"
import { addClass, quote, quoteWithChildren, type ElementType } from "./helper"



function transformHeading(element: ElementType): RootContent {
    const level = Number(element.tagName[1])

    if (level < 1 || level > 6) {
        return element
    }

    switch (level) {
        case 1:
            const wrapper = <ElementType> quote('<div class="md-h1-wrapper"></div>')

            addClass(element, 'md-h1')
            wrapper.children = [element, <ElementType> quote('<div class="md-h1-underline"></div>')]

            return wrapper
        default:
            addClass(element, `md-h${level}`)
            return element
    }   
}

function transformInlineCode(element: ElementType): RootContent {
    addClass(element, 'md-code')
    return element
}

function transformParagraph(element: ElementType): RootContent {
    addClass(element, 'md-p')

    element.children = <ElementType[]> element.children.map((child) => {
        if (child.type === 'element' && child.tagName === 'code') {
            return transformInlineCode(child as ElementType)
        }
        return child
    })

    return element
}

function transformLi(element: ElementType, number: number | null): RootContent {
    addClass(element, 'md-li')

    let subListHead: ElementContent | null = null

    const mainContentWrapper = quote('<div class="md-li-main"></div>')
    
    element.children.forEach((child) => {
        if (child.type === 'element') {
            if (child.tagName === 'ul') {
                const transformedChild = transformUl(child as ElementType)

                subListHead = quoteWithChildren('<div class="md-li-sublist"></div>', <ElementType> transformedChild)
            } else if (child.tagName === 'ol') {
                const transformedChild = transformOl(child as ElementType)

                subListHead = quoteWithChildren('<div class="md-li-sublist"></div>', <ElementType> transformedChild)
            }
        }

        mainContentWrapper.children.push(child)
    })

    element.children = [
        quoteWithChildren('<div class="md-li-content"></div>', 
            quote(number !== null ? `<div class="md-li-number">${number}. </div>` : '<div class="md-li-bullet">• </div>'),
            mainContentWrapper,
        )
    ]

    return element
}

function transformUl(element: ElementType): RootContent {
    addClass(element, 'md-ul')

    element.children = <ElementType[]> element.children.map((child) => {
        if (child.type === 'element' && child.tagName === 'li') {
            return transformLi(child as ElementType, null)
        }
        return child
    })

    return element
}

function transformOl(element: ElementType): RootContent {
    addClass(element, 'md-ol')
    
    let counter = 0
    element.children = <ElementType[]> element.children.map((child, index) => {
        if (child.type === 'element' && child.tagName === 'li') {
            return transformLi(child as ElementType, ++counter)
        }
        return child
    })

    return element
}

export default function transformMdElement() {
    return function(tree: Root) {
        tree.children = tree.children?.map((it) => {
            if (it.type !== 'element') {
                return it
            }

            if (it.tagName.startsWith('h')) {
                return transformHeading(it)
            } else if (it.tagName === 'p') {
                return transformParagraph(it)
            } else if (it.tagName === 'ul') {
                return transformUl(it)
            } else if (it.tagName === 'ol') {
                return transformOl(it)
            }

            return it
        })
    }
}