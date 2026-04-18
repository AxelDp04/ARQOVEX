/** @type {import('next').NextConfig} */
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://www.paypal.com https://*.paypal.com https://www.paypalobjects.com https://maps.googleapis.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googleapis.com;
    img-src 'self' blob: data: https://rdbdwvwmnozumwtxdmra.supabase.co https://*.supabase.co https://images.unsplash.com https://*.paypal.com https://*.paypalobjects.com https://maps.gstatic.com https://*.googleapis.com;
    font-src 'self' data: https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    frame-src 'self' https://www.paypal.com https://*.paypal.com https://www.sandbox.paypal.com https://www.google.com https://*.google.com;
    connect-src 'self' https://rdbdwvwmnozumwtxdmra.supabase.co wss://rdbdwvwmnozumwtxdmra.supabase.co https://*.supabase.co https://www.paypal.com https://*.paypal.com https://www.sandbox.paypal.com https://*.googleapis.com;
    media-src 'self' blob: data: https://rdbdwvwmnozumwtxdmra.supabase.co https://*.supabase.co;
`;

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "rdbdwvwmnozumwtxdmra.supabase.co",
                port: "",
                pathname: "/storage/v1/object/public/**",
            },
            {
                protocol: "https",
                hostname: "**.supabase.co",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: cspHeader.replace(/\n/g, ''),
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                ],
            },
            {
                source: '/_next/static/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/(.*)\\.(png|jpg|jpeg|gif|svg|webp)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/_supabase/:path*',
                destination: 'https://rdbdwvwmnozumwtxdmra.supabase.co/:path*',
            },
        ];
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
