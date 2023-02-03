# solid-pocketbase-hooks

```tsx
import App from './App'
import { render } from 'solid-js/web'
import {PocketBaseProvider, AuthProvider, useRecord, useAuth} from 'solid-pocketbase-hooks'

render(
  () => <PocketBaseProvider url='https://some.pocket.base.host/'>
    <AuthProvider>
      <App />
    </AuthProvider>
  </PocketBaseProvider>,
  document.getElementById('root')
)

const App = () => {
  const { user } = useAuth()
  const record = useRecord('documents', 'foo')
  return <Show when={user()} fallback={<p>You are not logged in</p>}>
    <div>{record()}</div>
  </Show>
}
```

This project was created using `bun init` in bun v0.5.5. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
