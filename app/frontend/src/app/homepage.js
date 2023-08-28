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
        papers:[
            {
                content: "Childs, C. A., Geller, A. M., von Hippel, T., Motherway, E., and Zwicker, C., 'Goodbye Chi-by-Eye: A Bayesian Analysis of Photometric Binaries in Six Open Clusters', 2023, submitted to ApJ"
            },
            {
                content:"Motherway, E., Geller, A. M., Childs, A. C., Zwicker, C., and von Hippel, T., 'Tracing the Origins of Mass Segregation in M35: Evidence for Primordially Segregated Binaries', 2023, submitted to ApJL"
            },
            {
                content:"Zwicker, C., Geller, A. M., Childs, A. C., Motherway, E., and von Hippel, T., 'Investigating Mass Segregation of the Binary Stars in the Open Cluster NGC 6819', 2023, submitted to ApJL"
            }
        ]
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
