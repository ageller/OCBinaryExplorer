'use client'

import Head from 'next/head';
import {ExplorerEntry, Team, Papers} from './components'
import {HeaderTop, Footer} from './sharedComponents/misc'



export default function HomePage() {

    let headerProps = {
        title:"Open Cluster Binary Explorer",
        subtitle:"Access photometric binary-star data in a collection of open clusters", 
        subsubtitle:<>An NSF-funded research project from PI <a href="https://faculty.wcas.northwestern.edu/aaron-geller/index.html">Aaron M. Geller.</a></>
    }

    let teamProps = {
        contributors:[
            {
                name: "Aaron Geller",
                link: "https://faculty.wcas.northwestern.edu/aaron-geller/index.html",
                image: "/images/AMG_photo_square.png",
                title: "Research Assistant Professor, Project PI",
                affiliation: "Northwestern Unversity - CIERA",
                type: "faculty"
            },
            {
                name: "Anna Childs",
                link: "https://ciera.northwestern.edu/directory/anna-childs/",
                image: "/images/Anna-Childs-265x265.jpg",
                title: "Postdoctoral Associate",
                affiliation: "Northwestern Unversity - CIERA",
                type: "postdoc"
            },
            {
                name: "Erin Motherway",
                link: "",
                title: "Undergraduate Researcher",
                affiliation: "Embry-Riddle Aeronautical University",
                type: "undergrad"
            },
            {
                name: "Claire Zwicker",
                link: "",
                title: "Undergraduate Researcher",
                affiliation: "Illinois Institute of Technology",
                type: "undergrad"
            }
        ],
    };

    let paperProps = {
        papers:[]
    };

    return (
        <>
            <Head>
                <title>OC Binary Explorer</title>
            </Head>
            <HeaderTop {...headerProps} />
            <ExplorerEntry />
            <div className = "division lightColor" id = "creditDiv">
                <div className = "content" style = {{minHeight:'700px', width:'100%"'}}>
                    <Team {...teamProps}/>
                    <div style = {{height:"50px"}}></div>
                    <Papers {...paperProps}/>
                    <hr/>

                </div>
            </div>
            <Footer />
        </>
    );
}
