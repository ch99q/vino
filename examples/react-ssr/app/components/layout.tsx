import { ReactNode } from 'react';
import { Head } from '../../jsx/context';

import styles from "../style.css?url";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div>
      <Head>
        <title>Vino Todo - Task Management Made Simple</title>
        <meta name="description" content="Organize your tasks efficiently with Vino Todo. Create, manage, and track your productivity." />
        <link as="style" rel="preload" href={styles} crossOrigin="anonymous" />
        <link rel="stylesheet" href={styles} crossOrigin="anonymous" />
      </Head>
      <div className="logo-header">
        <a href="/">
          <h1>Vino Todo</h1>
        </a>
        <p className="tagline">A simple task management app</p>
      </div>
      <main className="container">
        {children}
      </main>
      <footer className="footer">
        <div className="footer-content">
          <p>Built with <strong>Vino Plugin</strong> • Modern SSR with React • <a href="https://github.com/ch99q/vino" target="_blank">View on GitHub</a></p>
        </div>
      </footer>
    </div>
  );
}