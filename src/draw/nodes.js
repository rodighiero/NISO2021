import { BitmapText, Circle, Graphics, Point, Texture, Sprite, Loader, Rectangle } from 'pixi.js'

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

    const loader = Loader.shared

    s.nodes.forEach(node => {
        if (node.image)
            loader.add('index_' + node.index, node.image)
    })


    s.nodes.forEach(node => {

        const side = 20
        const thickness = 5

        if (node.image) {

            loader.load(function (loader, resources) {
                const texture = resources['index_' + node.index].texture
                const width = texture.width
                const height = texture.height
                const circle = new Graphics()
                const options = {
                    texture: texture
                }
                circle.beginTextureFill(options)
                circle.lineStyle(thickness, '0xFFFFFF', 1)
                circle.drawCircle(width / 2, width / 2, width / 2)
                circle.endFill()
                circle.pivot.set(width / 2, width / 2); 
                circle.width = side
                circle.height = side
                circle.position = new Point(node.x, node.y)
                stage.addChild(circle)
            })

        } else {
            const circle = new Graphics()
            circle.lineStyle(.5, '0xFFFFFF', 1)
            circle.beginFill(color, 1)
            circle.drawCircle(0, 0, side / 2)
            circle.endFill()
            circle.position = new Point(node.x, node.y)
            stage.addChild(circle)
        }

        // node.circle.hitArea = new Circle(0, 0, s.distance)
        // node.circle.interactive = true


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