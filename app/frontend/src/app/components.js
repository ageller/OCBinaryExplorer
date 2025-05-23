import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';


function ExplorerEntry() {
    // include an animation (or better image) that will play when the page loads(TO DO)
    const [windowHeight, setWindowHeight] = useState(0);
    const [windowWidth, setWindowWidth] = useState(0);
    const [top0, setTop0] = useState(0);
    const [sceneContainerStyle, setSceneContainerStyle] = useState({ width: "100%", height: '500px' });
    const sceneContainerRef = useRef(null);
    const [availableClusters, setAvailableClusters] = useState([]);

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
        // Set up the Three.js scene
        // would be cool to add bloom to this: https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html
        const setupScene = () => {
            const width = window.innerWidth - 20; //for scroll bar
            const height = window.innerHeight - top0;
            setSceneContainerStyle({ width: width, height: height });
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1e5);
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
                renderer.render(scene, camera);
                controls.update();
            };
            animate();
        };


        // Handle window resize event
        const handleResizeWebGL = (renderer, camera) => {
            const width = window.innerWidth - 20; //for scroll bar
            const height = window.innerHeight - top0;
            setSceneContainerStyle({ width: width, height: height });
            camera.aspect = width / height;
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
        <div className="division darkBackgroundColor" style={{ height: windowHeight - top0, position: "relative" }}>
            <div className="webGLContainer" ref={sceneContainerRef} style={sceneContainerStyle}></div>
            <div className="content " id="explainer" style={{ position: "absolute", bottom: 0, left: 0 }}>
                <div id="explainerContainer" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
                    <div className="explainer">This website provides public access to data products and visualization tools to explore results from our open cluster photometric binary research.  Click the button below to enter the data explorer.</div>
                    <div className="explainerSmall">In short, the project uses the Bayesian Analysis of Stellar Evolution with Nine Parameters <a href="https://base-9.readthedocs.io/en/latest/" target="blank">(BASE-9)</a> software suite along with Gaia kinematics and distances and photometry from Gaia, Pan-STARRS and 2MASS to characterise the binary-star populations in a collection of open clusters.  For information about our methods and results, please see the Papers section at the bottom of this page.  You can access these data by clicking on the button below.</div>
                    <div className="explainerSmall">The interactive visualization above shows the open cluster population as seen from Earth, with the clusters in this study highlighted in pink.</div>
                </div>
                <ExplorerEntryButton />
            </div>
        </div>


    )
}

function ExplorerEntryButton() {
    return (
        <Link href="explorer">
            <div className="foregroundBackgroundColor linkDiv" style={{ marginLeft: '16px' }}>
                <div className="content">
                    <div className="headerSmall bannerColor">Click here to enter the <i>Interactive Data Explorer</i> </div>
                    <div className="subheader darkColor" >View, filter, sort, create, edit, and download data and plots</div>

                </div>
            </div>
        </Link>
    )
}


function ContributorPhoto({ index, name, link, image, title, affiliation, type }) {
    // why do I need this -3px to avoid the white space (where is the white space coming from??)
    return (
        // <div className="pageSideBySide" style={{ borderBottom: '1px solid gray', ...(index === 0 ? { borderTop: '1px solid gray' } : {marginTop: '-3px'}) }}>
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
        <>
            <div className="headerSmall darkColor">Meet the Team</div>
            {/* <div className = "lightBackgroundColor"> */}
            {contributors.map((d, i) => (
                d.type === 'undergrad' ? (
                    <ContributorUndergrad key={i} index={i} {...d} />
                ) : (
                    <ContributorPhoto key={i} index={i} {...d} />

                )
            ))}'
            {/* </div> */}
        </>

    )
}


function Paper({ authors, title, bib, doi, link }) {

    return (
        <li className="paperContent">
            <em>"{title}"</em>, {authors}, {bib}, DOI: <a href={link}>{doi} </a>
        </li>
    )
}
function Papers({ papers }) {

    return (
        <>
            <div className="headerSmall darkColor ">Refereed Publications</div>
            <ul className="lightBackgroundColor">
                {papers.map((d, i) => (
                    <Paper key={i} {...d} />
                ))}
            </ul>
        </>
    )
}


function Abstract({ authors, title, bib, link }) {

    return (
        <li className="paperContent">
            <em>"{title}"</em>, {authors}, {bib}, <a href={link}>NASA ADS </a>
        </li>
    )
}
function Abstracts({ abstracts }) {

    return (
        <>
            <div className="headerSmall darkColor">Conference Presentations</div>
            <ul className="lightBackgroundColor">
                {abstracts.map((d, i) => (
                    <Abstract key={i} {...d} />
                ))}
            </ul>
        </>
    )
}
function DataAccess() {

    return (
        <>
            <div className="headerSmall darkColor">Data Access</div>
            <div className="lightBackgroundColor darkColor"  style={{ padding: '10px' }}>
                Data used in this study are available on <a href="https://zenodo.org/records/10080762">Zenodo here</a>.
            </div>
        </>
    )
}
export { ExplorerEntry, Team, Papers, Abstracts, DataAccess } 
