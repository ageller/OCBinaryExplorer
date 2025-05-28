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


function Footer(){
    return(
        <div className = "division footer">
            <div className = "content" style = {{fontSize: "calc(10px + 0.3vw)", lineHeight: "calc(14px + 0.3vw)"}}>
                This material is based upon work supported by the National Science Foundation under AAG Grant No. AST-2107738.  Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the National Science Foundation. <br/><br/>
                © 2023-2025 <b><a href = "https://faculty.wcas.northwestern.edu/aaron-geller/index.html">Aaron M. Geller</a></b> 
            </div>
        </div>
    )
}


export {HeaderTop, Footer} 
