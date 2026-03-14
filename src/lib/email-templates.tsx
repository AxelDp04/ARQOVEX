import * as React from 'react';
import {
    Body,
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
} from '@react-email/components';

const main = {
    backgroundColor: '#0A0F1A',
    fontFamily: 'Outfit, Arial, sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '40px 20px',
    maxWidth: '600px',
    backgroundColor: '#0D1424',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
};

const logo = {
    margin: '0 auto',
    marginBottom: '20px',
};

const badge = {
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    color: '#0066FF',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    display: 'inline-block',
    textAlign: 'center' as const,
    margin: '0 auto 10px',
};

const h1 = {
    color: '#FFFFFF',
    fontSize: '28px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '20px 0',
};

const text = {
    color: '#9CA3AF',
    fontSize: '16px',
    lineHeight: '26px',
    marginBottom: '20px',
};

const button = {
    backgroundColor: '#0066FF',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '14px 28px',
    margin: '30px auto',
    width: 'fit-content',
    boxShadow: '0 4px 20px rgba(0, 102, 255, 0.3)',
};

const hr = {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    margin: '40px 0 20px',
};

const footer = {
    color: '#4B5563',
    fontSize: '12px',
    textAlign: 'center' as const,
};

const propertyImage = {
    borderRadius: '12px',
    width: '100%',
    display: 'block',
    marginBottom: '20px',
};

const priceText = {
    color: '#0066FF',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 10px',
};

export const WelcomeEmailTemplate = ({ email }: { email: string }) => (
    <Html>
        <Head />
        <Preview>Bienvenido a la comunidad ARQOVEX</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={{ textAlign: 'center' }}>
                    <Img
                        src="https://arqovex.vercel.app/Logo.png"
                        width="60"
                        height="60"
                        alt="ARQOVEX"
                        style={logo}
                    />
                    <Text style={badge}>Comunidad Exclusiva</Text>
                    <Heading style={h1}>¡Bienvenido a ARQOVEX!</Heading>
                </Section>
                
                <Text style={text}>
                    Hola, <strong>{email}</strong>. Es un placer tenerte con nosotros.
                </Text>
                
                <Text style={text}>
                    Has dado el primer paso para estar a la vanguardia del mercado inmobiliario y arquitectónico en República Dominicana. Muy pronto recibirás:
                </Text>
                
                <Section style={{ paddingLeft: '20px', marginBottom: '30px' }}>
                    <Text style={{ ...text, marginBottom: '8px' }}>• Planos arquitectónicos de tendencia.</Text>
                    <Text style={{ ...text, marginBottom: '8px' }}>• Oportunidades exclusivas de inversión.</Text>
                    <Text style={{ ...text, marginBottom: '8px' }}>• Consejos de diseño moderno.</Text>
                </Section>

                <Section style={{ textAlign: 'center' }}>
                    <Link href="https://arqovex.vercel.app/catalogo" style={button}>
                        Explorar Catálogo
                    </Link>
                </Section>

                <Hr style={hr} />
                <Text style={footer}>
                    © 2026 ARQOVEX RD. Todos los derechos reservados.<br />
                    Santo Domingo, República Dominicana.
                </Text>
            </Container>
        </Body>
    </Html>
);

export const PropertyNotificationEmailTemplate = ({
    titulo,
    precio,
    imagen_url,
    tipo
}: {
    titulo: string;
    precio: number;
    imagen_url: string;
    tipo: string;
}) => (
    <Html>
        <Head />
        <Preview>Nueva Oportunidad Inmobiliaria: {titulo}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={{ textAlign: 'center' }}>
                    <Img
                        src="https://arqovex.vercel.app/Logo.png"
                        width="60"
                        height="60"
                        alt="ARQOVEX"
                        style={logo}
                    />
                    <Text style={badge}>Nueva Oportunidad</Text>
                    <Heading style={h1}>¡Nueva Propiedad Publicada!</Heading>
                </Section>

                {imagen_url && (
                    <Img
                        src={imagen_url}
                        alt={titulo}
                        style={propertyImage}
                    />
                )}

                <Section style={{ padding: '0 10px' }}>
                    <Heading as="h2" style={{ ...h1, fontSize: '22px', textAlign: 'left', margin: '0 0 10px' }}>
                        {titulo}
                    </Heading>
                    <Text style={priceText}>
                        US$ {precio.toLocaleString()}
                    </Text>
                    <Text style={text}>
                        Acabamos de publicar un nuevo <strong>{tipo}</strong> que podría interesarte. Haz clic en el botón de abajo para ver todos los detalles técnicos, planos y galería completa.
                    </Text>
                </Section>

                <Section style={{ textAlign: 'center' }}>
                    <Link href="https://arqovex.vercel.app/catalogo" style={button}>
                        Ver Nueva Propiedad
                    </Link>
                </Section>

                <Hr style={hr} />
                <Text style={footer}>
                    Recibes este correo porque estás suscrito a nuestra newsletter.<br />
                    © 2026 ARQOVEX RD. Todos los derechos reservados.
                </Text>
            </Container>
        </Body>
    </Html>
);
export const ProyectoNotificationEmailTemplate = ({
    nombre,
    email,
    telefono,
    tipo_servicio,
    mensaje
}: {
    nombre: string;
    email: string;
    telefono: string;
    tipo_servicio: string;
    mensaje: string;
}) => (
    <Html>
        <Head />
        <Preview>Nueva Solicitud de Proyecto: {nombre}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={{ textAlign: 'center' }}>
                    <Img
                        src="https://arqovex.vercel.app/Logo.png"
                        width="60"
                        height="60"
                        alt="ARQOVEX"
                        style={logo}
                    />
                    <Text style={badge}>Nueva Solicitud de Proyecto</Text>
                    <Heading style={h1}>🏠 Consulta Arquitectónica</Heading>
                </Section>

                <Section style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <Text style={{ ...text, marginBottom: '10px', color: '#FFFFFF' }}><strong>Detalles del Cliente:</strong></Text>
                    <Text style={{ ...text, marginBottom: '5px' }}>• Nombre: {nombre}</Text>
                    <Text style={{ ...text, marginBottom: '5px' }}>• Email: {email}</Text>
                    <Text style={{ ...text, marginBottom: '5px' }}>• Teléfono: {telefono}</Text>
                    <Text style={{ ...text, marginBottom: '5px' }}>• Tipo de Servicio: {tipo_servicio}</Text>
                    
                    <Hr style={{ ...hr, margin: '20px 0' }} />
                    
                    <Text style={{ ...text, marginBottom: '10px', color: '#FFFFFF' }}><strong>Mensaje del Proyecto:</strong></Text>
                    <Text style={text}>{mensaje}</Text>
                </Section>

                <Section style={{ textAlign: 'center', marginTop: '30px' }}>
                    <Text style={{ ...text, fontSize: '14px', textAlign: 'center' }}>
                        <strong>Acción Inmediata Requerida:</strong><br />
                        Contactar al cliente en menos de 24 horas para convertir esta consulta en un proyecto.
                    </Text>
                </Section>

                <Hr style={hr} />
                <Text style={footer}>
                    ARQOVEX Proyectos System<br />
                    © 2026 ARQOVEX RD. Todos los derechos reservados.<br />
                    Santo Domingo, República Dominicana.
                </Text>
            </Container>
        </Body>
    </Html>
);

export const CitaNotificationEmailTemplate = ({
    nombre,
    email,
    telefono,
    fecha,
    mensaje,
    url_propiedad
}: {
    nombre: string;
    email: string;
    telefono: string;
    fecha: string;
    mensaje: string;
    url_propiedad: string;
}) => (
    <Html>
        <Head />
        <Preview>Nueva Solicitud de Cita: {nombre}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={{ textAlign: 'center' }}>
                    <Img
                        src="https://arqovex.vercel.app/Logo.png"
                        width="60"
                        height="60"
                        alt="ARQOVEX"
                        style={logo}
                    />
                    <Text style={badge}>Nueva Cita Agendada</Text>
                    <Heading style={h1}>Solicitud de Visita</Heading>
                </Section>

                <Section style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <Text style={{ ...text, marginBottom: '10px', color: '#FFFFFF' }}><strong>Detalles del Cliente:</strong></Text>
                    <Text style={{ ...text, marginBottom: '5px' }}>• Nombre: {nombre}</Text>
                    <Text style={{ ...text, marginBottom: '5px' }}>• Email: {email}</Text>
                    <Text style={{ ...text, marginBottom: '5px' }}>• Teléfono: {telefono}</Text>
                    <Text style={{ ...text, marginBottom: '5px' }}>• Fecha solicitada: {new Date(fecha).toLocaleDateString()}</Text>
                    
                    <Hr style={{ ...hr, margin: '20px 0' }} />
                    
                    <Text style={{ ...text, marginBottom: '10px', color: '#FFFFFF' }}><strong>Mensaje:</strong></Text>
                    <Text style={text}>{mensaje || 'Sin mensaje adicional.'}</Text>
                </Section>

                <Section style={{ textAlign: 'center' }}>
                    <Link href={url_propiedad} style={button}>
                        Ver Propiedad en la Web
                    </Link>
                </Section>

                <Hr style={hr} />
                <Text style={footer}>
                    ARQOVEX Leads System<br />
                    © 2026 ARQOVEX RD.
                </Text>
            </Container>
        </Body>
    </Html>
);
