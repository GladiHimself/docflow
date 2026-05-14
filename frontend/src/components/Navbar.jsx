import { Link } from 'react-router-dom';

// styles defined FIRST before the component uses them
const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#1a1a2e',
    color: 'white',
  },
  logo: {
    margin: 0,
    color: 'white',
  },
  links: {
    display: 'flex',
    gap: '1rem',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1rem',
  }
};

function Navbar() {
  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>📁 DocFlow</h2>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
      </div>
    </nav>
  );
}

export default Navbar;