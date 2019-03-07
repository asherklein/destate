const {
    __, compose: c, curry,
    all,
    mapObjIndexed: mapo, keys, eqProps
} = require('ramda')

const unifies = curry((goal, head) => c(all(eqProps(__, goal, head)), keys)(head))

// reducers :: { name: state -> body -> state, ... }
// ruleReducer :: reducers -> (state -> rule -> state) 
const ruleReducer = (reducers) => (acc, rule) => mapo((r, k) => r(acc[k], rule), reducers)

module.exports = { unifies, ruleReducer }