import React, { useState, useEffect, useRef } from "react";
import { Input, List, Spin, Button, message } from "antd";
import axios from "axios";
import {StarOutlined, StarFilled, ReloadOutlined, EnvironmentOutlined} from "@ant-design/icons";
import styles from "../css/MySearch.module.css";
import Myloca from "./Myloca.jsx";



const { Search } = Input;

const MySearch = ({ onToggleFavorite, favorites }) => {
    const key = 'one_key';

    const [searchResults, setSearchResults] = useState([]);
    const [isSearched, setIsSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showNoResults, setShowNoResults] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    // const [isExpanded, setIsExpanded] = useState(false);
    const searchRef = useRef(null);


    useEffect(() => {
        if (!isLoading && isSearched) {
            const timer = setTimeout(() => {
                setShowNoResults(searchResults.length === 0);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isLoading, isSearched, searchResults]);

    useEffect(() => {
        if (searchRef.current) {
            searchRef.current.input.focus();
        }
    }, []);

    const handleSearch = (value) => {
        if (value.trim() === "") {
            setSearchResults([]);
            setIsSearched(false);
            setIsLoading(false);
            setShowNoResults(false);
            // setIsExpanded(false);
            return;
        }

        setIsSearched(true);
        setIsLoading(true);
        setShowNoResults(false);
        // setIsExpanded(false);

        axios
            .get(
                `https://businfo.daegu.go.kr:8095/dbms_web_api/bs/search?searchText=${value}&wincId=`
            )
            .then((response) => {
                if (response.data.header.success) {
                    setSearchResults(response.data.body);
                } else {
                    setSearchResults([]);
                }
            })
            .catch((error) => {
                console.error("정류장 검색 실패:", error);
                message.error({
                    content: "정류장 검색에 실패했습니다.",
                    key,
                    duration: 2,
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleReset = () => {
        setSearchResults([]);
        setIsSearched(false);
        setIsLoading(false);
        setShowNoResults(false);
        setSearchValue("");
        // setIsExpanded(false);
        if (searchRef.current) {
            searchRef.current.input.focus();
        }
    };

    const handleToggleFavorite = (item) => {
        const isFavorite = favorites.some((fav) => fav.bsId === item.bsId);
        onToggleFavorite(item);
        message.success(
            {
                content: isFavorite
                    ? "나의 버스에서 제거되었습니다."
                    : "나의 버스에서 추가되었습니다.",
                key,
                duration: 2,
            }
        );
    };

    // const toggleExpand = () => {
    //     setIsExpanded(!isExpanded);
    // };

    // const displayedResults = isExpanded ? searchResults : searchResults.slice(0, 5);

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>나의 버스 등록</h3>
            <div className={styles.searchWrapper}>
                <Search
                    ref={searchRef}
                    placeholder="정류장 검색"
                    enterButton="검색"
                    size="large"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onSearch={handleSearch}
                    className={styles.searchInput}
                />
                {isSearched && (
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={handleReset}
                        size="large"
                        className={styles.resetButton}
                    />
                )}
            </div>
            {isSearched && (
                <div className={styles.resultsWrapper}>
                    {isLoading ? (
                        <div className={styles.loading}>
                            <Spin tip="Loading..." fullscreen/>
                        </div>
                    ) : showNoResults ? (
                        <div className={styles.noResults}>
                            <p>검색 결과가 없습니다.</p>
                        </div>
                    ) : (
                        <div>
                            <List
                                bordered
                                dataSource={searchResults}
                                renderItem={(item) => (
                                    <List.Item
                                        actions={[
                                            <Myloca stop={item}></Myloca>,
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleFavorite(item);
                                                }}
                                                className={styles.favoriteIcon}
                                            >
                                                {favorites.some((fav) => fav.bsId === item.bsId) ? (
                                                    <StarFilled style={{ color: "#fadb14" }} />
                                                ) : (
                                                    <StarOutlined />
                                                )}
                                            </span>,
                                        ]}
                                        className={styles.listItem}
                                    >

                                        <div className={styles.listItemContent}>
                                            <div className={styles.stopName} title={item.bsNm}>
                                                {item.bsNm}
                                            </div>
                                            <div className={styles.stopId} title={`정류장 ID: ${item.bsId}`}>
                                                정류장 ID: {item.bsId}
                                            </div>
                                            <div className={styles.routeList} title={`경유 노선: ${item.routeList}`}>
                                                경유 노선: {item.routeList}
                                            </div>
                                        </div>

                                    </List.Item>

                                )}

                                className={styles.list}

                            />
                            {/*<div className={styles.buttonWrapper}>*/}
                            {/*    {searchResults.length > 5 && (*/}
                            {/*        <Button*/}
                            {/*            onClick={toggleExpand}*/}
                            {/*            className={styles.toggleButton}*/}
                            {/*            type="primary"*/}
                            {/*        >*/}
                            {/*            {isExpanded ? "숨기기" : `더 보기 (${searchResults.length - 5}개)`}*/}
                            {/*        </Button>*/}
                            {/*    )}*/}
                            {/*</div>*/}

                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MySearch;