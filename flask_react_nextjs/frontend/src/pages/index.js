// index.html
import { useState } from 'react';
import Head from 'next/head';
import {HeaderTop, HeaderContent, ExplorerEntry, Credit, Footer, Contributor, Paper} from './components'

// my scripts
import addScrollAnimator from '../hooks/scrollAnimator';


export default function HomePage() {
    // const names = ['Ada Lovelace', 'Grace Hopper', 'Margaret Hamilton'];

    // const [likes, setLikes] = useState(0);

    // function handleClick() {
    //     setLikes(likes + 1);
    // }

    addScrollAnimator();

    let headerProps = {
        title:"Open Cluster Binary Explorer",
        subtitle:"Access binary-star data in hundreds of open clusters", 
        subsubtitle:<>An NSF-funded research project from PI <a href="https://faculty.wcas.northwestern.edu/aaron-geller/index.html">Aaron M. Geller.</a></>
    }

    let creditProps = {
        contributors:[
            {
                name: "Aaron Geller",
                link: "https://faculty.wcas.northwestern.edu/aaron-geller/index.html",
                image: "/images/AMG_photo_square.png",
                title: "Research Assistant Professor, Project PI",
                affiliation: "Northwestern Unversity - CIERA"
            },
            {
                name: "Anna Childs",
                link: "",
                image: "/images/Smiley_Face.png",
                title: "Postdoctoral Associate",
                affiliation: "Northwestern Unversity - CIERA"
            },
            {
                name: "Erin Motherway",
                link: "",
                image: "/images/Smiley_Face.png",
                title: "Undergraduate Researcher",
                affiliation: "Embry-Riddle Aeronautical University"
            },
            {
                name: "Claire Zwicker",
                link: "",
                image: "/images/Smiley_Face.png",
                title: "Undergraduate Researcher",
                affiliation: "Illinois Institute of Technology"
            }
        ],
        papers:[]
    }
    return (
        <>
            <Head>
                <title>OC Binary Explorer</title>
            </Head>
            <HeaderTop {...headerProps} />
            <HeaderContent />
            <ExplorerEntry />
            <Credit {...creditProps}/>
            <Footer />
            {/* <button onClick={handleClick}>Like ({likes})</button> */}
        </>
    );
}
export { HeaderTop }
