'use client'

import {useContext, useState, useEffect} from 'react';
import Head from 'next/head';
import Link from 'next/link';

import {SideBar, ExplorerContainer, HelpModal} from './components'
import {HeaderTop, Copyright} from '../sharedComponents/misc'
import {GlobalStateContext} from '../context/globalState';
import { FaJedi } from 'react-icons/fa';



export default function Explorer() {
    const {globalState} = useContext(GlobalStateContext);
    const [showHelp, setShowHelp] = useState(false);

    // Show modal on first load
    useEffect(() => {
        setShowHelp(true);
    }, []);

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
            {
                label: 'explore',
                icon: 'Dataset',
            }, 
        ],
        onHelpClick: () => setShowHelp(true),
    }


    let helpProps = {
        show: showHelp,
        onClose : () => setShowHelp(false),
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
            <HelpModal {...helpProps} />
            <HeaderTop {...headerProps} />
            <div className = "explorerContent">
                <SideBar {...sideBarProps} />
                <div className = "explorerInstructions">
                    <div style={{position:'absolute', bottom:0}}>
                        <div className = "division footer">
                            <div className = "content" style = {{fontSize: "calc(10px + 0.3vw)", lineHeight: "calc(14px + 0.3vw)"}}>
                                <Copyright />
                            </div>
                        </div>
                    </div>
                </div>
                {renderExplorerComponents()}
            </div>
        </>
    );
}