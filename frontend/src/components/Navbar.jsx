import { Link } from 'react-router-dom';

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2.5rem',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e8edf3',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#1a1a2e',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '1.5rem',
    fontWeight: '800',
  },
  tagline: {
    fontSize: '0.75rem',
    color: '#6b7280',
    fontWeight: '400',
  }
};

function Navbar() {
  return (
    <nav style={styles.nav}>
      {/* Logo is now a link — clicking takes to home */}
      <Link to="/" style={styles.logo}>
        📁 DocFlow
      </Link>
      {/* Home link removed — logo serves as home */}
    </nav>
  );
}

export default Navbar;