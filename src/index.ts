
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { WebSocketLink } from 'apollo-link-ws'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import * as ws from 'ws'
import gql from 'graphql-tag'
import * as moment from 'moment'

const GRAPHQL_SERVER_URI = 'ws://localhost:3421/graphql'

const subscriptionClient = new SubscriptionClient(GRAPHQL_SERVER_URI, {
  reconnect: true,
}, ws)

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new WebSocketLink(subscriptionClient),
})

const subscription = gql`
  subscription {
    eventListener(
      name: "*"
    ) {
      name
      data
      time
    }
  }
`

const log = (msg: string, data: any = '%', date = new Date()) => {
  console.log(`${moment(date).format('HH:mm:ss-SSS')} - ${msg} - ${data}`)
}

const logFn = (msg: string) => (data: any = '%') => log(msg, data)

subscriptionClient.onDisconnected(logFn('Client Disconnected'))
subscriptionClient.onReconnected(logFn('Client Reconnected'))
subscriptionClient.onReconnecting(logFn('Client Reconnecting'))
subscriptionClient.onConnected(logFn('Client Connected'))
subscriptionClient.onConnecting(logFn('Client Connecting'))

const observer = client.subscribe({
  query: subscription,
})

observer.forEach(({ data: { eventListener: { name, data, time } }}) => log(name, data, time))
