const skmeans = require('skmeans');
const fs = require('fs')
const natural = require('natural')
const sw = require('stopword')
const stringify = require('json-stringify-pretty-compact')

const reuse = require('d3-force-reuse')
const d3 = require('d3')
const { cluster } = require('d3')

// Time counter

const start = Date.now()

// Load JSON

fs.readFile(__dirname + '/data/speakers.json', (err, json) => {
    if (err) throw err
    analysis(JSON.parse(json))
})

// Text analysis

const analysis = nodes => {

    // Tokenizer

    // const tokenizer = new natural.WordTokenizer()
    const tokenizer = new natural.RegexpTokenizer({ pattern: /([A-zÀ-ÿ-]+|[0-9._]+|.|!|\?|\[|\]|'|'|:|;|,)/i })


    nodes.forEach((node, i) => {
        console.log('Tokenizing author #', i)
        node.biography = node.biography ? node.biography : ''
        node.tokens = tokenizer.tokenize(node.biography.toLowerCase())
        node.tokens = node.tokens.filter(token => token.length > 4 && token.length < 20)
        node.tokens = node.tokens.filter(token => !token.includes('-'))
        node.tokens = node.tokens.filter(token => !token.includes('['))
        node.tokens = node.tokens.filter(token => !token.includes(']'))
        delete node.biography
    })

    // Singularize

    const inflector = new natural.NounInflector()
    const safeList = ['humanities']

    nodes.forEach((node, i) => {
        console.log('Singularizing author #', i)
        node.tokens = node.tokens.map(t => {
            const length = t.length
            if ((safeList.includes(t)) || /us$/.test(t) || /is$/.test(t))
                return t
            else
                return inflector.singularize(t)
        })
    })

    // Cleaning

    const stopWords = ['http', 'better', 'serve', 'year', 'across', 'according', 'prior', 'within', 'field', 'including', 'joining', 'served', 'hold', 'working', 'conference', 'begin']
    
    nodes.forEach((node, i) => {
        console.log('Cleaning author #', i)
        node.tokens = sw.removeStopwords(node.tokens, sw.en.concat(stopWords).concat(node.name.toLowerCase().split(' ')))
        // .filter(token => token.length > 4)
        // .filter(token => !parseInt(token))
    })

    // return

    // TF-IDF

    const frequency = new natural.TfIdf()

    nodes.forEach((node, i) => {
        console.log('Frequency for author #', i)
        frequency.addDocument(node.tokens)
    })

    // Set Tokens and Relevancy

    const max = Infinity

    nodes.forEach((node, i) => {

        console.log('Reducing for author #', i)

        node.tokens = frequency.listTerms(i)
            .slice(0, max)
            .reduce((tokens, token) => {
                tokens[token.term] = Math.round(token.tfidf)
                return tokens
            }, {})

        if (Object.values(node.tokens).length > 0)
            node.relevancy = Object.values(node.tokens).reduce((a, b) => a + b)
        else
            node.relevancy = 1

    })

    // Set links

    const links = []
    const minCommonTokens = 1

    for (let i1 = 0; i1 < nodes.length; i1++) {

        const n1 = nodes[i1]
        const t1 = Object.keys(n1.tokens)

        for (let i2 = i1 + 1; i2 < nodes.length; i2++) {

            const n2 = nodes[i2]
            const t2 = Object.keys(n2.tokens)

            const tokens = t1.filter(term => t2.includes(term))

            if (tokens.length <= minCommonTokens)
                continue

            console.log('|', tokens.length, 'terms between', n1.name, 'and', n2.name)

            let link

            tokens.forEach(token => {

                if (!link) link = links.find(link => link.source === n1.name && link.target === n2.name)

                const value = n1.tokens[token] + n2.tokens[token]
                // console.log(value)

                if (link) {
                    link.value += value
                    link.tokens[token] = value
                } else {
                    // console.log(n1.name)
                    const link = {
                        source: n1.name,
                        target: n2.name,
                        value: value,
                        tokens: {
                            [token]: value,
                        }
                    }

                    links.push(link)

                }
            })

            const tokensSorted = Object.entries(link.tokens)
                .sort((a, b) => b[1] - a[1])

            link.tokens = Object.fromEntries(tokensSorted)

        }

    }


    // Sort links by value

    const compare = (a, b) => {
        valueA = Object.values(a.tokens)[0]
        valueB = Object.values(b.tokens)[0]
        if (valueA > valueB) return -1
        if (valueB > valueA) return 1
        return 0
    }

    links.sort(compare)


    // Normalization

    const maxLinkValue = links.reduce((max, link) => max > link.value ? max : link.value, 0)
    const minLinkValue = links.reduce((min, link) => min < link.value ? min : link.value, Infinity)
    const maxCommonTokens = links.reduce((max, link) => max > link.tokens.length ? max : link.tokens.length, 0)
    links.forEach(link => link.value = link.value / maxLinkValue)


    // Simulation

    console.log('\nSimulation starts\n')

    const simulation = d3.forceSimulation()

    simulation
        .force('charge', reuse.forceManyBodyReuse()
            .strength(10)
            .distanceMax(30)
        )
        .force('collide', d3.forceCollide()
            .radius(30)
            .strength(.5)
            .iterations(5)
        )
        .force('center', d3.forceCenter(0, 0))

    simulation
        .nodes(nodes)
        .force('link', d3.forceLink()
            .id(d => d.name)
            .strength(d => d.value)
        )
        .force('link').links(links)

    simulation
        .on('end', () => {
            afterSimulation(nodes, links)
        })

    const afterSimulation = (nodes, links) => {

        // K-Means

        console.log('Clustering')

        const clustering = skmeans(nodes.map(n => [n.x, n.y]), 30)

        nodes.forEach((node, i) => {
            node.cluster = clustering.idxs[i]
        })

        // Triplets

        console.log('Triplets')

        const distance = 30
        const gap = 15
        const min = Math.pow(distance * 2 - gap, 2)
        const max = Math.pow(distance * 2 + gap, 2)
        const proximity = (a, b) => {
            const deltaX = Math.abs(a.x - b.x)
            const deltaY = Math.abs(a.y - b.y)
            const distance = Math.pow(deltaX, 2) + Math.pow(deltaY, 2)
            return (min < distance && distance < max)
        }

        let counter = 0
        let triplets = []

        for (let i1 = 0; i1 < nodes.length; i1++) {

            const n1 = nodes[i1]

            for (let i2 = i1 + 1; i2 < nodes.length; i2++) {

                const n2 = nodes[i2]

                if (!proximity(n1, n2)) continue

                const l1 = Object.keys(n1.tokens)
                const l2 = Object.keys(n2.tokens)
                const l12 = l1.filter(t => l2.includes(t))
                if (l12.length == 0) continue

                for (let i3 = i2 + 1; i3 < nodes.length; i3++) {

                    const n3 = nodes[i3]

                    if (!proximity(n2, n3)) continue
                    if (!proximity(n3, n1)) continue

                    const l3 = Object.keys(n3.tokens)
                    let list = l12.filter(t => l3.includes(t))
                    if (list.length == 0) continue

                    const x = (n1.x + n2.x + n3.x) / 3
                    const y = (n1.y + n2.y + n3.y) / 3

                    list = list.map(token => {
                        const v1 = (n1.tokens[token])
                        const v2 = (n2.tokens[token])
                        const v3 = (n3.tokens[token])
                        return [token, v1 + v2 + v3]
                    }).sort((a, b) => b[1] - a[1])

                    triplets.push({
                        index: triplets.length,
                        position: [Math.round(x), Math.round(y)],
                        tokens: list
                    })

                    counter += 1

                }
            }
        }

        // Sort triplets by first value

        const compare = (a, b) => {
            if (a.tokens[0][1] > b.tokens[0][1]) return -1
            if (b.tokens[0][1] > a.tokens[0][1]) return 1
            return 0
        }

        triplets.sort(compare)


        writing(nodes, links, triplets)

    }

    const writing = (nodes, links, triplets) => {

        // Clean links and nodes

        function roundToTwo(num) {
            return +(Math.round(num + "e+2") + "e-2");
        }

        // links = links.reduce((links, link) => {
        //     links.push({
        //         // index: link.index,
        //         value: roundToTwo(link.value),
        //         source: { x: Math.round(link.source.x), y: Math.round(link.source.y) },
        //         target: { x: Math.round(link.target.x), y: Math.round(link.target.y) },
        //         // tokens: link.tokens,
        //     })
        //     return links
        // }, [])

        nodes.forEach(node => {
            node.x = Math.round(node.x)
            node.y = Math.round(node.y)
            delete node.vx
            delete node.vy
        })

        // Writing files

        fs.writeFile('./src/data/nodes.json', JSON.stringify(nodes), err => { if (err) throw err })
        fs.writeFile('./data/nodes.json', stringify(nodes, { maxLength: 200 }), err => { if (err) throw err })
        fs.writeFile('./src/data/links.json', JSON.stringify(links), err => { if (err) throw err })
        fs.writeFile('./data/links.json', stringify(links, { maxLength: 200 }), err => { if (err) throw err })
        fs.writeFile('./src/data/triplets.json', JSON.stringify(triplets), err => { if (err) throw err })
        fs.writeFile('./data/triplets.json', stringify(triplets, { maxLength: 200 }), err => { if (err) throw err })

        // Final report

        const format = x => JSON.stringify(x).length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        console.log('\n')
        console.log(`     nodes.json : ${format(nodes)}kb for ${nodes.length} authors`)
        console.log(`     links.json : ${format(links)}kb for ${links.length} links`)
        console.log(`   maxLinkValue : ${maxLinkValue}`)
        console.log(`   minLinkValue : ${minLinkValue}`)

        // Time end

        const end = Date.now()
        const d = new Date(end - start)
        console.log(`\nTime computed ${d.getUTCHours()}h ${d.getUTCMinutes()}m ${d.getUTCSeconds()}s ${d.getUTCMilliseconds()}ms\n`)

    }

}

