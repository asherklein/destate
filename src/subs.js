const {
    __, compose: c, 
    filter, forEach, 
    prop
} = require('ramda')

const { createRulebook: coreCreate } = require('./core')
const { unifies, ruleReducer } = require('./util')

const createRulebook = (rules) => {

    const { defineRule: coreDefine, query, rulebook } = coreCreate(rules)

    const subscribers = []

    // uponStateChange :: subscriber -> ()
    const queryAndUpdateSub = (rule) =>
        ({ reducers, onStateChange, latest, update }) => {
            const updated = ruleReducer(reducers)(latest, rule)
            update(updated)
            onStateChange(updated)
        }

    
    
    const notifySubscribers = (rule) => c(forEach(queryAndUpdateSub(rule)), filter(c(unifies(__, rule.head), prop('goal'))))(subscribers)
    
    const defineRule = c(notifySubscribers, coreDefine)

    const dirtyUnSubscribe = (sub) => {
        const found = subscribers.indexOf(sub)
        if (found > -1) subscribers.splice(found, 1)
    }

    // onStateChange :: (mystate) -> ()
    const subscribe = (goal = {}, reducers = {}, onStateChange) => {
        const latest = query(goal, reducers)
        const sub = { goal, reducers, onStateChange, latest }
        sub.update = (latest) => sub.latest = latest
        subscribers.push(sub)
        onStateChange(latest)
        return { unSubscribe: () => dirtyUnSubscribe(sub), query: () => sub.latest  }
    }

    return { defineRule, query, subscribe, rulebook }
}

module.exports = { createRulebook }