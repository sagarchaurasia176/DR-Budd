import React from 'react'

const Arrow = () => {
  return (
    <div>
      {/* arrow */}
      <div className=' flex items-center  text-black  justify-center'>
            <div className="animate-bounce mt-4">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="white"
                    className="w-6 h-6"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </div>
        </div>
    </div>
  )
}

export default Arrow
