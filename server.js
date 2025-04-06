const express = require('express');
const multer = require('multer');
const cors = require('cors');  
const { exec } = require('child_process'); 
const app = express();

app.use(cors()); 

const largeBuffer = Buffer.alloc(5 * 1024 * 1024, 'a'); // 5MB

app.get('/', (req, res) =>{
    res.send('200 OK')
})
app.get('/ip', (req, res)=>{
    const userIP = req.ip.includes('::ffff:') ? req.ip.split(':').pop() : req.ip;
    res.json({ ip: userIP})
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
    const userIP = req.ip.includes('::ffff:') ? req.ip.split(':').pop() : req.ip;
    console.log(`nmap -A --script vuln ${userIP}`)
    exec(`nmap -A --script vuln ${userIP}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: 'Nmap scan failed', details: stderr });
        }
        res.json({ nmap: stdout });
    });
});

app.get('/open-ports', (req, res) => {
    const userIP = req.ip.includes('::ffff:') ? req.ip.split(':').pop() : req.ip;
    exec(`nmap -p- ${userIP}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: 'Port scan failed', details: stderr });
        }
        res.json({ ports: stdout });
    });
});

app.get('/services', (req, res) => {
    const userIP = req.ip.includes('::ffff:') ? req.ip.split(':').pop() : req.ip;
    exec(`nmap -sV -O ${userIP}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: 'Service detection failed', details: stderr });
        }
        res.json({ services: stdout });
    });
});

app.get('/ssl-check', (req, res) => {
    const userIP = req.ip.includes('::ffff:') ? req.ip.split(':').pop() : req.ip;
    exec(`nmap --script ssl-enum-ciphers ${userIP}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: 'SSL check failed', details: stderr });
        }
        res.json({ ssl: stdout });
    });
});

app.get('/vuln-scan', (req, res) => {
    const userIP = req.ip.includes('::ffff:') ? req.ip.split(':').pop() : req.ip;
    exec(`nmap --script vuln ${userIP}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: 'Vulnerability scan failed', details: stderr });
        }
        res.json({ vuln: stdout });
    });
});

app.get('/firewall-check', (req, res) => {
    const userIP = req.ip.includes('::ffff:') ? req.ip.split(':').pop() : req.ip;
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

const port = 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
