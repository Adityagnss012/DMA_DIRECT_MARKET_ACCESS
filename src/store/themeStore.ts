import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  actualTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const updateActualTheme = (theme: Theme): 'light' | 'dark' => {
  const actualTheme = theme === 'system' ? getSystemTheme() : theme
  
  if (actualTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  
  return actualTheme
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      actualTheme: getSystemTheme(),
      setTheme: (theme) => {
        const actualTheme = updateActualTheme(theme)
        set({ theme, actualTheme })
      }
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          updateActualTheme(state.theme)
        }
      }
    }
  )
)

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const { theme, setTheme } = useThemeStore.getState()
  if (theme === 'system') {
    setTheme('system')
  }
})