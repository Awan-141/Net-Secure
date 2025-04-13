const express = require('express');
const multer = require('multer');
const cors = require('cors');  
const { exec } = require('child_process'); 
const app = express();

/**
 * Cloud-native CORS configuration that works in any environment
 * This implementation supports:
 * - Local development
 * - Cloud platforms (AWS, GCP, Azure)
 * - Containerized deployments (Docker, Kubernetes)
 * - Serverless environments
 * - PaaS platforms (Heroku, Vercel, Netlify)
 */
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Get allowed origins from environment variables or use defaults
    const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS ? 
      process.env.CORS_ALLOWED_ORIGINS.split(',') : 
      ['http://localhost:3000', 'http://frontend:3000'];
    
    // Add common development domains to allowed origins
    const trustedDomains = [
      // GitHub Codespaces domains
      '.app.github.dev',
      // Local development
      'localhost',
      '127.0.0.1',
      // Cloud development platforms
      '.vercel.app',
      '.netlify.app',
      '.ngrok.io'
    ];
    
    // Check if the request origin matches any trusted domain pattern
    const isTrustedDomain = trustedDomains.some(domain => origin.includes(domain));
    
    // Allow if it's a trusted domain or explicitly allowed
    if (isTrustedDomain || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked for origin: ${origin}`);
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-start-time', 'x-requested-with'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
console.log(`CORS configured with cloud-native settings. Explicit allowed origins: ${process.env.CORS_ALLOWED_ORIGINS || 'Default development origins'}`);

// Add proper OPTIONS handling for preflight requests
app.options('*', cors(corsOptions));

// Fix missing/incorrect endpoint paths in requests
app.use((req, res, next) => {
  // Detect and fix common URL path issues
  if (req.path.includes('/ip/')) {
    // Fix issue where 'ip' gets attached to hostname without slash
    req.url = req.url.replace('/ip/', '/ip');
  } else if (req.path.endsWith('/ip')) {
    // Ensure trailing slash is properly handled
    req.url = '/ip';
  }
  
  console.log(`Processing request: ${req.method} ${req.path} from origin: ${req.headers.origin || 'Unknown'}`);
  next();
});

const largeBuffer = Buffer.alloc(5 * 1024 * 1024, 'a'); // 5MB

// Basic health check endpoint
app.get('/', (req, res) =>{
    res.send('200 OK')
})

// IP endpoint - properly separated from hostname
app.get('/ip', (req, res) => {
    const IP = req.ip;
    res.json({ ip: IP })
})

app.get('/ping', (req, res) => {
    const startTime = Date.now();
    res.json({ startTime });
});

app.get('/download', (req, res) => {
    res.setHeader('Content-Length', largeBuffer.length);
    res.send(largeBuffer);
});


app.get('/nmap', (req, res) => {
    const userIP = req.ip;  
    console.log(`nmap -A --script vuln ${userIP}`)
    exec(`nmap -A --script vuln ${userIP}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: 'Nmap scan failed', details: stderr });
        }
        res.json({ nmap: stdout });
    });
});

app.get('/open-ports', (req, res) => {
    const userIP = req.ip;
    exec(`nmap -p- ${userIP}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: 'Port scan failed', details: stderr });
        }
        res.json({ ports: stdout });
    });
});

app.get('/services', (req, res) => {
    const userIP = req.ip;
    exec(`nmap -sV -O ${userIP}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: 'Service detection failed', details: stderr });
        }
        res.json({ services: stdout });
    });
});

app.get('/ssl-check', (req, res) => {
    const userIP = req.ip;
    exec(`nmap --script ssl-enum-ciphers ${userIP}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: 'SSL check failed', details: stderr });
        }
        res.json({ ssl: stdout });
    });
});

app.get('/vuln-scan', (req, res) => {
    const userIP = req.ip;
    exec(`nmap --script vuln ${userIP}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: 'Vulnerability scan failed', details: stderr });
        }
        res.json({ vuln: stdout });
    });
});

app.get('/firewall-check', (req, res) => {
    const userIP = req.ip;
    exec(`nmap -sA ${userIP}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: 'Firewall detection failed', details: stderr });
        }
        res.json({ firewall: stdout });
    });
});

// Configure file upload for testing upload speed
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const startTime = req.headers['x-start-time']; // Client sends timestamp
    if (!startTime) {
        return res.status(400).json({ error: 'Missing x-start-time header' });
    }
    const endTime = Date.now();
    const uploadTime = endTime - startTime;
    res.json({ uploadTime });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
