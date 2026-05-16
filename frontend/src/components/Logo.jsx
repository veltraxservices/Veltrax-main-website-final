import React from "react";

const LOGO_SRC = "/brand/veltrax-logo.png";

/**
 * Veltrax logo wordmark (uses the full square brand asset).
 * `size` controls height in px on desktop, scales down on mobile.
 */
const Logo = ({ size = 32, className = "", showTagline = false, ...rest }) => {
  // The asset is a square (V + wordmark + tagline). We crop to keep
  // a tight wordmark when showTagline=false using object-position.
  return (
    <span
      className={`inline-flex items-center ${className}`}
      style={{ height: size }}
      {...rest}
    >
      <img
        src={LOGO_SRC}
        alt="Veltrax"
        draggable={false}
        style={{
          height: showTagline ? size : size * 1.9,
          width: "auto",
          objectFit: "contain",
          // shift up so the tagline crops out when not requested
          marginTop: showTagline ? 0 : `-${size * 0.05}px`,
          marginBottom: showTagline ? 0 : `-${size * 0.55}px`,
          marginLeft: `-${size * 0.18}px`,
          marginRight: `-${size * 0.18}px`,
        }}
      />
    </span>
  );
};

export default Logo;
