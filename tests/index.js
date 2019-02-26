const { getState, send } = require('../index')
const { mergeAll } = require('ramda')

const country1 = { country: 'canada' }
const city1 = { city: 'montreal' }
const street1 = { street: 'stanley' }
const country2 = { country: 'usa' }
const city2 = { city: 'new york' }
const street2 = { street: 'wall' }

const descript = mergeAll([country1, city1, street1])
const nyse = mergeAll([country2, city2, street2])
const jmsb = mergeAll([country1, city1, { street: 'guy' }])
const stanleySomewhere = street1


send(descript,
    {
        type: 'WHERE_I_LIVE',
        story: 'I live on stanley st montreal, canada'
    }
)
send(nyse,
    {
        type: 'WHERE_I_LIVE',
        story: 'I live on wall st, NY, USA'
    }
)
send(stanleySomewhere,
    {
        type: 'WHERE_I_LIVE',
        story: 'I\'m on a street named Stanley'
    }
)

send({ city: 'montreal' },
    {
        type: 'WHERE_I_LIVE',
        story: 'I\'m in montreal'
    })


send(descript, { type: 'VISITOR' })
send(descript, { type: 'VISITOR' })
send({ city: 'montreal' }, { type: 'VISITOR' })
send({ street: 'stanley' }, { type: 'VISITOR' })



const myStoryReducer = (state = [], { type, story }) => type == 'WHERE_I_LIVE' ? state.concat(story) : state
const countVisitorsReducer = (state = 0, { type }) => type == 'VISITOR' ? state + 1 : state

const locReducers = {
    visitors: countVisitorsReducer,
    story: myStoryReducer
}

const nyseState = getState(nyse, locReducers)
console.log('nyseState', nyseState)

const descriptState = getState(descript, locReducers)
console.log('descriptState', descriptState)

const stanleySomewhereState = getState(stanleySomewhere, locReducers)
console.log('stanleySomewhereState', stanleySomewhereState)

const jmsbState = getState(jmsb, locReducers)
console.log('jmsbState', jmsbState)