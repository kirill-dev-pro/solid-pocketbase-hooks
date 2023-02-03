import { PocketBaseContext } from './PocketbaseProvider'
import { createEffect, useContext } from 'solid-js'
import type { Record } from 'pocketbase'
import { createStore, reconcile } from 'solid-js/store'

export const useRecords = <T extends Record>(
  collection: string,
  batchSize: number = 200,
  realtime: boolean = true,
) => {
  const client = useContext(PocketBaseContext)

  if (!client) {
    throw new Error('useRecords must be used within a <ClientProvider>')
  }

  const [{ records, error }, setData] = createStore<{
    records: T[] | undefined
    error: Error | undefined
  }>({ records: undefined, error: undefined })

  createEffect(() => {
    client
      .collection(collection)
      .getFullList(batchSize)
      .then(async update => {
        const records = update as T[]
        setData(
          reconcile({
            records,
            error: undefined,
          }),
        )
        if (realtime) {
          await client.realtime.subscribe(collection, event => {
            console.log('subscribe event', event)
            switch (event.action) {
              case 'create':
                setData(
                  reconcile({
                    records: [...records!, event.record],
                    error: undefined,
                  }),
                )
                break
              case 'update':
                setData(
                  reconcile({
                    records: records!.map(record => {
                      if (record.id === event.record.id) {
                        record = event.record
                      }
                      return record
                    }),
                    error: undefined,
                  }),
                )
                break
              case 'delete':
                setData({ records: records?.filter(record => record.id !== event.record.id) })
                break
            }
          })
        }
      })
      .catch(error =>
        setData(
          reconcile({
            records: undefined,
            error,
          }),
        ),
      )
  })

  function createRecord(record: Omit<T, 'id'>) {
    return client.collection(collection).create(record)
  }

  function updateRecord(record: T) {
    return client.collection(collection).update(record.id, record)
  }

  function deleteRecord(record: T) {
    return client.collection(collection).delete(record.id)
  }

  return { records, error, createRecord, updateRecord, deleteRecord }
}
