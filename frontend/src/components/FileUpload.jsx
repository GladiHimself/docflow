import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { CREATE_FILE } from '../graphql/mutations';
import { GET_ALL_FILES } from '../graphql/queries';

function FileUpload() {
  // useState tracks what user types in the form
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('CSV');

  // useMutation gives us a function to call + loading state
  // refetchQueries → after mutation, automatically re-fetch file list
  const [createFile, { loading }] = useMutation(CREATE_FILE, {
    refetchQueries: [{ query: GET_ALL_FILES }], // refreshes list after upload
  });

  const handleSubmit = async (e) => {
    e.preventDefault(); // stops page from reloading on form submit

    if (!fileName.trim()) {
      alert('Please enter a file name');
      return;
    }

    try {
      await createFile({
        variables: {
          fileName: fileName,
          fileType: fileType,
        }
      });
      setFileName(''); // clear input after success
      alert('File created successfully!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h3>Add New File</h3>
      {/* onSubmit fires when form is submitted */}
      <form onSubmit={handleSubmit} style={styles.form}>

        <div style={styles.field}>
          <label>File Name:</label>
          {/* onChange updates state every time user types */}
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="e.g. employees.csv"
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>File Type:</label>
          {/* select dropdown — onChange updates fileType state */}
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            style={styles.input}
          >
            <option value="CSV">CSV</option>
            <option value="PDF">PDF</option>
            <option value="IMAGE">IMAGE</option>
          </select>
        </div>

        {/* disabled while loading — prevents double submit */}
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Uploading...' : 'Upload File'}
        </button>

      </form>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#f9f9f9',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    border: '1px solid #ddd',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },
  input: {
    padding: '0.5rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '0.7rem',
    backgroundColor: '#1a1a2e',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  }
};

export default FileUpload;