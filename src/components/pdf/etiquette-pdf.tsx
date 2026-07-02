import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

/**
 * Étiquette produit pour mini-imprimante thermique (largeur 58 mm).
 * Contenu : référence + désignation, caractéristiques (poids/carat/matière)
 * et QR code. Pas de prix (variable selon le cours de l'or).
 * Format en points : 58 mm ≈ 164 pt de large.
 */

export type EtiquetteProduitData = {
  reference: string;
  designation: string;
  matiere: string | null;
  carat: number | null;
  poidsGrammes: number | null;
};

// 58 mm de large, hauteur compacte.
const LARGEUR = 164;
const HAUTEUR = 92;

const s = StyleSheet.create({
  page: {
    width: LARGEUR,
    height: HAUTEUR,
    paddingVertical: 9,
    paddingHorizontal: 10,
    fontFamily: "Helvetica",
    color: "#111111",
  },
  row: { flexDirection: "row", alignItems: "center" },
  gauche: { flexGrow: 1, flexBasis: 0, paddingRight: 8 },
  reference: { fontFamily: "Helvetica-Bold", fontSize: 14, letterSpacing: 0.5 },
  designation: { fontSize: 7.5, color: "#333333", marginTop: 3 },
  specs: { fontFamily: "Helvetica-Bold", fontSize: 8, color: "#7a6f55", marginTop: 5 },
  qr: { width: 56, height: 56 },
});

function caracteristiques(p: EtiquetteProduitData): string {
  const parts: string[] = [];
  if (p.matiere) parts.push(p.matiere);
  if (p.carat) parts.push(`${p.carat}k`);
  if (p.poidsGrammes)
    parts.push(`${p.poidsGrammes.toLocaleString("fr-FR")} g`);
  return parts.join(" · ");
}

export function EtiquettePdf({
  produit,
  qr,
}: {
  produit: EtiquetteProduitData;
  qr: string;
}) {
  const specs = caracteristiques(produit);
  return (
    <Document title={`Étiquette ${produit.reference}`}>
      <Page size={[LARGEUR, HAUTEUR]} style={s.page}>
        <View style={s.row}>
          <View style={s.gauche}>
            <Text style={s.reference}>{produit.reference}</Text>
            <Text style={s.designation}>{produit.designation}</Text>
            {specs ? <Text style={s.specs}>{specs}</Text> : null}
          </View>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={qr} style={s.qr} />
        </View>
      </Page>
    </Document>
  );
}
