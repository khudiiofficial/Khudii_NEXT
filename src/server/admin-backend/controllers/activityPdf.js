/** Small dependency-free PDF writer for audit logs, with deterministic pagination. */
function ascii(value) { return String(value ?? '').replace(/[^\x20-\x7e]/g,'?').replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)'); }
export function createActivityPdf(records,{from,to}) {
  const pageLines=45;
  const rows=records.map(r=>{
    const stamp=r.time.replace('T',' ').slice(0,16);
    return `${stamp.padEnd(17)} ${r.surface.slice(0,8).padEnd(8)} ${r.category.slice(0,13).padEnd(13)} ${r.action.slice(0,14).padEnd(14)} ${r.status||''}\n  ${r.path.slice(0,104)}`;
  });
  const pages=[];let page=[];
  for(const row of rows){if(page.length+2>pageLines){pages.push(page);page=[];}page.push(...row.split('\n'));}
  if(page.length||!pages.length)pages.push(page);
  const objects=[null];
  function obj(value){objects.push(value);return objects.length-1;}
  const catalog=obj(''), pagesId=obj(''), font=obj('<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>');
  const pageIds=[];
  pages.forEach((lines,i)=>{
    const text=[`BT /F1 9 Tf 40 795 Td 12 TL (Khudii Activity Logs | ${from} to ${to} | Page ${i+1} of ${pages.length}) Tj`,
      '0 -21 Td (Time              Surface  Category      Action         HTTP) Tj',
      '0 -19 Td'];
    for(const line of lines) text.push(`(${ascii(line)}) Tj T*`);
    if(records.length===0)text.push('(No activity recorded for selected dates.) Tj');
    text.push('ET');
    const stream=text.join('\n');
    const bytes=Buffer.byteLength(stream,'latin1');
    const content=obj(`<< /Length ${bytes} >>\nstream\n${stream}\nendstream`);
    const pageId=obj(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${content} 0 R >>`);
    pageIds.push(pageId);
  });
  objects[catalog]=`<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId]=`<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map(id=>`${id} 0 R`).join(' ')}] >>`;
  const chunks=['%PDF-1.4\n%Khudii\n'],offsets=[0];
  let byteOffset=Buffer.byteLength(chunks[0],'latin1');
  for(let i=1;i<objects.length;i++){
    offsets[i]=byteOffset;
    const chunk=`${i} 0 obj\n${objects[i]}\nendobj\n`;
    chunks.push(chunk);
    byteOffset+=Buffer.byteLength(chunk,'latin1');
  }
  const xref=byteOffset;
  chunks.push(`xref\n0 ${objects.length}\n0000000000 65535 f \n`);
  for(let i=1;i<objects.length;i++)chunks.push(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);
  chunks.push(`trailer\n<< /Size ${objects.length} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return Buffer.from(chunks.join(''),'latin1');
}
