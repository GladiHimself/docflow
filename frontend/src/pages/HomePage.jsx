import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';

// HomePage simply combines FileUpload + FileList
function HomePage() {
  return (
    <div style={styles.container}>
      <h2>Dashboard</h2>
      <FileUpload />  {/* upload form on top */}
      <FileList />    {/* file list below */}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '0 1rem',
  }
};

export default HomePage;