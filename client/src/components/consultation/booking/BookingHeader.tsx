"use client";

import { MastheadBrand } from "./masthead/MastheadBrand";
import { MastheadCopy } from "./masthead/MastheadCopy";
import { MastheadLive } from "./masthead/MastheadLive";
import { MastheadMeta } from "./masthead/MastheadMeta";
import { MastheadRule } from "./masthead/MastheadRule";
import { MastheadTitle } from "./masthead/MastheadTitle";
import "./masthead/masthead-motion.css";

/**
 * Booking desk masthead — brand-first, step-reactive, interactive.
 * Composed of small modules; no clip art / cards / emoji.
 */
export function BookingHeader() {
  return (
    <header
      className="booking-masthead relative z-10 max-w-2xl"
      data-booking-masthead
    >
      <MastheadLive />
      <div className="mt-4 md:mt-5">
        <MastheadBrand />
      </div>
      <MastheadRule />
      <MastheadTitle />
      <MastheadCopy />
      <MastheadMeta />
    </header>
  );
}
