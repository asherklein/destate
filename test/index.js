const { expect } = require('chai')


const { mergeAll } = require('ramda')
const { getState, send } = require('../index')


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



const myStoryReducer = (state = [], { type, story }) => type == 'WHERE_I_AM' ? state.concat(story) : state
const countVisitorsReducer = (state = 0, { type }) => type == 'VISITOR' ? state + 1 : state

const locReducers = {
    visitors: countVisitorsReducer,
    story: myStoryReducer
}

const nyseState = getState(nyse, locReducers)
const descriptReducers = locReducers
const descriptState = getState(descript, descriptReducers)
const descriptMtlState = getState(descriptMtl, descriptReducers)
const descriptNyState = getState(descriptNy, descriptReducers)

const stanleySomewhereState = getState(stanleySomewhere, locReducers)

const jmsbState = getState(jmsb, locReducers)

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