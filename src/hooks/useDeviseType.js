import { useMediaQuery, useTheme } from "@mui/material";

const useDeviceType = () => {
  const theme = useTheme();

  // Verifique se a tela é mobile (ou seja, se a largura é menor que o breakpoint 'sm' do tema)
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Retorne o tipo de dispositivo
  return {
    isMobile,
    isDesktop: !isMobile, // se não for mobile, é desktop
  };
};

export default useDeviceType;
