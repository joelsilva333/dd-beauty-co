import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { Order, OrderItem } from "@prisma/client";
import { formatKwanza } from "@/lib/currency";
import { ORDER_STATUS_LABELS } from "@/lib/order-number";
import { SITE } from "@/lib/site-config";

// Fatura simples em PDF. Usa só as fontes base do PDF (sem Google Fonts):
// carregar uma fonte externa durante a geração é um ponto de falha a mais
// numa função que corre em cada pedido — não vale a pena para um documento
// que só precisa de ser legível e correto.
const INK = "#2E2019";
const GOLD = "#B08D57";
const TAUPE = "#A98F7C";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: INK, fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  brand: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  brandSub: { fontSize: 8, color: TAUPE, letterSpacing: 2, marginTop: 2 },
  invoiceTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", textAlign: "right" },
  invoiceMeta: { fontSize: 9, color: TAUPE, textAlign: "right", marginTop: 2 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 8, color: GOLD, letterSpacing: 1, marginBottom: 4, textTransform: "uppercase" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  table: { marginTop: 8, borderTopWidth: 1, borderTopColor: "#E5DFD6" },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: INK,
    paddingVertical: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5DFD6",
    paddingVertical: 6,
  },
  colName: { flex: 1 },
  colQty: { width: 50, textAlign: "center" },
  colPrice: { width: 90, textAlign: "right" },
  colTotal: { width: 90, textAlign: "right" },
  totals: { marginTop: 12, alignSelf: "flex-end", width: 220 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalsFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: INK,
  },
  footer: { marginTop: 40, fontSize: 8, color: TAUPE, textAlign: "center" },
});

type InvoiceOrder = Order & { items: OrderItem[] };

const PAYMENT_LABELS: Record<string, string> = {
  STRIPE: "Cartão internacional",
  BITPAY_AO: "Multicaixa (BitPay)",
};

function InvoiceDocument({ order }: { order: InvoiceOrder }) {
  const issued = order.createdAt.toLocaleDateString("pt-AO", { dateStyle: "long" });

  return (
    <Document title={`Fatura ${order.orderNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Deodália Dias</Text>
            <Text style={styles.brandSub}>BEAUTY & CO.</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>Fatura</Text>
            <Text style={styles.invoiceMeta}>{order.orderNumber}</Text>
            <Text style={styles.invoiceMeta}>{issued}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.sectionLabel}>Faturado a</Text>
            <Text>{order.customerName}</Text>
            <Text>{order.customerPhone}</Text>
            {order.customerEmail && <Text>{order.customerEmail}</Text>}
          </View>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.sectionLabel}>Entrega</Text>
            <Text>{order.addressLine}</Text>
            <Text>
              {order.bairro ? `${order.bairro}, ` : ""}
              {order.municipality}, {order.province}
            </Text>
          </View>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.sectionLabel}>Pagamento</Text>
            <Text>{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</Text>
            <Text>Estado: {ORDER_STATUS_LABELS[order.status] ?? order.status}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colName, { fontFamily: "Helvetica-Bold" }]}>Produto</Text>
            <Text style={[styles.colQty, { fontFamily: "Helvetica-Bold" }]}>Qtd.</Text>
            <Text style={[styles.colPrice, { fontFamily: "Helvetica-Bold" }]}>Preço</Text>
            <Text style={[styles.colTotal, { fontFamily: "Helvetica-Bold" }]}>Total</Text>
          </View>
          {order.items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.colName}>{item.name}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatKwanza(item.priceCents)}</Text>
              <Text style={styles.colTotal}>{formatKwanza(item.priceCents * item.quantity)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <Text>Subtotal</Text>
            <Text>{formatKwanza(order.subtotalCents)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text>Entrega</Text>
            <Text>{formatKwanza(order.shippingCents)}</Text>
          </View>
          <View style={styles.totalsFinal}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Total</Text>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>{formatKwanza(order.totalCents)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          {SITE.name} · {SITE.email} · Documento gerado automaticamente, válido como comprovativo de compra.
        </Text>
      </Page>
    </Document>
  );
}

export async function renderInvoicePdf(order: InvoiceOrder): Promise<Buffer> {
  return renderToBuffer(<InvoiceDocument order={order} />);
}
