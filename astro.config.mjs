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
                        href: 'https://cdn.slicesoft.dev/design-system/ss-design-system-v1.0.3/css/_variables.css',
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
                            { label: 'ss-keel-gorm', items: [
                                { label: 'Home',          translations: { es: 'Inicio' },         slug: 'addons/ss-keel-gorm' },
                                { label: 'Overview',      translations: { es: 'Resumen' },        slug: 'addons/ss-keel-gorm/overview' },
                                { label: 'Installation',  translations: { es: 'Instalacion' },    slug: 'addons/ss-keel-gorm/installation' },
                                { label: 'Configuration', translations: { es: 'Configuracion' },  slug: 'addons/ss-keel-gorm/configuration' },
                                { label: 'Examples',      translations: { es: 'Ejemplos' },       slug: 'addons/ss-keel-gorm/examples' },
                            ]},
                            { label: 'ss-keel-mongo', items: [
                                { label: 'Home',          translations: { es: 'Inicio' },         slug: 'addons/ss-keel-mongo' },
                                { label: 'Overview',      translations: { es: 'Resumen' },        slug: 'addons/ss-keel-mongo/overview' },
                                { label: 'Installation',  translations: { es: 'Instalacion' },    slug: 'addons/ss-keel-mongo/installation' },
                                { label: 'Configuration', translations: { es: 'Configuracion' },  slug: 'addons/ss-keel-mongo/configuration' },
                                { label: 'Examples',      translations: { es: 'Ejemplos' },       slug: 'addons/ss-keel-mongo/examples' },
                            ]},
                        ]},
                        { label: 'Cache',          items: [
                            { label: 'ss-keel-redis', items: [
                                { label: 'Home',          translations: { es: 'Inicio' },         slug: 'addons/ss-keel-redis' },
                                { label: 'Overview',      translations: { es: 'Resumen' },        slug: 'addons/ss-keel-redis/overview' },
                                { label: 'Installation',  translations: { es: 'Instalacion' },    slug: 'addons/ss-keel-redis/installation' },
                                { label: 'Configuration', translations: { es: 'Configuracion' },  slug: 'addons/ss-keel-redis/configuration' },
                                { label: 'Examples',      translations: { es: 'Ejemplos' },       slug: 'addons/ss-keel-redis/examples' },
                            ]},
                        ]},
                        { label: 'Authentication', translations: { es: 'Autenticación' },  items: [
                            { label: 'ss-keel-jwt', items: [
                                { label: 'Home',          translations: { es: 'Inicio' },         slug: 'addons/ss-keel-jwt' },
                                { label: 'Overview',      translations: { es: 'Resumen' },        slug: 'addons/ss-keel-jwt/overview' },
                                { label: 'Installation',  translations: { es: 'Instalacion' },    slug: 'addons/ss-keel-jwt/installation' },
                                { label: 'Configuration', translations: { es: 'Configuracion' },  slug: 'addons/ss-keel-jwt/configuration' },
                                { label: 'Examples',      translations: { es: 'Ejemplos' },       slug: 'addons/ss-keel-jwt/examples' },
                            ]},
                            { label: 'ss-keel-oauth', items: [
                                { label: 'Home',          translations: { es: 'Inicio' },         slug: 'addons/ss-keel-oauth' },
                                { label: 'Overview',      translations: { es: 'Resumen' },        slug: 'addons/ss-keel-oauth/overview' },
                                { label: 'Installation',  translations: { es: 'Instalacion' },    slug: 'addons/ss-keel-oauth/installation' },
                                { label: 'Configuration', translations: { es: 'Configuracion' },  slug: 'addons/ss-keel-oauth/configuration' },
                                { label: 'Examples',      translations: { es: 'Ejemplos' },       slug: 'addons/ss-keel-oauth/examples' },
                            ]},
                        ]},
                        { label: 'Observability',   translations: { es: 'Observabilidad' }, items: [
                            { label: 'ss-keel-devpanel', items: [
                                { label: 'Home',          translations: { es: 'Inicio' },         slug: 'addons/ss-keel-devpanel' },
                                { label: 'Overview',      translations: { es: 'Resumen' },        slug: 'addons/ss-keel-devpanel/overview' },
                                { label: 'Installation',  translations: { es: 'Instalacion' },    slug: 'addons/ss-keel-devpanel/installation' },
                                { label: 'Configuration', translations: { es: 'Configuracion' },  slug: 'addons/ss-keel-devpanel/configuration' },
                                { label: 'Examples',      translations: { es: 'Ejemplos' },       slug: 'addons/ss-keel-devpanel/examples' },
                            ]},
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
