/**
 * Canonical wholesale unit + package-size resolution.
 * Formula source: source-app/backend/app/services/unit_resolution_service.py
 */
import rulesJson from "./unit_rules_master.json";

export type UnitResolution = {
  selling_unit: string;
  stock_unit: string | null;
  display_unit: string | null;
  package_type: string | null;
  package_size: number | null;
  package_measurement: string | null;
  conversion_factor: number;
  confidence: number;
  rule_id: string | null;
  canonical_unit_type: string | null;
};

export type CatalogItemUnitFields = {
  name?: string | null;
  selling_unit?: string | null;
  stock_unit?: string | null;
  display_unit?: string | null;
  package_type?: string | null;
  package_size?: number | null;
  package_measurement?: string | null;
  conversion_factor?: number | null;
  unit_confidence?: number | null;
  validation_status?: string | null;
  smart_classification?: string | null;
  default_kg_per_bag?: number | null;
};

type RulesRoot = {
  smart_detection_rules?: Array<{
    condition?: Record<string, unknown>;
    result?: Record<string, unknown>;
  }>;
  category_rules?: Record<
    string,
    { default_unit?: string; package_type?: string }
  >;
};

const SIZE_KG = /(\d+)\s*KG/i;
const SIZE_GM = /(\d+)\s*GM/i;
const SIZE_LTR = /(\d+)\s*LTR/i;
const SIZE_ML = /(\d+)\s*ML/i;
const NN_KG = /(\d+(?:\.\d+)?)\s*KG/i;

let cachedRules: RulesRoot | null = null;

function loadRules(): RulesRoot {
  if (cachedRules) return cachedRules;
  cachedRules = rulesJson as RulesRoot;
  return cachedRules;
}

/** Formula source: trade_unit_type.py:parse_kg_per_bag_from_name */
export function parseKgPerBagFromName(itemName: string | null | undefined): number | null {
  if (!itemName) return null;
  const m = NN_KG.exec(itemName);
  if (!m) return null;
  const v = Number(m[1]);
  if (!Number.isFinite(v) || v <= 0 || v > 200) return null;
  return v;
}

export function unitResolutionAsDict(ur: UnitResolution): Record<string, unknown> {
  const canon = (ur.canonical_unit_type || ur.selling_unit || "").toUpperCase();
  const d: Record<string, unknown> = {
    selling_unit: ur.selling_unit,
    stock_unit: ur.stock_unit,
    display_unit: ur.display_unit,
    package_type: ur.package_type,
    package_size: ur.package_size,
    package_measurement: ur.package_measurement,
    conversion_factor: ur.conversion_factor,
    confidence: ur.confidence,
    rule_id: ur.rule_id,
    canonical_unit_type: canon || null,
    inferred_confidence: ur.confidence,
    unit_profile_source: ur.rule_id,
    kg_per_bag: null as number | null,
  };
  if (
    (ur.selling_unit || "").toUpperCase() === "BAG" &&
    ur.package_measurement === "KG" &&
    ur.package_size != null
  ) {
    d.kg_per_bag = ur.package_size;
  }
  return d;
}

function parseSizeTokens(upperName: string): {
  size: number | null;
  meas: string | null;
} {
  let m = SIZE_KG.exec(upperName);
  if (m) return { size: Number(m[1]), meas: "KG" };
  m = SIZE_GM.exec(upperName);
  if (m) return { size: Number(m[1]), meas: "GM" };
  m = SIZE_LTR.exec(upperName);
  if (m) return { size: Number(m[1]), meas: "LTR" };
  m = SIZE_ML.exec(upperName);
  if (m) return { size: Number(m[1]), meas: "ML" };
  return { size: null, meas: null };
}

function inferStockAndConversion(
  sellingUnit: string,
  size: number | null,
  meas: string | null,
  packageType: string | null,
): { pt: string | null; stock: string | null; conv: number } {
  let stock = "PCS";
  let conv = 1;
  let pt = packageType;
  if (sellingUnit === "BAG" && size != null && meas === "KG") {
    stock = "KG";
    conv = size;
    pt = pt || "SACK";
  } else if (sellingUnit === "TIN" && size != null && (meas === "LTR" || meas === "ML")) {
    stock = "TIN";
    conv = 1;
    pt = pt || "TIN";
  } else if (sellingUnit === "BOX" && size != null) {
    stock = "PCS";
    conv = 1;
    pt = pt || "BOX";
  } else if (sellingUnit === "KG") {
    stock = "KG";
    conv = 1;
    pt = pt || "LOOSE";
  }
  return { pt, stock, conv };
}

function categoryRuleMatchesKey(catUpper: string, key: string): boolean {
  // Formula source: unit_resolution_service.py:_category_rule_matches_key
  // Note: empty cat_upper matches every key via `cat_upper in ku` (Python/JS).
  const ku = key.toUpperCase().replace(/_/g, " ").replace(/-/g, " ");
  if (ku.includes(catUpper) || catUpper.includes(ku)) return true;
  const kuCompact = ku.replace(/ /g, "");
  const cc = catUpper.replace(/ /g, "");
  if (kuCompact && cc.includes(kuCompact)) return true;
  return false;
}

function matchCondition(
  upperName: string,
  upperCat: string,
  brandDetected: boolean,
  cond: Record<string, unknown>,
): boolean {
  const anyTokens = ((cond.contains_any as unknown[]) || []).map((x) =>
    String(x).toUpperCase(),
  );
  const compactName = upperName.replace(/ /g, "");
  if (
    anyTokens.length > 0 &&
    !anyTokens.some(
      (t) => upperName.includes(t) || compactName.includes(t.replace(/ /g, "")),
    )
  ) {
    return false;
  }
  const excludes = ((cond.excludes_any as unknown[]) || []).map((x) =>
    String(x).toUpperCase(),
  );
  if (excludes.some((t) => upperName.includes(t))) return false;
  const cats = ((cond.category_any as unknown[]) || []).map((x) =>
    String(x).toUpperCase(),
  );
  if (
    cats.length > 0 &&
    !cats.some(
      (c) =>
        upperCat.includes(c) ||
        upperCat === c ||
        categoryRuleMatchesKey(upperCat, c),
    )
  ) {
    return false;
  }
  if (cond.brand_detected === true && !brandDetected) return false;
  const rx = cond.name_regex;
  if (rx) {
    try {
      if (!new RegExp(String(rx), "i").test(upperName)) return false;
    } catch {
      return false;
    }
  }
  return true;
}

function applyResult(
  upperName: string,
  result: Record<string, unknown>,
  ruleId: string,
): UnitResolution {
  const su = String(result.selling_unit || "").toUpperCase();
  const { size, meas } = parseSizeTokens(upperName);
  const rawPt = result.package_type;
  let pt = rawPt != null ? String(rawPt).toUpperCase() : null;
  if (pt != null && !pt.trim()) pt = null;
  const cfRaw = result.conversion_factor;
  const cfExplicit = cfRaw != null ? Number(cfRaw) : null;
  const st = result.stock_unit;
  const stock = st != null ? String(st).toUpperCase() : null;
  const inferred = inferStockAndConversion(su, size, meas, pt);
  return {
    selling_unit: su,
    stock_unit: stock || inferred.stock,
    display_unit: null,
    package_type: inferred.pt,
    package_size: size,
    package_measurement: meas,
    conversion_factor: cfExplicit ?? inferred.conv,
    confidence: 85,
    rule_id: ruleId,
    canonical_unit_type: su || null,
  };
}

/** Formula source: unit_resolution_service.py:resolve_from_text */
export function resolveFromText(
  itemName: string,
  opts: { categoryName?: string | null; brandDetected?: boolean } = {},
): UnitResolution {
  const rules = loadRules();
  const upper = itemName.toUpperCase().trim();
  const cat = (opts.categoryName || "").toUpperCase().trim();
  const brandDetected = Boolean(opts.brandDetected);

  if (upper.includes("LOOSE")) {
    return {
      selling_unit: "KG",
      stock_unit: "KG",
      display_unit: null,
      package_type: "LOOSE",
      package_size: null,
      package_measurement: null,
      conversion_factor: 1,
      confidence: 92,
      rule_id: "loose",
      canonical_unit_type: "KG",
    };
  }

  const detection = rules.smart_detection_rules || [];
  for (let i = 0; i < detection.length; i++) {
    const row = detection[i]!;
    const cond = (row.condition || {}) as Record<string, unknown>;
    const result = (row.result || {}) as Record<string, unknown>;
    if (!matchCondition(upper, cat, brandDetected, cond)) continue;
    if (!result.selling_unit) continue;
    return applyResult(upper, result, `smart_rule_${i}`);
  }

  const catRules = rules.category_rules || {};
  for (const [key, meta] of Object.entries(catRules)) {
    if (!categoryRuleMatchesKey(cat, key)) continue;
    const du = String(meta?.default_unit || "").toUpperCase();
    if (!du) continue;
    const pt = String(meta?.package_type || "").toUpperCase() || null;
    const { size, meas } = parseSizeTokens(upper);
    const inferred = inferStockAndConversion(du, size, meas, pt);
    return {
      selling_unit: du,
      stock_unit: inferred.stock,
      display_unit: null,
      package_type: pt,
      package_size: size,
      package_measurement: meas,
      conversion_factor: inferred.conv,
      confidence: 70,
      rule_id: `category_${key}`,
      canonical_unit_type: du,
    };
  }

  const { size, meas } = parseSizeTokens(upper);
  if (size != null && meas === "KG" && (upper.includes("RICE") || upper.includes("SUGAR"))) {
    const inferred = inferStockAndConversion("BAG", size, meas, "SACK");
    return {
      selling_unit: "BAG",
      stock_unit: inferred.stock,
      display_unit: null,
      package_type: inferred.pt,
      package_size: size,
      package_measurement: meas,
      conversion_factor: inferred.conv,
      confidence: 65,
      rule_id: "fallback_bag_sack",
      canonical_unit_type: "BAG",
    };
  }

  return {
    selling_unit: "PCS",
    stock_unit: null,
    display_unit: null,
    package_type: null,
    package_size: null,
    package_measurement: null,
    conversion_factor: 1,
    confidence: 40,
    rule_id: "fallback_pcs",
    canonical_unit_type: "PCS",
  };
}

/** Formula source: unit_resolution_service.py:resolve_for_catalog_item */
export function resolveForCatalogItem(
  item: CatalogItemUnitFields | null,
  opts: {
    itemName: string;
    categoryName?: string | null;
    brandDetected?: boolean;
  },
): UnitResolution {
  const name = (item?.name || opts.itemName) ?? opts.itemName;
  const textRes = resolveFromText(name, {
    categoryName: opts.categoryName,
    brandDetected: opts.brandDetected,
  });

  if (item != null && (item.selling_unit || "").trim()) {
    const su = item.selling_unit!.trim().toUpperCase();
    const validationStatus = (item.validation_status || "").trim().toLowerCase();
    const smartSource = (item.smart_classification || "").trim().toLowerCase();
    const rowIsVerified =
      validationStatus === "unit_profile_verified" ||
      smartSource.startsWith("master_item_profiles");
    if (
      !rowIsVerified &&
      (su === "PCS" || su === "PIECE") &&
      textRes.selling_unit !== su &&
      textRes.confidence >= 80
    ) {
      return {
        ...textRes,
        rule_id: `${textRes.rule_id || "text_rule"}+override_unverified_row`,
        canonical_unit_type: textRes.canonical_unit_type || textRes.selling_unit,
      };
    }
    const size = item.package_size ?? null;
    const meas = (item.package_measurement || "").toUpperCase() || null;
    const pt = item.package_type ? item.package_type.toUpperCase() : null;
    const cf = item.conversion_factor ?? 1;
    const st = item.stock_unit ? item.stock_unit.toUpperCase() : null;
    const du = item.display_unit ? item.display_unit.toUpperCase() : null;
    const uc = item.unit_confidence ?? 95;
    return {
      selling_unit: su,
      stock_unit: st,
      display_unit: du,
      package_type: pt,
      package_size: size,
      package_measurement: meas,
      conversion_factor: cf,
      confidence: uc,
      rule_id: "catalog_item_row",
      canonical_unit_type: su,
    };
  }

  if (item != null && item.default_kg_per_bag && textRes.selling_unit === "BAG") {
    const kpb = item.default_kg_per_bag;
    return {
      selling_unit: textRes.selling_unit,
      stock_unit: textRes.stock_unit || "KG",
      display_unit: textRes.display_unit,
      package_type: textRes.package_type || "SACK",
      package_size: textRes.package_size ?? kpb,
      package_measurement: textRes.package_measurement || "KG",
      conversion_factor: textRes.package_size != null ? textRes.conversion_factor : kpb,
      confidence: Math.min(textRes.confidence + 5, 99),
      rule_id: `${textRes.rule_id || ""}+kpb`,
      canonical_unit_type: textRes.canonical_unit_type || textRes.selling_unit,
    };
  }

  if (item != null && (item.default_kg_per_bag || parseKgPerBagFromName(name))) {
    const kpb = item.default_kg_per_bag || parseKgPerBagFromName(name);
    if (kpb) {
      return {
        selling_unit: "BAG",
        stock_unit: "KG",
        display_unit: null,
        package_type: "SACK",
        package_size: kpb,
        package_measurement: "KG",
        conversion_factor: kpb,
        confidence: 72,
        rule_id: "default_kg_per_bag",
        canonical_unit_type: "BAG",
      };
    }
  }

  return {
    ...textRes,
    canonical_unit_type: textRes.canonical_unit_type || textRes.selling_unit,
  };
}
