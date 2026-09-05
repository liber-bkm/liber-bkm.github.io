// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Docs site for liber. Local dev runs on 127.0.0.1:4321; production
// deploys to https://liber-bkm.github.io (user site, served from the
// domain root, so no `base` path is needed).
export default defineConfig({
  site: 'https://liber-bkm.github.io',
  server: {
    host: '127.0.0.1',
    port: 4321,
  },
  integrations: [
    starlight({
      title: 'liber',
      description:
        'Cross-platform, private, local CLI bookmark manager: plain-text HTML, JSON index, no database.',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/liber-bkm/liber' },
      ],
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Start',
          items: [{ label: 'Quickstart', slug: 'start/quickstart' }],
        },
        {
          label: 'Install',
          items: [
            { label: 'Linux', slug: 'install/linux' },
            { label: 'macOS', slug: 'install/macos' },
            { label: 'Windows', slug: 'install/windows' },
          ],
        },
        {
          label: 'Guide',
          items: [
            { label: 'Adding bookmarks', slug: 'guide/adding' },
            { label: 'Searching and opening', slug: 'guide/searching' },
            { label: 'Editing and deleting', slug: 'guide/editing' },
            { label: 'Attachments', slug: 'guide/attachments' },
            { label: 'Tags and folders', slug: 'guide/tags-folders' },
            { label: 'Importing', slug: 'guide/import' },
            { label: 'Automation', slug: 'guide/automation' },
            { label: 'Sync', slug: 'guide/sync' },
            { label: 'Profiles', slug: 'guide/profiles' },
            { label: 'Web UI', slug: 'guide/web-ui' },
            { label: 'Static site export', slug: 'guide/static-export' },
            { label: 'Shell completions', slug: 'guide/completions' },
          ],
        },
        {
          label: 'Configuration',
          items: [
            { label: 'Overview', slug: 'config' },
            { label: 'Directory layout', slug: 'config/layout' },
            { label: 'Reindexing', slug: 'config/reindex' },
          ],
        },
        {
          label: 'Concepts',
          items: [{ label: 'Design notes', slug: 'concepts/design-notes' }],
        },
        {
          label: 'Reference',
          items: [{ label: 'CLI reference', slug: 'reference/cli' }],
        },
        {
          label: 'Developer',
          items: [
            { label: 'Overview', slug: 'dev' },
            { label: 'Data model and reindexing', slug: 'dev/data-model' },
            { label: 'Ingest: dedupe and import', slug: 'dev/ingest' },
            { label: 'Mutations: taxonomy, history, batch', slug: 'dev/taxonomy' },
            { label: 'Search internals', slug: 'dev/search' },
            { label: 'Automation internals', slug: 'dev/automation' },
            { label: 'Attachments internals', slug: 'dev/attachments' },
            { label: 'Profiles and sync', slug: 'dev/profiles-sync' },
            { label: 'Web UI and export', slug: 'dev/webui' },
          ],
        },
      ],
    }),
  ],
});
