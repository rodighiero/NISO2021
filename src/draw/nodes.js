import { BitmapText, Circle, Graphics, Point, Texture, Sprite } from 'pixi.js'

import { mouseover, mouseout } from '../interface/mouseover'

const splitInTwo = string => {
    const middle = Math.round(string.length / 2)
    for (let i = middle, j = middle; i < string.length || j >= 0; i++, j--) {
        if (string[i] === ' ') return [string.substring(0, i), string.substring(i + 1)]
        if (string[j] === ' ') return [string.substring(0, j), string.substring(j + 1)]
    }
    return [string, '']
}

const color = {
    on: 0xFEDD00,
    off: 0x333333,
}


export default () => {

    const stage = new Graphics()
    stage.alpha = 0
    stage.name = 'nodes'
    s.viewport.addChild(stage)


    s.nodes.forEach(node => {


        // Circle

        const side = 20

        if (node.image !== null || node.name.includes('Suver')) {


            let texture = Texture.from(node.image)
            let sprite = new Sprite(texture)
            sprite.width = side
            sprite.height = side
            sprite.position = new Point(node.x - side / 2, node.y - side / 2)
            sprite.interactiveChildren = false
            stage.addChild(sprite)

            let mask = new Graphics()
            stage.addChild(mask);
            mask.beginFill(color.off, 1)
            mask.drawCircle(0, 0, side / 2)
            mask.position = new Point(node.x, node.y)
            mask.interactiveChildren = false

            sprite.mask = mask

        } else {

            node.circle = new Graphics()
            node.circle.beginFill(color.off, 1)
            node.circle.drawCircle(0, 0, side / 2)
            node.circle.endFill()
            node.circle.tint = color.off
            node.circle.position = new Point(node.x, node.y)
            node.circle.hitArea = new Circle(0, 0, s.distance)
            node.circle.interactive = true

            stage.addChild(node.circle)

        }

        const size = 4


        // Label

        const scale = .15
        const [nA, nB] = splitInTwo(node.name)

        node.text = new BitmapText(
            `${nA}\n${nB}`,
            {
                fontName: 'Lato',
                fontSize: '21',
                fill: color.off,
                align: 'center',
            })

        node.text.scale.set(scale)
        node.text.position.set(node.x - node.text.width / 2, node.y + size + 7)

        stage.addChild(node.text)

        // Set information panel & set on circles

        // node.circle.mouseover = mouseData => {
        //     mouseover(node)
        //     s.nodes.filter(peer => node.peers.includes(peer.id))
        //         .forEach(node => {
        //             node.circle.tint = color.on
        //             node.text.tint = color.on
        //         })
        // }

        // Clean information panel & set off circles

        // node.circle.mouseout = mouseData => {
        //     mouseout(node)
        //     s.nodes.forEach(node => {
        //         node.circle.tint = color.off
        //         node.text.tint = color.off
        //     })
        // }

    })

}