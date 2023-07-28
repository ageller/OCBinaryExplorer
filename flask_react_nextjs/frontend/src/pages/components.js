import { useState, useContext, useRef, useEffect, useLayoutEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GlobalStateContext } from '../context/globalState';

import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';

import dynamic from 'next/dynamic';
const DynamicPlot = dynamic(() => import('react-plotly.js'), { ssr: false });


function HeaderTop({ title, subtitle, subsubtitle}) {

    return (
        <div className = "topNav">
            {(title || subtitle) &&
                <div className = "content">
                    {title && <div className = "header">{title}</div>}
                    {subtitle && <div className = "subheader">{subtitle }</div>}
                </div>
            }
            {subsubtitle && <div className = "content">{subsubtitle}</div>}

        </div>
    )

}

function ExplorerEntry(){
    // include an animation (or better image) that will play when the page loads(TO DO)
    const [windowHeight, setWindowHeight] = useState(0);
    const [windowWidth, setWindowWidth] = useState(0);
    const [top0, setTop0] = useState(0);
    const [sceneContainerStyle, setSceneContainerStyle] = useState({width:"100%", height: '500px'});
    const sceneContainerRef = useRef(null);

    // Function to handle window resize event
    useEffect(() => {
        const handleResize = () => {
            setWindowHeight(window.innerHeight);
            setWindowWidth(window.innerWidth);
            const topNavElement = document.querySelector('.topNav');
            if (topNavElement){
                setTop0(topNavElement.getBoundingClientRect().height);
            }
        }

        handleResize();

        // Add event listener for window resize
        window.addEventListener('resize', handleResize);
    
        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        // Set up the Three.js scene
        // would be cool to add bloom to this: https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html
        const setupScene = () => {
            const width = window.innerWidth - 20; //for scroll bar
            const height = window.innerHeight - top0;
            setSceneContainerStyle({width: width, height: height});
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1e5);
            camera.position.z = 0.1;
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(width, height);
            sceneContainerRef.current.appendChild(renderer.domElement);
            const controls = new TrackballControls(camera, renderer.domElement);
            controls.noZoom = true;
            controls.noPan = true;
            return { scene, camera, controls, renderer };
        };

    
        // Add points to the scene
        const addPoints = (scene, coordinates) => {
            const vertices = [];
            const sizes = [];
            coordinates.forEach(({name, x, y, z, rh}) => {
                if (!isNaN(x) & !isNaN(y) & !isNaN(z) & !isNaN(rh)){
                    vertices.push(parseFloat(x), parseFloat(y), parseFloat(z));
                    sizes.push(2.*parseFloat(rh));
                }
            });
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
            geometry.setAttribute('size', new THREE.BufferAttribute(new Float32Array(sizes), 1));
            const colorValue = getComputedStyle(document.documentElement).getPropertyValue('--foreground');
            const color = new THREE.Color(colorValue.trim());

            // Create the shader material
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    pointColor: { value: new THREE.Vector3(color.r, color.g, color.b) }
                },
                vertexShader: `
                    attribute float size;
                    varying float vSize;
                
                    void main() {
                        vSize = size;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        gl_PointSize = size; // Set the size of each point
                    }
                `,
                fragmentShader: `
                    uniform vec3 pointColor;
                    varying float vSize;
                    
                    void main() {
                        vec2 fromCenter = abs(gl_PointCoord - vec2(0.5));
                        float dist = 2.*length(fromCenter);
                        gl_FragColor = vec4(pointColor, 1. - dist);
                    }
                `,
                transparent: true, 
                blending: THREE.AdditiveBlending,
                depthTest: false
            });
            const points = new THREE.Points(geometry, material);
            scene.add(points);
            return points;
        };

        // Animate the scene
        const animateScene = (scene, renderer, camera, controls) => {
          const animate = () => {
                requestAnimationFrame(animate);
                renderer.render(scene, camera);
                controls.update();
            };
          animate();
        };


        // Handle window resize event
        const handleResizeWebGL = (renderer, camera) => {
            const width = window.innerWidth - 20; //for scroll bar
            const height = window.innerHeight - top0;
            setSceneContainerStyle({width: width, height: height});
            camera.aspect = width/height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };


        // Resize event listener
        window.addEventListener('resize', () => handleResizeWebGL(renderer, camera));
        
        // Clean up the scene
        const cleanupScene = (renderer) => {
            return () => {
                if (sceneContainerRef.current) sceneContainerRef.current.removeChild(renderer.domElement);
                window.removeEventListener('resize', handleResizeWebGL);

            };
        };
    
        const { scene, camera, controls, renderer } = setupScene();

        // Fetch and parse the CSV file
        fetch('data/OCdata_forUnity.csv')
            .then((response) => response.text())
            .then((data) => {
                const coordinates = [];
                const lines = data.trim().split('\n');
                const headers = lines[0].split(',');
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',');
                    const coordinate = {};
                    for (let j = 0; j < headers.length; j++) {
                        coordinate[headers[j]] = values[j];
                    }
                    coordinates.push(coordinate);
                }
                // const objects = addObjects(scene, coordinates);
                const points = addPoints(scene, coordinates);
                animateScene(scene, renderer, camera, controls);
        });

        // Clean up the scene when the component is unmounted
        return cleanupScene(renderer);
      }, [windowHeight, top0]);

    return(
        <div className = "division darkBackgroundColor" style = {{height: windowHeight - top0, position: "relative"}}>
            <div className = "webGLContainer" ref = {sceneContainerRef}  style = {sceneContainerStyle}></div>
            <div className = "content " id = "explainer" style = {{position:"absolute",  bottom:0, left:0}}>
                <div className = "subheader lightColor">[Explanation of the analysis]</div>
                <div className = "lightColor" style = {{ margin: '10px 0px 10px 16px' }}>[Some text about analysis and BASE-9]</div>
                <ExplorerEntryButton />
            </div>
        </div> 


    )
}

function ExplorerEntryButton(){
    return(
        <Link href = "explorer">
            <div className = "foregroundBackgroundColor linkDiv" style={{marginLeft:'16px'}}>
                <div className = "content">
                    <div className = "headerSmall bannerColor">Click here to enter the <i>Interactive Data Explorer</i> </div>
                    <div className = "subheader darkColor" >View, filter, sort, create, edit, and download data and plots</div>

                </div>
            </div>
        </Link>
    )
}

function ExplorerEntryLarge({content}){
    // currently unused
    // include some image
    // something about "click here to enter"
    const [windowHeight, setWindowHeight] = useState(0);
    const [divHeight, setDivHeight] = useState(0);

    useEffect(() => {
        setDivHeight(document.querySelector('#explorerEntryHeader').getBoundingClientRect().height + 40);

        // Function to handle window resize event
        const handleResize = () => {
            setWindowHeight(window.innerHeight);
        };
    
        // Set initial window height
        setWindowHeight(window.innerHeight);
    
        // Add event listener for window resize
        window.addEventListener('resize', handleResize);
    
        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return(
        <div className = "pageInset foregroundBackgroundColor" id="explorerEntryDiv" style = {{height: windowHeight}}>
            <div className = "content"  style = {{minHeight:'700px', width:'100%'}}>
                <div className = "header darkColor" id = "explorerEntryHeader">Interactive data explorer</div>

                <div className = "animateScrollWrapper">
                    <div className = "animateScroll scrollTransition">
                        <Link href = "explorer">
                            <div className = "inset bannerBackgroundColor linkDiv" style = {{height: windowHeight - divHeight}}>
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




function ContributorPhoto({ index, name, link, image, title, affiliation, type }){
    // why do I need this -3px to avoid the white space (where is the white space coming from??)
    return( 
        <div className="pageSideBySide" style={{ borderBottom: '1px solid gray', ...(index === 0 ? { borderTop: '1px solid gray' } : {marginTop: '-3px'}) }}>
            <div className = "smallerChild" style = {{padding:'10px'}}>
                <div className = "insetLeft">
                    <a href = {link}>
                        <Image className = "profileImage" src = {image} height = {150} width = {150} alt = {name}/>
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
function ContributorUndergrad({ index, name, link, image, title, affiliation, type }){
    // why do I need this -3px to avoid the white space (where is the white space coming from??)
    return( 
        <div className="pageSideBySide" >
            <div style = {{padding:'10px'}}>
                <strong>{name}</strong>, {title}, {affiliation}
            </div>
        </div>
    )
}
function Team({ contributors }){

    return(
        <>
            <div className = "headerSmall darkColor">Meet the Team</div>
            {contributors.map((d, i) => (
                d.type === 'undergrad' ? (
                    <ContributorUndergrad key = {i} index={i} {...d}/>
                ) : (
                    <ContributorPhoto key = {i} index={i} {...d}/>

                )
            ))}
        </>

    )
}


function Paper({ content }){

    return( 
        <div className = "paperContent">
        </div>
    )
}
function Papers({ papers }){

    return(
        <>
            <div className = "headerSmall darkColor">Papers</div>
            {papers.map((d, i) => (
                <Paper key = {i} {...d}/>
            ))}
        </>
    )
}
function Footer(){
    return(
        <div className = "division footer">
            <div className = "content" style = {{fontSize: "calc(10px + 0.5vw)"}}>
                This material is based upon work supported by the National Science Foundation under AAG Grant No. AST-2107738.  Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the National Science Foundation.
                <div style={{height:'20px'}}></div>
                For additional Information, please contact: <br/><br/>
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

function PlotlyFigure({data}){

    var dataUse;
    var layout = {
        width: data.div_width,
        height: data.div_height
    };
    if (data.type === "histogram"){
        dataUse = [{
            x: data.x,
            type: data.type,
        },];
        layout.xaxis = {title: data.x2_column === "" ? data.x_column : data.x_column + "-" + data.x2_column};
        layout.yaxis = {title: 'N'};
    } else if (data.type === "scatter"){
        dataUse = [{
            x: data.x,
            y: data.y,
            type: data.type,
            mode:data.mode,
        },]; 
        layout.xaxis =  {title: data.x2_column === "" ? data.x_column : data.x_column + "-" + data.x2_column};
        layout.yaxis = {title: data.y_column};
    }

    const config = {};
    
    return dataUse[0].x.length > 0 ? (
            <div style= {{marginTop: "40px"}}>
                <DynamicPlot data={dataUse} layout={layout} config={config} /> 
            </div>
        )
    : null;

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
    const [pos, setPos] = useState({ left: left, top: top, maxWidth: window.innerWidth - left0, maxHeight: window.innerHeight - top0 });
    const [diffPos, setDiffPos] = useState({ diffX: 0, diffY: 0 });
    const [isDragging, setIsDragging] = useState(false);

    const [plotData, setPlotData] = useState({
        cluster: "",
        table: "",
        x_column: "",
        x2_column: "",
        y_column: "",
        x:[],
        y:[],
        type:label,
        mode:label === "scatter" ? "markers" : "",
        div_height:0,
        div_width:0,
    });
    const [availableClusters, setAvailableClusters] = useState({clusters:[], options:[]});
    const [availableTables, setAvailableTables] = useState({tables:[], options:[]});
    const [availableColumns, setAvailableColumns] = useState({columns:[], options:[]});

    ///////////////////
    // functions to set the div position
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
        const maxWidth = window.innerWidth - left;
        const maxHeight = window.innerHeight - top;

        // for some reason this seems necessary to avoid the last value (right before mouseUp) which is all zeros
        if (e.screenX != 0 || e.screenY != 0) setPos({ left: left, top: top, maxWidth: maxWidth, maxHeight: maxHeight });
    };
  
    const handleDragEnd = () => {
        setIsDragging(false);
    };
  

    const handleClick = (e) => {
        setZIndex(getMaxZValue() + 1);
    }

    const handleClose = (e) => {
        var className = e.target.parentElement.parentElement.parentElement.className;
        var i1 = className.indexOf('index') + 5;
        var substr = className.substring(i1);
        var index = className.substring(i1);
        var i2 = substr.indexOf(' ');
        if (i2 > 0) index = className.substring(i1, i2);
        setShowExplorerDivAtIndex(index, false);
    };

    ////////////////////////////
    // database queries

    useEffect(() => {
        // get the clusters (this could be done once for the entire )
        fetch("/api/getAvailableClusters")
            .then(res => res.json())
            .then(data => {
                let options = [];
                data.clusters.forEach(d => {
                    options.push({label: d.replaceAll('_',' '), value: d})
                });
                setAvailableClusters({
                    clusters: data.clusters,
                    options: options
                });
            })
    }, []);

    useEffect(() => {
        // when the cluster changes
        // - set the cluster on the backend
        // - get the available tables for that cluster

        fetch('/api/setCluster', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(plotData),
          })
            .then(response => response.json())
            .then(data => {
                let options = [];
                data.tables.forEach(d => {
                    options.push({label: d.replaceAll('_',' '), value: d})
                });               
                setAvailableTables({
                    tables: data.tables,
                    options: options
                });
            })
            .catch(error => {
                console.error('Error sending cluster data:', error);
            });

    }, [plotData.cluster]);

    useEffect(() => {
        // when the table changes
        // - get the available columns for that table

        fetch('/api/setTable', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(plotData),
          })
            .then(response => response.json())
            .then(data => {
                let options = [];
                data.columns.forEach(d => {
                    options.push({label: d, value: d})
                });               
                setAvailableColumns({
                    columns: data.columns,
                    options: options
                });
            })
            .catch(error => {
                console.error('Error sending table data:', error);
            });

    }, [plotData.table]);

    useEffect(() => {
        // when the x_column or x2_column changes
        // - get the data from the table

        fetch('/api/setXColumn', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(plotData),
          })
            .then(response => response.json())
            .then(data => {
                setPlotData((prevData) => ({
                    ...prevData,
                    x: data.x_data,
                }))
            })
            .catch(error => {
                console.error('Error sending x column:', error);
            });

    }, [plotData.x_column, plotData.x2_column]);


    useEffect(() => {
        // when the y_column changes
        // - get the data from the table

        fetch('/api/setYColumn', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(plotData),
          })
            .then(response => response.json())
            .then(data => {
                setPlotData((prevData) => ({
                    ...prevData,
                    y: data.y_data,
                }))
            })
            .catch(error => {
                console.error('Error sending y column:', error);
            });

    }, [plotData.y_column]);
    
    // resizing for the plot
    // TO DO
    
        
    ////////////////////////////
    // function controlling the settings
    const toggleSettings = () => {
        divRef.current.querySelector('.explorerSettings').classList.toggle("hidden");

    };

    const renderDropdown = (options, dataKey) => {
        const handleDropdownChange = (event) => {
            const selectedValue = event.target.value;
            setPlotData((prevData) => ({
                ...prevData,
                [dataKey]: selectedValue,
            }));
        };
        
        return (
          <select value = {plotData[dataKey]} onChange={handleDropdownChange}>
            <option value="" disabled>Please select</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      };

    const explorerSettings = () => {
        return (
            <div style={{ padding: '40px 10px' }}>
                <p style={{ fontSize: '20px' }}>
                    <i>Settings</i>
                </p>
                {label === 'table' && (
                    <div>
                        1. Select the cluster <br/>
                        {renderDropdown(availableClusters.options, 'cluster')}
                        <br/><br/>
                        2. Select the data table <br/>
                        {renderDropdown(availableTables.options, 'table')}
                    </div>
                )}
                {label === 'histogram' && (
                    <div>
                        1. Select the cluster <br/>
                        {renderDropdown(availableClusters.options, 'cluster')}
                        <br/><br/>
                        2. Select the data table <br/>
                        {renderDropdown(availableTables.options, 'table')}
                        <br/><br/>
                        3. Select the column to plot <br/>
                        {renderDropdown(availableColumns.options, 'x_column')}
                        <br/><br/>
                        3a. (Optional) Select a column to subtract from the previous column (e.g., for a color) <br/>
                        {renderDropdown(availableColumns.options, 'x2_column')}
                    </div>
                )}
                {label === 'scatter' && (
                    <div>
                        1. Select the cluster <br/>
                        {renderDropdown(availableClusters.options, 'cluster')}
                        <br/><br/>
                        2. Select the data table <br/>
                        {renderDropdown(availableTables.options, 'table')}
                        <br/><br/>
                        3. Select the column for the x-axis <br/>
                        {renderDropdown(availableColumns.options, 'x_column')}
                        <br/><br/>
                        3a. (Optional) Select a column to subtract from the previous column (e.g., for a color) <br/>
                        {renderDropdown(availableColumns.options, 'x2_column')}
                        <br/><br/>
                        4. Select the column for the y-axis <br/>
                        {renderDropdown(availableColumns.options, 'y_column')}
                    </div>
                )}
                <br/><br/>
                <div className = "button linkDiv" onClick={toggleSettings}>Done</div>
            </div>
          );
    }


    return(
        <div 
            ref = {divRef}
            className = {className} 
            style = {{ ...pos, position: "absolute", zIndex: zIndex}}
            onClick = {handleClick}
        >
            <div className = "explorerSettings">
                {explorerSettings()}
            </div>
            <div className = "explorerMain">
                <PlotlyFigure data={plotData} />
            </div>
            <div className = "explorerTopBar grabbable" 
                draggable = {true}    
                onDragStart = {handleDragStart}
                onDrag = {handleDragging}
                onDragEnd = {handleDragEnd}
            >
                <span className = "label">{label}</span>
                <div className = "explorerTopBarIcons">
                    <span className = "material-symbols-outlined icon"onClick = {toggleSettings}>settings</span>
                    <span className = "material-symbols-outlined icon" onClick = {handleClose}>close</span>
                </div>
            </div>


        </div>
    )
}

function SideBarButton({label, icon, style}){
    const {globalState, appendExplorerDiv} = useContext(GlobalStateContext);

    const handleButtonClick = () => {
        var key = label;
        if (label == 'hist.' ) key = 'histogram';
        appendExplorerDiv(key);
    };


    return( 
        <div key = {label} className = "button linkDiv" onClick = {handleButtonClick} style = {style}>
            <div className = "material-symbols-outlined icon">{icon}</div>
            <div className = "label">{label}</div>
        </div>
    )
}
function SideBarHomeButton({label, icon, style}){

    return( 
        <Link href = "/">
            <div key = {label} className = "button linkDiv"  style = {style}>
                <div className = "material-symbols-outlined icon">{icon}</div>
                <div className = "label">{label}</div>
            </div>
        </Link>
    )
}

function SideBar({buttons}){
    return (
        <div className = "sideBar">
            <div style = {{height:'80px'}}></div>
            {buttons.map((data, index) => (
                <SideBarButton key = {index} {...data}/>
            ))}
            <SideBarHomeButton label = "home" icon = "home" style={{position:"absolute", bottom:"0px"}}/>

        </div>
    )
}


// for explorer divs that are created when clicking on a button
// https://stackoverflow.com/questions/33840150/onclick-doesnt-render-new-react-component


export {HeaderTop, ExplorerEntry, Team, Papers, Footer, SideBar, ExplorerContainer}

