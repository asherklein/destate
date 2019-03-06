const {
    __, compose: c, curry,
    reduce, filter, forEach, all, pluck,
    mapObjIndexed: mapo, keys, eqProps, prop, toString
} = require('ramda')


const initialTrans = { address: {}, content: { type: '@@__INIT__@@' } }

const createLedger = () => {

    const transactions = [initialTrans]

    const subscribers = []



    const isAddressedToMe = curry((myAddress, address) => c(all(eqProps(__, myAddress, address)), keys)(address))

    // reducers :: { name: state -> content -> state, ... }
    // transReducer :: reducers -> (state -> trans -> state) 
    const transReducer = (reducers) => (acc, trans) => mapo((r, k) => r(acc[k], trans), reducers)

    const receive = (myAddress = {}, reducers = {}) => c(reduce(transReducer(reducers), {}), filter(c(isAddressedToMe(myAddress), prop('address'))))(transactions)

    // // uponReceipt :: subscriber -> ()
    // const subscriberReceives = ({ address, reducers, onReceipt }) => onReceipt(receive(address, reducers)) 

    // uponReceipt :: subscriber -> ()
    const subscriberReceiveAndUpdate = (trans) =>
        ({ reducers, onReceipt, latest, update }) => {
            const updated = transReducer(reducers)(latest, trans)
            update(updated)
            onReceipt(updated)
        }

    const send = (address = {}, content = {}) => {
        const trans = { address, content }
        transactions.push(trans)
        c(forEach(subscriberReceiveAndUpdate(trans)), filter(c(isAddressedToMe(__, address), prop('address'))))(subscribers)
        return trans
    }

    const dirtyUnSubscribe = (sub) => {
        const found = subscribers.indexOf(sub)
        if (found > -1) subscribers.splice(found, 1)
    }

    // onReceipt :: (mystate) -> ()
    const subscribe = (myAddress = {}, reducers = {}, onReceipt) => {
        const latest = receive(myAddress, reducers)
        const sub = { address: myAddress, reducers, onReceipt, latest }
        sub.update = (latest) => sub.latest = latest
        subscribers.push(sub)
        onReceipt(latest)
        return { unSubscribe: () => dirtyUnSubscribe(sub), receive: () => sub.latest  }
    }

    return { send, receive, subscribe, ledger: transactions }
}

module.exports = { createLedger }