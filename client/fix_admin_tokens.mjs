import fs from 'fs';

let content = fs.readFileSync('src/views/AdminDashboard.jsx', 'utf8');

const replacements = [
  ['text-text-primary', 'text-primary'],
  ['text-text-secondary', 'text-secondary'],
  ['text-text-muted', 'text-on-surface-variant'],
  ['text-accent-neon', 'text-primary'],
  ['text-accent-danger', 'text-error'],
  ['text-brand-blue', 'text-primary'],
  ['text-brand-purple', 'text-secondary'],
  ['border-border-subtle/50', 'border-outline-variant/50'],
  ['border-border-subtle/20', 'border-outline-variant/20'],
  ['border-border-subtle', 'border-outline-variant'],
  ['border-border-strong', 'border-primary'],
  ['border-accent-neon/20', 'border-primary/20'],
  ['border-accent-danger/20', 'border-error/20'],
  ['border-brand-purple/20', 'border-primary/20'],
  ['bg-background-elevated', 'bg-surface-container-low'],
  ['bg-accent-neon/10', 'bg-primary/10'],
  ['bg-accent-neon/20', 'bg-primary/20'],
  ['bg-brand-purple/20', 'bg-primary/10'],
  ['bg-white/5', 'bg-surface-container-low'],
  ['bg-white/[0.01]', 'bg-surface-container-low/50'],
  ['hover:bg-accent-neon/20', 'hover:bg-primary/20'],
  ['hover:text-accent-danger/80', 'hover:text-error/80'],
  ['hover:text-brand-purple', 'hover:text-primary'],
  ['hover:bg-brand-purple', 'hover:bg-primary'],
  ['variant="primary-gradient"', 'variant="primary"'],
  ['bg-black/60', 'bg-black/40'],
  ['border-accent-neon', 'border-primary'],
  ['border-accent-danger', 'border-error'],
  ['accent-danger', 'error'],
];

for (const [from, to] of replacements) {
  content = content.replaceAll(from, to);
}

fs.writeFileSync('src/views/AdminDashboard.jsx', content, 'utf8');
console.log('AdminDashboard tokens updated.');
