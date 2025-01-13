"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import QRCode from "react-qr-code";
import { ReportProblem } from "@mui/icons-material";

const GerarPagamento = ({ codigoPix }) => {
  const [copiado, setCopiado] = useState(false);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(codigoPix).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000); // Reseta o estado após 2 segundos
    });
  };

  return (
    <Box
      sx={{
        padding: 4,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        backgroundColor: "#fff",
        marginLeft: 3,
        marginRight: 3,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "left" }}>
        Pagamento por Pix
      </Typography>
      {/* Stepper */}
      <Stepper
        activeStep={-1} // Configuração para steps fixos
        orientation="vertical"
        sx={{ width: "100%", marginBottom: 4 }}
      >
        <Step>
          <StepLabel>
            <Typography
              variant="h6"
              sx={{ fontSize: "0.9rem", fontWeight: "bold" }}
            >
              APP seu banco
            </Typography>
            <Typography variant="body1" sx={{ fontSize: "0.8rem" }}>
              Abra o app do seu banco e vá até o menu <b>PIX</b>
            </Typography>
          </StepLabel>
        </Step>

        <Step>
          <StepLabel>
            <Typography
              variant="h6"
              sx={{ fontSize: "0.9rem", fontWeight: "bold" }}
            >
              PIX QR-CODE
            </Typography>
            <Typography variant="body1" sx={{ fontSize: "0.8rem" }}>
              Escolha a opção para pagar com QR-CODE; Aponte a câmera do celular
              para o QR-Code abaixo ou copie o código pix abaixo e cole no seu
              aplicativo bancário na função (Copiar-Colar).
            </Typography>
          </StepLabel>
        </Step>

        <Step>
          <StepLabel>
            <Typography
              variant="h6"
              sx={{ fontSize: "0.9rem", fontWeight: "bold" }}
            >
              Revise as informações
            </Typography>
            <Typography variant="body1" sx={{ fontSize: "0.8rem" }}>
              Confira se as informações estão corretas e confirme o pagamento.
            </Typography>
          </StepLabel>
        </Step>
      </Stepper>

      {/* QRCode */}
      <Box
        sx={{
          marginBottom: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <QRCode value={codigoPix} size={200} />
      </Box>

      {/* Código PIX e botão */}
      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleCopyPix}
          sx={{
            textTransform: "capitalize",
            backgroundColor: "#b81f25",
            "&:hover": { backgroundColor: "#a71b20" },
          }}
        >
          {copiado ? "Código Copiado!" : "Copiar Código PIX"}
        </Button>
      </Box>

      <Box
        sx={{
          borderRadius: 2,
          backgroundColor: "#f5f5f5",
          padding: 2,
          fontSize: "0.8rem",
          textAlign: "left",
          color: "#555",
          marginTop: 3,
          display: "flex",
          gap: 2,
        }}
      >
        <ReportProblem sx={{ color: "#ed6c02", fontSize: "1.4rem" }} />
        <Box>
          Após a confirmação do pagamento, a tela será atualizada permitindo a
          geração do comprovante de pagamento.
        </Box>
      </Box>
    </Box>
  );
};

export default GerarPagamento;
