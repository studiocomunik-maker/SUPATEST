"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

type Props = ImageProps & {
  /** Image de repli tentée si la principale échoue (ex. visuel par défaut). */
  fallbackSrc?: string;
  /** Classe du bloc placeholder affiché si tout échoue. */
  fallbackClassName?: string;
};

// next/image n'a pas de gestion d'erreur intégrée : si la source 404 / casse,
// on tente une image de secours, puis on affiche un placeholder neutre.
// Le ratio (width/height) est conservé → pas de "saut" de layout (CLS).
export default function SafeImage({
  fallbackSrc,
  fallbackClassName,
  src,
  ...props
}: Props) {
  const [current, setCurrent] = useState(src);
  const [dead, setDead] = useState(false);

  // Si la source change (contenu mis à jour), on réessaie.
  useEffect(() => {
    setCurrent(src);
    setDead(false);
  }, [src]);

  if (dead) {
    const aspect =
      props.width && props.height
        ? { aspectRatio: `${Number(props.width)} / ${Number(props.height)}` }
        : undefined;
    return (
      <div
        aria-hidden
        style={aspect}
        className={
          fallbackClassName ??
          (props.fill ? "absolute inset-0 bg-cream" : "w-full bg-cream")
        }
      />
    );
  }

  return (
    <Image
      {...props}
      src={current}
      onError={() => {
        if (fallbackSrc && current !== fallbackSrc) setCurrent(fallbackSrc);
        else setDead(true);
      }}
    />
  );
}
