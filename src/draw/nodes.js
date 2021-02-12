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

const color = '0x70c4f6'

export default () => {

    const stage = new Graphics()
    stage.alpha = 0
    stage.name = 'nodes'
    s.viewport.addChild(stage)


    s.nodes.forEach(node => {

        const side = 20
        const thickness = .5

        node.circle = new Graphics()
        node.circle.lineStyle(thickness, '0xFFFFFF', 1)
        node.circle.beginFill(color, 1)
        node.circle.drawCircle(0, 0, side / 2)
        node.circle.endFill()
        node.circle.position = new Point(node.x, node.y)
        stage.addChild(node.circle)

        if (node.image) {
            let texture = Texture.from(node.image)
            node.circle = new Sprite(texture)
            node.circle.width = side
            node.circle.height = side
            node.circle.position = new Point(node.x - side / 2, node.y - side / 2)
            stage.addChild(node.circle)

            let mask = new Graphics()
            mask.beginFill(color, 1)
            mask.drawCircle(0, 0, (side - thickness) / 2)
            mask.position = new Point(node.x, node.y)
            stage.addChild(mask);
            node.circle.mask = mask

        }

        node.circle.hitArea = new Circle(0, 0, s.distance)
        node.circle.interactive = true


        // Label

        const size = 4

        const scale = .15
        const [nA, nB] = splitInTwo(node.name)

        node.text = new BitmapText(
            `${nA}\n${nB}`,
            {
                fontName: 'Lato',
                fontSize: '21',
                fill: '0xFFFFFF',
                align: 'center',
            })

        node.text.scale.set(scale)
        node.text.position.set(node.x - node.text.width / 2, node.y + size + 7)

        stage.addChild(node.text)

        // Set information panel & set on circles

        // node.circle.mouseover = mouseData => {
        //     console.log(node.name)
        //     mouseover('hey', node)
        //     //     s.nodes.filter(peer => node.peers.includes(peer.id))
        //     //         .forEach(node => {
        //     //             node.circle.tint = color.on
        //     //             node.text.tint = color.on
        //     //         })
        // }

        // // Clean information panel & set off circles

        // node.circle.mouseout = mouseData => {
        //     mouseout(node)
        //     //     s.nodes.forEach(node => {
        //     //         node.circle.tint = color.off
        //     //         node.text.tint = color.off
        //     //     })
        // }

    })

}