import React, { useContext, useEffect } from 'react'
import { GlobalContext } from '../context/GlobalContext'

export function useSetPage({page}) {
    const [globalState, setGlobalState] = useContext(GlobalContext)

    useEffect(() => {
      setGlobalState((state) => {
        return { ...state, currentPage: page };
      });
    }, []);

    return null
}
