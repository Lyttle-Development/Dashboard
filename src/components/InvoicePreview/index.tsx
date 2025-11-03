import React from "react";
import { formatCurrency } from "@/lib/invoice/calculations";
import styles from "./index.module.scss";
import classnames from "classnames";

export interface InvoicePreviewProps {
  invoiceNumber?: string;
  invoiceDate: Date;
  dueDate?: Date;
  customer: {
    name: string;
    email?: string;
    address?: string;
  };
  items: Array<{
    description: string;
    quantity?: number;
    unitPrice?: number;
    amount: number;
    details?: string;
  }>;
  subtotal: number;
  discount?: number;
  discountAmount?: number;
  tax: number;
  taxAmount: number;
  total: number;
  notes?: string;
  printMode?: boolean;
}

export function InvoicePreview({
  invoiceNumber,
  invoiceDate,
  dueDate,
  customer,
  items,
  subtotal,
  discount,
  discountAmount,
  tax,
  taxAmount,
  total,
  notes,
  printMode = false,
}: InvoicePreviewProps) {
  return (
    <div className={classnames(styles.invoice, { [styles.printMode]: printMode })}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.company}>
          <h1>Lyttle Development</h1>
          <p>Professional Software Development Services</p>
        </div>
        <div className={styles.invoiceInfo}>
          {invoiceNumber && (
            <div className={styles.invoiceNumber}>
              <strong>Invoice #:</strong> {invoiceNumber}
            </div>
          )}
          <div className={styles.date}>
            <strong>Date:</strong> {invoiceDate.toLocaleDateString()}
          </div>
          {dueDate && (
            <div className={styles.dueDate}>
              <strong>Due Date:</strong> {dueDate.toLocaleDateString()}
            </div>
          )}
        </div>
      </header>

      {/* Customer Info */}
      <section className={styles.customer}>
        <h2>Bill To:</h2>
        <div className={styles.customerDetails}>
          <div className={styles.name}>{customer.name}</div>
          {customer.email && (
            <div className={styles.email}>{customer.email}</div>
          )}
          {customer.address && (
            <div className={styles.address}>{customer.address}</div>
          )}
        </div>
      </section>

      {/* Items */}
      <section className={styles.items}>
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th className={styles.description}>Description</th>
              <th className={styles.quantity}>Qty</th>
              <th className={styles.unitPrice}>Unit Price</th>
              <th className={styles.amount}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <React.Fragment key={index}>
                <tr className={styles.itemRow}>
                  <td className={styles.description}>{item.description}</td>
                  <td className={styles.quantity}>
                    {item.quantity !== undefined ? item.quantity : "-"}
                  </td>
                  <td className={styles.unitPrice}>
                    {item.unitPrice !== undefined
                      ? formatCurrency(item.unitPrice)
                      : "-"}
                  </td>
                  <td className={styles.amount}>
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
                {item.details && (
                  <tr className={styles.detailsRow}>
                    <td colSpan={4} className={styles.details}>
                      {item.details}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </section>

      {/* Totals */}
      <section className={styles.totals}>
        <div className={styles.totalsTable}>
          <div className={styles.totalRow}>
            <span className={styles.label}>Subtotal:</span>
            <span className={styles.value}>{formatCurrency(subtotal)}</span>
          </div>
          {discount !== undefined && discount > 0 && (
            <div className={styles.totalRow}>
              <span className={styles.label}>
                Discount ({discount.toFixed(2)}%):
              </span>
              <span className={styles.value}>
                -{formatCurrency(discountAmount || 0)}
              </span>
            </div>
          )}
          <div className={styles.totalRow}>
            <span className={styles.label}>Tax ({tax.toFixed(2)}%):</span>
            <span className={styles.value}>{formatCurrency(taxAmount)}</span>
          </div>
          <div className={classnames(styles.totalRow, styles.grandTotal)}>
            <span className={styles.label}>Total:</span>
            <span className={styles.value}>{formatCurrency(total)}</span>
          </div>
        </div>
      </section>

      {/* Notes */}
      {notes && (
        <section className={styles.notes}>
          <h3>Notes:</h3>
          <p>{notes}</p>
        </section>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Thank you for your business!</p>
        <p className={styles.contactInfo}>
          For questions about this invoice, please contact us.
        </p>
      </footer>
    </div>
  );
}
