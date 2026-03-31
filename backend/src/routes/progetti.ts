import express, { Router, Request, Response } from 'express';
import pool from '../db';
import { RowDataPacket } from 'mysql2';

const router: Router = express.Router();
console.log('Router progetti caricato');

interface Progetto extends RowDataPacket {
    id_p: number;
    Nome_P: string;
    Descrizione_P: string;
    Data_P: string;
    repo_git: string;
}

router.get('/', (req: Request, res: Response): void => {
    pool.query('SELECT * FROM progetti', (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Errore nel database' });
            return;
        }
        res.json(results);
    });
});

router.get('/:id', (req: Request, res: Response): void => {
    const id = req.params.id as string;
    
    pool.query<Progetto[]>(
        'SELECT * FROM progetti WHERE id_p = ?',
        [id],
        (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Errore nel database' });
                return;
            }
            
            if (results.length === 0) {
                console.log(`Progetto con id ${id} non trovato`);
                res.status(404).json({ error: 'Progetto non trovato' });
                return;
            }
            
            res.json(results[0]);
        }
    );
});

export default router;