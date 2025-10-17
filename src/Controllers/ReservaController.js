const ReservaRepository = require('../repositories/ReservaRepository.js');
const HospedeRepository = require('../repositories/HospedeRepository.js');
// **CORREÇÃO:** O caminho foi ajustado para encontrar o arquivo de conexão corretamente
const db = require('../database/conexao.js');

class ReservaController {
  async index(req, res) {
    try {
      const reservas = await ReservaRepository.findAllWithHospede();
      res.status(200).json(reservas);
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      res.status(500).json({ error: 'Ocorreu um erro ao buscar as reservas' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      const reserva = await ReservaRepository.findByIdWithHospede(id);
      if (!reserva) {
        return res.status(404).json({ error: 'Reserva não encontrada' });
      }
      res.status(200).json(reserva);
    } catch (error) {
      console.error('Erro ao buscar reserva:', error);
      res.status(500).json({ error: 'Ocorreu um erro ao buscar a reserva' });
    }
  }

  async store(req, res) {
    let connection;
    try {
      const { reserva, hospede } = req.body;
      if (!reserva || !hospede) {
        return res.status(400).json({ error: 'Dados da reserva ou do hóspede faltando.' });
      }

      connection = await db.getConnection();
      await connection.beginTransaction();

      const novoHospede = await HospedeRepository.create(hospede, connection);
      const idHospede = novoHospede.idHospede;
      const novaReserva = await ReservaRepository.create({ ...reserva, idHospede }, connection);

      await connection.commit();
      res.status(201).json({ message: 'Reserva criada com sucesso!', hospede: novoHospede, reserva: novaReserva });

    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Erro ao criar reserva:', error);
      res.status(500).json({ error: 'Ocorreu um erro ao criar a reserva.' });
    } finally {
      if (connection) connection.release();
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const reservaData = req.body;
      const result = await ReservaRepository.update(id, reservaData);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Reserva não encontrada para atualização' });
      }
      const reservaAtualizada = await ReservaRepository.findByIdWithHospede(id);
      res.status(200).json(reservaAtualizada);
    } catch (error) {
      console.error('Erro ao atualizar reserva:', error);
      res.status(500).json({ error: 'Ocorreu um erro ao atualizar a reserva' });
    }
  }

  async destroy(req, res) {
    try {
      const { id } = req.params;
      const result = await ReservaRepository.delete(id);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Reserva não encontrada para exclusão' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar reserva:', error);
      res.status(500).json({ error: 'Ocorreu um erro ao deletar a reserva' });
    }
  }
}

module.exports = new ReservaController();