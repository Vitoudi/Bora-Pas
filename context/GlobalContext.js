import React, {useEffect, useState} from 'react'

export const GlobalContext = React.createContext(null)

const defaultState = {
  currentPage: '',
  user: {
    isLoggedIn: false,
    uid: ''
  },
};

export function GlobalContextProvider({children}) {
    const [globalState, setGlobalState] = useState(defaultState)

    return (
        <GlobalContext.Provider value={[globalState, setGlobalState]}>
            {children}
        </GlobalContext.Provider>
    )
}