import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'p-6',
  ...props
}) => {
  const classes = `rounded-2xl shadow-lg bg-white ${padding} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
