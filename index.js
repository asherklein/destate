const { __, compose: c, mapObjectIndexed: mapo, keys, eqProps } = require('ramda')

const transactions = []

// address = {prop: 1, prop2: 2}
const send = (address, content) => transactions.push({ address: address || {}, content: content || {} })

const isAddressedToMe = myAddress => trans => c(all(eqProps(__, myAddress, trans.address)), keys)(trans.address)

// const latest = (_, { content }) => content 

// export const NEW_STATE = '@@__NEW_STATE__@@'

const transReducer = (reducers) => (acc, content) => mapo((r, k) => r(acc[k], content), reducers)

const getState = (myAddress, reducers) => c(reduce(transReducer(reducers)), filter(isAddressedToMe(myAddress)))(transactions)

module.exports = { getState, send }