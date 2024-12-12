import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
const basicAuth = require('express-basic-auth');

const prisma = new PrismaClient()

const app = express()
app.use(express.json())


const allowedIP = '2804:910:80a:7101:e9fe:6409:81ff:9e61';

app.use(basicAuth({
    users: { 'usuario': 'senha' },
    challenge: true,
    realm: 'Restrito',
}));

app.use(cors({
    origin: 'https://finan-as-final.vercel.app'
}));


app.use((req, res, next) => {
  const clientIP = req.ip;


  if (clientIP === allowedIP) {
    next();  
  } else {
    res.status(403).send('Acesso negado!');  
  }
});


app.get('/usuarios', async (req, res) => {
    const users = await prisma.user.findMany()
    res.json(users)
})

app.post('/usuarios', async (req, res) => {
    try {
        const usuario = await prisma.user.create({
            data: {
                conta: req.body.conta,
                logado: req.body.logado,
                transacoes: req.body.transacoest
            }
        })

        res.status(201).json(usuario)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Erro ao criar o usuário' })
    }
})

app.put("/usuarios/:id", async (req, res) => {
    try {
        const { id } = req.params
        const { transacoest } = req.body

        const updatedUser = await prisma.user.update({
            where: {
                id: id
            },
            data: {
                transacoes: {
                    push: transacoest
                },
            },
        })

        res.json(updatedUser)
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar transação' })
    }
})

app.put('/usuarios/:userId/:transacaoId', async (req, res) => {
    const { userId, transacaoId } = req.params;
    const { novaTransacao } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { transacoes: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const transacaoExistente = user.transacoes.find(transacao => transacao.transacaoId === transacaoId);
        if (!transacaoExistente) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        const updatedTransacoes = user.transacoes.map(transacao => {
            if (transacao.transacaoId === transacaoId) {
                return { ...transacao, ...novaTransacao };
            }
            return transacao;
        });

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                transacoes: updatedTransacoes,
            },
        });

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao editar a transação' });
    }
});

app.delete('/usuarios/:id', async (req, res) => {
    const userId = req.params.id;
    const { transacaoid } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { transacoes: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const transacaoExistente = user.transacoes.find(transacao => transacao.transacaoId === transacaoid);
        if (!transacaoExistente) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        const updatedTransacoes = user.transacoes.filter(transacao => transacao.transacaoId !== transacaoid);

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                transacoes: updatedTransacoes,
            },
        });

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar a transação' });
    }
});

app.listen(3000, () => {
    console.log('rodando')
})

export default app
