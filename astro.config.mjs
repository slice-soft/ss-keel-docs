// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
    site: 'https://docs.keel-go.dev',
    integrations: [
        starlight({
            title: 'Keel',
            logo: {
                src: './src/assets/keel-logo.svg',
                replacesTitle: false,
            },
            favicon: '/favicon.svg',
            customCss: ['./src/styles/custom.css'],
            defaultLocale: 'en',
            locales: {
                en: { label: 'English'},
                es: { label: 'Español', lang: 'es'},
            },
            head: [
                {
                    tag: 'link',
                    attrs: {
                        rel: 'stylesheet',
                        href: 'https://cdn.slicesoft.dev/design-system/latest/css/_variables.css',
                    },
                },
                {
                    tag: 'link',
                    attrs: {
                        rel: 'preconnect',
                        href: 'https://fonts.googleapis.com',
                    },
                },
                {
                    tag: 'link',
                    attrs: {
                        rel: 'preconnect',
                        href: 'https://fonts.gstatic.com',
                        crossorigin: 'anonymous',
                    },
                },
                {
                    tag: 'link',
                    attrs: {
                        rel: 'stylesheet',
                        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
                    },
                },
            ],
            social: [
                { icon: 'github', label: 'GitHub', href: 'https://github.com/slice-soft/ss-keel-core' },
            ],
            editLink: {
                baseUrl: 'https://github.com/slice-soft/ss-keel-docs/edit/main/',
            },
            lastUpdated: true,
            sidebar: [
                {
                    label: 'Guías',
                    items: [
                        { label: 'Primeros Pasos',    slug: 'guides/getting-started' },
                        { label: 'Configuración',     slug: 'guides/configuration' },
                        { label: 'Controladores',     slug: 'guides/controllers' },
                        { label: 'Módulos',           slug: 'guides/modules' },
                        { label: 'Manejo de Errores', slug: 'guides/error-handling' },
                        { label: 'Autenticación',     slug: 'guides/authentication' },
                        { label: 'OpenAPI y Swagger', slug: 'guides/openapi' },
                        { label: 'Registro (Logger)', slug: 'guides/logger' },
                        { label: 'Pruebas',           slug: 'guides/testing' },
                    ],
                },
                {
                    label: 'CLI',
                    items: [
                        { label: 'Visión general', slug: 'cli/overview' },
                        { label: 'Instalación', slug: 'cli/installation' },
                        { label: 'Inicio Rápido', slug: 'cli/quickstart' },
                        { label: 'Comando new', slug: 'cli/new' },
                        { label: 'Comando init', slug: 'cli/init' },
                        { label: 'Comando generate', slug: 'cli/generate' },
                        { label: 'Comando run', slug: 'cli/run' },
                        { label: 'Autocompletado', slug: 'cli/completion' },
                        { label: 'Resolución de problemas', slug: 'cli/troubleshooting' },
                    ],
                },
                {
                    label: 'Complementos',
                    collapsed: true,
                    items: [
                        { label: 'Resumen', slug: 'addons/overview' },
                        { label: 'Bases de datos', items: [
                            { label: 'ss-keel-gorm',  slug: 'addons/ss-keel-gorm' },
                            { label: 'ss-keel-mongo', slug: 'addons/ss-keel-mongo' },
                        ]},
                        { label: 'Cache',           items: [
                            { label: 'ss-keel-redis', slug: 'addons/ss-keel-redis' },
                        ]},
                        { label: 'Autenticación',   items: [
                            { label: 'ss-keel-jwt',   slug: 'addons/ss-keel-jwt' },
                            { label: 'ss-keel-oauth', slug: 'addons/ss-keel-oauth' },
                        ]},
                        { label: 'Mensajería',      items: [
                            { label: 'ss-keel-amqp',  slug: 'addons/ss-keel-amqp' },
                            { label: 'ss-keel-kafka', slug: 'addons/ss-keel-kafka' },
                        ]},
                        { label: 'Comunicación',    items: [
                            { label: 'ss-keel-mail', slug: 'addons/ss-keel-mail' },
                            { label: 'ss-keel-ws',   slug: 'addons/ss-keel-ws' },
                        ]},
                        { label: 'Almacenamiento',  items: [
                            { label: 'ss-keel-storage', slug: 'addons/ss-keel-storage' },
                        ]},
                        { label: 'Observabilidad',  items: [
                            { label: 'ss-keel-metrics', slug: 'addons/ss-keel-metrics' },
                            { label: 'ss-keel-tracing', slug: 'addons/ss-keel-tracing' },
                        ]},
                        { label: 'Jobs',            items: [
                            { label: 'ss-keel-cron', slug: 'addons/ss-keel-cron' },
                        ]},
                        { label: 'i18n',           items: [
                            { label: 'ss-keel-i18n', slug: 'addons/ss-keel-i18n' },
                        ]},
                    ],
                },
                {
                    label: 'Referencia',
                    autogenerate: { directory: 'reference' },
                },
                {
                    label: 'Comunidad',
                    items: [
                        { label: 'Resumen', slug: 'community/overview' },
                    ],
                },
            ],
        }),
    ],
});
