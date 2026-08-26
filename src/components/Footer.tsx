const footerLink =
  "font-medium underline-offset-4 transition-colors duration-200 hover:text-primary hover:underline";

export function Footer() {
  return (
    <footer className="mt-20 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 border-t border-outline-variant/50 pt-8 pb-4 text-[13px] text-on-surface-variant">
      <span>© 2026 Chidc</span>
      <span aria-hidden className="text-outline-variant">·</span>
      <a href="https://github.com/ChidcGithub" target="_blank" rel="noopener noreferrer" className={footerLink}>
        GitHub
      </a>
      <span aria-hidden className="text-outline-variant">·</span>
      <a href="mailto:chidcout@outlook.com" className={footerLink}>
        Contact
      </a>
      <span aria-hidden className="text-outline-variant">·</span>
      <span>Built with Material 3 Expressive</span>
    </footer>
  );
}
