import React from "react";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DownloadIcon from "@mui/icons-material/Download";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const PagamentoConfirmado = ({
  data,
  invoiceIdOriginal,
  valorTotal,
  parcelasSelecionadas,
}) => {
  function gerarNumeroPadrao() {
    const prefixo = "00."; // Prefixo fixo
    const numeroPrincipal = Math.floor(Math.random() * 1e9)
      .toString()
      .padStart(9, "0"); // Gera um número com 9 dígitos
    const sufixo = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0"); // Gera um número com 2 dígitos

    return `${prefixo}${numeroPrincipal}-${sufixo}`;
  }

  function obterEmissaoAtual() {
    const agora = new Date();

    const dia = String(agora.getDate()).padStart(2, "0");
    const mes = String(agora.getMonth() + 1).padStart(2, "0"); // Mês começa em 0
    const ano = agora.getFullYear();

    const horas = String(agora.getHours()).padStart(2, "0");
    const minutos = String(agora.getMinutes()).padStart(2, "0");
    const segundos = String(agora.getSeconds()).padStart(2, "0");

    return `Emissão realizada em ${dia}/${mes}/${ano} às ${horas}:${minutos}:${segundos}`;
  }

  const gerarRandomId = () => {
    return `AUTH-${Date.now()}-${Math.floor(Math.random() * 1e8)}`;
  };

  const gerarComprovantePDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    // Adicionar marca-d'água
    doc.setFontSize(40);
    doc.setTextColor(200, 200, 200);
    doc.setFont("helvetica", "bold");

    // Logotipo no cabeçalho
    doc.addImage("/logosec.png", "PNG", 15, 15, 30, 30);

    // Título principal
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("SECRETARIA DE ESTADO DE FAZENDA DE MINAS GERAIS", 60, 25);
    doc.setFontSize(12);
    doc.text("Comprovante de Pagamento Consolidado Por Exercício", 60, 35);

    // Linha separadora
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(10, 45, 200, 45);

    // Tabelas lado a lado ajustadas às margens
    autoTable(doc, {
      startY: 50,
      head: [["Dados do Contribuinte", "Informações Adicionais"]],
      body: [
        [
          `Nome: ${data.proprietario.nome}\nCPF/CNPJ: ${data.proprietario.cpfCnpj}\nMunicípio: ${data.proprietario.municipio}\nUF: ${data.proprietario.uf}`,
          `Renavam: ${data.renavam}\nAno de Referência: 2025\nPlaca: ${data.veiculo.placa}\nChassi: ${data.veiculo.chassi}`,
        ],
      ],
      styles: { font: "helvetica", fontSize: 10 },
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
      bodyStyles: {
        textColor: [0, 0, 0],
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 90 },
      },
      tableWidth: 190,
    });

    // Linha separadora
    doc.line(
      10,
      doc.lastAutoTable.finalY + 5,
      200,
      doc.lastAutoTable.finalY + 5
    );

    // Tabela de pagamentos ajustada
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [
        [
          "Nº do DAE",
          "Exercício",
          "Tributo",
          "Valor (R$)",
          "Multa (R$)",
          "Juros (R$)",
          "Total (R$)",
        ],
      ],
      body: parcelasSelecionadas.map((parcela) => [
        gerarNumeroPadrao(),
        parcela.descricao,
        parcela.dataVencimento,
        parcela.valorTotal.toFixed(2),
        parcela.multa?.toFixed(2) || "0.00",
        parcela.juros?.toFixed(2) || "0.00",
        (
          parcela.valorTotal +
          (parcela.multa || 0) +
          (parcela.juros || 0)
        ).toFixed(2),
      ]),
      styles: { font: "helvetica", fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] },
      bodyStyles: { textColor: [0, 0, 0], lineWidth: 0.1 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 25 },
      },
      tableWidth: 181,
    });

    // Linha digitável e autenticação
    const linhaDigitavelY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PIX ID:", 15, linhaDigitavelY);
    doc.setFont("helvetica", "normal");
    doc.text(invoiceIdOriginal, 50, linhaDigitavelY);

    const randomId = gerarRandomId();
    doc.setFont("helvetica", "bold");
    doc.text("Autenticação:", 15, linhaDigitavelY + 10);
    doc.setFont("helvetica", "normal");
    doc.text(randomId, 50, linhaDigitavelY + 10);

    // Rodapé
    const rodapeY = linhaDigitavelY + 35;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(obterEmissaoAtual(), 15, rodapeY);
    doc.text(
      "Este comprovante é válido para fins de comprovação do pagamento.",
      15,
      rodapeY + 5
    );

    // Salvar PDF
    doc.save(
      `comprovante-${Date.now()}-${Math.floor(Math.random() * 1e8)}.pdf`
    );
  };

  return (
    <Card elevation={0}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: 5,
          }}
        >
          {/* Ícone de check animado */}
          <CheckCircleOutlineIcon
            sx={{
              fontSize: 80,
              color: "green",
              animation: "pulse 1.5s infinite",
              "@keyframes pulse": {
                "0%": { transform: "scale(1)" },
                "50%": { transform: "scale(1.2)" },
                "100%": { transform: "scale(1)" },
              },
            }}
          />

          {/* Texto principal */}
          <Typography
            variant="h4"
            sx={{
              marginTop: 2,
              fontWeight: "bold",
              color: "green",
            }}
          >
            Pagamento Confirmado!
          </Typography>

          {/* Texto informativo */}
          <Typography
            variant="body1"
            sx={{
              marginTop: 1,
              color: "text.secondary",
              maxWidth: 500, // Limita a largura do texto
            }}
          >
            Muito obrigado, recebemos seu pagamento e a partir de agora o status
            do seu IPVA será atualizado em até 7 dias úteis. Abaixo você
            consegue baixar seu comprovante fiscal.
          </Typography>

          {/* Botão de download */}
          <Button
            variant="contained"
            color="success"
            size="large"
            startIcon={<DownloadIcon />}
            onClick={gerarComprovantePDF} // Função de download passada como prop
            sx={{ marginTop: 4 }}
          >
            Baixar Comprovante
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PagamentoConfirmado;
