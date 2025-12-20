import { SeedPostgres } from "@snaplet/seed/adapter-postgres";
import { defineConfig } from "@snaplet/seed/config";
import postgres from "postgres";
import enumsData from "./.snaplet/enums.json";

/**
 * Snaplet Seed configuration with dynamic enum overrides.
 *
 * This configuration automatically discovers and applies enum constraints
 * from Django model fields, ensuring generated data respects application-level
 * enum definitions without hardcoding values.
 */

// Type-safe access to enum data
interface EnumField {
  type: "scalar" | "array";
  values: string[];
  nullable: boolean;
  model: string;
  field: string;
}

interface EnumsData {
  enums: Record<string, EnumField>;
  discovered_fields: string[];
  total_fields: number;
}

const enums = (enumsData as EnumsData).enums;

/**
 * Helper to generate array enum values with realistic cardinality.
 * Returns an array of 0-5 enum values (weighted toward 1-3 items).
 */
function generateEnumArray(values: string[]): () => string[] {
  return () => {
    const count = Math.floor(Math.random() * 6); // 0-5 items
    if (count === 0) return [];
    
    // Shuffle and take first N items
    const shuffled = [...values].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };
}

/**
 * Build column overrides for all discovered enum fields.
 */
function buildEnumOverrides() {
  const overrides: Record<string, any> = {};

  for (const [fieldPath, enumField] of Object.entries(enums)) {
    const [table, column] = fieldPath.split(".");

    if (!overrides[table]) {
      overrides[table] = {};
    }

    if (enumField.type === "scalar") {
      // Scalar enum: use oneOf to pick a single value
      // Handle nullable fields by allowing null ~10% of the time
      if (enumField.nullable) {
        overrides[table][column] = ({ copycat }: any) => {
          if (Math.random() < 0.1) {
            return null;
          }
          return copycat.oneOf(enumField.values);
        };
      } else {
        overrides[table][column] = ({ copycat }: any) =>
          copycat.oneOf(enumField.values);
      }
    } else {
      // Array enum: generate array with realistic cardinality
      const arrayGenerator = generateEnumArray(enumField.values);
      if (enumField.nullable) {
        overrides[table][column] = () => {
          if (Math.random() < 0.05) {
            return null;
          }
          return arrayGenerator();
        };
      } else {
        overrides[table][column] = arrayGenerator;
      }
    }
  }

  return overrides;
}

export default defineConfig({
  adapter: () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    const client = postgres(databaseUrl);
    return new SeedPostgres(client);
  },
  // Column overrides for enum fields
  // These ensure generated data respects Django enum constraints
  overrides: buildEnumOverrides(),
});
