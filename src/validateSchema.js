import Ajv from "ajv";
import schema from "../schema/caml-lite.schema.json" assert { type: "json" };

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });

export function validateSchema(data) {
  const validate = ajv.compile(schema);
  const ok = validate(data);
  if (ok) return [];
  return (validate.errors || []).map(e => {
    const where = e.instancePath && e.instancePath.length ? e.instancePath : "(root)";
    return `${where} ${e.message}`;
  });
}
