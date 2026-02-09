const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8089;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Serve the main HTML file with HOST and PORT injected
    if (pathname === '/' || pathname === '/index.html') {
        fs.readFile(path.join(__dirname, 'ibis-dashboard.html'), 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading page');
                return;
            }
            // Inject HOST and PORT into the HTML
            const injectedHtml = data
                .replace(/const OAUTH_REDIRECT_PORT = 8089;/g, `const OAUTH_REDIRECT_PORT = ${PORT};`)
                .replace(/localhost:\${OAUTH_REDIRECT_PORT}/g, `${HOST}:\${OAUTH_REDIRECT_PORT}`);
            
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(injectedHtml);
        });
    }
    // Handle OAuth callback
    else if (pathname === '/callback') {
        const code = parsedUrl.query.code;
        
        if (code) {
            // Serve success page with code
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Strava Authorization</title>
                    <style>
                        body {
                            font-family: 'Courier New', monospace;
                            background: #0a0a12;
                            color: #4ecdc4;
                            text-align: center;
                            padding: 60px 20px;
                            min-height: 100vh;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            margin: 0;
                        }
                        h1 {
                            font-size: 3rem;
                            margin-bottom: 20px;
                            animation: pulse 2s ease-in-out infinite;
                        }
                        p {
                            font-size: 1.2rem;
                            color: #b0c4de;
                        }
                        @keyframes pulse {
                            0%, 100% { transform: scale(1); }
                            50% { transform: scale(1.05); }
                        }
                    </style>
                </head>
                <body>
                    <h1>SUCCESS! ✨</h1>
                    <p>Authorization complete! You can close this window now.</p>
                    <script>
                        // Send code to parent window
                        if (window.opener) {
                            window.opener.postMessage({ 
                                type: 'strava-oauth-code', 
                                code: '${code}' 
                            }, '*');
                            // Auto-close after 2 seconds
                            setTimeout(() => window.close(), 2000);
                        }
                    </script>
                </body>
                </html>
            `);
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Authorization Failed</title>
                    <style>
                        body {
                            font-family: 'Courier New', monospace;
                            background: #0a0a12;
                            color: #ff6b6b;
                            text-align: center;
                            padding: 60px 20px;
                        }
                        h1 { font-size: 2rem; }
                    </style>
                </head>
                <body>
                    <h1>Authorization Failed</h1>
                    <p>Please try again.</p>
                </body>
                </html>
            `);
        }
    }
    // Handle 404
    else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`🪶 Ibis Dashboard Server running at http://${HOST}:${PORT}`);
    console.log(`Open your browser and navigate to http://${HOST}:${PORT}`);
    console.log(`\nEnvironment variables:`);
    console.log(`  HOST: ${HOST} (can be set with HOST=your-domain)`);
    console.log(`  PORT: ${PORT} (can be set with PORT=8080)`);
});
