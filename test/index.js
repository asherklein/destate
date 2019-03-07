const { expect } = require('chai')


const { mergeAll } = require('ramda')
const { createRulebook } = require('../index')

const { defineRule, query, subscribe } = createRulebook()

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

const myStoryReducer = (state = [], { body: { type, story } }) => type == 'WHERE_I_AM' ? state.concat(story) : state
const countVisitorsReducer = (state = 0, { body: { type } }) => type == 'VISITOR' ? state + 1 : state

const locReducers = {
    visitors: countVisitorsReducer,
    story: myStoryReducer
}

defineRule(descriptMtl,
    {
        type: 'WHERE_I_AM',
        story: 'I live on Stanley St, Montreal, Canada'
    }
)
defineRule(nyse,
    {
        type: 'WHERE_I_AM',
        story: 'I\'m on on Wall St, NY, USA'
    }
)
defineRule(stanleySomewhere,
    {
        type: 'WHERE_I_AM',
        story: 'I\'m on a street named Stanley'
    }
)

defineRule({ city: 'montreal' },
    {
        type: 'WHERE_I_AM',
        story: 'I\'m in montreal'
    })


defineRule(descript, { type: 'VISITOR' })
defineRule(descriptMtl, { type: 'VISITOR' })
defineRule({ city: 'montreal' }, { type: 'VISITOR' })
defineRule({ street: 'stanley' }, { type: 'VISITOR' })





const nyseState = query(nyse, locReducers)
const descriptReducers = locReducers
const descriptState = query(descript, descriptReducers)
const descriptMtlState = query(descriptMtl, descriptReducers)
const descriptNyState = query(descriptNy, descriptReducers)

const stanleySomewhereState = query(stanleySomewhere, locReducers)

const jmsbState = query(jmsb, locReducers)

describe('destate state derivation', () => {
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
        let ignoreFirst = true
        sub = subscribe(jmsb, locReducers, ({ visitors }) => {
            if(ignoreFirst) {
                ignoreFirst = false
                return
            }
            visitors == oneMoreVisitor ? done() : done(new Error('subscriber not notified'))
        })

        defineRule({ street: 'stanley' }, { type: 'VISITOR' })
        defineRule({ street: 'guy' }, { type: 'VISITOR' })
    })


    it('unsubscriber not notified', (done) => {
        sub.unSubscribe()
        defineRule({ street: 'guy' }, { type: 'VISITOR' })
        done()
    })

    it('subscriber can query', () => {
        const sub2 = subscribe(jmsb, locReducers, (state) => console.log('queryd from sub2', state))
        expect(sub2.query().visitors).to.be.equal(jmsbState.visitors + 2)
        defineRule({ street: 'guy' }, { type: 'VISITOR' })
        expect(sub2.query().visitors).to.be.equal(jmsbState.visitors + 3)
          
    })
})