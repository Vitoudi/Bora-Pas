import React, { useEffect, useState } from 'react'
import BookLogo from "../public/images/icons/book-white-18dp.svg";

export default function Snippet({
  size,
  color,
  text,
  textColor,
  icon,
  children,
  classList
}) {
    
  

  return (
    <div className={`snippet ${size} ${color} ${classList}`}>
      {text && <img src={icon && BookLogo} alt="" />}
      {text && <h2 style={{color: textColor? textColor : ''}} className="snippet-title">{text && text}</h2>}

      {children}
    </div>
  );
}
