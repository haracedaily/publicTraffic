import React from 'react';
import {Input, Space} from "antd";

function SearchTotal(props) {
    return (
        <div>
            <Space.Compact style={{ width: '100%', padding: '20px' }}>
                <Input.Search placeholder="버스번호 및 정류소" allowClear />
            </Space.Compact>
        </div>
    );
}

export default SearchTotal;