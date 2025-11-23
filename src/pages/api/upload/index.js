import { WP_API_BASE } from "@/lib/wp";
import { IncomingForm } from "formidable";
import FormData from "form-data";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, we'll handle multipart/form-data
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const wpBase = process.env.NEXT_PUBLIC_WP_URL || WP_API_BASE;
  if (!wpBase) {
    return res.status(500).json({ ok: false, error: "WP API base not configured" });
  }

  const devHeader = process.env.NODE_ENV === "development" ? { "X-CA-Dev": "1" } : {};
  
  // Extract token from query parameter to forward to WordPress
  const token = req.query.token || null;

  try {
    // Parse the incoming multipart form data
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      multiples: true,
    });

    // Parse the form
    const parsed = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const [fields, files] = parsed;

    // Reconstruct FormData for WordPress
    const formData = new FormData();

    // Add all fields (excluding token - it's passed as query parameter)
    for (const [key, values] of Object.entries(fields)) {
      // Skip token field - it's passed as query parameter
      if (key === 'token') continue;
      
      const valueArray = Array.isArray(values) ? values : [values];
      for (const value of valueArray) {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      }
    }

    // Add all files
    for (const [key, fileArray] of Object.entries(files)) {
      const filesToProcess = Array.isArray(fileArray) ? fileArray : [fileArray];
      for (const file of filesToProcess) {
        if (file && file.filepath) {
          formData.append(key, fs.createReadStream(file.filepath), {
            filename: file.originalFilename || file.newFilename || "upload",
            contentType: file.mimetype || "application/octet-stream",
          });
        }
      }
    }

    // Forward to WordPress with token as query parameter
    const uploadUrl = token 
      ? `${wpBase}/ca/v1/upload?token=${encodeURIComponent(token)}`
      : `${wpBase}/ca/v1/upload`;
    
    const resp = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        ...devHeader,
        ...formData.getHeaders(),
        Cookie: req.headers.cookie || "",
      },
      credentials: "include",
      body: formData,
    });

    // Clean up temporary files
    for (const fileArray of Object.values(files)) {
      const filesToClean = Array.isArray(fileArray) ? fileArray : [fileArray];
      for (const file of filesToClean) {
        if (file && file.filepath && fs.existsSync(file.filepath)) {
          try {
            fs.unlinkSync(file.filepath);
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      }
    }

    const body = await resp.json();
    return res.status(resp.status).json(body);
  } catch (e) {
    return res.status(500).json({ ok: false, error: e instanceof Error ? e.message : "Failed" });
  }
}

