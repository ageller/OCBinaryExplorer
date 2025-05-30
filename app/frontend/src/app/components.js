import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaGithub } from 'react-icons/fa';

import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { CollectionsOutlined } from '@mui/icons-material';

function HeaderLinks() {

    return (
        <>
            <div id="homeHeader" className="lightBackgroundColor mediumColor headerSmall topNav">
                <div style={{padding:'10px', fontSize: '30px', display:'flex', flexDirection: 'row' }}>
                    <div style={{ marginRight: '20px'}}><a href="#aboutHeader">About</a></div>
                    <div style={{ marginRight: '20px'}}><a href="#teamHeader">Team</a></div>
                    <div style={{ marginRight: '20px'}}><a href="#papersHeader">Publications</a></div>
                    <div style={{ marginRight: '20px'}}><a href="#dataHeader">Data</a></div>
                    <div style={{ marginLeft: 'auto'}}><a href="https://github.com/ageller/OCBinaryExplorer" className="ml-auto text-xl"><FaGithub /></a></div>
                </div>
            </div>
        </>
    )
}

function ExplorerEntry() {
    // include an animation (or better image) that will play when the page loads(TO DO)
    const [windowHeight, setWindowHeight] = useState(0);
    const [windowWidth, setWindowWidth] = useState(0);
    const [top0, setTop0] = useState(0);
    const [sceneContainerStyle, setSceneContainerStyle] = useState({ width: "50%", height: '500px' });
    const sceneContainerRef = useRef(null);
    const [availableClusters, setAvailableClusters] = useState([]);
    const isInteracting = useRef(false);

    // Function to handle window resize event
    useEffect(() => {
        const handleResize = () => {
            setWindowHeight(window.innerHeight);
            setWindowWidth(window.innerWidth);
            const topNavElement = document.querySelector('.topNav');
            if (topNavElement) {
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
        // get the clusters (this could be done once for the entire )
        fetch("/ocbexapi/getAvailableClusters")
            .then(res => res.json())
            .then(data => {
                let options = [];
                data.clusters.forEach(d => {
                    options.push({ label: d.replaceAll('_', ' '), value: d })
                });
                setAvailableClusters(data.clusters);
            })
    }, []);

    useEffect(() => {

        // check that the scenConterRef is defined
        if (!sceneContainerRef.current) {
            console.log("sceneContainerRef is null at scene setup — delaying...");
            return;
        }
        // check if the data is availablel
        if (availableClusters.length == 0) {
            console.log("cluster data is not yet available — delaying...");
            return;
        }

        const container = sceneContainerRef.current;

        // Set up the Three.js scene
        // would be cool to add bloom to this: https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html
        const setupScene = () => {
            var width = window.innerWidth/2. - 20; //for scroll bar
            var height = window.innerHeight - 2.*top0;
            const sze = Math.min(width, height);
            width = height = sze;
            setSceneContainerStyle({ paddingTop:"10px", width: width, height: height });
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(90, width / height, 0.1, 1e5);
            camera.position.z = 0.1;
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(width, height);

            container.appendChild(renderer.domElement);
            const controls = new TrackballControls(camera, renderer.domElement);
            controls.noZoom = true;
            controls.noPan = true;


            // detect user interaction (so that I can stop the auto-rotate)
            controls.addEventListener("start", handleInteractionStart);
            controls.addEventListener("end", handleInteractionEnd);
            renderer.domElement.addEventListener("mousedown", handleInteractionStart);
            renderer.domElement.addEventListener("touchstart", handleInteractionStart);
            window.addEventListener("mouseup", handleInteractionEnd);
            window.addEventListener("touchend", handleInteractionEnd);
            return { scene, camera, controls, renderer };
        };

        // for detecting user interaction
        const handleInteractionStart = () => {
            isInteracting.value = true;
        };
        const handleInteractionEnd = () => {
            isInteracting.value = false;
        };

        // Add points to the scene
        const addPoints = (scene, coordinates, color) => {
            const vertices = [];
            const sizes = [];
            coordinates.forEach(({ name, x, y, z, rh }) => {
                if (!isNaN(x) & !isNaN(y) & !isNaN(z) & !isNaN(rh)) {
                    vertices.push(parseFloat(x), parseFloat(y), parseFloat(z));
                    sizes.push(2. * parseFloat(rh));
                }
            });
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(new Float32Array(sizes), 1));


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
                if (!isInteracting.value) {
                    // Rotate
                    camera.position.applyAxisAngle(new THREE.Vector3(1, 1, 0), 0.001);
                    camera.lookAt(scene.position);
                }

                controls.update();
                renderer.render(scene, camera);
            };
            animate();
        };


        // Handle window resize event
        const handleResizeWebGL = (renderer, camera) => {
            var width = window.innerWidth/2. - 20; //for scroll bar
            var height = window.innerHeight - 2.*top0;
            const sze = Math.min(width, height);
            width = height = sze;
            setSceneContainerStyle({ paddingTop:"10px", width: width, height: height });
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };


        // Resize event listener
        window.addEventListener('resize', () => handleResizeWebGL(renderer, camera));

        // Clean up the scene
        const cleanupScene = (renderer) => {
            return () => {
                console.log("Cleaning up scene", container);
                controls.dispose();
                renderer.domElement.removeEventListener("mousedown", handleInteractionStart);
                renderer.domElement.removeEventListener("touchstart", handleInteractionStart);
                window.removeEventListener('resize', handleResizeWebGL);
                window.removeEventListener("mouseup", handleInteractionEnd);
                window.removeEventListener("touchend", handleInteractionEnd);

                // Remove canvas if it exists
                if (container && renderer.domElement.parentNode === container) {
                    container.removeChild(renderer.domElement);
                    console.log('removed canvas from DOM')
                }

                renderer.dispose();
            };
        };

        const { scene, camera, controls, renderer } = setupScene();

        // Fetch and parse the CSV file
        fetch('data/OCdata_forUnity.csv')
            .then((response) => response.text())
            .then((data) => {
                console.log("available clusters", availableClusters);

                // coordinate arrays and colors for the two samples
                const coordinatesOther = [];
                const colorValueOther = getComputedStyle(document.documentElement).getPropertyValue('--foreground');
                const colorOther = new THREE.Color(colorValueOther.trim());
                const coordinatesAvail = [];
                const colorValueAvail = getComputedStyle(document.documentElement).getPropertyValue('--link');
                const colorAvail = new THREE.Color(colorValueAvail.trim());

                const lines = data.trim().split('\n');
                const headers = lines[0].split(',');
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',');
                    const coordinate = {};
                    for (let j = 0; j < headers.length; j++) {
                        coordinate[headers[j]] = values[j];
                    }
                    if (availableClusters.includes(values[0])) {
                        console.log('found available cluster', values[0]);
                        coordinatesAvail.push(coordinate);
                    } else {
                        coordinatesOther.push(coordinate);
                    }
                }
                // const objects = addObjects(scene, coordinates);
                const pointsOther = addPoints(scene, coordinatesOther, colorOther);
                const pointsAvail = addPoints(scene, coordinatesAvail, colorAvail);
                animateScene(scene, renderer, camera, controls);
            });

        // Clean up the scene when the component is unmounted
        return cleanupScene(renderer);
    }, [windowHeight, top0, availableClusters]);

    return (
        <div>
            <div className="division lightBackgroundColor" style={{ height: windowHeight - top0, position: "relative" }}>
                <div id="entry" style={{width:"100%", display:"flex", flexDirection:"row", alignItems: "center"}}>
                    <div className="content " id="explainer" style={{ paddingLeft: "40px", paddingRight:"40px", width:"50%"}}>
                        <div className="header bannerColor">Open Cluster Binary Explorer</div>
                        <div className="explainer darkColor">Access photometric binary-star data in a collection of open clusters</div>
                        <div className="explainerSmall darkColor">Click the button below to enter.  Scroll down for additional information about the project.</div>
                        <ExplorerEntryButton />
                    </div>
                        <div className="webGLContainer" ref={sceneContainerRef} style={sceneContainerStyle}></div>
                </div>
            </div>
        </div>
    )
}

function AboutSection(){
    return (
        <div style={{ padding: "10px"}}>
            <div id="aboutHeader" className="headerSmall darkColor">About this website</div>
            <div id="aboutContainer" style={{ marginTop: "20px", marginBottom: "40px" }}>
                <div className="darkColor">
                    <p>This website provides public access to data products and visualization tools to explore results from our open cluster photometric binary research.  Click the "Enter" button above to enter the interactive data explorer.  The interactive sky view on the right above shows the open cluster population as seen from Earth, with the clusters in this study highlighted in pink.   </p>  
                    <p>This project uses the Bayesian Analysis of Stellar Evolution with Nine Parameters <a href="https://base-9.readthedocs.io/en/latest/" target="blank">(BASE-9)</a> software suite along with Gaia kinematics and distances and photometry from Gaia, Pan-STARRS and 2MASS to characterise the binary-star populations in a collection of open clusters.   For more information, please see our publications below and the link to our archived dataset on Zenodo, which explain our analysis methods and data products in more detail.</p>
                </div>
            </div>
            {/* An NSF-funded research project from PI <a href="https://faculty.wcas.northwestern.edu/aaron-geller/index.html">Aaron M. Geller.</a> */}
        </div>
    )
}

function ExplorerEntryButton() {
    return (
        <Link href="explorer" style={{textDecoration:"none"}}>
            <div className="foregroundBackgroundColor linkDiv" style={{ marginTop:'16px', width:'140px', padding:'12px', borderRadius:'40px', textAlign:'center'}}>
                <div className="headerSmall bannerColor">Enter</div>
            </div>
        </Link>
    )
}


function ContributorPhoto({ index, name, link, image, title, affiliation, type }) {
    // why do I need this -3px to avoid the white space (where is the white space coming from??)
    return (
        // <div className="pageSideBySide" style={{ borderBottom: '1px solid gray', ...(index === 0 ? { borderTop: '1px solid gray' } : {marginTop: '-3px'}) }}>
        <div>
            <div className="pageSideBySide">
                <div className="smallerChild" style={{ padding: '10px' }}>
                    <div className="insetLeft">
                        <a href={link}>
                            <Image className="profileImage" src={image} height={150} width={150} alt={name} />
                        </a>
                    </div>
                </div>
                <div className="child">
                    <div className="insetRight centerV">
                        <p>
                            <strong><a href={link}>{name}</a></strong><br />
                            {title}<br />
                            {affiliation}<br />
                        </p>
                    </div>
                </div>
            </div>
            <hr style= {{marginLeft:"20px", marginRight:"20px"}}/>
        </div>
    )
}
function ContributorUndergrad({ index, name, link, image, title, affiliation, type }) {
    // why do I need this -3px to avoid the white space (where is the white space coming from??)
    return (
        <div className="pageSideBySide" >
            <div style={{ padding: '10px' }}>
                <strong>{name}</strong>, {title}, {affiliation}
            </div>
        </div>
    )
}
function Team({ contributors }) {

    return (
        <div className="lightBackgroundColor">
            <div id = "teamHeader" className="headerSmall darkColor" style={{ padding: "10px"}}>Meet the Team</div>
            {/* <div className = "lightBackgroundColor"> */}
            {contributors.map((d, i) => (
                d.type === 'undergrad' ? (
                    <ContributorUndergrad key={i} index={i} {...d} />
                ) : (
                    <ContributorPhoto key={i} index={i} {...d} />

                )
            ))}'
            {/* </div> */}
        </div>

    )
}


function Paper({ authors, title, bib, doi, link }) {

    return (
        <div className="paperContent">
            <em>"{title}"</em>, {authors}, {bib}, DOI: <a href={link}>{doi} </a>
        </div>
    )
}
function Papers({ papers }) {

    return (
        <div style={{ padding: "10px"}}>
            <div id="papersHeader" className="headerSmall darkColor ">Refereed Publications</div>
            <div>
                {papers.map((d, i) => (
                    <Paper key={i} {...d} />
                ))}
            </div>
        </div>
    )
}


function Abstract({ authors, title, bib, link }) {

    return (
        <div className="paperContent">
            <em>"{title}"</em>, {authors}, {bib}, <a href={link}>NASA ADS </a>
        </div>
    )
}
function Abstracts({ abstracts }) {

    return (
        <div style={{ padding: "10px"}}>
            <div className="headerSmall darkColor">Conference Presentations</div>
            <div>
                {abstracts.map((d, i) => (
                    <Abstract key={i} {...d} />
                ))}
            </div>
        </div>
    )
}
function DataAccess() {

    return (
        <div className="lightBackgroundColor" style={{ padding: "10px", marginTop:"40px", paddingBottom:"40px"}}>
            <div id="dataHeader" className="headerSmall darkColor">Data Access</div>
            <div className="darkColor"  style={{ paddingTop: '10px' }}>
                Data used in this study are available on <a href="https://zenodo.org/records/10080762">Zenodo here</a>.
            </div>
        </div>
    )
}
export { ExplorerEntry, Team, Papers, Abstracts, DataAccess, HeaderLinks, AboutSection } 
