import Client from 'pocketbase'
import { JSX, useContext, createContext } from 'solid-js'

export const PocketBaseContext = createContext<Client>()

interface PocketBaseProviderProps {
  url?: string
  client?: Client
  children: JSX.Element
}

export const PocketBaseProvider = (props: PocketBaseProviderProps) => {
  if (!props.url && !props.client)
    throw new Error('PocketBaseProvider requires a url or client prop')
  if (props.url && props.client)
    throw new Error('PocketBaseProvider requires a url or client prop, not both')
  const client = props.client ? props.client : new Client(props.url)
  return <PocketBaseContext.Provider value={client}>{props.children}</PocketBaseContext.Provider>
}

export const usePocketbase = () => useContext(PocketBaseContext)
