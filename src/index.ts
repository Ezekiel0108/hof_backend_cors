import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import progettiRoutes from './routes/progetti';
import studentiRoutes from './routes/studenti';
import readmeRoutes from './routes/readme';
import progettoStudentiRoutes from './routes/progetto_studenti';

const app: Express = express();
const port: number = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'dist')));

app.use(express.static(path.join(__dirname, '..', 'dist')));

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.use('/api/progetti', progettiRoutes);
app.use('/api/studenti', studentiRoutes);
app.use('/api/readme', readmeRoutes);
app.use('/api/progetto_studenti', progettoStudentiRoutes);

app.listen(port, () => {
    console.log(`Il server è in ascolto sulla porta ${port}`);
});
