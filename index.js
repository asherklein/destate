const {
    __, compose: c, curry,
    reduce, filter, forEach, all, 
    mapObjIndexed: mapo, keys, eqProps, prop
} = require('ramda')


const initialRule = { head: {}, body: { type: '@@__INIT__@@' } }

const createRulebook = () => {

    const rulebook = [ initialRule ]

    const subscribers = []




    const unifies = curry((goal, head) => c(all(eqProps(__, goal, head)), keys)(head))

    // reducers :: { name: state -> body -> state, ... }
    // ruleReducer :: reducers -> (state -> rule -> state) 
    const ruleReducer = (reducers) => (acc, rule) => mapo((r, k) => r(acc[k], rule), reducers)

    const query = (goal = {}, reducers = {}) => c(reduce(ruleReducer(reducers), {}), filter(c(unifies(goal), prop('head'))))(rulebook)

    // uponStateChange :: subscriber -> ()
    const queryAndUpdateSub = (rule) =>
        ({ reducers, onStateChange, latest, update }) => {
            const updated = ruleReducer(reducers)(latest, rule)
            update(updated)
            onStateChange(updated)
        }

    const addRule = (head = {}, body = {}) => {
        const rule = { head, body }
        rulebook.push(rule)
        return rule
    }
    
    const notifySubscribers = (rule) => c(forEach(queryAndUpdateSub(rule)), filter(c(unifies(__, rule.head), prop('goal'))))(subscribers)
    
    const defineRule = c(notifySubscribers, addRule)

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