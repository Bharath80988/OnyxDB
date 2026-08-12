import React from 'react';

const CLOUDFRONT_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4";

export default function BackgroundVideo({ activeVideoUrl }) {
  const currentVideo = activeVideoUrl || CLOUDFRONT_VIDEO;

  return (
    <div className="bg absolute inset-0 z-0 overflow-hidden bg-black">
      {/* High-Definition Cover Video */}
      <video
        key={currentVideo}
        className="bg-video absolute inset-0 h-full w-full object-cover pointer-events-none z-0 contrast-[1.08] brightness-[1.05]"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      >
        <source src={currentVideo} type="video/mp4" />
      </video>

      {/* Subtle Crisp Gradient Vignette (Keeps Video HD & Text Crisp) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-black/15 z-0 pointer-events-none" />
    </div>
  );
}
