import React from "react";
import HeaderCard from "./HeaderCard";
import Arrow from "../constant/Arrow";

const Heading = () => {
  return (
    <div>
      <div className="sticky top-0 left-0 z-80 bg-gradient-to-r from-blue-600 to-indigo-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          DR-Buddy
        </h1>
        <p className="text-lg text-blue-100 text-center mb-6">
          Your Smart Coding Reminder
        </p>
      </div>
<br />
      <div>
        <HeaderCard />
      </div>
        <Arrow />
    </div>
  );
};

export default Heading;
