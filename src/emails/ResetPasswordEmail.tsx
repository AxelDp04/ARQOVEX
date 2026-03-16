import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  userFirstname?: string;
  resetPasswordLink?: string;
}

import { LOGO_FULL_URL } from "@/lib/constants";

const baseUrl = "https://arqovex.vercel.app";

export const ResetPasswordEmail = ({
  userFirstname = "Usuario",
  resetPasswordLink = "https://arqovex.vercel.app/auth/reset-password",
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Restablece tu contraseña de ARQOVEX</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Link href={baseUrl}>
             <Img
               src={LOGO_FULL_URL}
               width="60"
               height="60"
               alt="ARQOVEX"
               style={logo}
             />
          </Link>
          <Text style={brandName}>
            ARQOVEX
          </Text>
        </Section>
        <Heading style={h1}>Seguridad de tu cuenta</Heading>
        <Text style={text}>Hola {userFirstname},</Text>
        <Text style={text}>
          Haz clic en el botón de abajo para crear una nueva contraseña segura y seguir explorando el futuro de la arquitectura dominicana.
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href={resetPasswordLink}>
            Restablecer Contraseña
          </Button>
        </Section>
        <Text style={text}>
          Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
        </Text>
        <Hr style={hr} />
        <Section style={footer}>
          <Text style={footerText}>
            © 2026 ARQOVEX • Arquitectura y Bienes Raíces de Lujo
          </Text>
          <Link href={baseUrl} style={link}>
            www.arqovex.vercel.app
          </Link>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default ResetPasswordEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
  backgroundColor: "#ffffff",
};

const logoSection = {
  textAlign: "center" as const,
  padding: "20px 0",
};

const logo = {
  margin: "0 auto",
  display: "block",
};

const brandName = {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#000000",
    letterSpacing: "1px",
    marginTop: "10px",
    textAlign: "center" as const,
};

const h1 = {
  color: "#000000",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const text = {
  color: "#333333",
  fontSize: "16px",
  lineHeight: "26px",
  textAlign: "left" as const,
};

const btnContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "16px 24px",
};

const hr = {
  borderColor: "#eeeeee",
  margin: "40px 0",
};

const footer = {
    textAlign: "center" as const,
};

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "24px",
};

const link = {
    color: "#000000",
    fontSize: "12px",
    textDecoration: "underline",
};
