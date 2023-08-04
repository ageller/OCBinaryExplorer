'use client'

// for explorer divs that are created when clicking on a button
// https://stackoverflow.com/questions/33840150/onclick-doesnt-render-new-react-component

import {useState, useContext, useRef, useEffect, useMemo} from 'react';
import Link from 'next/link';
import {GlobalStateContext} from '../context/globalState';

import dynamic from 'next/dynamic';
const DynamicPlot = dynamic(() => import('react-plotly.js'), { ssr: false });

import { MaterialReactTable } from 'material-react-table';
import { Box, Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { ExportToCsv } from 'export-to-csv'; //or use your library of choice here


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
        color_column: "",
        table_columns: {},
        table_data: [],
        x:[],
        y:[],
        color: [],
        type:label,
        mode:label === "scatter" ? "markers" : "",
        nbinsx:'',
        xmin:'',
        xmax:'',
        ymin:'',
        ymax:'',
    });
    const [availableClusters, setAvailableClusters] = useState({clusters:[], options:[]});
    const [availableTables, setAvailableTables] = useState({tables:[], options:[]});
    const [availableColumns, setAvailableColumns] = useState({columns:[], options:[]});

    const [plotlyLayout, setPlotlyLayout] = useState({width:0, height:0});
    const [tableLayout, setTableLayout] = useState({maxHeight:'100px'})

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
                let check_options = {};
                data.columns.forEach(d => {
                    check_options[d] = false;
                });                  
                setAvailableColumns({
                    columns: data.columns,
                    options: options
                });
                setPlotData((prevData) => ({
                    ...prevData,
                    table_columns: check_options,
                }))
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
    
    useEffect(() => {
        // when the color_column changes
        // - get the data from the table

        fetch('/api/setColorColumn', {
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
                    color: data.color_data,
                }))
            })
            .catch(error => {
                console.error('Error sending color column:', error);
            });

    }, [plotData.color_column]);

    useEffect(() => {
        // when the table_columns changes
        // - get the data from the table

        fetch('/api/setTableData', {
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
                    table_data: data.table_data,
                }))
            })
            .catch(error => {
                console.error('Error setting table data:', error);
            });

    }, [plotData.table_columns]);

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

    const renderTextInput = (dataKey) => {
        const handleTextInputChange = (event) => {
            const selectedValue = event.target.value;
            setPlotData((prevData) => ({
                ...prevData,
                [dataKey]: selectedValue,
            }));
        };
        
        return (
            <input
                type="text"
                value={plotData[dataKey]}
                onChange={handleTextInputChange}
                placeholder=""
          />
        );
    };

    const renderCheckboxGrid = (dataKey) => {
        const handleCheckboxChange = (event) => {
            const { name, checked } = event.target;
            setPlotData((prevData) => ({
                ...prevData,
                [dataKey]: {
                    ...prevData[dataKey],
                        [name]: checked,
                },
            }));
        };
        
        return (
            <div style={{fontSize:'12px'}}>
                <table>
                <tbody>
                    {Object.keys(plotData[dataKey]).map((option) => (
                        <tr key={option}>
                            <td>
                                <input
                                    type="checkbox"
                                    name={option}
                                    checked={plotData[dataKey][option]}
                                    onChange={handleCheckboxChange}
                                />
                            </td>
                            <td>{option}</td>
                        </tr>
                    ))}
                </tbody>
              </table>
            </div>
        );


    };

    const explorerSettings = () => {
        return (
            <div style={{ padding: '40px 0px' }}>
                <p style={{ fontSize: '20px', paddingLeft:'10px' }}>
                    <i>Settings</i>
                </p>
                {label === 'table' && (
                    <div className="settingsContainer">
                        1. Select the cluster <br/>
                        {renderDropdown(availableClusters.options, 'cluster')}
                        <br/><br/>
                        2. Select the data table <br/>
                        {renderDropdown(availableTables.options, 'table')}
                        <br/><br/>
                        2. Select the columns that you would like to show <br/>
                        {renderCheckboxGrid('table_columns')}
                    </div>
                )}
                {label === 'histogram' && (
                    <div className="settingsContainer">
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
                        {renderDropdown([{label:"None", value:"None"}].concat(availableColumns.options), 'x2_column')}
                        <br/><br/>
                        4. (Optional) Set the number of bins <br/>
                        {renderTextInput('nbinsx')}
                        <br/><br/>
                        5. (Optional) Set the x-axis range <br/>
                        {renderTextInput('xmin')}&nbsp;{renderTextInput('xmax')}
                    </div>
                )}
                {label === 'scatter' && (
                    <div className="settingsContainer">
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
                        {renderDropdown([{label:"None", value:"None"}].concat(availableColumns.options), 'x2_column')}
                        <br/><br/>
                        4. Select the column for the y-axis <br/>
                        {renderDropdown(availableColumns.options, 'y_column')}
                        <br/><br/>
                        5. (Optional) Select a column for the point color <br/>
                        {renderDropdown([{label:"None", value:"None"}].concat(availableColumns.options), 'color_column')}
                        <br/><br/>
                        6. (Optional) Set the x-axis range <br/>
                        {renderTextInput('xmin')}&nbsp;{renderTextInput('xmax')}
                        <br/><br/>
                        7. (Optional) Set the y-axis range <br/>
                        {renderTextInput('ymin')}&nbsp;{renderTextInput('ymax')}
                    </div>
                )}
                <br/><br/>
                <div className = "button linkDiv" style = {{marginLeft:'10px'}}onClick={toggleSettings}>Done</div>
            </div>
          );
    }

    ////////////////////////////////////////////
    // function for visualizing the data

    // Function to update the Plotly layout with the current div size
    const updateVisualizationLayout = () => {
        if (divRef.current) {
            if (plotData.type === "histogram"){
                setPlotlyLayout((prevData) => ({
                    ...prevData,
                    xaxis: {
                        title: (plotData.x2_column === "" | plotData.x2_column === "None") ? plotData.x_column : plotData.x_column + "-" + plotData.x2_column, 
                        range: [plotData.xmin, plotData.xmax], 
                        showline: true,
                        zeroline: false,
                    },
                    yaxis: {
                        title: 'N', 
                        range: [plotData.ymin, plotData.ymax], 
                        showline: true,
                        zeroline: false,
                    },
                    width: divRef.current.clientWidth,
                    height: divRef.current.clientHeight - 50
                }))
            } else if (plotData.type === "scatter"){
                setPlotlyLayout((prevData) => ({
                    ...prevData,
                    xaxis: {
                        title: (plotData.x2_column === "" | plotData.x2_column === "None") ? plotData.x_column : plotData.x_column + "-" + plotData.x2_column, 
                        range: [plotData.xmin, plotData.xmax], 
                        showline: true,
                        zeroline: false,
                    },
                    yaxis: {
                        title: plotData.y_column, 
                        range: [plotData.ymin, plotData.ymax], 
                        showline: true,
                        zeroline: false,
                    },
                    width: divRef.current.clientWidth,
                    height: divRef.current.clientHeight - 50
                }))
            } else if (plotData.type === "table"){
                setTableLayout((prevData) => ({
                    ...prevData,
                    maxHeight: (divRef.current.clientHeight - 250) + 'px'
                }))
            }

        }
    };


    //observe for changes in the divRef size
    useEffect(() => {
        updateVisualizationLayout();
        const resizeObserver = new ResizeObserver(updateVisualizationLayout);
        if (divRef.current) resizeObserver.observe(divRef.current);

        // Cleanup the observer when the component unmounts
        return () => {
            if (divRef.current) resizeObserver.unobserve(divRef.current);
        };
    }, [plotData])


    // functions for the table 
    // define the columns, should be memoized or stable
    const use_table_columns = useMemo(() => {
        let header = [];
        Object.keys(plotData.table_columns).map((col) => {
            if (plotData.table_columns[col]) header.push(
                {
                    accessorKey:col.replaceAll(' ',''),
                    header: col
                }
            )
        })
        return header
    },[plotData.table_columns]);

    const csvOptions = {
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: false,
        headers: use_table_columns.map((c) => c.header),
    };
      
    const csvExporter = new ExportToCsv(csvOptions);

    const handleExportRows = (rows) => {
        csvExporter.generateCsv(rows.map((row) => row.original));
    };
    
    const handleExportData = () => {
        csvExporter.generateCsv(plotData.table_data);
    };

    const visualizeData = () => {
        var dataUse;
        let plotDefined = false;

        // for histogram and scatter I will use plotly
        if (plotData.type === "histogram" || plotData.type === "scatter"){
            if (plotData.type === "histogram"){
                dataUse = [{
                    x: plotData.x,
                    type: plotData.type,
                    nbinsx : plotData.nbinsx
                },];
                if (dataUse[0].x.length > 0) plotDefined = true;
            } else if (plotData.type === "scatter"){
                dataUse = [{
                    x: plotData.x,
                    y: plotData.y,
                    type: plotData.type,
                    mode: plotData.mode,
                },]; 
                if (plotData.color_column != "" && plotData.color.length === plotData.x.length){
                    dataUse[0].marker = {
                        color: plotData.color,
                        colorscale: 'Viridis',
                        colorbar: {
                            thickness:10,
                            title: plotData.color_column,
                        },
                        showscale: true,
                    }
                }
                if (dataUse[0].x.length > 0 && dataUse[0].y.length > 0 ) plotDefined = true;
            }

            const config = {};

            if (plotDefined){
                return (
                    <div style= {{marginTop: "40px"}}>
                        <DynamicPlot data={dataUse} layout={plotlyLayout} config={config} /> 
                    </div>
                )
            }

        }


        // for tables, I will use a different library
        // currently using https://datatables.net/
        if (plotData.type === "table"){

            if (plotData.table_data.length > 0) {
  
                return (
                    <div style= {{marginTop: "40px"}}>
                        <MaterialReactTable  
                            columns={use_table_columns} 
                            data={plotData.table_data}
                            enableRowSelection
                            initialState={{ 
                                pagination: 
                                    { 
                                        pageSize: 5, 
                                        pageIndex: 1, 
                                    },
                                density: 'compact' 
                                }}
                                enableStickyHeader
                            muiTableContainerProps={{ 
                                sx: { 
                                    maxHeight: tableLayout.maxHeight,
                                } 
                            }}
                            muiTablePaginationProps={{
                                rowsPerPageOptions: [5, 10, 25, 100, 1000],
                            }}
                            renderTopToolbarCustomActions={({ table }) => (
                                <Box sx={{ display: 'flex', gap: '1rem', p: '0.5rem', flexWrap: 'wrap' }}>
                                    <Button
                                        sx={{ 
                                            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--banner'),
                                            color: getComputedStyle(document.documentElement).getPropertyValue('--foreground'),
                                        }}
                                        disabled={table.getPrePaginationRowModel().rows.length === 0}
                                        //export all rows, including from the next page, (still respects filtering and sorting)
                                        onClick={() => handleExportRows(table.getPrePaginationRowModel().rows)}
                                        startIcon={<FileDownloadIcon />}
                                        variant="contained"
                                    >
                                        Export All Rows
                                    </Button>
                                    <Button
                                        sx={{ 
                                            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--banner'),
                                            color: getComputedStyle(document.documentElement).getPropertyValue('--foreground'),
                                        }}
                                        disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
                                        //only export selected rows
                                        onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
                                        startIcon={<FileDownloadIcon />}
                                        variant="contained"
                                    >
                                        Export Selected Rows
                                    </Button>
                                </Box>
                            )}
                        />
                    </div>
                )
            }
        } 



        return (
                <div style= {{margin: "60px 40px"}}>
                    Please click on the gear icon above to define the settings.
                </div>
            );
    }



    return(
        <div 
            ref = {divRef}
            className = {className} 
            style = {{ ...pos, position: "absolute", zIndex: zIndex}}
            onClick = {handleClick}
            key = {count}
        >
            <div className = "explorerSettings">
                {explorerSettings()}
            </div>
            <div className = "explorerMain">
                {visualizeData()}
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

export {SideBar, ExplorerContainer}
