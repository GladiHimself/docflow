import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { REQUEST_UPLOAD } from '../graphql/mutations';  // changed from CREATE_FILE
import { GET_ALL_FILES } from '../graphql/queries';

function FileUpload() {
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('CSV');
  const [actualFile, setActualFile] = useState(null);  // stores real file object
  const [uploading, setUploading] = useState(false);

  // REQUEST_UPLOAD → asks backend for pre-signed S3 URL
  const [requestUpload] = useMutation(REQUEST_UPLOAD, {
    refetchQueries: [{ query: GET_ALL_FILES }],  // refresh file list after upload
  });

  // When user picks a file → store it and auto-fill filename
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setActualFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!actualFile) {
      alert('Please select a file');
      return;
    }

    setUploading(true);
    try {
      // Step 1: Ask backend to create DB record + generate pre-signed S3 URL
      const { data } = await requestUpload({
        variables: { fileName, fileType }
      });

      const { uploadUrl } = data.requestUpload;

      // Step 2: Upload file DIRECTLY to S3 using pre-signed URL
      // File never goes through our backend — straight to S3!
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',                                          // S3 pre-signed URLs use PUT
        body: actualFile,                                       // raw file bytes
        headers: {
          'Content-Type': actualFile.type || 'application/octet-stream'
        }
      });

      if (uploadResponse.ok) {
        alert('File uploaded to S3 successfully!');
        setFileName('');
        setActualFile(null);
      } else {
        alert('S3 upload failed');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setUploading(false);  // always reset loading state
    }
  };

  return (
    <div style={styles.container}>
      <h3>Upload File to DocFlow</h3>
      <form onSubmit={handleSubmit} style={styles.form}>

        {/* File picker — user selects actual file from their computer */}
        <div style={styles.field}>
          <label style={{ color: '#374151', fontWeight: '600', fontSize: '0.85rem' }}>Select File:</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".csv,.pdf,.png,.jpg"
            style={styles.input}
          />
        </div>

        {/* Auto-filled from selected file, but user can edit */}
        <div style={styles.field}>
          <label style={{ color: '#374151', fontWeight: '600', fontSize: '0.85rem' }}>File Name:</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="e.g. employees.csv"
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label style={{ color: '#374151', fontWeight: '600', fontSize: '0.85rem' }}>File Type:</label>
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

        <button type="submit" disabled={uploading} style={styles.button}>
          {uploading ? '⏳ Uploading...' : '☁️ Upload to DocFlow'}
        </button>

      </form>
    </div>
  );
}

const styles = {
  container: {
  backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  input: { padding: '0.5rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#f8fafc', color: '#1a1a2e' },
  button: { padding: '0.7rem', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' }
};

export default FileUpload;