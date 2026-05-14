import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_FILE } from '../graphql/queries';
import { UPDATE_FILE_STATUS, DELETE_FILE } from '../graphql/mutations';
import { GET_ALL_FILES } from '../graphql/queries';

function FileDetailPage() {
  // useParams extracts the id from URL (/file/1 → id = "1")
  const { id } = useParams();
  const navigate = useNavigate();

  const { loading, error, data } = useQuery(GET_FILE, {
    variables: { id }  // passes id to the query
  });

  const [updateStatus] = useMutation(UPDATE_FILE_STATUS, {
    refetchQueries: [{ query: GET_FILE, variables: { id } }]
  });

  const [deleteFile] = useMutation(DELETE_FILE, {
    refetchQueries: [{ query: GET_ALL_FILES }],
    onCompleted: () => navigate('/') // go home after delete
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{color:'red'}}>Error: {error.message}</p>;

  const file = data.getFile;

  const handleStatusUpdate = async (newStatus) => {
    await updateStatus({
      variables: { id, status: newStatus }
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this file?')) {
      await deleteFile({ variables: { id } });
    }
  };

  return (
    <div style={styles.container}>

      {/* Back button */}
      <button onClick={() => navigate('/')} style={styles.backBtn}>
        ← Back
      </button>

      <h2>{file.fileName}</h2>

      {/* File details table */}
      <div style={styles.card}>
        <Row label="File Type" value={file.fileType} />
        <Row label="Status" value={file.status} />
        <Row label="Uploaded At" value={new Date(file.uploadedAt).toLocaleString()} />
        <Row label="Processed At" value={file.processedAt ? new Date(file.processedAt).toLocaleString() : 'Not yet'} />
        <Row label="Record Count" value={file.recordCount ?? 'Not yet'} />
        <Row label="Notes" value={file.notes ?? 'None'} />
      </div>

      {/* Status update buttons */}
      <div style={styles.actions}>
        <h4>Update Status:</h4>
        <div style={styles.btnGroup}>
          {['UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED'].map(status => (
            <button
              key={status}
              onClick={() => handleStatusUpdate(status)}
              style={{
                ...styles.statusBtn,
                opacity: file.status === status ? 0.5 : 1
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Delete button */}
      <button onClick={handleDelete} style={styles.deleteBtn}>
        🗑️ Delete File
      </button>

    </div>
  );
}

// Small reusable component for detail rows
function Row({ label, value }) {
  return (
    <div style={styles.row}>
      <span style={styles.label}>{label}:</span>
      <span>{value}</span>
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' },
  card: { backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ddd', padding: '1.5rem', marginBottom: '1.5rem' },
  row: { display: 'flex', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' },
  label: { fontWeight: 'bold', minWidth: '130px', color: '#555' },
  actions: { marginBottom: '1rem' },
  btnGroup: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  statusBtn: { padding: '0.5rem 1rem', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  deleteBtn: { padding: '0.7rem 1.5rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  backBtn: { padding: '0.5rem 1rem', marginBottom: '1rem', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white' },
};

export default FileDetailPage;