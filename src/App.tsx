import { RouterProvider } from '@tanstack/react-router'
import { authClient } from './lib/auth-client'
import { getRouter } from './router'

const router = getRouter()

function InnerApp() {
  const session = authClient.useSession()

  const auth = {
    isAuthenticated: !!session.data?.user,
    user: session.data?.user ?? null,
    isLoading: session.isPending,
    login: async (email: string, password: string) => {
      const result = await authClient.signIn.email({ email, password })
      if (result.error) throw new Error(result.error.message)
    },
    logout: async () => {
      await authClient.signOut()
    },
  }

  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    )
  }

  return <RouterProvider router={router} context={{ auth }} />
}

export default InnerApp
