"use client";

import type { PengirimanStatus } from "../api/pengirimanApi";
import { formatWeight as fmtWeight, formatDate } from "@/lib/formatters";

export function formatWeight(weightInGrams: number) {
  return fmtWeight(weightInGrams / 1000);
}

export function formatTimestamp(timestamp: string) {
  return formatDate(timestamp);
}

export function compactPengirimanId(id: string) {
  if (!id) {
    return "-";
  }
  if (id.length <= 18) {
    return id;
  }
  return `${id.slice(0, 8)}...${id.slice(-6)}`;
}

export function deliveryStatusClass(status: PengirimanStatus): string {
  if (status === "REJECTED" || status === "REJECTED_ADMIN" || status === "REJECTED_MANDOR") {
    return "text-error border-error bg-error/5";
  }
  if (status === "APPROVED" || status === "APPROVED_ADMIN" || status === "APPROVED_MANDOR") {
    return "text-success border-success bg-success/5";
  }
  if (status === "PARTIAL") {
    return "text-gold border-gold bg-gold/10";
  }
  return "text-forest border-forest/35 bg-forest/5";
}

const GRAMS_PER_KILOGRAM = 1000;

export function kilogramsInputToGrams(value: string) {
  if (!value.trim()) {
    return null;
  }

  const normalized = value.replace(",", ".");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return Math.round(parsed * GRAMS_PER_KILOGRAM);
}

export function gramsToKilogramsInput(weightInGrams: number) {
  const kilograms = weightInGrams / GRAMS_PER_KILOGRAM;
  return Number.isInteger(kilograms) ? String(kilograms) : kilograms.toString();
}
