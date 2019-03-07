const {
    __, compose: c, curry,
    reduce, filter, forEach, all, 
    mapObjIndexed: mapo, keys, eqProps, prop
} = require('ramda')

const { unifies, ruleReducer } = require('./util')

const initialRule = { head: {}, body: { type: '@@__INIT__@@' } }

const createRulebook = (rules = [initialRule]) => {

    const rulebook = rules

    const query = (goal = {}, reducers = {}) => c(reduce(ruleReducer(reducers), {}), filter(c(unifies(goal), prop('head'))))(rulebook)

    const defineRule = (head = {}, body = {}) => {
        const rule = { head, body }
        rulebook.push(rule)
        return rule
    }
    
    return { defineRule, query, rulebook }
}

module.exports = { createRulebook }