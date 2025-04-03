import React from 'react'
import { FaCode, FaLightbulb, FaTasks } from "react-icons/fa";

const HeaderCard = () => {
  return (
    <div className=' bg-slate-950'>
      <div className=" flex flex-row gap-4">
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg hover:bg-white/20 transition-all cursor-pointer text-center">
          <FaCode className="mx-auto text-white text-3xl mb-2" />
          <h2 className="text-xl font-semibold text-white">Data Structures</h2>
          <p className="text-blue-100 mt-2">Master the building blocks of efficient code</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg hover:bg-white/20 transition-all cursor-pointer text-center">
          <FaLightbulb className="mx-auto text-white text-3xl mb-2" />
          <h2 className="text-xl font-semibold text-white">Algorithms</h2>
          <p className="text-blue-100 mt-2">Solve problems with elegant solutions</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg hover:bg-white/20 transition-all cursor-pointer text-center">
          <FaTasks className="mx-auto text-white text-3xl mb-2" />
          <h2 className="text-xl font-semibold text-white">Daily Practice</h2>
          <p className="text-blue-100 mt-2">Build habits for coding success</p>
        </div>
      </div>
    </div>
  )
}

export default HeaderCard
