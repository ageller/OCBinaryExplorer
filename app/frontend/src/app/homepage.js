'use client'

import Head from 'next/head';
import {ExplorerEntry, Team, Papers, Abstracts} from './components'
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
                title: "Research Associate Professor, Project PI",
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
                name: "Anurathi Madasi",
                link: "",
                title: "Undergraduate Researcher",
                affiliation: "Loyola University Chicago",
                type: "undergrad"
            },
            {
                name: "Amelia Marengo",
                link: "",
                title: "Undergraduate Researcher",
                affiliation: "Illinois Institute of Technology",
                type: "undergrad"
            },
            {
                name: "Erin Motherway",
                link: "",
                title: "Undergraduate Researcher",
                affiliation: "Embry-Riddle Aeronautical University",
                type: "undergrad"
            },
            {
                name: "Justyce Watson",
                link: "",
                title: "Undergraduate Researcher",
                affiliation: "Lewis University",
                type: "undergrad"
            },
            {
                name: "Claire Zwicker",
                link: "",
                title: "Undergraduate Researcher",
                affiliation: "Illinois Institute of Technology",
                type: "undergrad"
            },
        ],
    };

    let paperProps = {
        papers:[
            {
                authors: "Childs, C. A., Geller, A. M., von Hippel, T., Motherway, E., and Zwicker, C.",
                title: "Goodbye Chi-by-Eye: A Bayesian Analysis of Photometric Binaries in Six Open Clusters",
                bib: "2024, ApJ, 963, 41",
                doi: "10.3847/1538-4357/ad18c0",
                link: "https://ui.adsabs.harvard.edu/abs/2024ApJ...962...41C/abstract"
            },
            {
                authors: "Motherway, E., Geller, A. M., Childs, A. C., Zwicker, C., and von Hippel, T.",
                title: "Tracing the Origins of Mass Segregation in M35: Evidence for Primordially Segregated Binaries",
                bib: "2024, ApJL, 962, 9",
                doi: "10.3847/2041-8213/ad18bf",
                link: "https://ui.adsabs.harvard.edu/abs/2024ApJ...962L...9M/abstract"
            },
            {
                authors: "Zwicker, C., Geller, A. M., Childs, A. C., Motherway, E., and von Hippel, T.",
                title: "Investigating Mass Segregation of the Binary Stars in the Open Cluster NGC 6819",
                bib: "2024, ApJ, 967, 44",
                doi: "10.3847/1538-4357/ad39c6",
                link: "https://ui.adsabs.harvard.edu/abs/2024ApJ...967...44Z/abstract"
            },
        ]
    };

    let abstractProps = {
        abstracts:[
            {
                authors:"Childs, C. A., Geller, A. M., von Hippel, T., Motherway, E., and Zwicker, C.",
                title:"Goodbye Chi-by-Eye: A Bayesian Analysis of Photometric Binaries in Six Open Clusters'",
                bib:"2024, AAS #243 oral presentation 422.01, BAAS, 56, 2",
                link: "https://ui.adsabs.harvard.edu/abs/2024AAS...24342201C/abstract"
            },
            {
                authors: "Madasi, A., Geller, A., and Childs, A.",
                title: "Searching for Tidal Tails in the Open Cluster M35",
                bib: "2024, AAS #243 poster presentation 458.18, BAAS, 56, 2",
                link: "https://ui.adsabs.harvard.edu/abs/2024AAS...24345818M/abstract"
            },
            {
                authors:"Marengo, A., Geller, A., and Childs A.",
                title:"Blue Stragglers and Blue Lukers in Open Cluster N-body Models",
                bib:"2024, AAS #243 poster presentation 458.19, BAAS, 56, 2",
                link:"https://ui.adsabs.harvard.edu/abs/2024AAS...24345819M/abstract"
            },
            {
                authors:"Watson, J., Geller, A., Childs, A., con Hippem, T., and Jeffery E.",
                title:"Ages of Normal and Blue Lurker Stars in the Open Cluster M67",
                bib:"2024, AAS #243 poster presentation 458.05, BAAS, 56, 2",
                link:"https://ui.adsabs.harvard.edu/abs/2024AAS...24345805W/abstract"
            },
            {
                authors:"Childs, A., Geller, A., Motherway, A., and Zwicker, C.",
                title:"Constraining Binary Demographics in Open Clustes to Test Binary Formation and Evolution Theory",
                bib:"2023, AAS #241 poster presentation 321.01, BAAS, 55, 2",
                link:"https://ui.adsabs.harvard.edu/abs/2023AAS...24132101C/abstract"
            },
            {
                authors:"Motherway, E., Geller, A. M., Childs, A., and Zwicker, C.",
                title:"Using Bayesian Statistics Software (BASE-9) to Analyze Binary Stars in Open CLustesr M67 and M35",
                bib:"2023, AAS #241 poster presentation 401.13, BAAS, 55, 2",
                link:"https://ui.adsabs.harvard.edu/abs/2023AAS...24140113M/abstract"
            },
            {
                authors:"Zwicker, C., Geller, A. M., Childs, A., and Motherway, A.",
                title:"Applying Bayesian statistics to identify binaries within the open cluster NGC 6819",
                bib:"2023, AAS #241 poster presentation 401.14, BAAS, 55, 2",
                link:"https://ui.adsabs.harvard.edu/abs/2023AAS...24140114Z/abstract"
            },  




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
                    <Abstracts {...abstractProps}/>
                    <hr/>


                </div>
            </div>
            <Footer />
        </>
    );
}
