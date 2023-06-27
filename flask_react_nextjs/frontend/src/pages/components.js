import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
                        <Link href = "explorer">
                            <div className = "inset blueBackground linkDiv" style = {{minHeight: '600px'}}>
                                <div className = "content">
                                    <div className = "headerSmall">Tables and Plots</div>
                                    <div className = "subheader">View, filter, sort, create, edit, and download data and plots</div>

                                </div>
                            </div>
                        </Link>
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
                    <a href = {link}>
                        <Image className = "profileImage" src = {image} height = {200} width = {200} alt = {name}/>
                        </a>
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

function SideBarButton({label, icon}){
    console.log(label)
    return( 
        <div className = "button linkDiv">
            <div className = "material-symbols-outlined icon">{icon}</div>
            <div className = "label">{label}</div>
        </div>
    )
}

function SideBar({buttons}){
    return (
        <div className = "sideBar">
            {buttons.map((d) => (
                <SideBarButton {...d}/>
            ))}
        </div>
    )
}
export {HeaderTop, HeaderAnimation, HeaderExplanation, ExplorerEntry, Credit, Footer, Contributor, Paper, SideBar}

