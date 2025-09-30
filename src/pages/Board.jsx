// import React, { useEffect, useState } from 'react';
// import axios from '../axios';

const Board = () => {
    // const [msg, setMsg] = useState([]);

    // useEffect(() => {
    //     axios
    //         .get('/api/allmember')
    //         .then((res) => setMsg(res.data))
    //         .catch((err) => console.error('Axios error:', err));
    // }, []);
    // console.log(msg);

    return (
        <div>
            Board
            {/* <ul>
                {msg.map((member) => (
                    <li key={member.mem_id}>
                        이름: {member.mem_name} / 이메일: {member.mem_email}
                    </li>
                ))}
            </ul> */}
        </div>
    );
};

export default Board;
