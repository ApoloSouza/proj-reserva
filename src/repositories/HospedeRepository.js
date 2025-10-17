import { randomUUID } from "node:crypto";
import db from "../database/conexao.js"; // Assumindo que seu arquivo de conexão se chama 'conexao.js'

class HospedeRepository {
  async findAll() {
    const sql = "SELECT * FROM Hospede;";
    const [rows] = await db.execute(sql);
    return rows;
  }

  async findById(id) {
    const sql = "SELECT * FROM Hospede WHERE idHospede = ?;";
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
  }

  async create(hospedeData) {
    const newId = randomUUID();
    const { nome, CPF, email, dataNascimento, telefone } = hospedeData;

    const sql = `
      INSERT INTO Hospede (idHospede, nome, CPF, email, dataNascimento, telefone)
      VALUES (?, ?, ?, ?, ?, ?);
    `;
    const values = [newId, nome, CPF, email, dataNascimento, telefone];

    await db.execute(sql, values);
    return { idHospede: newId, ...hospedeData };
  }

  async update(id, hospedeData) {
    const { nome, CPF, email, dataNascimento, telefone } = hospedeData;

    const sql = `
      UPDATE Hospede SET
        nome = ?, CPF = ?, email = ?, dataNascimento = ?, telefone = ?
      WHERE idHospede = ?;
    `;
    const values = [nome, CPF, email, dataNascimento, telefone, id];

    const [result] = await db.execute(sql, values);
    return { affectedRows: result.affectedRows };
  }

  async delete(id) {
    const sql = "DELETE FROM Hospede WHERE idHospede = ?;";
    const [result] = await db.execute(sql, [id]);
    return { affectedRows: result.affectedRows };
  }
}

export default new HospedeRepository();
