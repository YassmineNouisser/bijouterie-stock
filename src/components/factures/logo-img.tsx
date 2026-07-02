import Image from "next/image";

const RATIO = 600 / 1050; // hauteur / largeur du fichier source

/**
 * Logo officiel « Youssef Bouzid Bijoux » (public/logo-bouzid.png).
 * Le fichier a un fond blanc : à utiliser sur fond blanc, ou sur une
 * pastille blanche (cf. fond sombre comme la sidebar).
 */
export function LogoImg({
  largeur = 180,
  className = "",
  priority = false,
}: {
  largeur?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo-bouzid.png"
      alt="Youssef Bouzid Bijoux"
      width={largeur}
      height={Math.round(largeur * RATIO)}
      priority={priority}
      unoptimized
      className={className}
    />
  );
}
