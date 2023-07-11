import React, { createContext, useState } from 'react';

export const GlobalStateContext = createContext();

// is there a more efficient way to do this so that I don't need separately named functions?  Can I have a setter function that takes an input and accesses the globalState in a kind of dict?
export const GlobalStateProvider = ({ children }) => {
    const [globalState, setGlobalState] = useState({
        explorerTableCount: 0,
        explorerHistCount: 0,
        explorerScatterCount: 0,
      });

    const setExplorerTableCount = (value) => {
        setGlobalState((prevState) => ({ ...prevState, explorerTableCount: value }));
    };
    
    const setExplorerHistCount = (value) => {
        setGlobalState((prevState) => ({ ...prevState, explorerHistCount: value }));
    };
    
    const setExplorerScatterCount = (value) => {
        setGlobalState((prevState) => ({ ...prevState, explorerScatterCount: value }));
    };
    

    return (
        <GlobalStateContext.Provider value={{ globalState,  setExplorerTableCount, setExplorerHistCount, setExplorerScatterCount}}>
            {children}
        </GlobalStateContext.Provider>
    );
};
