import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const app = express()
app.use(express.json())
app.use(cors())

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
    const { userId, transacaoId } = req.params;  // Obtém o ID do usuário e o ID da transação a partir da URL
    const { novaTransacao } = req.body;  // Obtém os novos dados da transação a partir do corpo da requisição

    try {
        // Recupera o usuário com o array de transações
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { transacoes: true },  // Apenas o campo transacoes
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Verifica se a transação existe no array de transações
        const transacaoExistente = user.transacoes.find(transacao => transacao.transacaoId === transacaoId);
        if (!transacaoExistente) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        // Atualiza a transação encontrada com os novos dados
        const updatedTransacoes = user.transacoes.map(transacao => {
            if (transacao.transacaoId === transacaoId) {
                // Atualize os campos da transação aqui conforme os dados recebidos
                return { ...transacao, ...novaTransacao };  // Exemplo: substitui os dados antigos pelos novos
            }
            return transacao;
        });

        // Atualiza o usuário com o novo array de transações
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                transacoes: updatedTransacoes,  // Atualiza o array de transações com a transação editada
            },
        });

        res.json(updatedUser);  // Retorna o usuário atualizado com a transação editada
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao editar a transação' });
    }
});




app.delete('/usuarios/:id', async (req, res) => {
    const userId = req.params.id;  // Obtém o ID do usuário a partir da URL
    const { transacaoid } = req.body;  // Obtém o ID da transação a ser excluída

    try {
        // Recupera o usuário com o array de transações
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { transacoes: true },  // Apenas o campo transacoes
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Verifica se a transação existe antes de tentar removê-la
        const transacaoExistente = user.transacoes.find(transacao => transacao.transacaoId === transacaoid);
        if (!transacaoExistente) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        // Filtra o array de transações, removendo a transação que corresponde ao transacaoId
        const updatedTransacoes = user.transacoes.filter(transacao => transacao.transacaoId !== transacaoid);

        // Atualiza o usuário com o array de transações filtrado
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                transacoes: updatedTransacoes,  // Atualiza o array de transações removendo o objeto
            },
        });

        res.status(204).send();  // Retorna sucesso sem conteúdo
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar a transação' });
    }
});

app.listen(3000, () => {
    console.log('rodando')
})

export default app
