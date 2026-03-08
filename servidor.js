import express from 'express'
import cors from 'cors'
import mysql from 'mysql2/promise'

const app = express()
app.use(express.json())
app.use(cors())

//conexão mysql
const bancoDados = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password:'16102006',
    database: 'clinica_agendamento'
})

//testando conexão
try {
    const conexão = await bancoDados.getConnection();
    console.log('banco de dados conectado com sucesso')
}
catch (err){
    console.log('não foi possivel se conectar ao banco', err)
}

app.post('/login', async (req, res) => {
    try {
        
        const {pessoa, acesso} = req.body;
        console.log(pessoa, acesso);

        const sql = 'SELECT * FROM usuarios where nome = ? AND senha = ?'
        
        const [rows] = await bancoDados.execute(sql, [pessoa, acesso ])

        if (rows.length > 0) {
            res.status(200).json({
                mensagem: 'usuario encontrado com sucesso'
            });
        } else {
            res.status(401).json({
                mensagem: 'usuario ou senha incorretos'
            });
        }
        
    }catch (erro) {
        console.error(erro);
    }
})

app.post('/cadastro', async (req, res) => {

    res.status(201).json({
        messagem: 'usuario cadastrado com sucesso'
    })
})



app.listen(3000, () => {
    console.log('servidor rodando na porta 3000')
})