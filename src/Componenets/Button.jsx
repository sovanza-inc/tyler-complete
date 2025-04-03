import React from 'react'

const Button = ({name,color,Onclick}) => {
  return (
    <div><button onClick={Onclick} className='un-btn' style={{backgroundColor: `${color}`}}>{name}</button></div>
  )
}

export default Button