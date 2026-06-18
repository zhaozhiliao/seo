// Schema.org JSON-LD type definitions for the Schema Builder.

export type FieldKind = "text" | "textarea" | "url" | "date" | "faq" | "breadcrumb" | "select";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SchemaField {
  key: string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  options?: SelectOption[];
  /** only show this field when state[showWhen.key] is one of showWhen.values */
  showWhen?: { key: string; values: string[] };
}

/** Commodity categories for the Product builder. "used-car" is default. */
export const PRODUCT_CATEGORIES: SelectOption[] = [
  { value: "used-car", label: "二手车 Used Car" },
  { value: "new-car", label: "新车 New Car" },
  { value: "general", label: "通用产品 Product" },
];

export interface SchemaType {
  id: string;
  label: string;
  schemaType: string;
  fields: SchemaField[];
}

export const SCHEMA_TYPES: SchemaType[] = [
  {
    id: "article",
    label: "文章 Article",
    schemaType: "Article",
    fields: [
      { key: "headline", label: "标题 headline", kind: "text", placeholder: "文章标题" },
      { key: "description", label: "摘要 description", kind: "textarea", placeholder: "一句话摘要" },
      { key: "image", label: "封面图 URL", kind: "url", placeholder: "https://example.com/cover.jpg" },
      { key: "author", label: "作者 author", kind: "text", placeholder: "作者姓名" },
      { key: "datePublished", label: "发布日期", kind: "date" },
      { key: "dateModified", label: "修改日期", kind: "date" },
      { key: "url", label: "页面 URL", kind: "url", placeholder: "https://example.com/post" },
    ],
  },
  {
    id: "faq",
    label: "常见问题 FAQ",
    schemaType: "FAQPage",
    fields: [{ key: "faq", label: "问答列表", kind: "faq" }],
  },
  {
    id: "product",
    label: "产品 Product",
    schemaType: "Product",
    fields: [
      { key: "category", label: "商品类型 category", kind: "select", options: PRODUCT_CATEGORIES },
      { key: "name", label: "名称 name", kind: "text", placeholder: "如：2021 款丰田凯美瑞 2.5L" },
      { key: "description", label: "描述 description", kind: "textarea" },
      { key: "image", label: "图片 URL", kind: "url" },
      { key: "brand", label: "品牌 brand", kind: "text", placeholder: "如：Toyota" },
      // car-specific fields
      { key: "model", label: "车型 model", kind: "text", placeholder: "如：Camry", showWhen: { key: "category", values: ["used-car", "new-car"] } },
      { key: "modelDate", label: "年款 modelDate", kind: "text", placeholder: "如：2021", showWhen: { key: "category", values: ["used-car", "new-car"] } },
      { key: "mileage", label: "里程（公里）", kind: "text", placeholder: "如：35000", showWhen: { key: "category", values: ["used-car"] } },
      { key: "vin", label: "车架号 VIN", kind: "text", showWhen: { key: "category", values: ["used-car", "new-car"] } },
      { key: "color", label: "颜色 color", kind: "text", showWhen: { key: "category", values: ["used-car", "new-car"] } },
      { key: "fuelType", label: "燃料类型 fuelType", kind: "text", placeholder: "如：Gasoline / Electric", showWhen: { key: "category", values: ["used-car", "new-car"] } },
      // generic product field
      { key: "sku", label: "SKU", kind: "text", showWhen: { key: "category", values: ["general"] } },
      { key: "price", label: "价格 price", kind: "text", placeholder: "99.00" },
      { key: "priceCurrency", label: "货币 priceCurrency", kind: "text", placeholder: "USD / CNY" },
      { key: "url", label: "详情页 URL", kind: "url" },
    ],
  },
  {
    id: "breadcrumb",
    label: "面包屑 Breadcrumb",
    schemaType: "BreadcrumbList",
    fields: [{ key: "breadcrumb", label: "层级列表", kind: "breadcrumb" }],
  },
  {
    id: "organization",
    label: "组织 Organization",
    schemaType: "Organization",
    fields: [
      { key: "name", label: "名称 name", kind: "text" },
      { key: "url", label: "官网 URL", kind: "url" },
      { key: "logo", label: "Logo URL", kind: "url" },
      { key: "description", label: "简介 description", kind: "textarea" },
      { key: "sameAs", label: "社交主页（逗号分隔）", kind: "textarea", placeholder: "https://twitter.com/...,https://...", },
    ],
  },
];

export interface FaqItem {
  q: string;
  a: string;
}
export interface CrumbItem {
  name: string;
  url: string;
}

export interface SchemaFormState {
  [key: string]: string | FaqItem[] | CrumbItem[] | undefined;
}

/** Build a JSON-LD object from the form state for a given type. */
export function buildJsonLd(type: SchemaType, state: SchemaFormState): Record<string, unknown> {
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": type.schemaType,
  };

  if (type.id === "faq") {
    const items = (state.faq as FaqItem[]) ?? [];
    base.mainEntity = items
      .filter((i) => i.q.trim())
      .map((i) => ({
        "@type": "Question",
        name: i.q,
        acceptedAnswer: { "@type": "Answer", text: i.a },
      }));
    return base;
  }

  if (type.id === "breadcrumb") {
    const items = (state.breadcrumb as CrumbItem[]) ?? [];
    base.itemListElement = items
      .filter((i) => i.name.trim())
      .map((i, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: i.name,
        ...(i.url.trim() ? { item: i.url } : {}),
      }));
    return base;
  }

  if (type.id === "product") {
    return buildProduct(state);
  }

  for (const field of type.fields) {
    const v = state[field.key];
    if (typeof v !== "string" || !v.trim()) continue;

    if (field.key === "author") {
      base.author = { "@type": "Person", name: v };
    } else if (field.key === "sameAs") {
      base.sameAs = v.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (field.key === "logo") {
      base.logo = { "@type": "ImageObject", url: v };
    } else {
      base[field.key] = v;
    }
  }

  return base;
}

/** Build Product / Car JSON-LD depending on the chosen commodity category. */
function buildProduct(state: SchemaFormState): Record<string, unknown> {
  const get = (k: string) => (typeof state[k] === "string" ? (state[k] as string).trim() : "");
  const category = get("category") || "used-car";
  const isCar = category === "used-car" || category === "new-car";

  const out: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": isCar ? "Car" : "Product",
  };

  const name = get("name");
  if (name) out.name = name;
  const description = get("description");
  if (description) out.description = description;
  const image = get("image");
  if (image) out.image = image;
  const brand = get("brand");
  if (brand) out.brand = { "@type": "Brand", name: brand };

  if (isCar) {
    out.itemCondition =
      category === "used-car"
        ? "https://schema.org/UsedCondition"
        : "https://schema.org/NewCondition";
    const model = get("model");
    if (model) out.model = model;
    const modelDate = get("modelDate");
    if (modelDate) out.vehicleModelDate = modelDate;
    const vin = get("vin");
    if (vin) out.vehicleIdentificationNumber = vin;
    const color = get("color");
    if (color) out.color = color;
    const fuelType = get("fuelType");
    if (fuelType) out.fuelType = fuelType;
    const mileage = get("mileage");
    if (mileage) {
      out.mileageFromOdometer = {
        "@type": "QuantitativeValue",
        value: mileage,
        unitCode: "KMT",
      };
    }
  } else {
    const sku = get("sku");
    if (sku) out.sku = sku;
  }

  const price = get("price");
  if (price) {
    out.offers = {
      "@type": "Offer",
      price,
      priceCurrency: get("priceCurrency") || "USD",
      ...(get("url") ? { url: get("url") } : {}),
      ...(isCar ? { itemCondition: out.itemCondition } : {}),
    };
  } else {
    const url = get("url");
    if (url) out.url = url;
  }

  return out;
}
