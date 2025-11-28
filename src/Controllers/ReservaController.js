import ReservaRepository from "../repositories/ReservaRepository.js";
import HospedeRepository from "../repositories/HospedeRepository.js";
// **CORREÇÃO:** O caminho foi ajustado para encontrar o arquivo de conexão corretamente
import db from "../database/conexao.js";

// 🔹 MODIFICADO: Função auxiliar para criar pagamento (fora da classe)
async function criarPagamento(reservaData, dadosPagamento) {
  try {
    const PAGAMENTO_API_URL = process.env.PAGAMENTO_API_URL || 'http://localhost:3005';
    
    // 🔹 CORRIGIDO: Mapear nome do método para o tipo numérico do banco
    const metodoPagamentoMap = {
      'credit': 1,  // Cartão de crédito
      'pix': 2      // PIX
    };
    
    const tipoMetodoPagamento = metodoPagamentoMap[dadosPagamento.metodoPagamento];
    
    if (!tipoMetodoPagamento) {
      throw new Error(`Método de pagamento inválido: ${dadosPagamento.metodoPagamento}`);
    }

    // 🔹 NOVO: Buscar o ID do método de pagamento pelo tipo
    console.log(`🔍 Buscando método de pagamento pelo tipo: ${tipoMetodoPagamento}`);
    const methodResponse = await fetch(`${PAGAMENTO_API_URL}/api/metodo-pagamento/tipo/${tipoMetodoPagamento}`);
    
    if (!methodResponse.ok) {
      throw new Error('Método de pagamento não encontrado no sistema');
    }

    const methodData = await methodResponse.json();
    const idMetodoPagamento = methodData.data.method.id;
    console.log(`✅ ID do método de pagamento encontrado: ${idMetodoPagamento}`);
    
    // Dados do pagamento
    const pagamentoPayload = {
      valorTotal: parseFloat(reservaData.precoTotal),
      idUsuario: reservaData.idCliente,
      idReserva: reservaData.idReserva,
      idMetodoPagamento,
      cartao: dadosPagamento.cartao || undefined,
    };

    console.log('📤 Criando pagamento com dados do formulário:', pagamentoPayload);

    const response = await fetch(`${PAGAMENTO_API_URL}/api/pagamento`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pagamentoPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('⚠️ Falha ao criar pagamento:', errorData);
      throw new Error(errorData.message || 'Erro ao processar pagamento');
    }

    const resultado = await response.json();
    console.log('✅ Pagamento criado com sucesso:', resultado);

    return resultado;
  } catch (error) {
    console.error('❌ Erro ao criar pagamento:', error);
    throw error; // Propagar erro para cancelar a reserva se pagamento falhar
  }
}

class ReservaController {
  async index(req, res) {
    try {
      // 🔹 CORRIGIDO: Verificar se há filtro por idCliente
      const { idCliente } = req.query;
      
      let reservas;
      if (idCliente) {
        reservas = await ReservaRepository.findByClienteIdWithHospede(idCliente);
      } else {
        reservas = await ReservaRepository.findAllWithHospede();
      }
      
      res.status(200).json(reservas);
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
      res.status(500).json({ error: "Ocorreu um erro ao buscar as reservas" });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      const reserva = await ReservaRepository.findByIdWithHospede(id);
      if (!reserva) {
        return res.status(404).json({ error: "Reserva não encontrada" });
      }
      res.status(200).json(reserva);
    } catch (error) {
      console.error("Erro ao buscar reserva:", error);
      res.status(500).json({ error: "Ocorreu um erro ao buscar a reserva" });
    }
  }

  async store(req, res) {
    let connection;
    try {
      const { reserva, pagamento, hospede } = req.body;
      
      // Validação
      if (!reserva) {
        return res
          .status(400)
          .json({ error: "Dados da reserva faltando." });
      }

      if (!reserva.idCliente) {
        return res
          .status(400)
          .json({ error: "ID do cliente é obrigatório." });
      }

      // 🔹 NOVO: Validar dados do hóspede
      if (!hospede || !hospede.nome || !hospede.email) {
        return res
          .status(400)
          .json({ error: "Dados do hóspede (nome, email) são obrigatórios." });
      }

      // 🔹 NOVO: Validar dados de pagamento
      if (!pagamento || !pagamento.metodoPagamento) {
        return res
          .status(400)
          .json({ error: "Dados de pagamento são obrigatórios." });
      }

      if (pagamento.metodoPagamento === 'credit' && !pagamento.cartao) {
        return res
          .status(400)
          .json({ error: "Dados do cartão são obrigatórios para pagamento com cartão." });
      }

      connection = await db.getConnection();
      await connection.beginTransaction();

      // 🔹 NOVO: Criar hóspede primeiro
      console.log('📝 Criando hóspede:', hospede);
      const novoHospede = await HospedeRepository.create(hospede, connection);
      console.log('✅ Hóspede criado:', novoHospede.idHospede);

      // Criar reserva com o ID do hóspede recém-criado
      const novaReserva = await ReservaRepository.create(
        { 
          ...reserva, 
          idHospede: novoHospede.idHospede
        },
        connection
      );

      // 🔹 MODIFICADO: Criar pagamento usando dados do formulário
      let resultadoPagamento;
      try {
        resultadoPagamento = await criarPagamento(novaReserva, pagamento);
      } catch (error) {
        // Se o pagamento falhar, fazer rollback da reserva
        await connection.rollback();
        return res.status(400).json({ 
          error: "Erro ao processar pagamento: " + error.message 
        });
      }

      await connection.commit();
      
      res.status(201).json({
        message: "Reserva e pagamento criados com sucesso!",
        reserva: novaReserva,
        hospede: novoHospede,
        pagamento: resultadoPagamento.data || resultadoPagamento,
      });
    } catch (error) {
      if (connection) await connection.rollback();
      console.error("Erro ao criar reserva:", error);
      res.status(500).json({ error: "Ocorreu um erro ao criar a reserva." });
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
        return res
          .status(404)
          .json({ error: "Reserva não encontrada para atualização" });
      }
      const reservaAtualizada = await ReservaRepository.findByIdWithHospede(id);
      res.status(200).json(reservaAtualizada);
    } catch (error) {
      console.error("Erro ao atualizar reserva:", error);
      res.status(500).json({ error: "Ocorreu um erro ao atualizar a reserva" });
    }
  }

  async destroy(req, res) {
    try {
      const { id } = req.params;
      const result = await ReservaRepository.delete(id);
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "Reserva não encontrada para exclusão" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar reserva:", error);
      res.status(500).json({ error: "Ocorreu um erro ao deletar a reserva" });
    }
  }
}

export default new ReservaController();
