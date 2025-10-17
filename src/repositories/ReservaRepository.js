import { randomUUID } from "node:crypto";
import db from "../database/conexao.js"; // Assumindo que seu arquivo de conexão se chama 'conexao.js'

class ReservaRepository {
  async findAllWithHospede() {
    const sql = `
      SELECT r.*, h.nome AS nomeHospede, h.email AS emailHospede
      FROM Reserva r
      JOIN Hospede h ON r.idHospede = h.idHospede;
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }

  async findByIdWithHospede(id) {
    const sql = `
      SELECT r.*, h.nome, h.email, h.telefone
      FROM Reserva r
      JOIN Hospede h ON r.idHospede = h.idHospede
      WHERE r.idReserva = ?;
    `;
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
  }

  async create(reservaData, connection) {
    const newId = randomUUID();
    const {
      dataEntrada,
      dataSaida,
      status,
      idQuarto,
      idCliente,
      precoTotal,
      quantidadeHospedes,
      quantidadeDiarias,
      idHospede,
    } = reservaData;

    const sql = `
      INSERT INTO Reserva (
        idReserva, dataEntrada, dataSaida, status, idQuarto, idCliente,
        precoTotal, quantidadeHospedes, quantidadeDiarias, idHospede
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const values = [
      newId,
      dataEntrada,
      dataSaida,
      status || "Pendente",
      idQuarto,
      idCliente,
      precoTotal,
      quantidadeHospedes,
      quantidadeDiarias,
      idHospede,
    ];

    // Usa a conexão da transação se ela for fornecida
    const executor = connection || db;
    await executor.execute(sql, values);

    return { idReserva: newId, ...reservaData };
  }

  async update(id, reservaData) {
    const setClause = Object.keys(reservaData)
      .map((key) => `\`${key}\` = ?`)
      .join(", ");
    const values = [...Object.values(reservaData), id];
    const sql = `UPDATE Reserva SET ${setClause} WHERE idReserva = ?`;
    const [result] = await db.execute(sql, values);
    return { affectedRows: result.affectedRows };
  }

  async delete(id) {
    const sql = "DELETE FROM Reserva WHERE idReserva = ?;";
    const [result] = await db.execute(sql, [id]);
    return { affectedRows: result.affectedRows };
  }
}

export default new ReservaRepository();
