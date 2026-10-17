"use client";

import { useEffect } from "react";
import {
  easings,
  iconMotions,
  isMotionIcon,
  type MotionIcon,
  poseTransform,
  type Track,
} from "./motion";

const hostSelector = "a[href], button, [role='button']";
const motionQuery =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function playIcon(svg: SVGSVGElement, icon: MotionIcon) {
  if (svg.dataset.playing === "true") return;
  const tracks: readonly Track[] = iconMotions[icon];
  const animations = tracks.flatMap((track) => {
    const keyframes = track.keyframes.map((keyframe) => ({
      offset: keyframe.at,
      transform: poseTransform(keyframe),
      easing: easings[keyframe.ease ?? track.ease],
    }));
    return [...svg.querySelectorAll<SVGGElement>(`[data-part="${track.part}"]`)].map((part) =>
      part.animate(keyframes, { duration: track.duration, delay: track.delay ?? 0, fill: "both" }),
    );
  });
  if (animations.length === 0) return;
  svg.dataset.playing = "true";
  void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
    for (const animation of animations) animation.cancel();
    delete svg.dataset.playing;
  });
}

function onPointerOver(event: PointerEvent) {
  if (!(event.target instanceof Element)) return;
  const host = event.target.closest(hostSelector);
  if (!host) return;
  if (event.relatedTarget instanceof Node && host.contains(event.relatedTarget)) return;
  if (!window.matchMedia(motionQuery).matches) return;
  for (const svg of host.querySelectorAll<SVGSVGElement>("svg[data-icon]")) {
    const icon = svg.dataset.icon;
    if (isMotionIcon(icon)) playIcon(svg, icon);
  }
}

export function IconMotion() {
  useEffect(() => {
    document.addEventListener("pointerover", onPointerOver);
    return () => document.removeEventListener("pointerover", onPointerOver);
  }, []);

  return null;
}
