import { useState, useContext, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GlobalStateContext } from '../context/globalState';

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
        <div className = "division darkBackgroundColor">
        <div className = "content">
            <div className = "subheader lightColor">[Explanation of the analysis]</div>
            <div className = "lightColor" style = {{ marginTop: '10px' }}>[Some text about analysis and BASE-9]</div>
        </div>
    </div> 
    )
}

function ExplorerEntry({content}){
    // include some image?
    // something about "click here to enter"

    return(
        <div className = "pageInset foregroundBackgroundColor">
            <div className = "content"  style = {{minHeight:'700px', width:'100%'}}>
                <div className = "header darkColor">Interactive data explorer</div>

                <div className = "animateScrollWrapper">
                    <div className = "animateScroll scrollTransition">
                        <Link href = "explorer">
                            <div className = "inset bannerBackground linkDiv" style = {{minHeight: '600px'}}>
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

        <div className = "division lightColor">
            <div className = "content" style = {{minHeight:'700px', width:'100%"'}}>
                <div className = "headerSmall darkColor">Credit</div>
                <div className = "subheader darkColor" style = {{margin:'20px 0px 20px 0px'}}>Contributors</div>
                
                {contributors.map((d) => (
                    <Contributor {...d}/>
                ))}
               
                <hr/>
                <div style = {{height:"50px"}}></div>
                <div className = "subheader darkColor">Papers</div>

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

function ExplorerContainer({label, count}){
    // I'd like to be able to set the cursor while dragging to something other than the red circle (why is that default?!)
    const {globalState, setShowExplorerDivAtIndex} = useContext(GlobalStateContext);

    const top0 = document.querySelector('.topNav').getBoundingClientRect().height;
    const left0 = document.querySelector('.sideBar').getBoundingClientRect().width;
    const className = `explorerContainer ${label} index${count}`;
    const maxSize = window.innerHeight - 600;
    const top = top0 + (count*45 % maxSize);
    const left = left0 + count*5;

    const divRef = useRef(null);
    const [pos, setPos] = useState({ left: left, top: top });
    const [diffPos, setDiffPos] = useState({ diffX: 0, diffY: 0 });
    const [isDragging, setIsDragging] = useState(false);

    const getMaxZValue = () => {
        // get the maximum z-index for all the divs so that I can place the next one on top
        var z = 1;
        const elems = document.querySelectorAll('.explorerContainer');
        for (const elem of elems) {
            z = Math.max(elem.style.zIndex, z);
        }

        return z;
    }
    const [zIndex, setZIndex] = useState(getMaxZValue());

    const handleDragStart = (e) => {
        e.stopPropagation();

        const boundingRect = e.currentTarget.getBoundingClientRect();
        setDiffPos({
            diffX: e.screenX - boundingRect.left,
            diffY: e.screenY - boundingRect.top
        });
        setZIndex(getMaxZValue() + 1);
        e.dataTransfer.setData('text/plain', ''); // Required for dragging in Firefox
        e.dataTransfer.setDragImage(divRef.current,e.screenX - boundingRect.left, e.screenY - boundingRect.top);
        setIsDragging(true);
        return true;
    };
  
    const handleDragging = (e) => {
        const boundingRect = e.currentTarget.parentElement.getBoundingClientRect();
        const left = Math.min(Math.max(left0, e.screenX - diffPos.diffX), window.innerWidth - boundingRect.width);
        const top = Math.min(Math.max(top0, e.screenY - diffPos.diffY), window.innerHeight - boundingRect.height);

        // for some reason this seems necessary to avoid the last value (right before mouseUp) which is all zeros
        if (e.screenX != 0 || e.screenY != 0) setPos({ left: left, top: top });
    };
  
    const handleDragEnd = () => {
        setIsDragging(false);
    };
  

    const handleClick = (e) => {
        setZIndex(getMaxZValue() + 1);
    }

    // I need to fix this so that it closes the right one!
    const handleClose = (e) => {
        var className = e.target.parentElement.parentElement.parentElement.className;
        var i1 = className.indexOf('index') + 5;
        var substr = className.substring(i1);
        var index = className.substring(i1);
        var i2 = substr.indexOf(' ');
        if (i2 > 0) index = className.substring(i1, i2);
        console.log(className, i1, substr, i2, index);
        setShowExplorerDivAtIndex(index, false);
    };

    const handleSettings = () => {
        // to do
        console.log('settings');
    };


    return(
        <div 
            ref = {divRef}
            className = {className} 
            style = {{ ...pos, position: "absolute", zIndex: zIndex}}
            onClick = {handleClick}
        >
            <div className = "explorerTopBar grabbable" 
                draggable = {true}    
                onDragStart = {handleDragStart}
                onDrag = {handleDragging}
                onDragEnd = {handleDragEnd}
            >
                <span className = "label">{label}</span>
                <div className = "explorerTopBarIcons">
                    <span className = "material-symbols-outlined icon"onClick = {handleSettings}>settings</span>
                    <span className = "material-symbols-outlined icon" onClick = {handleClose}>close</span>
                </div>
            </div>

        </div>
    )
}

function SideBarButton({label, icon}){
    const {globalState, appendExplorerDiv} = useContext(GlobalStateContext);

    const handleButtonClick = () => {
        var key = label;
        if (label == 'hist.' ) key = 'histogram';
        appendExplorerDiv(key);
    };


    return( 
        <div key = {label} className = "button linkDiv" onClick = {handleButtonClick}>
            <div className = "material-symbols-outlined icon">{icon}</div>
            <div className = "label">{label}</div>
        </div>
    )
}

function SideBar({buttons}){
    return (
        <div className = "sideBar">
            <div style = {{height:'100px'}}></div>
            {buttons.map((data, index) => (
                <SideBarButton key = {index} {...data}/>
            ))}
        </div>
    )
}


// for explorer divs that are created when clicking on a button
// https://stackoverflow.com/questions/33840150/onclick-doesnt-render-new-react-component


export {HeaderTop, HeaderAnimation, HeaderExplanation, ExplorerEntry, Credit, Footer, Contributor, Paper, SideBar, ExplorerContainer}

