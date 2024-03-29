// good info here : https://www.netlify.com/blog/2020/12/01/using-react-context-for-state-management-in-next.js/

'use client'

import React, { createContext, useState, useContext } from 'react';

export const GlobalStateContext = createContext();

// is there a more efficient way to do this so that I don't need separately named functions?  Can I have a setter function that takes an input and accesses the globalState in a kind of dict?
export const GlobalStateProvider = ({ children }) => {
    const [globalState, setGlobalState] = useState({
        explorerDivs : [],
        showExplorerDivs : [],
      });

    // syntax if there is an object in the globaleState
    // const setExplorerDivCount = (key, value) => {
    //     console.log(key, value)
    //     if (key != '') setGlobalState((prevState) => ({...prevState, explorerDivCount: {...prevState.explorerDivCount, [key]: value}}));
    // };

    // syntax for a normal setter
    // const setExplorerZIndex = (value) => {
    //     setGlobalState((prevState) => ({ ...prevState, explorerZIndex: value }));
    // };

    const appendExplorerDiv = (item) => {
        setGlobalState((prevState) => ({...prevState, explorerDivs: [...prevState.explorerDivs, item]}))
        setGlobalState((prevState) => ({...prevState, showExplorerDivs: [...prevState.showExplorerDivs, true]}))
    };

    const setShowExplorerDivAtIndex = (index, value) => {
        setGlobalState((prevState) => {
            const updatedItems = [...prevState.showExplorerDivs];
            updatedItems[index] = value;
            return {...prevState, showExplorerDivs: updatedItems,};
        });
    }; 



    return (
        <GlobalStateContext.Provider value={{ globalState,  appendExplorerDiv, setShowExplorerDivAtIndex}}>
            {children}
        </GlobalStateContext.Provider>
    );
};

export function useGlobalStateContext() {
    return useContext(GlobalStateContext);
}
