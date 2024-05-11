import {fileURLToPath} from 'url';
import path from 'path';
import os from 'os';
import Koa from 'koa';
import Router from '@koa/router';
import {promises as fs} from 'fs';
import koaStatic from 'koa-static';
import {bodyParser} from '@koa/bodyparser';
import cors from '@koa/cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Koa();
const router = new Router();

const docsPath = path.join(__dirname, 'docs');
const savedFilePath = path.join(__dirname, 'saved.txt');

// Serve static files from ./docs directory
app.use(koaStatic(docsPath));

app.use(cors());
app.use(bodyParser());

// Middleware to ensure saved.txt always exists
app.use(async (_ctx, next) => {
	try {
		await fs.access(savedFilePath);
	} catch (error) {
		await fs.writeFile(savedFilePath, '');
	}
	await next();
});

router.post('/api/save', async (ctx) => {
	const {content} = ctx.request.body;
	if (!content) {
		ctx.status = 400;
		ctx.body = 'Content is required';
		return;
	}
	try {
		await fs.writeFile(savedFilePath, content);
		ctx.status = 200;
		ctx.body = 'Content saved successfully';
	} catch (error) {
		ctx.status = 500;
		ctx.body = 'Error saving content';
	}
});

router.get('/api/retrieve', async (ctx) => {
	try {
		const content = await fs.readFile(savedFilePath, 'utf8');
		ctx.status = 200;
		ctx.body = {content};
	} catch (error) {
		ctx.status = 500;
		ctx.body = 'Error retrieving content';
	}
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(8006, () => {
	const networkInterfaces = os.networkInterfaces();
	delete networkInterfaces.lo;
	const interfaces = Object.values(networkInterfaces).flat();
	const lanAddress =
		interfaces.find((i) => i.family === 'IPv4')?.address || '???.???.???.???';
	console.log(
		`Server Listening on http://localhost:8006/ (http://${lanAddress}:8006/)`,
	);
});
