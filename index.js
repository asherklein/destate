const { 
    __, compose: c, tap,
    reduce, filter, all, pluck,
    mapObjIndexed: mapo, keys, eqProps  
} = require('ramda')

const log = tap((x) => console.log(x))

const transactions = []

// address = {prop: 1, prop2: 2}
const send = (address, content) => transactions.push({ address: address || {}, content: content || {} })

const isAddressedToMe = myAddress => trans => c(all(eqProps(__, myAddress, trans.address)), keys)(trans.address)

const mapToContent = pluck('content')

const transReducer = (reducers) => (acc, content) => mapo((r, k) => r(acc[k], content), reducers)

const getState = (myAddress, reducers) => c(reduce(transReducer(reducers), {}), mapToContent, filter(isAddressedToMe(myAddress)))(transactions)

module.exports = { getState, send }