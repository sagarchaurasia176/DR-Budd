import React from 'react'
import Heading from '../pages/Heading'
import ProblemInputForm from '../pages/QuestionBox'

const Popup = () => {
  return (
    <div className='  w-[600px]   h-auto max-w-fit  bg-slate-950'>
      {/* Heading */}
      <Heading/>
      {/* Question Box */}
      <ProblemInputForm/>
    </div>
  )
}

export default Popup;
