import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { GET_ALL_FILES } from '../graphql/queries';

function FileList() {
  const { loading, error, data } = useQuery(GET_ALL_FILES);

  // useNavigate lets us programmatically go to another page
  const navigate = useNavigate();

  if (loading) return <p>Loading files...</p>;
  if (error) return <p style={{color: 'red'}}>Error: {error.message}</p>;

  return (
    <div>
      <h3>All Files ({data.getAllFiles.length})</h3>

      {data.getAllFiles.length === 0 ? (
        <p style={styles.empty}>No files yet. Upload one above!</p>
      ) : (
        <div style={styles.list}>
          {data.getAllFiles.map(file => (
            <div
              key={file.id}
              style={styles.card}
              // clicking the card navigates to detail page
              onClick={() => navigate(`/file/${file.id}`)}
            >
              <div style={styles.cardLeft}>
                <span style={styles.icon}>
                  {/* show different icon per file type */}
                  {file.fileType === 'CSV' ? '📊' :
                   file.fileType === 'PDF' ? '📄' : '🖼️'}
                </span>
                <div>
                  <p style={styles.fileName}>{file.fileName}</p>
                  <p style={styles.fileType}>{file.fileType}</p>
                </div>
              </div>
              <div style={styles.cardRight}>
                {/* status badge with color based on status */}
                <span style={{
                  ...styles.badge,
                  backgroundColor: getStatusColor(file.status)
                }}>
                  {file.status}
                </span>
                <p style={styles.date}>
                  {new Date(file.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Returns color based on status
function getStatusColor(status) {
  switch(status) {
    case 'UPLOADED':   return '#3498db';  // blue
    case 'PROCESSING': return '#f39c12';  // orange
    case 'COMPLETED':  return '#27ae60';  // green
    case 'FAILED':     return '#e74c3c';  // red
    default:           return '#95a5a6';  // grey
  }
}

const styles = {
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #ddd',
    cursor: 'pointer',         // shows hand cursor on hover
  },
  cardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  icon: { fontSize: '2rem' },
  fileName: { margin: 0, fontWeight: 'bold' },
  fileType: { margin: 0, color: '#666', fontSize: '0.85rem' },
  cardRight: { textAlign: 'right' },
  badge: {
    padding: '0.3rem 0.7rem',
    borderRadius: '12px',
    color: 'white',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  date: { margin: '0.3rem 0 0 0', fontSize: '0.8rem', color: '#666' },
  empty: { color: '#666', fontStyle: 'italic' },
};

export default FileList;