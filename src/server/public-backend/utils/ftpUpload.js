// utils/ftpUpload.js
import ftp from "basic-ftp";

const FTP_CONFIG = {
  host: process.env.FTP_HOST,
  port: Number(process.env.FTP_PORT || 21),
  user: process.env.FTP_USER,
  password: process.env.FTP_PASS || process.env.FTP_PASSWORD,
  secure: process.env.FTP_SECURE === 'true',
  timeout: Number(process.env.FTP_TIMEOUT_MS || 300000),
  keepAlive: Number(process.env.FTP_KEEPALIVE_MS || 10000),
  passive: true,
};


// const FTP_UPLOAD_DIR = "/home/u738598637/domains/khudii.com/public_html/media";
const FTP_UPLOAD_DIR = process.env.FTP_UPLOAD_DIR || '/media';
const BASE_URL = (process.env.FTP_BASE_URL || 'https://media.khudii.com').replace(/\/$/, '');

/**
 * Uploads a Buffer to FTP with given filename.
 * Returns the public URL of the uploaded file.
 */
export async function uploadToFTP(fileName, fileBuffer) {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  try {
    await client.access(FTP_CONFIG);
    // ensure dir exists and switch directory
    await client.ensureDir(FTP_UPLOAD_DIR);
    await client.cd(FTP_UPLOAD_DIR);
    // uploadFrom accepts a readable stream or local path; use uploadFrom with a Buffer via a stream:
    const {Readable} = await import("stream");
    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null);
    await client.uploadFrom(stream, fileName);
    return `${BASE_URL}/${fileName}`;
  } catch (err) {
    console.error("FTP upload error:", err);
    throw err;
  } finally {
    client.close();
  }
}

/**
 * Deletes file from FTP given its public URL (or filename).
 * Silently returns when file doesn't exist or on error (logs error).
 */
export async function deleteFromFTP(fileUrl) {
  if (!fileUrl) return;
  const client = new ftp.Client();
  client.ftp.verbose = false;
  try {
    await client.access(FTP_CONFIG);
    await client.ensureDir(FTP_UPLOAD_DIR);
    await client.cd(FTP_UPLOAD_DIR);
    const fileName = fileUrl.split("/").pop();
    if (!fileName) return;
    await client.remove(fileName);
    // success
  } catch (err) {
    // Log and continue (deleting a non-existing file may throw)
    console.error("FTP delete error:", err);
  } finally {
    client.close();
  }
}





/**
 * Uploads a video file to FTP
 */
export async function uploadVideoToFTP(fileName, fileBuffer) {
  const client = new ftp.Client();
  client.ftp.timeout = 0;

  client.ftp.verbose = true;
  try {
    await client.access(FTP_CONFIG);
    await client.ensureDir(FTP_UPLOAD_DIR);
    await client.cd(FTP_UPLOAD_DIR);
    
    const {Readable} = await import("stream");
    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null);
    
    await client.uploadFrom(stream, fileName);
    return `${BASE_URL}/${fileName}`;
  } catch (err) {
    console.error("FTP video upload error:", err);
    throw err;
  } finally {
    client.close();
  }
}

// import { Readable } from "stream";

// export async function uploadVideoToFTP(fileName, fileBuffer) {
//   const client = new ftp.Client();
  
//   // Disable timeouts for large files
//   client.ftp.timeout = 0;
//   client.ftp.verbose = true;

//   try {
//     console.log(`Uploading: ${fileName} (${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
    
//     await client.access(FTP_CONFIG);
//     await client.ensureDir(FTP_UPLOAD_DIR);
//     await client.cd(FTP_UPLOAD_DIR);

//     const { Readable } = await import("stream");
//     const stream = Readable.from(fileBuffer);
    
//     // Simple upload - no progress tracking to reduce overhead
//     await client.uploadFrom(stream, fileName);
    
//     console.log(`Upload successful: ${fileName}`);
//     return `${BASE_URL}/${fileName}`;

//   } catch (err) {
//     console.error("Upload failed:", err.message);
    
//     // For large files, try without CD command
//     if (err.message.includes('Timeout')) {
//       return await uploadWithoutCD(fileName, fileBuffer);
//     }
    
//     throw err;
//   } finally {
//     client.close();
//   }
// }

// Alternative method without CD commands
// async function uploadWithoutCD(fileName, fileBuffer) {
//   const client = new ftp.Client();
//   client.ftp.timeout = 0;
  
//   try {
//     console.log("Trying alternative upload method...");
    
//     await client.access(FTP_CONFIG);
    
//     // Upload directly to media directory without CD
//     const { Readable } = await import("stream");
//     const stream = Readable.from(fileBuffer);
    
//     await client.uploadFrom(stream, `/media/${fileName}`);
    
//     console.log("Alternative upload successful");
//     return `${BASE_URL}/${fileName}`;
    
//   } finally {
//     client.close();
//   }
// }


/**
 * Deletes video file from FTP
 */
export async function deleteVideoFromFTP(videoUrl) {
  if (!videoUrl) return;
  const client = new ftp.Client();
  client.ftp.verbose = false;
  try {
    await client.access(FTP_CONFIG);
    await client.ensureDir(FTP_UPLOAD_DIR);
    await client.cd(FTP_UPLOAD_DIR);
    
    const fileName = videoUrl.split("/").pop();
    if (!fileName) return;
    
    await client.remove(fileName);
  } catch (err) {
    console.error("FTP video delete error:", err);
  } finally {
    client.close();
  }
}


/**
 * Complete test: Upload -> Verify -> Delete
 */
// export async function runCompleteTest() {
//   try {
//     console.log('🚀 Starting complete FTP test...\n');
    
//     // Step 1: Upload a file
//     console.log('1. Testing file upload...');
//     const fileUrl = await testFileUpload();
    
//     // Step 2: List files to verify upload
//     console.log('\n2. Verifying file exists...');
//     await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit
//     await listFTPFiles();
    
//     // Step 3: Delete the file
//     console.log('\n3. Testing file deletion...');
//     await testFileDeletion(fileUrl);
    
//     // Step 4: List files again to verify deletion
//     console.log('\n4. Verifying file deletion...');
//     await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit
//     await listFTPFiles();
    
//     console.log('\n🎉 Complete FTP test finished successfully!');
    
//   } catch (error) {
//     console.error('\n💥 Complete FTP test failed:', error);
//     throw error;
//   }
// }
// runCompleteTest()

/**
 * Utility to generate unique filenames
 */




// export async function testFTPConnection() {
//   const client = new ftp.Client();
//   client.ftp.verbose = true;
//   client.ftp.log = console.log;
  
//   try {
//     console.log("Testing FTP connection...");
//     await client.access(FTP_CONFIG);
//     console.log("FTP connection test: SUCCESS");
    
//     // Test directory access
//     await client.ensureDir(FTP_UPLOAD_DIR);
//     const list = await client.list();
//     console.log(`Directory contents (${list.length} items):`, list.map(item => item.name));
    
//     return true;
//   } catch (err) {
//     console.error("FTP connection test: FAILED", err);
//     return false;
//   } finally {
//     client.close();
//   }
// }
// testFTPConnection()


// utils/ftpUpload.js - Update with correct path finding

/**
 * Find the actual web root directory
 */


// export async function findWebRootDirectory() {
//   const client = new ftp.Client();
//   client.ftp.verbose = true;
  
//   try {
//     await client.access(FTP_CONFIG);
    
//     // Start from root and search for where one.png actually is
//     await client.cd('/');
//     console.log('Starting from root directory...');
    
//     // Search for one.png
//     const searchPaths = [
//       '/',
//       '/public_html',
//       '/public_html/media', 
//       '/media',
//       '/home/u738598637/domains/khudii.com/public_html',
//       '/home/u738598637/domains/khudii.com/public_html/media',
//       '/domains/khudii.com/public_html',
//       '/domains/khudii.com/public_html/media'
//     ];
    
//     for (const path of searchPaths) {
//       try {
//         await client.cd(path);
//         const files = await client.list();
//         const hasOnePng = files.some(file => file.name === 'one.png');
        
//         if (hasOnePng) {
//           console.log(`✅ FOUND one.png in directory: ${path}`);
//           console.log('All files in this directory:', files.map(f => f.name));
//           return path;
//         } else {
//           console.log(`❌ one.png not found in: ${path}`);
//         }
//       } catch (err) {
//         console.log(`❌ Cannot access: ${path}`);
//       }
//     }
    
//     throw new Error('Could not find directory containing one.png');
    
//   } finally {
//     client.close();
//   }
// }

// findWebRootDirectory()