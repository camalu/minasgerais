import React from "react";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DownloadIcon from "@mui/icons-material/Download";
import { jsPDF } from "jspdf";

const PagamentoConfirmado = ({ data }) => {
  const gerarComprovantePDF = () => {
    const doc = new jsPDF();

    // Cabeçalho
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Comprovante de Pagamento", 105, 20, { align: "center" });

    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);

    // Informações do Pagamento
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    // Exemplo de preenchimento dinâmico com os dados da variável `data`
    doc.text(`Nome: ${data.proprietario.nome}`, 20, 40);
    doc.text(`CPF: ${data.proprietario.cpfCnpj}`, 20, 50);
    doc.text(`Placa do Veículo: ${data.veiculo.placa}`, 20, 60);

    // Rodapé
    doc.setFontSize(10);
    doc.text(
      "Este é um comprovante oficial de pagamento gerado automaticamente.",
      105,
      280,
      { align: "center" }
    );

    // Baixar o PDF
    doc.save("comprovante.pdf");
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
