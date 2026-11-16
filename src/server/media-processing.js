import ftp from 'basic-ftp';
import db from './admin-backend/Database/oldDB.js';
import {PassThrough,Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';

const LIMIT=12*1024*1024;
function readConfig(){
 if(!process.env.FTP_HOST||!process.env.FTP_USER||!(process.env.FTP_PASS||process.env.FTP_PASSWORD))throw new Error('FTP storage unavailable');
 return {host:process.env.FTP_HOST,port:Number(process.env.FTP_PORT||21),user:process.env.FTP_USER,password:process.env.FTP_PASS||process.env.FTP_PASSWORD,secure:process.env.FTP_SECURE==='true',timeout:60000};
}
async function streamToBuffer(client,name){
 const chunks=[];let total=0;const sink=new PassThrough();
 const collected=(async()=>{for await(const chunk of sink){total+=chunk.length;if(total>LIMIT){sink.destroy(new Error('Image exceeds safe processing limit'));break;}chunks.push(chunk)}})();
 await client.downloadTo(sink,name);await collected;return Buffer.concat(chunks);
}
export async function processMediaImage(req,res){
 const base=(process.env.FTP_BASE_URL||'https://media.khudii.com').replace(/\/$/,'');
 const {url,operation,width,height}=req.body||{};
 if(typeof url!=='string'||!url.startsWith(base+'/'))return res.status(422).json({message:'Only media hosted in the configured Khudii FTP root can be processed'});
 const filename=decodeURIComponent(url.slice(base.length+1));
 if(!/^[a-zA-Z0-9._-]{1,180}$/.test(filename)||filename.includes('..')||!/\.(jpe?g|png|webp|avif)$/i.test(filename))return res.status(422).json({message:'Unsupported or unsafe media filename'});
 if(!['optimize','render'].includes(operation))return res.status(422).json({message:'Unknown operation'});
 if(operation==='render'&&(!Number.isInteger(width)||width<40||width>5000||!Number.isInteger(height)||height<20||height>5000))return res.status(422).json({message:'Rendering needs measured frontend width and height'});
 const client=new ftp.Client(60000);
 try{
  await client.access(readConfig());await client.cd(process.env.FTP_UPLOAD_DIR||'/media');
  const actualSize=await client.size(filename);
  if(actualSize>LIMIT)return res.status(422).json({message:'Image is too large for safe processing'});
  if(operation==='optimize'&&actualSize<=100*1024)return res.json({success:true,skipped:true,reason:'Already 100 KB or smaller'});
  let sharp;try{sharp=(await import('sharp')).default}catch{return res.status(503).json({message:'Sharp dependency is unavailable; install it before processing images'});}
  const original=await streamToBuffer(client,filename);
  const meta=await sharp(original,{limitInputPixels:40_000_000}).metadata();
  if(!meta.width||!meta.height||!['jpeg','png','webp','avif'].includes(meta.format)||meta.pages>1)return res.status(422).json({message:'Animated, unknown or oversized images cannot be processed'});
  if(operation==='render'&&meta.width<=width&&meta.height<=height)return res.json({success:true,skipped:true,reason:'Original dimensions already fit rendered size'});
  let editor=sharp(original,{limitInputPixels:40_000_000}).rotate();
  if(operation==='render')editor=editor.resize({width,height,fit:'inside',withoutEnlargement:true});
  const extension=filename.split('.').pop().toLowerCase();
  if(extension==='png')editor=editor.png({compressionLevel:9,palette:false});
  else if(extension==='jpg'||extension==='jpeg')editor=editor.jpeg({quality:79,mozjpeg:true});
  else if(extension==='webp')editor=editor.webp({quality:79,effort:5});
  else editor=editor.avif({quality:55,effort:5});
  const result=await editor.toBuffer();
  if(result.length>=original.length)return res.json({success:true,skipped:true,reason:'No byte saving from processing',before:original.length,after:original.length});
  // Save a reversible copy on FTP before altering the stable URL referenced by content.
  const backup=filename+'.backup-'+Date.now();
  await client.uploadFrom(Readable.from(original),backup);
  try{
   await client.uploadFrom(Readable.from(result),filename);
   if(await client.size(filename)!==result.length)throw new Error('Uploaded image size did not verify');
  }catch(error){await client.uploadFrom(Readable.from(original),filename).catch(()=>{});throw error}
  try{await db.promise().execute('INSERT INTO khudii_media_processing_logs (media_url,operation,before_bytes,after_bytes,original_width,original_height,backup_file) VALUES (?,?,?,?,?,?,?)',[url,operation,original.length,result.length,meta.width,meta.height,backup]);}catch(error){console.error('[media audit]',error?.code||error?.message)}
  res.set('Cache-Control','no-store');return res.json({success:true,skipped:false,before:original.length,after:result.length,width:meta.width,height:meta.height,backup});
 }catch(e){console.error('[media processing]',e?.message);return res.status(503).json({message:'Image processing failed; check FTP permissions, image format, or storage availability'});}finally{client.close()}
}
