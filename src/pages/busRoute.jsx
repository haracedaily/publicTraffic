import React from 'react';
import {Button, Input, Space} from "antd";
import {SearchOutlined} from "@ant-design/icons";

function BusRoute(props) {
    return (
        <div>

            <Space.Compact style={{width: '100%', padding: '20px'}}>
                <Input.Search placeholder="출발지를 선택해주세요." allowClear/>
            </Space.Compact>

            <Space.Compact style={{width: '100%', padding: '20px'}}>
                <Input.Search placeholder="도착지를 선택해주세요." allowClear/>
            </Space.Compact>
            <div style={{  padding: '10px' }}>
                <Button type='primary' icon={<SearchOutlined/>} style={{width: '88%'}}>
                    경로 찾기
                </Button>
            </div>
        </div>
    );
}

export default BusRoute;