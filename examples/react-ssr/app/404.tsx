import { Head } from "../jsx/context";
import { Layout } from "./components/layout";

export default function NotFoundPage() {
  return (
    <Layout>
      <Head>
        <title>Page Not Found - Vino Todo</title>
        <meta name="description" content="The page you're looking for couldn't be found." />
      </Head>

      <div style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '4rem', margin: '0', color: '#000', fontWeight: '600' }}>404</h1>
        <h2 style={{ marginTop: '1rem', color: '#333', fontSize: '1.5rem', fontWeight: '500' }}>Page Not Found</h2>
        <p style={{ fontSize: '1rem', color: '#666', margin: '1.5rem 0 2rem 0', lineHeight: '1.6' }}>
          The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a 
            href="/" 
            style={{ 
              background: '#000', 
              color: '#fff', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '2px', 
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Back to Tasks
          </a>
          <a 
            href="/about" 
            style={{ 
              background: '#f0f0f0', 
              color: '#000', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '2px', 
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Learn More
          </a>
        </div>
      </div>
    </Layout>
  );
}
