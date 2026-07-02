import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { calculerTotaux, type FactureData } from "@/lib/facture";
import { bijouterie } from "@/lib/config";
import { formatDinar, formatDate } from "@/lib/format";

/**
 * Facture A4 au format PDF vectoriel (@react-pdf/renderer).
 * Reproduit le letterhead : FACTURE À + logo, tableau produits, totaux,
 * encadré signature et bandeau doré de contact.
 * Module chargé dynamiquement côté navigateur (cf. bouton de téléchargement).
 */

const OR = "#c7a24b";
const ANTHRACITE = "#1a1a1a";
const GRIS = "#6b6b6b";

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: ANTHRACITE },
  contenu: { padding: 34, flexGrow: 1 },

  // Filigrane : logo centré, très atténué, derrière le contenu.
  filigraneWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  filigrane: { width: 360, height: 206, opacity: 0.07, objectFit: "contain" },

  enteteRow: { flexDirection: "row", justifyContent: "space-between" },
  factureA: { fontFamily: "Times-Bold", fontSize: 22, letterSpacing: 1 },
  clientNom: { fontFamily: "Helvetica-Bold", fontSize: 10, marginTop: 8 },
  clientLigne: { color: GRIS, marginTop: 2 },
  logo: { width: 150, height: 86, objectFit: "contain" },
  metaWrap: { alignItems: "flex-end", marginTop: 10 },
  metaLigne: { marginTop: 2 },
  metaLabel: { color: GRIS },
  metaVal: { fontFamily: "Helvetica-Bold" },

  table: { marginTop: 34 },
  th: {
    flexDirection: "row",
    borderBottomWidth: 1.4,
    borderBottomColor: OR,
    paddingBottom: 6,
  },
  thTxt: { fontFamily: "Helvetica-Bold", fontSize: 8, color: GRIS, letterSpacing: 0.5 },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 0.6,
    borderBottomColor: "#ece2c8",
    paddingVertical: 7,
  },
  cDesig: { flexGrow: 1, flexBasis: 0 },
  cQte: { width: 40, textAlign: "center" },
  cPu: { width: 78, textAlign: "right" },
  cMontant: { width: 84, textAlign: "right" },
  desig: { fontFamily: "Helvetica-Bold", fontSize: 9.5 },
  ref: { color: "#a99b78", fontSize: 7.5, marginTop: 2 },

  totaux: { width: 210, alignSelf: "flex-end", marginTop: 18 },
  totLigne: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    color: "#4a4438",
  },
  totalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f6efdd",
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  totalLabel: { fontFamily: "Times-Bold", fontSize: 11 },
  totalVal: { fontFamily: "Times-Bold", fontSize: 13 },

  signature: { width: 210, alignSelf: "flex-end", marginTop: 40 },
  signTitre: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 0.8,
    textAlign: "right",
    marginBottom: 6,
    color: "#4a4438",
  },
  signBox: { height: 80, borderWidth: 1, borderColor: "#cdcdcd", borderRadius: 4 },

  mf: { textAlign: "center", fontSize: 7.5, color: "#b39a5a", marginTop: 14 },

  footer: {
    backgroundColor: "#c2a45f",
    color: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 34,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footCol: { width: "48%" },
  footLigne: { fontSize: 8.5, marginBottom: 5 },
});

export function FacturePdf({
  facture,
  logoSrc,
}: {
  facture: FactureData;
  logoSrc: string;
}) {
  const t = calculerTotaux(facture.lignes, facture.remise);

  return (
    <Document
      title={`Facture ${facture.numero}`}
      author={bijouterie.nom}
    >
      <Page size="A4" style={s.page}>
        {/* Filigrane (logo en fond) */}
        <View style={s.filigraneWrap}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={logoSrc} style={s.filigrane} />
        </View>

        <View style={s.contenu}>
          {/* En-tête */}
          <View style={s.enteteRow}>
            <View>
              <Text style={s.factureA}>FACTURE À</Text>
              <Text style={s.clientNom}>{facture.client.nom}</Text>
              {facture.client.adresse ? (
                <Text style={s.clientLigne}>{facture.client.adresse}</Text>
              ) : null}
              {facture.client.telephone ? (
                <Text style={s.clientLigne}>{facture.client.telephone}</Text>
              ) : null}
              {facture.client.matriculeFiscal ? (
                <Text style={s.clientLigne}>
                  M.F. : {facture.client.matriculeFiscal}
                </Text>
              ) : null}
            </View>

            <View style={{ alignItems: "flex-end" }}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={logoSrc} style={s.logo} />
              <View style={s.metaWrap}>
                <Text style={s.metaLigne}>
                  <Text style={s.metaLabel}>Facture N° </Text>
                  <Text style={s.metaVal}>{facture.numero}</Text>
                </Text>
                <Text style={s.metaLigne}>
                  <Text style={s.metaLabel}>Date : </Text>
                  <Text style={s.metaVal}>{formatDate(facture.date)}</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Tableau */}
          <View style={s.table}>
            <View style={s.th}>
              <Text style={[s.thTxt, s.cDesig]}>DÉSIGNATION</Text>
              <Text style={[s.thTxt, s.cQte]}>QTÉ</Text>
              <Text style={[s.thTxt, s.cPu]}>PRIX UNITAIRE</Text>
              <Text style={[s.thTxt, s.cMontant]}>MONTANT</Text>
            </View>
            {facture.lignes.map((l, i) => (
              <View style={s.tr} key={i}>
                <View style={s.cDesig}>
                  <Text style={s.desig}>{l.designation}</Text>
                  {l.reference ? <Text style={s.ref}>{l.reference}</Text> : null}
                </View>
                <Text style={s.cQte}>{l.quantite}</Text>
                <Text style={s.cPu}>{formatDinar(l.prixUnitaire)}</Text>
                <Text style={s.cMontant}>
                  {formatDinar(l.quantite * l.prixUnitaire)}
                </Text>
              </View>
            ))}
          </View>

          {/* Totaux */}
          <View style={s.totaux}>
            <View style={s.totLigne}>
              <Text>Sous-total</Text>
              <Text>{formatDinar(t.sousTotal)}</Text>
            </View>
            {facture.remise > 0 ? (
              <View style={s.totLigne}>
                <Text>Remise</Text>
                <Text>− {formatDinar(facture.remise)}</Text>
              </View>
            ) : null}
            <View style={s.totalBox}>
              <Text style={s.totalLabel}>TOTAL À RÉGLER</Text>
              <Text style={s.totalVal}>{formatDinar(t.total)}</Text>
            </View>
          </View>

          {/* Signature */}
          <View style={s.signature}>
            <Text style={s.signTitre}>SIGNATURE ET CACHET</Text>
            <View style={s.signBox} />
          </View>

          {bijouterie.matriculeFiscal ? (
            <Text style={s.mf}>
              Matricule fiscal : {bijouterie.matriculeFiscal}
            </Text>
          ) : null}
        </View>

        {/* Bandeau doré */}
        <View style={s.footer}>
          <View style={s.footCol}>
            <Text style={s.footLigne}>Tél : {bijouterie.tel}</Text>
            <Text style={s.footLigne}>Email : {bijouterie.email}</Text>
          </View>
          <View style={s.footCol}>
            <Text style={s.footLigne}>{bijouterie.adresse}</Text>
            <Text style={s.footLigne}>{bijouterie.site}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
