// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Docs site for liber (Rust rewrite, liber-rs). Local dev runs on
// 127.0.0.1:4321; production deploys to https://liber-bkm.github.io
// (user site, served from the domain root, so no `base` path is needed).
export default defineConfig({
  site: 'https://liber-bkm.github.io',
  // Old Guide URLs (this revamp) and old Go-era config/concepts URLs keep
  // working through these redirects.
  redirects: {
    '/guide/adding/': '/cli/adding/',
    '/guide/searching/': '/cli/searching/',
    '/guide/editing/': '/cli/editing/',
    '/guide/attachments/': '/cli/attachments/',
    '/guide/tags-folders/': '/cli/tags-folders/',
    '/guide/import-export/': '/cli/import-export/',
    '/guide/automation/': '/cli/automation/',
    '/guide/sync/': '/cli/sync/',
    '/guide/profiles/': '/config/profiles/',
    '/guide/web-ui/': '/app/web-ui/',
    '/guide/desktop/': '/app/desktop/',
    '/guide/self-hosting/': '/config/self-hosting/',
    '/guide/backup-restore/': '/cli/backup-restore/',
    '/guide/discovery/': '/app/pairing/',
    '/guide/link-health/': '/cli/link-health/',
    '/guide/completions/': '/cli/completions/',
    '/guide/configuration/': '/config/overview/',
    '/guide/storage/': '/config/storage/',
    '/config/': '/config/overview/',
    '/config/layout/': '/config/storage/',
    '/config/reindex/': '/config/storage/',
    '/concepts/design-notes/': '/dev/',
  },
  server: {
    host: '127.0.0.1',
    port: 4321,
  },
  integrations: [
    starlight({
      title: 'liber',
      description:
        'A local first bookmark manager: CLI plus web UI plus desktop and mobile. Plain-text bookmark files with powerful search, tags and folders, offline archives, notes, and attachments.',
      logo: {
        src: './src/assets/logo.svg',
        alt: 'liber logo',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/liber-bkm/liber' },
      ],
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Start',
          items: [
            { label: 'Quickstart', slug: 'start/quickstart' },
            { label: 'Documentation index', slug: 'documentation' },
          ],
        },
        {
          label: 'Install',
          items: [
            { label: 'Linux', slug: 'install/linux' },
            { label: 'macOS', slug: 'install/macos' },
            { label: 'Windows', slug: 'install/windows' },
            { label: 'Android', slug: 'install/android' },
          ],
        },
        {
          label: 'CLI guide',
          items: [
            { label: 'Adding bookmarks', slug: 'cli/adding' },
            { label: 'Searching and opening', slug: 'cli/searching' },
            { label: 'Terminal UI', slug: 'cli/terminal-ui' },
            { label: 'Editing and deleting', slug: 'cli/editing' },
            { label: 'Attachments', slug: 'cli/attachments' },
            { label: 'Tags and folders', slug: 'cli/tags-folders' },
            { label: 'Importing and exporting', slug: 'cli/import-export' },
            { label: 'Automation', slug: 'cli/automation' },
            { label: 'Link health', slug: 'cli/link-health' },
            { label: 'Shell completions', slug: 'cli/completions' },
            { label: 'Syncing across devices', slug: 'cli/sync' },
            { label: 'Backup and restore', slug: 'cli/backup-restore' },
            { label: 'Serving the library', slug: 'cli/serving' },
          ],
        },
        {
          label: 'App guide',
          items: [
            { label: 'Web UI', slug: 'app/web-ui' },
            { label: 'Desktop app', slug: 'app/desktop' },
            { label: 'Android app', slug: 'app/android' },
            { label: 'Adding', slug: 'app/adding' },
            { label: 'Finding', slug: 'app/finding' },
            { label: 'Organizing', slug: 'app/organizing' },
            { label: 'Check center', slug: 'app/check-center' },
            { label: 'Library settings', slug: 'app/library-settings' },
            { label: 'Pairing', slug: 'app/pairing' },
          ],
        },
        {
          label: 'Configuration guide',
          items: [
            { label: 'Overview', slug: 'config/overview' },
            { label: 'Archive backends', slug: 'config/archive-backends' },
            { label: 'Storage layout', slug: 'config/storage' },
            { label: 'Profiles', slug: 'config/profiles' },
            { label: 'Self-hosting', slug: 'config/self-hosting' },
            { label: 'Backup and restore', slug: 'config/backup-restore' },
            { label: 'Troubleshooting', slug: 'config/troubleshooting' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'CLI reference', slug: 'reference/cli' },
            { label: 'API reference', slug: 'reference/api' },
            { label: 'Changelog', slug: 'reference/changelog' },
          ],
        },
        {
          label: 'Developer',
          items: [
            { label: 'Overview', slug: 'dev' },
            { label: 'Architecture', slug: 'dev/architecture' },
            { label: 'Building from source', slug: 'dev/building' },
            { label: 'Storage and reindexing', slug: 'dev/storage' },
            { label: 'Search internals', slug: 'dev/search' },
            { label: 'Sync internals', slug: 'dev/sync' },
            { label: 'Addressing and short IDs', slug: 'dev/addressing' },
            { label: 'Automation internals', slug: 'dev/automation' },
            { label: 'Archiver internals', slug: 'dev/archiver' },
            { label: 'Link check internals', slug: 'dev/check' },
            { label: 'Picker and interactive add', slug: 'dev/picker' },
            { label: 'Server and Tauri split', slug: 'dev/server-tauri' },
            { label: 'Settings and profiles', slug: 'dev/settings-profiles' },
            { label: 'Auth internals', slug: 'dev/auth' },
            { label: 'LAN discovery', slug: 'dev/discovery' },
            { label: 'Android internals', slug: 'dev/android' },
            { label: 'Windows packaging', slug: 'dev/windows' },
            { label: 'Portability and performance', slug: 'dev/portability' },
          ],
        },
      ],
    }),
  ],
});
