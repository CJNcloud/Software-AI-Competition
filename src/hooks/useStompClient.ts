import { useEffect, useState } from 'react'
import { Client, IMessage } from '@stomp/stompjs'

export const useStompClient = (url: string) => {
  const [client, setClient] = useState<Client | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const stompClient = new Client({
      brokerURL: url,
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true)
        console.log('STOMP client connected')
      },
      onDisconnect: () => {
        setConnected(false)
        console.log('STOMP client disconnected')
      },
      onStompError: (error) => {
        console.error('STOMP error', error)
      },
    })

    setClient(stompClient)

    return () => {
      stompClient.deactivate()
    }
  }, [url])

  const subscribe = (destination: string, callback: (message: IMessage) => void) => {
    if (client?.connected) {
      client.subscribe(destination, callback)
    }
  }

  const sendMessage = (destination: string, message: string) => {
    if (client?.connected) {
      client.publish({ destination, body: message })
    }
  }

  const connect = () => {
    client?.activate()
  }

  const disconnect = () => {
    client?.deactivate()
  }

  return { connected, connect, disconnect, subscribe, sendMessage }
}
