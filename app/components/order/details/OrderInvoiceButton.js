"use client";

import { Button } from "@nextui-org/react";
import React, { useState } from "react";
import { LuFileText } from "react-icons/lu";

const OrderInvoiceButton = ({ selectedOrder }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePreview = async () => {
    if (!selectedOrder) return;
    setIsLoading(true);
    try {
      // Dynamically load @react-pdf/renderer and PDFDocument only on click
      const [{ pdf }, { default: PDFDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../../layout/PDFDocument.js'),
      ]);
      const blob = await pdf(<PDFDocument order={selectedOrder} />).toBlob();
      const pdfURL = URL.createObjectURL(blob);
      // Try opening in new tab for print/preview
      const printWindow = window.open(pdfURL, '_blank');
      if (!printWindow) {
        // Fallback: If popup was blocked by browser, trigger direct download
        const downloadLink = document.createElement('a');
        downloadLink.href = pdfURL;
        downloadLink.download = `Invoice-${selectedOrder.order_number || 'order'}.pdf`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    } catch (error) {
      console.error("Error generating PDF invoice:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-[var(--color-primary-500)] py-3 text-center text-xs font-semibold text-neutral-700 transition-[background-color] duration-300 hover:bg-[var(--color-primary-700)]"
      onClick={handlePreview}
      isLoading={isLoading}
    >
      {isLoading ? 'Viewing Invoice' : 'View Invoice'}
      <LuFileText size={14} />
    </Button>
  );
};

export default OrderInvoiceButton;
