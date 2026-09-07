import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8' };
http.createServer(async (req,res)=>{ try { const rel = req.url === '/' ? 'index.html' : req.url.slice(1).split('?')[0]; const file = path.resolve(root, rel); if(!file.startsWith(root)) throw new Error('forbidden'); const body=await readFile(file); res.writeHead(200, {'Content-Type':types[path.extname(file)]||'application/octet-stream'}); res.end(body); } catch { res.writeHead(404); res.end('Not found'); }}).listen(5200,'127.0.0.1',()=>console.log('http://localhost:5200'));
