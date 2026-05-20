import React from 'react';
import logo from "../assets/logo2.png";


export function WVIcon({ size = 36 }) {
  const gradId = `wv-grad-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={gradId}
          x1="4"
          y1="56"
          x2="56"
          y2="4"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#2B4DB8" />
          <stop offset="50%" stopColor="#1E9EAA" />
          <stop offset="100%" stopColor="#45AF72" />
        </linearGradient>
      </defs>
      <path
        d="M28 46 C16 42 8 30 10 18 C12 8 20 4 26 12 C28 16 28 24 28 34"
        stroke={`url(#${gradId})`}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 34 C28 24 28 16 30 12 C36 4 44 8 46 18 C48 30 40 42 28 46"
        stroke={`url(#${gradId})`}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="46" cy="10" r="6" fill={`url(#${gradId})`} />
    </svg>
  );
}

export default function WattVueLogo({
  iconSize = 160,
  textSize = 18,
  showText = true,
  darkText = false,
}) {
  const wattColor = darkText ? 'var(--wv-dark)' : '#ffffff';
  const vueColor = darkText ? '#25A1AB' : '#25A1AB';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: Math.round(iconSize * 0.28),
        lineHeight: 1,
      }}
    >
      {/* <WVIcon size={iconSize} />
      {showText && (
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: textSize,
            fontWeight: 700,
            letterSpacing: '0.04em',
            userSelect: 'none',
          }}
        >
          <span style={{ color: wattColor }}>WATT</span>
          <span style={{ color: vueColor }}>VUE</span>
        </span>
      )} */}

      <img
        src={logo}
        alt="WattVue Logo"
        style={{
          width: iconSize,
          height: 'auto',
          marginLeft: -20,
          // maxHeight: iconSize,
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </span>
  );
}
