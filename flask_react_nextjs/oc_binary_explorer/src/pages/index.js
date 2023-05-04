// index.html
import { useState } from 'react';
import addScrollAnimator from '../hooks/scrollAnimator';

function HeaderTop({ title, subtitle, subsubtitle }) {
    return (
        <div className = "topNav">
            {(title || subtitle) &&
                <div className = "content">
                    {title &&<div className = "header">{title}</div>}
                    {subtitle && <div className = "subheader">{subtitle }</div>}
                </div>
            }
            {subsubtitle && <div className = "content">{subsubtitle}</div>}

        </div>
    )

}

function HeaderAnimation({image}){
    // include an animation (or image) that will play when the page loads and is the size of the open window minus height of header (TO DO)
    return(
        <div className = "fullWidthImage"></div>

    )
}

function HeaderExplanation({content}){
    // include text
    // could update this to send the text in the prop
    return(
        <div className = "division darkGrayBackground">
        <div className = "content">
            <div className = "subheader lightGrayColor">[Explanation of the analysis]</div>
            <div className = "lightGrayColor" style = {{ marginTop: '10px' }}>[Some text about analysis and BASE-9]</div>
        </div>
    </div> 
    )
}

function ExplorerEntry({content}){
    // include some image?
    // something about "click here to enter"

    return(
        <div className = "pageInset mintBackground">
            <div className = "content"  style = {{minHeight:'700px', width:'100%'}}>
                <div className = "header darkGrayColor">Interactive data explorer</div>

                <div className = "animateScrollWrapper">
                    <div className = "animateScroll scrollTransition">
                        <div className = "inset blueBackground linkDiv" style = {{minHeight: '600px'}}>
                            <div className = "content">
                                <div className = "headerSmall">Tables and Plots</div>
                                <div className = "subheader">View, filter, sort, create, edit, and download data and plots</div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}


function Credit({ contributors, papers }){
    console.log('check', contributors)

    return(

        <div className = "division lightGrayBackground">
            <div className = "content" style = {{minHeight:'700px', width:'100%"'}}>
                <div className = "headerSmall darkGrayColor">Credit</div>
                <div className = "subheader darkGrayColor" style = {{margin:'20px 0px 20px 0px'}}>Contributors</div>
                
                {contributors.map((d) => (
                    <Contributor {...d}/>
                ))}
               
                <hr/>
                <div style = {{height:"50px"}}></div>
                <div className = "subheader darkGrayColor">Papers</div>

                {papers.map((d) => (
                    <Paper {...d}/>
                ))}

            </div>
        </div>
    )

}

function Footer(){
    return(
        <div className = "division footer">
            <div className = "content" style = {{fontSize: "calc(10px + 0.5vw)"}}>
                <strong><a href = "https://faculty.wcas.northwestern.edu/aaron-geller/index.html">Aaron M. Geller</a></strong><br/>
                <a href = "https://ciera.northwestern.edu/" target = "_blank">Northwestern University - CIERA</a><br/>				
                1800 Sherman Ave., Evanston, IL 60201, USA<br/>
                Office: 8019 (8th Floor)<br/>
                Phone: (847) 467-6233   |   Fax: (847) 467-0679<br/>
                Email: a-geller [at] northwestern.edu<br/>
            </div>
        </div>
    )
}

function Contributor({ name, link, image, title, affiliation }){

    return( 
        <div className = "pageSideBySide">
            <hr/>
            <div className = "smallerChild" style = {{paddingRight:'20px'}}>
                <div className = "insetLeft">
                    <a href = {link}><img className = "profileImage" src={image} style = {{width:'200px'}}/></a>
                </div>
            </div>
            <div className = "child">
                <div className = "insetRight centerV">
                    <p>
                        <strong><a href = {link}>{name}</a></strong><br/>
                        {title}<br/>
                        {affiliation}<br/>
                    </p>
                </div>
            </div>
        </div>
    )
}

function Paper({ content }){

    return( 
        <div>
        </div>
    )
}

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
                image: "images/AMG_photo_square.png",
                title: "Research Assistant Professor, Project PI",
                affiliation: "Northwestern Unversity - CIERA"
            },
            {
                name: "Anna Childs",
                link: "",
                image: "images/Smiley_Face.png",
                title: "Postdoctoral Associate",
                affiliation: "Northwestern Unversity - CIERA"
            },
            {
                name: "Erin Motherway",
                link: "",
                image: "images/Smiley_Face.png",
                title: "Undergraduate Researcher",
                affiliation: "Embry-Riddle Aeronautical University"
            },
            {
                name: "Claire Zwicker",
                link: "",
                image: "images/Smiley_Face.png",
                title: "Undergraduate Researcher",
                affiliation: "Illinois Institute of Technology"
            }
        ],
        papers:[]
    }
    return (
        <div>
            <HeaderTop {...headerProps} />
            <HeaderAnimation />
            <HeaderExplanation />
            <ExplorerEntry />
            <Credit {...creditProps}/>
            <Footer />
            {/* <button onClick={handleClick}>Like ({likes})</button> */}
        </div>
    );
}
