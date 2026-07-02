/** En-tête de page élégant : sur-titre doré + titre serif + action optionnelle. */
export function PageHeader({
  eyebrow,
  titre,
  sousTitre,
  action,
}: {
  eyebrow?: string;
  titre: string;
  sousTitre?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="font-titre text-[2rem] font-semibold leading-none tracking-tight text-anthracite">
          {titre}
        </h1>
        {sousTitre && (
          <p className="mt-2 text-sm text-anthracite/55">{sousTitre}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
