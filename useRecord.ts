import { PocketBaseContext } from './PocketbaseProvider'
import { createEffect, createSignal, useContext } from 'solid-js'
import type Client from 'pocketbase'
import { Record } from 'pocketbase'

export const useRecord = (
  collection: string,
  id: string,
  realtime: boolean = true,
  expand: string = '',
) => {
  const client = useContext<Client>(PocketBaseContext)

  if (!client) {
    throw new Error('useRecord must be used within a <ClientProvider>')
  }

  const [value, setValue] = createSignal<Record | undefined>(undefined)
  const [error, setError] = createSignal<Error | undefined>(undefined)

  createEffect(() => {
    client
      .collection(collection)
      .getOne(id, { expand })
      .then(record => {
        setValue(record)
        setError(undefined)
        if (realtime) {
          client.realtime.subscribe(collection + '/' + id, event => {
            switch (event.action) {
              case 'update':
                setValue(event.record)
                break
              case 'delete':
                setValue(undefined)
                break
            }
          })
        }
      })
      .catch((err: Error) => {
        setValue(undefined)
        setError(err)
      })
  })

  function updateRecord(value: Record) {
    return client.collection(collection).update(id, value)
  }

  return { value, error, updateRecord }
}
