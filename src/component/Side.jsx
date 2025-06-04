import React, {useState} from 'react';
import {Radio} from "antd";
import SearchTotal from "../pages/SearchTotal.jsx";
import BusRoute from "../pages/busRoute.jsx";
import styles from "../css/side.module.css";
function Side(props) {
    const [navTab, setNavTab] = useState('search');
    const handleTabClick = (e) => {
        setNavTab(e.target.value);
    }
    return (
        <nav ref={props.sideRef} className={props.isCommonMobile?styles.is_mobile_side:styles.side_nav}>
            <article id={styles.nav_header}>
                <img src="/bus.svg" alt="bus" />
                <h4>버스정보조회</h4>
            </article>
            <Radio.Group onChange={handleTabClick} value={navTab} style={{ width: '100%',display:'grid',gridTemplateColumns:'1fr 1fr' }} >
                <Radio.Button value="search" style={{borderRadius:0,height:"auto"}} className={"navSideTotalSearchBtn navSideRouteBtn"}>
                    <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
                        <img src={"/search_i.svg"} width={30} alt={"search_i"}/>
                        <h2 >통합검색</h2>
                    </div>
                </Radio.Button>
                <Radio.Button value="route" style={{borderRadius:0, height:"auto"}} className={"navSideRouteBtn"}>
                    <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
                        <img src={"/crossArrow.svg"} width={30} alt={"cross_arrow"}/>
                        <h2 >경로검색</h2>
                    </div>
                </Radio.Button>
            </Radio.Group>
            {navTab === 'search' ? <SearchTotal {...props} />:<BusRoute {...props} />}
        </nav>
    );
}

export default Side;