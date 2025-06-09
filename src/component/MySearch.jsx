import React, { useState, useEffect, useRef } from "react";
import { AutoComplete, List, Spin, Button, message, Input } from "antd";
import axios from "axios";
import { StarOutlined, StarFilled, ReloadOutlined } from "@ant-design/icons";
import debounce from "lodash/debounce";
import styles from "../css/MySearch.module.css";
import Myloca from "./Myloca.jsx";

const MySearch = ({ onToggleFavorite, favorites }) => {
    const key = "one_key";

    message.config({
        top: '10%',
    });

    const [searchResults, setSearchResults] = useState([]);
    const [isSearched, setIsSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showNoResults, setShowNoResults] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [options, setOptions] = useState([]);
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
            searchRef.current.focus();
        }
    }, []);

    const fetchSuggestions = async (value) => {
        if (value.trim() === "") {
            setOptions([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.get(
                `https://businfo.daegu.go.kr:8095/dbms_web_api/bs/search?searchText=${value}&wincId=`
            );
            if (response.data.header.success) {
                const filteredResults = response.data.body.filter((item) =>
                    item.bsNm.toLowerCase().includes(value.toLowerCase())
                );

                const uniqueResults = Array.from(
                    new Map(filteredResults.map((item) => [item.bsId, item])).values()
                );

                // 정렬 로직 추가: 검색어와의 관련성 기준
                const sortedResults = uniqueResults.sort((a, b) => {
                    const searchLower = value.toLowerCase();
                    const aName = a.bsNm.toLowerCase();
                    const bName = b.bsNm.toLowerCase();

                    const aExactMatch = aName === searchLower;
                    const bExactMatch = bName === searchLower;
                    if (aExactMatch && !bExactMatch) return -1;
                    if (!aExactMatch && bExactMatch) return 1;

                    const aStartsWith = aName.startsWith(searchLower);
                    const bStartsWith = bName.startsWith(searchLower);
                    if (aStartsWith && !bStartsWith) return -1;
                    if (!aStartsWith && bStartsWith) return 1;

                    const aIndex = aName.indexOf(searchLower);
                    const bIndex = bName.indexOf(searchLower);
                    if (aIndex !== bIndex) return aIndex - bIndex;

                    return aName.localeCompare(bName);
                });

                const suggestions = sortedResults.map((item) => ({
                    value: item.bsId,
                    label: (
                        <div>
                            <div>{item.bsNm}</div>
                            <div style={{ fontSize: "12px", color: "#888" }}>
                                {item.routeList}
                            </div>
                        </div>
                    ),
                    data: item,
                }));
                setOptions(suggestions);
            } else {
                setOptions([]);
            }
        } catch (error) {
            console.error("검색어 추천 실패:", error);
            message.error({
                content: "검색어 추천에 실패했습니다.",
                key,
                duration: 2,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);

    const handleSearch = (value) => {
        setSearchValue(value);
        debouncedFetchSuggestions(value);
    };

    const handleSelect = (value, option) => {
        setSearchValue(option.data.bsNm);
        setSearchResults([option.data]);
        setIsSearched(true);
        setShowNoResults(false);
    };

    const handleSearchButton = (value) => {
        if (value.trim() === "") {
            setSearchResults([]);
            setIsSearched(false);
            setIsLoading(false);
            setShowNoResults(false);
            setOptions([]);
            return;
        }

        setIsSearched(true);
        setIsLoading(true);
        setShowNoResults(false);

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
        setOptions([]);
        if (searchRef.current) {
            searchRef.current.focus();
        }
    };

    const handleToggleFavorite = (item) => {
        const isFavorite = favorites.some((fav) => fav.bsId === item.bsId);
        onToggleFavorite(item);
        message.success({
            content: isFavorite
                ? "나의 버스에서 제거되었습니다."
                : "나의 버스에 추가되었습니다.",
            key,
            duration: 2,
        });
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>나의 버스 등록</h3>
            <div className={styles.searchWrapper}>
                <AutoComplete
                    ref={searchRef}
                    options={options}
                    onSearch={handleSearch}
                    onSelect={handleSelect}
                    value={searchValue}
                    onChange={setSearchValue}
                    className={styles.searchInput}
                    placeholder="정류장 검색"
                >
                    <Input.Search
                        enterButton="검색"
                        size="large"
                        onSearch={handleSearchButton}
                    />
                </AutoComplete>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={handleReset}
                        size="large"
                        className={styles.resetButton}
                    />
            </div>
            {isSearched && (
                <div className={styles.resultsWrapper}>
                    {isLoading ? (
                        <div className={styles.loading}>
                            <Spin tip="Loading..." fullscreen />
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
                                    <List.Item key={item.bsId} className={styles.listItem}>
                                        <div className={styles.listItemContent}>
                                            <div className={styles.textContent}>
                                                <div className={styles.stopName} title={item.bsNm}>
                                                    {item.bsNm}
                                                </div>
                                                <div
                                                    className={styles.stopId}
                                                    title={`정류장 ID: ${item.bsId}`}
                                                >
                                                    정류장 ID: {item.bsId}
                                                </div>
                                                <div
                                                    className={styles.routeList}
                                                    title={`경유 노선: ${item.routeList}`}
                                                >
                                                    경유 노선: {item.routeList}
                                                </div>
                                            </div>
                                            <div className={styles.actions}>
                                                <Myloca stop={item} />
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
                        </span>
                                            </div>
                                        </div>
                                    </List.Item>
                                )}
                                className={styles.list}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MySearch;