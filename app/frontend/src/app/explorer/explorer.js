'use client'

import {useContext, useState, useEffect, useRef} from 'react';
import Head from 'next/head';

import {SideBar, ExplorerContainer, HelpModal} from './components'
import {HeaderTop, Copyright} from '../sharedComponents/misc'
import {GlobalStateContext} from '../context/globalState';


export default function Explorer() {
    const {globalState} = useContext(GlobalStateContext);
    const [showHelp, setShowHelp] = useState(false);
    const topbarRef = useRef(null);
    const sidebarRef = useRef(null);
    const [sidebarWidth, setSidebarWidth] = useState(0);

    // Show modal on first load
    useEffect(() => {
        setShowHelp(true);
    }, []);

    // currently only needed for the copyright
    useEffect(() => {
        const updateWidth = () => {
            if (sidebarRef.current) {
                setSidebarWidth(sidebarRef.current.offsetWidth);
            }
        };

        updateWidth(); // set on load
        window.addEventListener('resize', updateWidth); // update on resize
        return () => window.removeEventListener('resize', updateWidth);
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
            <HeaderTop {...headerProps} ref={topbarRef}/>
            <div className = "explorerContent">
                <SideBar {...sideBarProps} ref={sidebarRef} headerRef={topbarRef}/>
                <div style={{position:'absolute', bottom:0, left:0}}>
                    <div className = "division footer">
                        <div className = "content" style = {{fontSize: "calc(10px + 0.3vw)", lineHeight: "calc(14px + 0.3vw)", marginLeft:`${sidebarWidth}px`}}>
                            <Copyright />
                        </div>
                    </div>
                </div>
                {renderExplorerComponents()}
            </div>
        </>
    );
}