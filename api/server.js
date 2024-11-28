import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

app.get('/usuarios', async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});

app.post('/usuarios', async (req, res) => {
    try {
        const usuario = await prisma.user.create({
            data: {
                conta: req.body.conta,
                logado: req.body.logado,
                transacoes: req.body.transacoest
            }
        });
        res.status(201).json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar o usuário' });
    }
});

app.put("/usuarios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { transacoest } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                transacoes: {
                    push: transacoest
                },
            },
        });

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar transação' });
    }
});

app.delete('/usuarios/:id', async (req, res) => {
    try {
        await prisma.user.delete({
            where: {
                id: req.params.id
            }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar o usuário' });
    }
});

// Exportar como uma função serverless
export default app;
