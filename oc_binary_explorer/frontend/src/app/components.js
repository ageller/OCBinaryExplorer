import { useState, useRef, useEffect} from 'react';
import Link from 'next/link';
import Image from 'next/image';

import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';


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


export {ExplorerEntry, Team, Papers} 
