import { TimeLog, Project, PrintJob, ServicePrice } from "@/lib/prisma";
import { getTotalHours } from "@/lib/price/get-price";
import {
  TAX_COST_PROCENT,
  PRINT_LABOUR_BASE_COST,
  PRINT_MARGIN_PROCENT,
} from "@/constants";

/**
 * Base interface for invoice calculations
 */
export interface InvoiceCalculation {
  subtotal: number;
  discount: number;
  discountAmount: number;
  subtotalAfterDiscount: number;
  tax: number;
  taxAmount: number;
  total: number;
}

/**
 * Project invoice calculation details
 */
export interface ProjectInvoiceCalculation extends InvoiceCalculation {
  hoursWorked: number;
  hourlyRate: number;
  projects: Array<{
    id: string;
    name: string;
    hours: number;
    rate: number;
    amount: number;
  }>;
}

/**
 * Print job invoice calculation details
 */
export interface PrintJobInvoiceCalculation extends InvoiceCalculation {
  electricity: {
    hours: number;
    rate: number;
    cost: number;
  };
  material: {
    quantity: number;
    weightPerUnit: number;
    pricePerGram: number;
    cost: number;
  };
  labour: {
    baseCost: number;
    quantity: number;
    cost: number;
  };
  margin: {
    rate: number;
    cost: number;
  };
}

/**
 * Calculate project-based invoice
 */
export function calculateProjectInvoice(
  projects: Project[],
  discountPercent: number = 0
): ProjectInvoiceCalculation {
  // Calculate each project's contribution
  const projectDetails = projects
    .filter(
      (p) => p.priceId !== "133f319d-101f-4b0a-91ae-c3ebb0483714" // Filter out projects without valid prices
    )
    .map((project) => {
      const hours = getTotalHours(project.timeLogs || [], false);
      const rate = project.price?.price || 0;
      const amount = roundCurrency(hours * rate);

      return {
        id: project.id,
        name: project.name,
        hours,
        rate,
        amount,
      };
    });

  // Calculate totals
  const subtotal = roundCurrency(
    projectDetails.reduce((sum, p) => sum + p.amount, 0)
  );
  const totalHours = projectDetails.reduce((sum, p) => sum + p.hours, 0);
  const avgHourlyRate =
    totalHours > 0 ? roundCurrency(subtotal / totalHours) : 0;

  // Apply discount
  const discountAmount = roundCurrency(subtotal * (discountPercent / 100));
  const subtotalAfterDiscount = roundCurrency(subtotal - discountAmount);

  // Calculate tax
  const taxAmount = roundCurrency(subtotalAfterDiscount * (TAX_COST_PROCENT - 1));
  const total = roundCurrency(subtotalAfterDiscount + taxAmount);

  return {
    hoursWorked: totalHours,
    hourlyRate: avgHourlyRate,
    projects: projectDetails,
    subtotal,
    discount: discountPercent,
    discountAmount,
    subtotalAfterDiscount,
    tax: (TAX_COST_PROCENT - 1) * 100,
    taxAmount,
    total,
  };
}

/**
 * Calculate print job-based invoice
 */
export function calculatePrintJobInvoice(
  printJob: PrintJob,
  electricityPrice: number,
  discountPercent: number = 0
): PrintJobInvoiceCalculation {
  // Electricity cost
  const electricityHours = getTotalHours(printJob.timeLogs || [], true);
  const electricityCost = roundCurrency(electricityHours * electricityPrice);

  // Material cost
  const materialPricePerGram = printJob.material
    ? roundCurrency(
        printJob.material.unitPrice / printJob.material.unitAmount
      )
    : 0;
  const materialCost = roundCurrency(
    printJob.quantity * printJob.weight * materialPricePerGram
  );

  // Labour cost
  const labourCost = roundCurrency(
    PRINT_LABOUR_BASE_COST * printJob.quantity
  );

  // Subtotal before margin
  const subtotalBeforeMargin = roundCurrency(
    electricityCost + materialCost + labourCost
  );

  // Apply margin
  const marginCost = roundCurrency(
    subtotalBeforeMargin * (PRINT_MARGIN_PROCENT - 1)
  );
  const subtotal = roundCurrency(subtotalBeforeMargin + marginCost);

  // Apply discount
  const discountAmount = roundCurrency(subtotal * (discountPercent / 100));
  const subtotalAfterDiscount = roundCurrency(subtotal - discountAmount);

  // Calculate tax
  const taxAmount = roundCurrency(subtotalAfterDiscount * (TAX_COST_PROCENT - 1));
  const total = roundCurrency(subtotalAfterDiscount + taxAmount);

  return {
    electricity: {
      hours: electricityHours,
      rate: electricityPrice,
      cost: electricityCost,
    },
    material: {
      quantity: printJob.quantity,
      weightPerUnit: printJob.weight,
      pricePerGram: materialPricePerGram,
      cost: materialCost,
    },
    labour: {
      baseCost: PRINT_LABOUR_BASE_COST,
      quantity: printJob.quantity,
      cost: labourCost,
    },
    margin: {
      rate: (PRINT_MARGIN_PROCENT - 1) * 100,
      cost: marginCost,
    },
    subtotal,
    discount: discountPercent,
    discountAmount,
    subtotalAfterDiscount,
    tax: (TAX_COST_PROCENT - 1) * 100,
    taxAmount,
    total,
  };
}

/**
 * Round currency to 2 decimal places
 */
function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  return `€${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
