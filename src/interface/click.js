import { select } from 'd3'

const space = '&nbsp;'
const line = '—————————————'
const block = '<span class="block"></span>'


export function onClick(node) {

    select('#focus').remove()

    const focus = select('body').append('div').attr('id', 'focus')

    // Heading

    focus.append('h2').html(node.name)

    if (node.panel)
        focus.append('h3').html(`Panel <a href="${node.panel}" target="_blank">${node.panel}</a>`)
    if (node.url)
        focus.append('h3').html(`URL <a href="${node.url}" target="_blank">${node.url}</a>`)

    // Tokens
    if (Object.entries(node.tokens).length > 0) {
        focus.append('p').html(space)
        focus.append('h3').html('Tokens by tf-idf')
        focus.append('p').html(line)
        Object.entries(node.tokens).slice(0, 20)
            .forEach(([key, value]) => {
                const blocks = block.repeat(value)
                focus.append('p').html(`${blocks} &nbsp; ${key}`)
            })
    }
}