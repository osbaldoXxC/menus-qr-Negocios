const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ESQUEMAS_EXCLUIDOS = ['pg_catalog', 'information_schema', 'pg_toast'];

async function main() {
  const url = process.env.DATABASE_URL;
  const outDir = path.join(__dirname, '..', 'db', 'contract');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log('Connecting to database...');
  const client = new Client({ connectionString: url });
  
  try {
    await client.connect();
    console.log('Connected. Querying schema metadata...');

    const resCols = await client.query(`
      SELECT c.table_schema, c.table_name, c.column_name, c.ordinal_position,
             c.data_type, c.udt_name, c.is_nullable, c.column_default,
             c.character_maximum_length, c.numeric_precision, c.numeric_scale
      FROM information_schema.columns c
      JOIN information_schema.tables t
        ON t.table_schema = c.table_schema AND t.table_name = c.table_name
      WHERE c.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast') AND t.table_type = 'BASE TABLE'
      ORDER BY c.table_schema, c.table_name, c.ordinal_position
    `);

    const resConstr = await client.query(`
      SELECT tc.table_schema, tc.table_name, tc.constraint_name, tc.constraint_type,
             kcu.column_name, kcu.ordinal_position,
             ccu.table_name AS referencia_tabla, ccu.column_name AS referencia_columna
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu
        ON kcu.constraint_name = tc.constraint_name
       AND kcu.table_schema = tc.table_schema
      LEFT JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
       AND ccu.table_schema = tc.table_schema
       AND tc.constraint_type = 'FOREIGN KEY'
      WHERE tc.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY tc.table_schema, tc.table_name, tc.constraint_name, kcu.ordinal_position
    `);

    const resIdx = await client.query(`
      SELECT schemaname AS table_schema, tablename AS table_name,
             indexname AS index_name, indexdef AS definicion
      FROM pg_indexes
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schemaname, tablename, indexname
    `);

    const resEnums = await client.query(`
      SELECT t.typname AS nombre, e.enumlabel AS valor
      FROM pg_type t
      JOIN pg_enum e ON e.enumtypid = t.oid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY t.typname, e.enumsortorder
    `);

    const resExt = await client.query(`
      SELECT extname AS nombre, extversion AS version FROM pg_extension ORDER BY extname
    `);

    const resViews = await client.query(`
      SELECT table_schema, table_name
      FROM information_schema.views
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY table_schema, table_name
    `);

    const tablas = {};
    for (const fila of resCols.rows) {
      const clave = `${fila.table_schema}.${fila.table_name}`;
      if (!tablas[clave]) {
        tablas[clave] = {
          esquema: fila.table_schema,
          nombre: fila.table_name,
          columnas: [],
          clave_primaria: [],
          unicos: [],
          llaves_foraneas: [],
          indices: []
        };
      }
      tablas[clave].columnas.push({
        nombre: fila.column_name,
        tipo: fila.data_type === 'USER-DEFINED' ? fila.udt_name : fila.data_type,
        nulable: fila.is_nullable === 'YES',
        default: fila.column_default,
        longitud_maxima: fila.character_maximum_length,
        precision: fila.numeric_precision,
        escala: fila.numeric_scale
      });
    }

    for (const fila of resConstr.rows) {
      const clave = `${fila.table_schema}.${fila.table_name}`;
      if (!tablas[clave] || !fila.column_name) continue;
      const t = tablas[clave];
      if (fila.constraint_type === 'PRIMARY KEY') {
        t.clave_primaria.push(fila.column_name);
      } else if (fila.constraint_type === 'UNIQUE') {
        t.unicos.push({ restriccion: fila.constraint_name, columna: fila.column_name });
      } else if (fila.constraint_type === 'FOREIGN KEY') {
        t.llaves_foraneas.push({
          columna: fila.column_name,
          referencia_tabla: fila.referencia_tabla,
          referencia_columna: fila.referencia_columna
        });
      }
    }

    for (const fila of resIdx.rows) {
      const clave = `${fila.table_schema}.${fila.table_name}`;
      if (tablas[clave]) {
        tablas[clave].indices.push({
          nombre: fila.index_name,
          definicion: fila.definicion
        });
      }
    }

    const agrupadoEnums = {};
    for (const fila of resEnums.rows) {
      if (!agrupadoEnums[fila.nombre]) agrupadoEnums[fila.nombre] = [];
      agrupadoEnums[fila.nombre].push(fila.valor);
    }

    const extensiones = {};
    for (const fila of resExt.rows) {
      extensiones[fila.nombre] = fila.version;
    }

    const schemaData = {
      tablas: Object.keys(tablas).sort().map(k => tablas[k]),
      enums: agrupadoEnums,
      extensiones,
      vistas: resViews.rows.map(r => `${r.table_schema}.${r.table_name}`)
    };

    const jsonTexto = JSON.stringify(schemaData, null, 2);
    fs.writeFileSync(path.join(outDir, 'schema.json'), jsonTexto + '\n', 'utf8');

    // Generar SCHEMA.md
    const mdLines = [
      '# Contrato de esquema — MexxicanMX',
      '',
      'Generado por `scripts/extract_schema.js`. **No editar a mano.**',
      'Ningun nombre fuera de este archivo puede usarse en consultas, modelos o DTOs.',
      '',
      '## Contenido',
      '- Extensiones',
      '- Tipos enum',
      '- Tablas',
      '- Vistas',
      '',
      '## Extensiones',
      ''
    ];
    for (const ext of Object.keys(extensiones).sort()) {
      mdLines.push(`- \`${ext}\` ${extensiones[ext]}`);
    }
    mdLines.push('', '## Tipos enum', '');
    const enumKeys = Object.keys(agrupadoEnums).sort();
    if (enumKeys.length > 0) {
      for (const e of enumKeys) {
        mdLines.push(`- \`${e}\`: ${agrupadoEnums[e].map(v => '`' + v + '`').join(', ')}`);
      }
    } else {
      mdLines.push('_Sin tipos enum definidos._');
    }

    mdLines.push('', '## Tablas', '');
    for (const t of schemaData.tablas) {
      mdLines.push(`### \`${t.esquema}.${t.nombre}\``, '');
      mdLines.push('| Columna | Tipo | Nulable | Default |');
      mdLines.push('|---|---|---|---|');
      for (const col of t.columnas) {
        const def = col.default ? `\`${col.default}\`` : '';
        mdLines.push(`| \`${col.nombre}\` | ${col.tipo} | ${col.nulable ? 'si' : 'no'} | ${def} |`);
      }
      mdLines.push('');
      if (t.clave_primaria.length > 0) {
        mdLines.push(`- PK: ${t.clave_primaria.map(c => '`' + c + '`').join(', ')}`);
      }
      for (const fk of t.llaves_foraneas) {
        mdLines.push(`- FK: \`${fk.columna}\` → \`${fk.referencia_tabla}.${fk.referencia_columna}\``);
      }
      for (const u of t.unicos) {
        mdLines.push(`- UNIQUE: \`${u.columna}\` (${u.restriccion})`);
      }
      if (t.columnas.some(c => c.nombre === 'deleted_at')) {
        mdLines.push('- **Soft delete activo**: toda lectura debe filtrar `deleted_at IS NULL`.');
      }
      mdLines.push('');
    }

    mdLines.push('## Vistas', '');
    if (schemaData.vistas.length > 0) {
      for (const v of schemaData.vistas) {
        mdLines.push(`- \`${v}\``);
      }
    } else {
      mdLines.push('_Sin vistas._');
    }
    mdLines.push('');

    fs.writeFileSync(path.join(outDir, 'SCHEMA.md'), mdLines.join('\n'), 'utf8');

    const hash = crypto.createHash('sha256').update(jsonTexto).digest('hex');
    fs.writeFileSync(path.join(outDir, 'schema.lock'), hash + '\n', 'utf8');

    const totalColumnas = schemaData.tablas.reduce((acc, t) => acc + t.columnas.length, 0);
    console.log(`Tablas: ${schemaData.tablas.length}  Columnas: ${totalColumnas}`);
    console.log(`Enums: ${Object.keys(schemaData.enums).length}  Extensiones: ${Object.keys(schemaData.extensiones).length}`);
    console.log(`Escrito en db/contract/schema.json, SCHEMA.md, schema.lock`);
    console.log(`schema.lock = ${hash.substring(0, 16)}...`);
  } catch (err) {
    console.error('Error extrayendo esquema:', err.message);
  } finally {
    await client.end();
  }
}

main();
