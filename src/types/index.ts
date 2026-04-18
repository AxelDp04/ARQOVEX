// Database types for Supabase

export interface Plano {
    id: string
    titulo: string
    descripcion: string
    precio: number
    precio_original?: number
    metros_cuadrados: number
    habitaciones: number
    banos: number
    pisos: number

    // Nuevas Inmobiliaria
    ubicacion?: string
    tipo_propiedad?: string
    modalidad?: string
    parqueos?: number
    metros_frente?: number
    metros_fondo?: number

    categoria_id: string
    imagen_url: string
    url_archivo?: string
    imagenes?: string[]
    estilo: string
    autor_nombre?: string
    etiquetas?: string[]
    destacado: boolean
    disponible: boolean
    created_at: string
    categoria?: Categoria
    galeria?: { imagen_url: string }[]
    estado_proyecto?: 'En Planos' | 'En Construcción' | 'Listo para entrega'
    rating_avg?: number
    
    // Marketplace
    vendedor_id?: string
    estado_revision?: 'en_revision' | 'publicado' | 'rechazado'
    seccion?: 'planos' | 'inmobiliaria'
    video_url?: string
    enlace_mapa?: string
    iframe_mapa?: string
    total_vistas?: number
}

export interface Categoria {
    id: string
    nombre: string
    descripcion?: string
    icono?: string
    slug: string
}

export interface Perfil {
    id: string
    user_id: string
    nombre_completo: string
    avatar_url?: string
    telefono?: string
    created_at: string
    es_admin?: boolean
    role?: 'admin' | 'socio' | 'usuario'
    
    // Marketplace
    es_socio?: boolean
    bio?: string
    social_links?: {
        instagram?: string
        facebook?: string
        linkedin?: string
    }
    telefono_profesional?: string;
    
    // Payouts
    metodo_pago?: 'paypal' | 'transferencia_local';
    paypal_email?: string;
    banco_nombre?: string;
    banco_numero_cuenta?: string;
    cedula_identidad?: string;
    categoria_socio?: 'arquitectura' | 'inmobiliaria' | 'mixto';
}

export interface Favorito {
    id: string
    user_id: string
    plano_id: string
    created_at: string
    plano?: Plano
}

export interface Adquisicion {
    id: string
    user_id: string
    plano_id: string
    precio_pagado: number
    estado: 'pendiente' | 'completado' | 'cancelado'
    created_at: string
    plano?: Plano
}

export interface ContactoForm {
    nombre: string
    email: string
    telefono?: string
    mensaje: string
    tipo_servicio: string
}

export interface Resena {
    id: string
    usuario_id: string
    plano_id: string
    estrellas: number
    comentario: string
    aprobado: boolean
    respuesta_admin?: string
    created_at: string
    usuario?: {
        nombre_completo: string
        avatar_url?: string
        email?: string
        telefono?: string
    }
    plano?: {
        titulo: string
    }
}

export interface SolicitudSocio {
    id: string
    nombre_completo: string
    cedula: string
    telefono: string
    tipo_propiedad: string
    ubicacion: string
    precio: number
    habitaciones?: number
    banos?: number
    parqueos?: number
    metros_cuadrados?: number
    descripcion?: string
    fotos_urls?: string[]
    estado: 'pendiente' | 'contactado' | 'descartado'
    created_at: string
}

export interface SolicitudVendedor {
    id: string
    usuario_id: string
    nombre_completo: string
    telefono: string
    bio?: string
    social_links?: {
        instagram?: string
        facebook?: string
        linkedin?: string
    }
    estado: 'pendiente' | 'aprobado' | 'rechazado' | 'eliminado'
    categoria_socio?: 'arquitectura' | 'inmobiliaria' | 'mixto'
    created_at: string
}

export interface Cita {
    id: string
    nombre_cliente: string
    email_cliente: string
    telefono_cliente: string
    fecha_propuesta: string
    mensaje: string
    url_propiedad: string
    created_at: string
}

export interface Payout {
    id: string
    venta_id: string
    vendedor_id: string
    monto_payout: number
    estado: 'pendiente' | 'procesando' | 'completado' | 'error'
    metodo_usado: {
        metodo: 'paypal' | 'transferencia_local'
        paypal?: string
        banco?: string
        cuenta?: string
        cedula?: string
    }
    created_at: string
    vendedor?: Perfil
    venta?: {
        id: string
        plano_id: string
        monto_usd: number
        created_at: string
        paypal_order_id?: string
        usuario?: {
            nombre_completo: string
            email: string
            telefono?: string
        }
        plano: {
            titulo: string
            seccion?: string
            tipo_propiedad?: string
            metros_cuadrados?: number
            habitaciones?: number
            banos?: number
            parqueos?: number
        }
    }
    comprobante_url?: string
    notas_admin?: string
    fecha_pago_realizada?: string
}
