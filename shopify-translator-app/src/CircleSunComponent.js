import React from "react";

function CircleSunComponent({ bottom, top, gradient_bottom_x }) {
  return (
    <svg
      width="109"
      height="109"
      viewBox="0 0 109 109"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="54.5" cy="54.5" r="54.5" fill="url(#paint0_linear)" />
      <defs>
        <linearGradient
          id="paint0_linear"
          x1="54.5"
          y1="1.8045e-08"
          x2="55"
          y2={gradient_bottom_x}
          gradientUnits="userSpaceOnUse"
        >
          {/* <stop stop-color={top} />
          <stop offset="1" stop-color={bottom} /> */}
          <stop stop-color="#FFDECC" />
          <stop offset="1" stop-color="#fde800" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default CircleSunComponent;
