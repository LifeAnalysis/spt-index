import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Export protocol historical data to CSV
 */
export async function exportToCSV(protocolSlug, history) {
  if (!history || history.length === 0) {
    console.log(`No historical data to export for ${protocolSlug}`);
    return null;
  }

  const dataDir = path.join(__dirname, 'data');
  
  // Ensure data directory exists
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }

  const filename = `${protocolSlug}_spt_history.csv`;
  const filepath = path.join(dataDir, filename);

  // Create CSV content
  const headers = 'Date,Timestamp,SPT Score,TVL,Fees,Volume\n';
  const rows = history.map(point => {
    // Handle both string dates (YYYY-MM-DD) and timestamps
    const date = typeof point.date === 'string' ? point.date : new Date(point.date * 1000).toISOString().split('T')[0];
    const timestamp = point.timestamp || point.date;
    return `${date},${timestamp},${point.score},${point.tvl},${point.fees},${point.volume}`;
  }).join('\n');

  const csvContent = headers + rows;

  // Write to file
  await fs.writeFile(filepath, csvContent, 'utf-8');
  
  console.log(`✅ Exported ${history.length} data points to ${filename}`);
  return filepath;
}

/**
 * Export all protocols data to a summary CSV
 */
export async function exportSummaryCSV(protocols) {
  const dataDir = path.join(__dirname, 'data');
  
  // Ensure data directory exists
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }

  const filename = 'spt_index_summary.csv';
  const filepath = path.join(dataDir, filename);

  // Create CSV content
  const headers = 'Protocol,Type,SPT Score,Raw Score,TVL,Fees 24h,Volume 24h,Change 24h %,Change 7d %,Change 30d %,Historical Data Points\n';
  const rows = protocols.map(p => {
    return `${p.protocol},${p.type},${p.score},${p.rawScore || 0},${p.tvl},${p.fees},${p.volume},${p.change24h || ''},${p.change7d || ''},${p.change30d || ''},${p.historicalDataPoints || 0}`;
  }).join('\n');

  const csvContent = headers + rows;

  // Write to file
  await fs.writeFile(filepath, csvContent, 'utf-8');
  
  console.log(`✅ Exported summary for ${protocols.length} protocols to ${filename}`);
  return filepath;
}

