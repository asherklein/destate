const {
    __, compose: c, curry,
    allPass,
    reduce, filter, forEach, all, pluck,
    mapObjIndexed: mapo, keys, eqProps, prop
} = require('ramda')

const createLedger = () => {
    
    const transactions = []

    const subscribers = []


    const isAddressedToMe = curry((myAddress, address) => c(all(eqProps(__, myAddress, address)), keys)(address))

    const mapToContent = pluck('content')

    // reducers :: { name: (state, content) => state, ... }
    const transReducer = (reducers) => (acc, trans) => mapo((r, k) => r(acc[k], trans), reducers)

    const receive = (myAddress, reducers) => c(reduce(transReducer(reducers), {}), filter(c(isAddressedToMe(myAddress), prop('address'))))(transactions)

    // uponReceipt :: subscriber -> ()
    const subscriberReceives = ({ address, reducers, onReceipt }) => onReceipt(receive(address, reducers)) 

    const send = (address = {}, content = {}) => {
        const trans = { address, content }
        transactions.push(trans)
        c(forEach(subscriberReceives), filter(allPass([c(isAddressedToMe(__, address), prop('address')), prop('active')])))(subscribers)
        return trans
    }

    const dirtyUnSubscribe = (sub) => {
        const found = subscribers.indexOf(sub)
        if(found > -1) subscribers.splice(found, 1)
    }

    // onReceipt :: (mystate) -> ()
    const subscribe = (myAddress, reducers, onReceipt) => {
        const sub = { address: myAddress, reducers, onReceipt, active: true }
        subscribers.push(sub)
        return { unSubscribe: () => dirtyUnSubscribe(sub) }
    } 
    return { send, receive, subscribe, ledger: transactions }
}


module.exports = { createLedger }