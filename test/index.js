const { expect } = require('chai')


const { mergeAll } = require('ramda')
const { createLedger } = require('../index')

const { send, receive, subscribe } = createLedger()

const country1 = { country: 'canada' }
const city1 = { city: 'montreal' }
const street1 = { street: 'stanley' }
const country2 = { country: 'usa' }
const city2 = { city: 'new york' }
const street2 = { street: 'wall' }

const descriptMtl = mergeAll([country1, city1, street1])
const descriptNy = mergeAll([country1, city2, street1])
const nyse = mergeAll([country2, city2, street2])
const jmsb = mergeAll([country1, city1, { street: 'guy' }])
const stanleySomewhere = street1
const descript = mergeAll([country1, street1])

const myStoryReducer = (state = [], { content: { type, story } }) => type == 'WHERE_I_AM' ? state.concat(story) : state
const countVisitorsReducer = (state = 0, { content: { type } }) => type == 'VISITOR' ? state + 1 : state

const locReducers = {
    visitors: countVisitorsReducer,
    story: myStoryReducer
}

send(descriptMtl,
    {
        type: 'WHERE_I_AM',
        story: 'I live on Stanley St, Montreal, Canada'
    }
)
send(nyse,
    {
        type: 'WHERE_I_AM',
        story: 'I\'m on on Wall St, NY, USA'
    }
)
send(stanleySomewhere,
    {
        type: 'WHERE_I_AM',
        story: 'I\'m on a street named Stanley'
    }
)

send({ city: 'montreal' },
    {
        type: 'WHERE_I_AM',
        story: 'I\'m in montreal'
    })


send(descript, { type: 'VISITOR' })
send(descriptMtl, { type: 'VISITOR' })
send({ city: 'montreal' }, { type: 'VISITOR' })
send({ street: 'stanley' }, { type: 'VISITOR' })





const nyseState = receive(nyse, locReducers)
const descriptReducers = locReducers
const descriptState = receive(descript, descriptReducers)
const descriptMtlState = receive(descriptMtl, descriptReducers)
const descriptNyState = receive(descriptNy, descriptReducers)

const stanleySomewhereState = receive(stanleySomewhere, locReducers)

const jmsbState = receive(jmsb, locReducers)

describe('trux state derivation', () => {
    it('state for reducers exists', () => {
        expect(Object.keys(descriptState)).to.have.members(Object.keys(descriptReducers))
    })
    it('full address match', () => {
        expect(descriptMtlState.story).to.include('I live on Stanley St, Montreal, Canada')
    })
    it('subset of address match', () => {
        expect(descriptState.story).to.include('I\'m on a street named Stanley')
    })
    it('subset has less matches than superset', () => {
        expect(descriptState.visitors).to.be.above(stanleySomewhereState.visitors)
    })

})

describe('subscriber receipt', () => {
    
    let sub;

    subscribe({ street: 'random street' }, locReducers, () => console.log('sent trans to random street'))

    it('subscriber notified only when addressed', (done) => {
        const oneMoreVisitor = jmsbState.visitors + 1
        sub = subscribe(jmsb, locReducers, ({ visitors }) => {
            visitors == oneMoreVisitor ? done() : done(new Error('subscriber not notified'))
        })

        send({ street: 'stanley' }, { type: 'VISITOR' })
        send({ street: 'guy' }, { type: 'VISITOR' })
    })

    it('unsubscriber not notified', (done) => {
        sub.unSubscribe()
        send({ street: 'guy' }, { type: 'VISITOR' })
        done()
    })
})