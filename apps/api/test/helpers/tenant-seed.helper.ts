import { DataSource } from 'typeorm';
import { randomBytes, createHash } from 'crypto';

export interface TenantSeed {
  tenantId: string;
  slug: string;
  schemaName: string;
  rawApiKey: string;
}

export async function seedTestTenant(
  dataSource: DataSource,
): Promise<TenantSeed> {
  const slug = 'default';
  const schemaName = 'tenant_default';

  // Reutiliza o tenant_default criado pela Migration Zero
  const tenantResult = await dataSource.query<{ id: string }[]>(
    `SELECT id FROM public.tenants WHERE slug = $1`,
    [slug],
  );

  let tenantId: string;

  if (tenantResult.length > 0) {
    tenantId = tenantResult[0].id;
  } else {
    const inserted = await dataSource.query<{ id: string }[]>(
      `
      INSERT INTO public.tenants (name, slug, schema_name, status)
      VALUES ($1, $2, $3, 'active')
      RETURNING id
      `,
      ['Default Tenant', slug, schemaName],
    );
    tenantId = inserted[0].id;
  }

  // Criar API Key de teste
  const rawApiKey = randomBytes(32).toString('hex');
  const hashedKey = createHash('sha256').update(rawApiKey).digest('hex');

  await dataSource.query(
    `
    INSERT INTO tenant_default.api_keys (key, "tenantId", active)
    VALUES ($1, $2, true)
    `,
    [hashedKey, tenantId],
  );

  return { tenantId, slug, schemaName, rawApiKey };
}