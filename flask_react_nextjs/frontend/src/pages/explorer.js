import { useState, useEffect, useContext } from 'react';
import Head from 'next/head';
import {HeaderTop, Footer, SideBar, ExplorerContainer } from './components'
import { GlobalStateContext } from '../context/globalState';



export default function Explorer() {
    const {globalState} = useContext(GlobalStateContext);

    let headerProps = {
        title:"Open Cluster Binary Explorer",
    }

    let sideBarProps = {
        buttons: [
            {
                label: 'table',
                icon: 'Table',
            },
            {
                label: 'hist.',
                icon: 'Leaderboard',
            },
            {
                label: 'scatter',
                icon: 'scatter_plot',
            }, 


        ]
    }



    const renderExplorerComponents = () => {
        const divs = [];
        for (let i = 0; i < globalState.explorerDivs.length; i++) {
            if (globalState.showExplorerDivs[i]) divs.push(<ExplorerContainer key = {i} {...{label:globalState.explorerDivs[i], count:i}}/>);
        }
        return divs;
    };

    return (
        <>
            <Head>
                <title>OC Binary Explorer</title>
            </Head>
            <HeaderTop {...headerProps} />
            <div className = "explorerContent">
                <SideBar {...sideBarProps} />
                <div className = "explorerInstructions">
                    Please use the buttons on the left to create containers for tables, histograms and scatter plots.  <br/><br/>After clicking a button, you will be given options to customize your table or plot, accessible with the gear icon in the upper right corner of each container.<br/><br/>  You can have multiple containers open at the same time.  Clicking + dragging in the top bar of a container allows you to move the container around this work area.  Clicking + dragging in the bottom-right corner of a container allows you to resize the container.<br/><br/>MORE INFORMATION COMING LATER ON WHAT EACH DATABASE TABLE CONTAINS.
                    <div style={{position:'absolute', bottom:0}}>
                        <Footer />
                    </div>
                </div>
                {renderExplorerComponents()}
            </div>
        </>
    );
}