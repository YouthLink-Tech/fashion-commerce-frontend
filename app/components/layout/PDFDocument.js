import React, { useEffect } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  Link,
} from "@react-pdf/renderer";
import sidebarImageBase64 from "./sidebarImageBase64";
import JsBarcode from "jsbarcode";
import { montserratNormal } from "./Base64NormalMontserrat";
import { montserratSemibold } from "./MontserratSemibold";
import { montserratBold } from "./MontserratBold";
import { montserratBlack } from "./MontserratBlack";
import { montserratMedium } from "./MontserratMedium";
import { lilitaOne } from "./LilitaOne";
import { FRONTEND_URL } from "@/app/config/site";
import {
  COMPANY_EMAIL,
  COMPANY_NAME,
  COMPANY_PHONE,
} from "@/app/config/company";
import formatOrderDateTime from "@/app/utils/formatOrderDateTime";

// Generate Barcode as PNG Data URL
const generateBarcodeData = (order) => {
  if (!order) return "";
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, order, {
    format: "CODE128",
    displayValue: false, // Set to false if you do not want to display the text
    fontSize: 20, // Adjust font size for readability, if needed
    width: 2, // Thicker lines
    height: 40, // Increased height for clarity
    textAlign: "center", // Center-align the text
    textMargin: 2, // Margin between barcode and text
    background: null, // Make background transparent
    lineColor: "#000000", // Black lines for maximum contrast
  });
  return canvas.toDataURL("image/png");
};

// Define styles (100% original untouched)
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFDE7",
    fontSize: 10,
    flexDirection: "row", // Row layout to keep sidebar and content side by side
    fontFamily: "Montserrat",
  },
  sidebar: {
    width: 108,
    height: "100%",
    backgroundColor: "#3bc9a7",
  },
  contentContainer: {
    flex: 1,
    padding: 40, // Add padding for the content area only
  },
  header: {
    fontSize: 30,
    textAlign: "left",
    color: "#E74C3A",
    marginTop: 25,
    marginBottom: 10,
    fontWeight: 900,
    textTransform: "uppercase",
  },
  orderInfo: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderInfo2: {
    marginTop: 10,
    fontWeight: 700,
  },
  orderInfo3: {
    marginTop: 10,
    width: "100%",
    letterSpacing: 1,
    fontWeight: 500,
  },
  barcode: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginLeft: -5,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  productRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  table: {
    display: "table",
    width: "100%",
    marginTop: 10,
    borderCollapse: "collapse", // For a clean layout
    height: 250,
    letterSpacing: 1,
    fontWeight: 500,
  },
  tableHeader: {
    display: "flex",
    flexDirection: "row",
    marginVertical: 4,
    paddingVertical: 4,
    width: "100%",
    color: "#00B8AC",
    fontSize: 12,
    fontWeight: 400,
    fontFamily: "Lilita One",
  },
  tableRaw: {
    marginVertical: 10,
    marginBottom: 10,
  },
  tableCellLeft: {
    textAlign: "left", // Left-align for text-based cells
    paddingHorizontal: 4,
    flex: 1,
  },
  tableCellRight: {
    textAlign: "right", // Right-align for numeric cells
    paddingHorizontal: 4,
    flex: 1,
  },
  tableCellCenter: {
    textAlign: "center", // Center alignment for specific cells
    paddingHorizontal: 4,
    flex: 1,
  },
  border: {
    borderBottom: "2px solid #000000", // Subtle border for header
    marginBottom: 20,
  },
  subTable: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  subtotal: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
    marginBottom: 10,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  discount: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
    marginBottom: 10,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  total: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  footerAlign: {
    display: "flex",
    flexDirection: "row", // Arrange the details and "THANK YOU" in a row
    justifyContent: "space-between", // Space between the two sections
    alignItems: "flex-start", // Align items at the top
    paddingTop: 40,
    letterSpacing: 1,
  },
  footerDetails: {
    display: "flex",
    flexDirection: "column", // Stack the footer details vertically
    justifyContent: "flex-start", // Align the details at the top
    fontWeight: 500,
  },
  footer: {
    color: "#00B8AC",
    fontSize: 30,
    letterSpacing: 1,
    fontWeight: 400,
    fontFamily: "Lilita One",
  },
  link: {
    color: "inherit",
    textDecoration: "none",
  },
});

const PDFDocument = ({ order }) => {
  useEffect(() => {
    // Register the Montserrat font
    Font.register({
      family: "Montserrat",
      fonts: [
        {
          src: montserratNormal,
          fontWeight: 400,
        },
        {
          src: montserratMedium,
          fontWeight: 500,
        },
        {
          src: montserratSemibold,
          fontWeight: 600,
        },
        {
          src: montserratBold,
          fontWeight: 700,
        },
        {
          src: montserratBlack,
          fontWeight: 900,
        },
      ],
    });

    // Register Lilita One font family
    Font.register({
      family: "Lilita One",
      fonts: [
        {
          src: lilitaOne, // Adjust the path to the font file
          fontWeight: 400, // Assuming only one weight
        },
      ],
    });
  }, []);

  const barcodeDataUrl = React.useMemo(
    () => generateBarcodeData(order?.order_number),
    [order?.order_number],
  );

  if (!order) {
    console.error("Order data is missing");
    return null;
  }

  // Prepare the product rows from Postgres items
  const productRows = (order?.items || []).map((product) => {
    const unitPrice = Number(
      product?.final_price_after_discount ?? product?.regular_price ?? 0,
    );
    const quantity = Number(product?.quantity || 1);
    const productTotal = (unitPrice * quantity).toFixed(2);

    return [
      product.product_title, // Title
      product.color_name || "", // Color
      product.size_name || "", // Size
      `${unitPrice}`, // Unit Price
      quantity, // QTY
      `${productTotal}`, // Total
      product.offer_title
        ? {
          offerTitle: product.offer_title,
          offerDiscount: 0,
          productTitle: product.product_title,
        }
        : null,
    ];
  });

  const totalDiscount =
    Number(order?.total_special_offer_discount || 0) +
    Number(order?.applied_promo_discount || 0);

  const deliveryAddress = [
    order?.delivery_address1,
    order?.thana?.name,
    order?.thana?.city?.name,
    order?.delivery_postal_code,
  ]
    .filter(Boolean)
    .join(" ");

  const paymentMethod = order?.payment?.payment_method
    ? order.payment.payment_method.toUpperCase()
    : "--";

  const shippingMethod = order?.delivery_method
    ? order.delivery_method.toUpperCase()
    : "--";

  const paymentStatus = order?.payment?.payment_status
    ? order.payment.payment_status.charAt(0).toUpperCase() +
    order.payment.payment_status.slice(1).toLowerCase()
    : "--";

  return (
    <Document>
      <Page style={styles.page}>
        {/* Sidebar Image */}
        <View style={styles.sidebar}>
          <Image
            src={sidebarImageBase64}
            style={{ width: "100%", height: "100%" }}
            alt="pdf-image"
          />
        </View>

        {/* Main content with padding */}
        <View style={styles.contentContainer}>
          <Text style={styles.header}>{COMPANY_NAME}</Text>

          <View style={styles.orderInfo}>
            {/* Order Information */}
            <View style={styles.orderInfo2}>
              <Text style={{ letterSpacing: 4, textTransform: "uppercase" }}>
                #{order?.order_number}
              </Text>
              <View style={styles.barcode}>
                <Image
                  src={barcodeDataUrl}
                  style={{ width: 180, height: 65 }}
                  alt="Barcode"
                />
              </View>
              <Text
                style={{
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  fontSize: 14,
                  marginBottom: 5,
                }}
              >
                {order?.customer?.name}
              </Text>
              <Text style={{ letterSpacing: 4, textTransform: "uppercase" }}>
                {order?.phone_number}
              </Text>
              {order?.phone_number_2 && order?.phone_number_2 !== "0" && (
                <Text
                  style={{ letterSpacing: 4, textTransform: "uppercase" }}
                >
                  {order?.phone_number_2}
                </Text>
              )}
              <Text
                style={{
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  width: "70%",
                  marginBottom: 5,
                }}
              >
                {deliveryAddress}
              </Text>
            </View>
            <View style={styles.orderInfo3}>
              <Text style={{ textAlign: "right", marginBottom: 3 }}>
                {formatOrderDateTime(order?.placed_at).dateTime}
              </Text>
              <Text style={{ textAlign: "right", marginBottom: 3 }}>
                Shipping Method : {shippingMethod}
              </Text>
              <Text style={{ textAlign: "right", marginBottom: 3 }}>
                Payment Method : {paymentMethod}
              </Text>
              <Text style={{ textAlign: "right" }}>
                Payment Status : {paymentStatus}
              </Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellLeft, { minWidth: "75px" }]}>
                TITLE
              </Text>
              <Text style={[styles.tableCellCenter, { minWidth: "65px" }]}>
                VARIANT
              </Text>
              <Text style={[styles.tableCellCenter]}>PRICE</Text>
              <Text style={[styles.tableCellCenter]}>QTY</Text>
              <Text style={[styles.tableCellRight]}>TOTAL</Text>
            </View>

            <View style={styles.tableRaw}>
              {productRows.map((product, index) => (
                <View key={index} style={styles.row}>
                  <Text
                    style={[
                      styles.tableCellLeft,
                      { marginTop: 2, minWidth: "75px" },
                    ]}
                  >
                    {product[0]}
                  </Text>
                  <Text
                    style={[
                      styles.tableCellCenter,
                      { marginTop: 2, minWidth: "65px" },
                    ]}
                  >
                    {product[1]} - {product[2]}
                  </Text>
                  <Text style={[styles.tableCellCenter, { marginTop: 2 }]}>
                    {product[3]}
                  </Text>
                  <Text style={[styles.tableCellCenter, { marginTop: 2 }]}>
                    {product[4]}
                  </Text>
                  <Text style={[styles.tableCellRight, { marginTop: 2 }]}>
                    {product[5]}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.border}></View>

          <View style={styles.subTable}>
            {/* Subtotal, Discount, Shipping Charge, and Total */}
            <View style={styles.subtotal}>
              <Text
                style={{
                  color: "#E74C3A",
                  fontWeight: 400,
                  fontFamily: "Lilita One",
                }}
              >
                Subtotal
              </Text>
              <Text style={{ fontWeight: 500 }}>
                {Number(order?.subtotal || 0).toFixed(2)}
              </Text>
            </View>

            {totalDiscount > 0 && (
              <View style={styles.subtotal}>
                <Text
                  style={{
                    color: "#E74C3A",
                    fontWeight: 400,
                    fontFamily: "Lilita One",
                  }}
                >
                  Discount
                </Text>

                <Text style={{ fontWeight: 500 }}>
                  -{totalDiscount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.subtotal}>
              <Text
                style={{
                  color: "#E74C3A",
                  fontWeight: 400,
                  fontFamily: "Lilita One",
                }}
              >
                Shipping
              </Text>
              <Text style={{ fontWeight: 500 }}>
                +{Number(order?.shipping_charge || 0).toFixed(2)}
              </Text>
            </View>

            <View style={styles.total}>
              <Text
                style={{
                  color: "#E74C3A",
                  fontWeight: 400,
                  fontFamily: "Lilita One",
                }}
              >
                Total
              </Text>
              <Text style={{ fontWeight: 500 }}>
                {Number(order?.total || 0).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footerAlign}>
            <View style={styles.footerDetails}>
              <Text>{COMPANY_NAME}</Text>
              <Text>Email: {COMPANY_EMAIL}</Text>
              <Text>
                Phone:{" "}
                <Link
                  src={`tel:+88${COMPANY_PHONE.replace(/\s/g, "")}`}
                  style={styles.link}
                >
                  {COMPANY_PHONE}
                </Link>
              </Text>
              <Link src={FRONTEND_URL} style={styles.link}>
                {FRONTEND_URL}
              </Link>
            </View>
            <View>
              <Text style={styles.footer}>THANK YOU</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PDFDocument;