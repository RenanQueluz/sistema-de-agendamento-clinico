import express from 'express'
import cors from 'cors'
import mysql from 'mysql2/promise'
import dotenv from "dotenv";



const app = express()
app.use(express.json())
app.use(cors())

//conexão mysql
dotenv.config();
const bancoDados = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

//armazenamento de teste
const armazenamento = []

//testando conexão
try {
    const conexão = await bancoDados.getConnection();
    console.log('banco de dados conectado com sucesso')
}
catch (err) {
    console.log('não foi possivel se conectar ao banco', err)
}

app.post('/login', async (req, res) => {
    try {
        const { pessoa, acesso } = req.body;
        console.log(pessoa, acesso);

        const sql = 'SELECT * FROM usuarios where nome = ? AND cpf = ?'

        const [rows] = await bancoDados.execute(sql, [pessoa, acesso])
        if (rows.length > 0) {
            res.status(200).json({
                mensagem: 'usuario encontrado com sucesso'
            });

        } else {
            res.status(401).json({
                mensagem: 'usuario ou senha incorretos'
            });
        }
    } catch (erro) {
        console.error(erro);
    }
})

app.post('/cadastro', async (req, res) => {

    try {
        const { usuario, email, chave, sexo } = req.body
        console.log(req.body)

        const sql = 'INSERT INTO usuarios (nome, email, sexo, cpf) VALUES (?, ?, ?, ?)'
        await bancoDados.execute(sql, [usuario, email, sexo, chave])

        console.log(req.body)
        res.status(201).json({
            messagem: 'usuario criado com sucesso'
        })

    }

    catch (error) {
        console.log('erro em continuar')
    }

});

app.post('/paciente', async (req, res) => { //cadastra os pacientes

    try {
        const pacientes = req.body.pacientes
        console.log('requisição do body:', req.body)


        const sql = 'INSERT INTO cliente (horario, nome_paciente, contato, nome_medico, tipo, data_consulta) VALUES (?, ?, ?, ?, ?, ?)'


        await bancoDados.execute(sql, [
            pacientes.horario_consulta,
            pacientes.nome_paciente,
            pacientes.contato,
            pacientes.nome_medico,
            pacientes.plano_saude,
            pacientes.data_consulta
        ])


       res.status(201).json({
            ok: true, 
            mensagem: 'paciente criado'
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            ok: false,
            mensagem: "Erro em acessar o banco"
        });
    }
})

app.get('/pesquisas', async (req, res) => { //busca os pacientes

    try {

        const data = req.query.data;

        const [consultas] = await bancoDados.query(
            "SELECT * FROM cliente WHERE data_consulta = ?",
            [data]
        );

        // nenhum resultado
        if (consultas.length === 0) {
            return res.status(404).json({
                mensagem: 'Nenhuma agenda encontrada'
            });
        }

        // retorna dados reais
        res.status(200).json(consultas);

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            mensagem: 'Erro ao buscar agendas'
        });
    }
    
});


//deletar pacientes

app.delete('/deletar/:id', async (req, res) =>{
    try{ 

    const id = req.params.id;

    await bancoDados.query(
        "DELETE FROM cliente where id = ?", [id]
    ) 
        
     res.status(200).json({
       ok: true,
       mesagem: 'paciente deletado'

    });

    }
    catch (erro){

        console.error(erro)

        res.status(500).json({
            ok: false,
            mensagem: 'erro em deletar paciente'

        })
    }

   
})


app.listen(3000, () => {
    console.log('servidor rodando na porta 3000')
})