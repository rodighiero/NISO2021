import { Graphics } from 'pixi.js'

export default () => {

    const stage = new Graphics()
    stage.interactiveChildren = false
    stage.alpha = 1
    s.viewport.addChild(stage)

    const scale = .3

    s.links
        .filter(l => l.value > .3)
        .forEach(({ source, target, value }) => {

            stage.lineStyle(value * scale, 0x70c4f6)
            stage.moveTo(source.x, source.y)
            stage.lineTo(target.x, target.y)

        })

}