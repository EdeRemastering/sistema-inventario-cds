export function formDataToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    const v = typeof value === "string" ? value : String(value);
    if (key === "id" || key.endsWith("_id")) {
      obj[key] = v === "" ? undefined : Number(v);
    } else if (v === "") {
      obj[key] = undefined;
    } else if (v === "true" || v === "false") {
      obj[key] = v === "true";
    } else {
      obj[key] = v;
    }
  }
  return obj;
}


