import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';

const styles = {
  page: {
    minHeight: '100vh',
    padding: '0',
  },
  hero: {
    textAlign: 'center',
    padding: '2.5rem 1rem 1rem',
  },
  heroTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#1a1a2e',
    margin: '0 0 0.75rem 0',
    letterSpacing: '-1px',
  },
  heroSubtitle: {
    fontSize: '0.95rem',
    color: '#4b5563',
    maxWidth: '520px',
    margin: '0 auto 1rem',
    lineHeight: '1.7',
  },
  badges: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.6rem',
    flexWrap: 'wrap',
    marginBottom: '2rem',
  },
  badge: {
    padding: '0.3rem 0.8rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    fontSize: '0.78rem',
    color: '#374151',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    fontWeight: '500',
  },
  container: {
  maxWidth: '820px',
  margin: '0 auto',
  padding: '0 1rem 3rem',  /* smaller padding on mobile */
},
};

function HomePage() {
  return (
    <div style={styles.page}>
      {/* Hero section */}
      <div style={styles.hero}>
        <h2 style={styles.heroTitle}>Your Personal Cloud Storage</h2>
        <p style={styles.heroSubtitle}>
          Upload, store and manage all your important documents securely in one place.
          Create your own custom cloud storage — CSVs, PDFs and more — 
          accessible only to you, powered by AWS.
        </p>
        <div style={styles.badges}>
          <span style={styles.badge}>☁️ AWS S3 Storage</span>
          <span style={styles.badge}>⚡ Auto Processing</span>
          <span style={styles.badge}>🔒 Private & Secure</span>
          <span style={styles.badge}>📊 GraphQL API</span>
        </div>
      </div>

      {/* Main content */}
      <div style={styles.container}>
        <FileUpload />
        <FileList />
      </div>
    </div>
  );
}

export default HomePage;