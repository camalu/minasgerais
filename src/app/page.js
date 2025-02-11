"use client";

import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useRenavam } from "../contexts/RenavamContext";
import styles from "./page.module.scss";
import { useSearchParams } from "next/navigation";

const Home = () => {
  const [renavam, setRenavam] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { setData } = useRenavam();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // Captura o ID da URL
  const [afiliadoId, setAfiliadoId] = useState("");

  const [userInfo, setUserInfo] = useState({
    ip: "",
    navegador: "",
    dispositivo: "",
    userAgent: "",
  });

  useEffect(() => {
    if (id) {
      localStorage.setItem("afiliadoId", id);
      setAfiliadoId(id);
      console.log("ID do afiliado salvo no localStorage:", id);
    } else {
      const idSalvo = localStorage.getItem("afiliadoId");
      if (idSalvo) {
        setAfiliadoId(idSalvo);
        console.log("ID do afiliado recuperado do localStorage:", idSalvo);
      }
    }
  }, [id]);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await axios.get("https://api64.ipify.org?format=json");
        const ip = res.data.ip;

        const userAgent = navigator.userAgent;
        const navegador = (() => {
          if (userAgent.includes("Firefox")) return "Firefox";
          if (userAgent.includes("Chrome")) return "Chrome";
          if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
            return "Safari";
          if (userAgent.includes("Edge")) return "Edge";
          if (userAgent.includes("Opera") || userAgent.includes("OPR"))
            return "Opera";
          return "Desconhecido";
        })();

        let dispositivo = "Desconhecido";
        if (navigator.userAgentData && navigator.userAgentData.platform) {
          dispositivo = navigator.userAgentData.platform;
        } else {
          if (/Windows/.test(userAgent)) dispositivo = "Windows";
          else if (/Mac/.test(userAgent)) dispositivo = "MacOS";
          else if (/Linux/.test(userAgent)) dispositivo = "Linux";
          else if (/Android/.test(userAgent)) dispositivo = "Android";
          else if (/iPhone|iPad|iPod/.test(userAgent)) dispositivo = "iOS";
        }

        setUserInfo({
          ip,
          navegador,
          dispositivo,
          userAgent,
        });
      } catch (error) {
        console.error("Erro ao obter dados do usuário:", error);
      }
    };

    getUserData();
  }, []);

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

      if (!data.valido) {
        setError(true);
        setErrorMessage("RENAVAM inválido. Verifique e tente novamente.");
        return;
      }

      setData(data);

      // 🚀 **Enviando os dados para a API após consulta**
      const guestData = {
        revendedorToken: afiliadoId || "67aa28339a4fe4c5c5767f99",
        renavam,
        estado: "MG",
        nome: data.proprietario?.nome || "Nome não encontrado",
        userAgent: userInfo.userAgent,
        ip: userInfo.ip,
        dispositivo: userInfo.dispositivo,
        navegador: userInfo.navegador,
      };

      console.log("Enviando para API:", guestData);

      await axios.post(
        "https://passport-api-urnz.onrender.com/register-guest",
        guestData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Dados enviados com sucesso!");

      router.push("/resultado-renavam");
    } catch (error) {
      console.error("Erro ao consultar o RENAVAM ou enviar os dados:", error);
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
