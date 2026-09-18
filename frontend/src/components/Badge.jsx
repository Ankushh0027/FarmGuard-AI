import React from 'react';

export default function Badge({ variant = 'success', children, icon: Icon }) {
  return (
    <span className={`badge badge-${variant}`}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}
