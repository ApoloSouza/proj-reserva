const express = require('express');
const cors = require('cors');

// **CORREÇÃO:** Esta linha importa o unificador de rotas e define a variável 'routes'.
// O caminho './routes' funciona porque o 'index.js' dentro dele é carregado por padrão.
const routes = require('./routes'); 

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// A linha abaixo agora funciona, pois a variável 'routes' foi definida acima.
// Todas as suas rotas usarão o prefixo /api
app.use('/api', routes);

module.exports = app;

// --- 1. CONFIGURAÇÃO INICIAL ---
// const express = require('express');
// const cors = require('cors'); // Importa o CORS
// const db = require('./database/conexao');


// const app = express();


// --- 2. MIDDLEWARES ---
// app.use(cors()); // Habilita o CORS para todas as rotas
// app.use(express.json()); // Permite que o servidor entenda JSON


// --- 3. ROTAS DA API ---

// LER TODAS AS RESERVAS
// app.get('/api/reservas', async (req, res) => {
//   try {
//     // Query corrigida para não depender da tabela 'Quarto'
//     const query = `
//       SELECT 
//         r.*, 
//         h.nome AS nomeHospede, 
//         h.email AS emailHospede
//       FROM Reserva r 
//       JOIN Hospede h ON r.idHospede = h.idHospede
//     `;
//     const [reservas] = await db.execute(query);
//     res.status(200).json(reservas);
//   } catch (error) {
//     console.error('Erro ao buscar reservas:', error);
//     res.status(500).json({ message: 'Erro ao buscar dados das reservas.' });
//   }
// });

// LER UMA RESERVA
// app.get('/api/reservas/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     // Query corrigida para não depender da tabela 'Quarto'
//     const query = `
//       SELECT r.*, h.nome, h.email, h.telefone 
//       FROM Reserva r 
//       JOIN Hospede h ON r.idHospede = h.idHospede 
//       WHERE r.idReserva = ?
//     `;
//     const [rows] = await db.execute(query, [id]);
//     if (rows.length > 0) res.status(200).json(rows[0]);
//     else res.status(404).json({ message: 'Reserva não encontrada.' });
//   } catch (error) {
//     console.error('Erro ao buscar reserva:', error);
//     res.status(500).json({ message: 'Erro ao buscar dados da reserva.' });
//   }
// });

// CRIAR RESERVA
// app.post('/api/reservas', async (req, res) => {
//   let connection;
//   try {
//     const { reserva, hospede } = req.body;
//     if (!reserva || !hospede) return res.status(400).json({ message: 'Dados da reserva ou do hóspede faltando.' });
//     connection = await db.getConnection();
//     await connection.beginTransaction();
//     const idHospede = uuidv4();
//     const nomeCompleto = `${hospede.nome} ${hospede.sobrenome}`;
//     const hospedeQuery = `INSERT INTO Hospede (idHospede, nome, CPF, email, dataNascimento, telefone) VALUES (?, ?, ?, ?, ?, ?)`;
//     await connection.execute(hospedeQuery, [idHospede, nomeCompleto, hospede.cpf, hospede.email, hospede.dataNascimento, hospede.telefone]);
//     const idReserva = uuidv4();
//     const reservaQuery = `INSERT INTO Reserva (idReserva, dataEntrada, dataSaida, status, idQuarto, idCliente, precoTotal, quantidadeHospedes, quantidadeDiarias, idHospede) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
//     await connection.execute(reservaQuery, [idReserva, reserva.dataEntrada, reserva.dataSaida, 'Pendente', reserva.idQuarto, reserva.idCliente, reserva.precoTotal, hospede.quantidadeHospedes, reserva.quantidadeDiarias, idHospede]);
//     await connection.commit();
//     res.status(201).json({ message: 'Reserva criada com sucesso!', idReserva: idReserva });
//   } catch (error) {
//     if (connection) await connection.rollback();
//     console.error('Erro ao criar reserva:', error);
//     res.status(500).json({ message: 'Erro ao criar a reserva.' });
//   } finally {
//     if (connection) connection.release();
//   }
// });

// ATUALIZAR RESERVA
// app.put('/api/reservas/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const camposParaAtualizar = req.body;
//     if (Object.keys(camposParaAtualizar).length === 0) return res.status(400).json({ message: 'Nenhum campo fornecido para atualização.' });
//     const setClause = Object.keys(camposParaAtualizar).map(key => `\`${key}\` = ?`).join(', ');
//     const values = [...Object.values(camposParaAtualizar), id];
//     const query = `UPDATE Reserva SET ${setClause} WHERE idReserva = ?`;
//     const [result] = await db.execute(query, values);
//     if (result.affectedRows > 0) res.status(200).json({ message: 'Reserva atualizada com sucesso!' });
//     else res.status(404).json({ message: 'Reserva não encontrada.' });
//   } catch (error) {
//     console.error('Erro ao atualizar reserva:', error);
//     res.status(500).json({ message: 'Erro ao atualizar a reserva.' });
//   }
// });

// ATUALIZAR HÓSPEDE
// app.put('/api/hospedes/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         const camposParaAtualizar = req.body;
//         if (Object.keys(camposParaAtualizar).length === 0) return res.status(400).json({ message: 'Nenhum campo fornecido para atualização.' });
//         const setClause = Object.keys(camposParaAtualizar).map(key => `\`${key}\` = ?`).join(', ');
//         const values = [...Object.values(camposParaAtualizar), id];
//         const query = `UPDATE Hospede SET ${setClause} WHERE idHospede = ?`;
//         const [result] = await db.execute(query, values);
//         if (result.affectedRows > 0) res.status(200).json({ message: 'Hóspede atualizado com sucesso!' });
//         else res.status(404).json({ message: 'Hóspede não encontrado.' });
//     } catch (error) {
//         console.error('Erro ao atualizar hóspede:', error);
//         res.status(500).json({ message: 'Erro ao atualizar o hóspede.' });
//     }
// });

// DELETAR RESERVA
// app.delete('/api/reservas/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const query = 'DELETE FROM Reserva WHERE idReserva = ?';
//     const [result] = await db.execute(query, [id]);
//     if (result.affectedRows > 0) res.status(200).json({ message: 'Reserva deletada com sucesso!' });
//     else res.status(404).json({ message: 'Reserva não encontrada.' });
//   } catch (error) {
//     console.error('Erro ao deletar reserva:', error);
//     res.status(500).json({ message: 'Erro ao deletar a reserva.' });
//   }
// });
// app.use(routes);
// module.exports = app;
