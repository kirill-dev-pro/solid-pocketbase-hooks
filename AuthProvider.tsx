import { usePocketbase } from '.'
import {
  createEffect,
  createSignal,
  JSX,
  onMount,
  createContext,
  Accessor,
  useContext,
  onCleanup,
} from 'solid-js'
import { Admin, Record } from 'pocketbase'

export const AuthContext = createContext<{
  user: Accessor<Record | Admin>
  avatarUrl: Accessor<string>
  error: Accessor<string>
  loginWithPassword: (email: string, password: string) => void
  logout: () => void
}>()

interface AuthProviderProps {
  children: JSX.Element
}

export const AuthProvider = (props: AuthProviderProps) => {
  const client = usePocketbase()

  if (!client) {
    throw new Error('useAuth must be used within a <PocketBaseProvider>')
  }

  const [user, setUser] = createSignal(client.authStore.model)
  const [avatarUrl, setAvatarUrl] = createSignal('')
  const [error, setError] = createSignal<string>(null)

  onMount(() => {
    const authData = sessionStorage.getItem('auth')
    client.authStore.loadFromCookie(authData)
  })

  createEffect(() => {
    const unsubscribe = client.authStore.onChange(token => {
      if (token) {
        setUser(client.authStore.model)
        sessionStorage.setItem('auth', client.authStore.exportToCookie())
      } else {
        setUser(null)
        sessionStorage.removeItem('auth')
      }
    })
    onCleanup(() => unsubscribe())
  })

  createEffect(() => {
    if (user()) {
      setAvatarUrl(client.getFileUrl(user() as Record, user().avatar))
    } else {
      setAvatarUrl('')
    }
  })

  function loginWithPassword(email: string, password: string) {
    client
      .collection('users')
      .authWithPassword(email, password)
      .catch(err => {
        console.log('login error:', err.message)
        setError(err.message)
      })
  }

  function logout() {
    client.authStore.clear()
  }

  return (
    <AuthContext.Provider value={{ user, avatarUrl, error, loginWithPassword, logout }}>
      {props.children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
