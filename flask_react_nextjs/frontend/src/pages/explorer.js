import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import {HeaderTop, SideBar, ExplorerContainer } from './components'
import { GlobalStateContext } from '../context/globalState';

// this is a simple test to see how I can grab data from the server
// eventually I can build this out into grabbing read data and then plotting results
function TestServer({}) {
    // usestate for setting a javascript
    // object for storing and using data
    const [data, setData] = useState({
        name: "",
        age: 0,
        date: "",
        programming: "",
    });
    const [loading, setLoading] = useState(true);

    // Using useEffect for single rendering
    useEffect(() => {
        // Using fetch to fetch the api from 
        // flask server it will be redirected to proxy
        fetch("/api/data")
            .then(res => res.json())
            .then(data => {
                // Setting a data from api
                setData({
                    name: data.Name,
                    age: data.Age,
                    date: data.Date,
                    programming: data.programming,
                });
                setLoading(false);
            })
    }, []);
  
    return (
        (loading) ?
            (
                <div>
                    <p>Loading...</p>
                </div>
            ) : (
                <div >
                    <h2>(React+next.js) + flask test <br/> will be replaced with instructions on how to use</h2>
                    {/* Calling a data from setdata for showing */}
                    <p>{data.name}</p>
                    <p>{data.age}</p>
                    <p>{data.date}</p>
                    <p>{data.programming}</p>
                </div>
            )
    );
  
}


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
                <h1>Hello World</h1>
                <TestServer />
                <Link href = "/">Back to home</Link>
                {renderExplorerComponents()}
            </div>
        </>
    );
}