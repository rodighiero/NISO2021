import { Point, Sprite, Texture } from 'pixi.js'

export default () => {

    const size = 2000

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = size
    canvas.height = size

    const gradient = context.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size / 2
    )

    gradient.addColorStop(1, '#4198C7')
    gradient.addColorStop(0, '#317396')

    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)

    let texture = Texture.from(canvas)
    let sprite = new Sprite(texture)
    sprite.width = size
    sprite.height = size
    sprite.position = new Point(-size / 2, -size / 2)
    sprite.interactiveChildren = false

    s.viewport.addChild(sprite)

}