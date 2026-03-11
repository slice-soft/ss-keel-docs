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
                    label: 'Guides',
                    translations: { es: 'Guías' },
                    items: [
                        { label: 'Getting Started',   translations: { es: 'Primeros Pasos' },           slug: 'guides/getting-started' },
                        { label: 'Architecture',      translations: { es: 'Arquitectura' },             slug: 'guides/architecture' },
                        { label: 'Configuration',     translations: { es: 'Configuración' },            slug: 'guides/configuration' },
                        { label: 'Controllers',       translations: { es: 'Controladores' },            slug: 'guides/controllers' },
                        { label: 'Modules',           translations: { es: 'Módulos' },                  slug: 'guides/modules' },
                        { label: 'Persistence',       translations: { es: 'Persistencia' },             slug: 'guides/persistence' },
                        { label: 'Error Handling',    translations: { es: 'Manejo de Errores' },        slug: 'guides/error-handling' },
                        { label: 'Authentication',    translations: { es: 'Autenticación' },            slug: 'guides/authentication' },
                        { label: 'OpenAPI & Swagger', translations: { es: 'OpenAPI y Swagger' },        slug: 'guides/openapi' },
                        { label: 'Logger',            translations: { es: 'Registro (Logger)' },        slug: 'guides/logger' },
                        { label: 'Testing',           translations: { es: 'Pruebas' },                  slug: 'guides/testing' },
                    ],
                },
                {
                    label: 'CLI',
                    items: [
                        { label: 'Overview',          translations: { es: 'Visión general' },           slug: 'cli/overview' },
                        { label: 'Installation',      translations: { es: 'Instalación' },              slug: 'cli/installation' },
                        { label: 'Quick Start',       translations: { es: 'Inicio Rápido' },            slug: 'cli/quickstart' },
                        { label: 'new command',       translations: { es: 'Comando new' },              slug: 'cli/new' },
                        { label: 'init command',      translations: { es: 'Comando init' },             slug: 'cli/init' },
                        { label: 'generate command',  translations: { es: 'Comando generate' },         slug: 'cli/generate' },
                        { label: 'add command',       translations: { es: 'Comando add' },              slug: 'cli/add' },
                        { label: 'run command',       translations: { es: 'Comando run' },              slug: 'cli/run' },
                        { label: 'Shell Completion',  translations: { es: 'Autocompletado' },           slug: 'cli/completion' },
                        { label: 'Troubleshooting',   translations: { es: 'Resolución de problemas' },  slug: 'cli/troubleshooting' },
                    ],
                },
                {
                    label: 'Addons',
                    collapsed: true,
                    items: [
                        { label: 'Overview',       translations: { es: 'Resumen' },        slug: 'addons/overview' },
                        { label: 'Ecosystem',      translations: { es: 'Ecosistema' },     slug: 'addons/ecosystem' },
                        { label: 'Databases',      translations: { es: 'Bases de datos' }, items: [
                            { label: 'ss-keel-gorm',  slug: 'addons/ss-keel-gorm' },
                            { label: 'ss-keel-mongo', slug: 'addons/ss-keel-mongo' },
                        ]},
                        { label: 'Cache',          items: [
                            { label: 'ss-keel-redis', slug: 'addons/ss-keel-redis' },
                        ]},
                        { label: 'Authentication', translations: { es: 'Autenticación' },  items: [
                            { label: 'ss-keel-jwt',   slug: 'addons/ss-keel-jwt' },
                            { label: 'ss-keel-oauth', slug: 'addons/ss-keel-oauth' },
                        ]},
                        { label: 'Messaging',      translations: { es: 'Mensajería' },     items: [
                            { label: 'ss-keel-amqp',  slug: 'addons/ss-keel-amqp' },
                            { label: 'ss-keel-kafka', slug: 'addons/ss-keel-kafka' },
                        ]},
                        { label: 'Communication',  translations: { es: 'Comunicación' },   items: [
                            { label: 'ss-keel-mail', slug: 'addons/ss-keel-mail' },
                            { label: 'ss-keel-ws',   slug: 'addons/ss-keel-ws' },
                        ]},
                        { label: 'Storage',        translations: { es: 'Almacenamiento' }, items: [
                            { label: 'ss-keel-storage', slug: 'addons/ss-keel-storage' },
                        ]},
                        { label: 'Observability',  translations: { es: 'Observabilidad' }, items: [
                            { label: 'ss-keel-metrics', slug: 'addons/ss-keel-metrics' },
                            { label: 'ss-keel-tracing', slug: 'addons/ss-keel-tracing' },
                        ]},
                        { label: 'Jobs',           items: [
                            { label: 'ss-keel-cron', slug: 'addons/ss-keel-cron' },
                        ]},
                        { label: 'i18n',           items: [
                            { label: 'ss-keel-i18n', slug: 'addons/ss-keel-i18n' },
                        ]},
                    ],
                },
                {
                    label: 'Reference',
                    translations: { es: 'Referencia' },
                    autogenerate: { directory: 'reference' },
                },
                {
                    label: 'Community',
                    translations: { es: 'Comunidad' },
                    items: [
                        { label: 'Overview', translations: { es: 'Resumen' }, slug: 'community/overview' },
                    ],
                },
            ],
        }),
    ],
});
