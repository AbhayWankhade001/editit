import { useNavigate } from 'react-router-dom';
import React from 'react';

const Button = () => {
const navigate = useNavigate();

const handleClick = () => {
navigate('/anotherpage');
};

return (
<button onClick={handleClick}>Go to Another Page</button>
);
};

export default Button;



