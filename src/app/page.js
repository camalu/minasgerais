"use client";

import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useRenavam } from "../contexts/RenavamContext";
import styles from "./page.module.scss";

const Home = () => {
  const [renavam, setRenavam] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { setData } = useRenavam(); // Usa o contexto
  const router = useRouter();

  const handleConsultar = async () => {
    if (!renavam) {
      setError(true);
      setErrorMessage("O campo deve ser preenchido.");
      return;
    }

    setError(false);
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await axios.get(
        `https://veiculosmg.fazenda.mg.gov.br/api/extrato-debito/renavam/${renavam}/`
      );

      const data = response.data;

      // Verifica se o RENAVAM é inválido com base no retorno da API
      if (!data.valido) {
        setError(true);
        setErrorMessage("RENAVAM inválido. Verifique e tente novamente.");
        return;
      }

      // Armazena os dados no contexto
      setData(data);

      // Redireciona para a página /resultado-renavam
      router.push("/resultado-renavam");
    } catch (error) {
      console.error("Erro ao consultar o RENAVAM:", error);
      alert("Erro ao consultar o RENAVAM. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <img src="/logo.png" alt="Logo" />
      </div>

      <div className={styles.bg}>
        <div className={styles.card}>
          <div>
            <h1>Consultar IPVA e Taxa de Licenciamento</h1>
            <h6>Imposto sobre a Propriedade de Veículos Automotores</h6>
          </div>

          <div className={styles.renavam}>
            <TextField
              label="Digite o N° RENAVAM *"
              variant="outlined"
              fullWidth
              value={renavam}
              onChange={(e) => {
                setRenavam(e.target.value);
                setError(false);
                setErrorMessage("");
              }}
              error={error}
              helperText={
                error
                  ? errorMessage
                  : "O n° RENAVAM encontra-se no canto superior esquerdo do documento do veículo."
              }
            />
          </div>

          <Button
            variant="contained"
            className={styles.btnPrimary}
            onClick={handleConsultar}
            disabled={loading || renavam.length < 9}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Consultar"
            )}
          </Button>

          <p>
            Confira a escala de vencimentos do <b>calendário IPVA 2025</b>
          </p>

          <div className={styles.info}>
            <InfoOutlinedIcon />
            Seu veículo foi roubado/furtado? Seu IPVA poderá ser restituído.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
