import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

// this is a simple test to see how I can grab data from the server
// eventually I can build this out into grabbing read data and then plotting results
function TestServer({}) {
    // usestate for setting a javascript
    // object for storing and using data
    const [data, setdata] = useState({
        name: "",
        age: 0,
        date: "",
        programming: "",
    });
  
    // Using useEffect for single rendering
    useEffect(() => {
        // Using fetch to fetch the api from 
        // flask server it will be redirected to proxy
        fetch("/api/data").then((res) =>
            res.json().then((data) => {
                // Setting a data from api
                setdata({
                    name: data.Name,
                    age: data.Age,
                    date: data.Date,
                    programming: data.programming,
                });
            })
        );
    }, []);
  
    return (
        <div >
            <h2>(React+next.js) + flask test</h2>
            {/* Calling a data from setdata for showing */}
            <p>{data.name}</p>
            <p>{data.age}</p>
            <p>{data.date}</p>
            <p>{data.programming}</p>
        </div>
    );
  
}


export default function Explorer() {
    return (
        <>
            <Head>
                <title>OC Binary Explorer</title>
            </Head>
            <h1>Hello World</h1>
            <TestServer />
            <Link href = "/">Back to home</Link>
        </>
    );
}