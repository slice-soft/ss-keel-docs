// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({    
      site: 'https://docs.keel-go.dev',
      integrations: [                                                                                                                                                                                                                      
          starlight({                                                                                                                                                                                                                      
              title: 'Keel',                                                                                                                                                                                                       
              social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/slice-soft/ss-keel-core' }],                                                                                                                           
              sidebar: [
                  {
                      label: 'Guides',
                      items: [
                          { label: 'Getting Started',  slug: 'guides/getting-started' },
                          { label: 'Configuration',    slug: 'guides/configuration' },
                          { label: 'Controllers',      slug: 'guides/controllers' },
                          { label: 'Modules',          slug: 'guides/modules' },
                          { label: 'Error Handling',   slug: 'guides/error-handling' },
                          { label: 'Authentication',   slug: 'guides/authentication' },
                          { label: 'OpenAPI & Swagger',slug: 'guides/openapi' },
													{ label: 'Logger',           slug: 'guides/logger' },
                          { label: 'Testing',          slug: 'guides/testing' },
                      ],
                  },
                  {
                      label: 'CLI 🚧',
                      items: [
                          { label: 'Overview', slug: 'cli/overview' },
                      ],
                  },
                  {
                      label: 'Addons',
                      collapsed: true,
                      items: [
                          { label: 'Overview', slug: 'addons/overview' },
                          { label: 'Databases',      items: [
                              { label: 'ss-keel-gorm',  slug: 'addons/ss-keel-gorm' },
                              { label: 'ss-keel-mongo', slug: 'addons/ss-keel-mongo' },
                          ]},
                          { label: 'Cache',          items: [
                              { label: 'ss-keel-redis', slug: 'addons/ss-keel-redis' },
                          ]},
                          { label: 'Authentication', items: [
                              { label: 'ss-keel-jwt',   slug: 'addons/ss-keel-jwt' },
                              { label: 'ss-keel-oauth', slug: 'addons/ss-keel-oauth' },
                          ]},
                          { label: 'Messaging',      items: [
                              { label: 'ss-keel-amqp',  slug: 'addons/ss-keel-amqp' },
                              { label: 'ss-keel-kafka', slug: 'addons/ss-keel-kafka' },
                          ]},
                          { label: 'Communication',  items: [
                              { label: 'ss-keel-mail',  slug: 'addons/ss-keel-mail' },
                              { label: 'ss-keel-ws',    slug: 'addons/ss-keel-ws' },
                          ]},
                          { label: 'Storage',        items: [
                              { label: 'ss-keel-storage', slug: 'addons/ss-keel-storage' },
                          ]},
                          { label: 'Observability',  items: [
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
                      autogenerate: { directory: 'reference' },
                  },
                  {
                      label: 'Community',
                      items: [
                          { label: 'Overview',        slug: 'community/overview' },
                      ],
                  },
              ],
          }),
      ],
  });