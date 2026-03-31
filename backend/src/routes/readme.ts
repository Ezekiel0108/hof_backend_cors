import express, { Router, Request, Response } from 'express';
import pool from '../db';
import { marked, Tokens } from 'marked';
import { RowDataPacket } from 'mysql2';

const router: Router = express.Router();
console.log("Connessione ai readme");

interface ReadmeRow extends RowDataPacket {
    id_p: number;
    readme_link: string;
}

interface Section {
    title: string;
    level: number;
    content: string;
}

interface ParsedReadme {
    id: number;
    sections: Section[];
}

/**
 * GET /readme
 * Restituisce tutti i README
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await pool.promise().query<ReadmeRow[]>(
            'SELECT id_p, readme_link FROM progetti'
        );

        if (rows.length === 0) {
            res.status(404).json({ error: "Nessun progetto trovato" });
            return;
        }

        await queryReadme(res, rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Errore DB' });
    }
});

/**
 * GET /readme/:id
 * Restituisce un singolo README
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;
        const [rows] = await pool.promise().query<ReadmeRow[]>(
            'SELECT id_p, readme_link FROM progetti WHERE id_p = ?',
            [id]
        );

        if (rows.length === 0) {
            res.status(404).json({ error: "Progetto non trovato" });
            return;
        }

        await queryReadme(res, rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Errore DB' });
    }
});

/**
 * Scarica e parsifica i README
 */
async function queryReadme(res: Response, results: ReadmeRow[]): Promise<void> {
    try {
        const parsed: ParsedReadme[] = await Promise.all(
            results.map(async (row) => {
                const response = await fetch(row.readme_link);
                if (!response.ok) {
                    throw new Error(`Errore fetch README: ${response.status}`);
                }
                const markdown = await response.text();
                const sections = splitMarkdownSections(markdown);
                return {
                    id: row.id_p,
                    sections
                };
            })
        );
        res.json(parsed);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Errore parsing README' });
    }
}

/**
 * Divide il markdown in sezioni basate sugli heading
 */
function splitMarkdownSections(markdown: string): Section[] {
    const tokens = marked.lexer(markdown) as Tokens.Generic[];
    const sections: Section[] = [];
    let current: Section | null = null;

    for (const token of tokens) {
        if (token.type === 'heading') {
            const heading = token as Tokens.Heading;
            current = {
                title: heading.text,
                level: heading.depth,
                content: ''
            };
            sections.push(current);
        } else if (current && 'raw' in token) {
            current.content += token.raw ?? '';
        }
    }

    return sections;
}

export default router;