import { BitmapText, Circle, Graphics, Point, Texture, Sprite, Loader, Rectangle } from 'pixi.js'

import { onClick } from '../interface/click'

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

        // Set circle

        const side = 20
        const thickness = 5

        if (node.image) {

            loader.load(function (loader, resources) {
                const texture = resources['index_' + node.index].texture
                const width = texture.width
                const height = texture.height
                const options = { texture: texture }
                node.circle = new Graphics()
                node.circle.lineStyle(thickness, '0xFFFFFF', 1)
                node.circle.beginTextureFill(options)
                node.circle.drawCircle(width / 2, width / 2, width / 2)
                node.circle.endFill()
                node.circle.pivot.set(width / 2, width / 2);
                node.circle.width = side
                node.circle.height = side
                node.circle.position = new Point(node.x, node.y)
                node.circle.interactive = false
                stage.addChild(node.circle)
            })

        } else {
            node.circle = new Graphics()
            node.circle.lineStyle(.5, '0xFFFFFF', 1)
            node.circle.beginFill(color, 1)
            node.circle.drawCircle(0, 0, side / 2)
            node.circle.endFill()
            node.circle.position = new Point(node.x, node.y)
            node.circle.interactive = false
            stage.addChild(node.circle)
        }

        // Set hit area
        
        const circle = new Graphics()
        circle.beginFill(color, 0)
        circle.drawCircle(0, 0, side / 2)
        circle.endFill()
        circle.position = new Point(node.x, node.y)
        circle.interactive = true
        circle.hitArea = new Circle(0, 0, s.distance)
        // circle.mouseover = mouseData => mouseover(node)
        // circle.mouseout = mouseData => mouseout(node)
        circle.buttonMode = true
        // circle.on('pointerdown', onClick)
        circle.click = mouseData => onClick(node)
        stage.addChild(circle)

        // Set label

        const size = 4
        const scale = .15
        const [nA, nB] = splitInTwo(node.name)
        node.text = new BitmapText(`${nA}\n${nB}`, { fontName: 'Lato', fontSize: '21', fill: '0xFFFFFF', align: 'center' })
        node.text.scale.set(scale)
        node.text.position.set(node.x - node.text.width / 2, node.y + size + 7)
        stage.addChild(node.text)

    })

}