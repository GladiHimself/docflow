import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_FILE, GET_ALL_FILES } from "../graphql/queries";
import { UPDATE_FILE_STATUS, DELETE_FILE, GENERATE_DOWNLOAD_URL } from "../graphql/mutations";

function FileDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { loading, error, data } = useQuery(GET_FILE, {
    variables: { id },
  });

  const [updateStatus] = useMutation(UPDATE_FILE_STATUS, {
    refetchQueries: [{ query: GET_FILE, variables: { id } }],
  });

  const [deleteFile] = useMutation(DELETE_FILE, {
    refetchQueries: [{ query: GET_ALL_FILES }],
    onCompleted: () => navigate("/"),
  });

  // Generate pre-signed download URL from Spring Boot
  const [generateDownloadUrl] = useMutation(GENERATE_DOWNLOAD_URL);

  if (loading)
    return (
      <p style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
        Loading...
      </p>
    );
  if (error)
    return (
      <p style={{ color: "red", textAlign: "center" }}>
        Error: {error.message}
      </p>
    );

  const file = data.getFile;

  const handleStatusUpdate = async (newStatus) => {
    await updateStatus({ variables: { id, status: newStatus } });
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this file?")) {
      await deleteFile({ variables: { id } });
    }
  };

  // Get pre-signed URL from backend then open in new tab
  const handleDownload = async () => {
    const { data } = await generateDownloadUrl({
      variables: { s3Key: file.s3Key }
    });
    window.open(data.generateDownloadUrl, '_blank');
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Back button */}
        <button onClick={() => navigate("/")} style={styles.backBtn}>
          ← Back
        </button>

        {/* File name */}
        <h2 style={styles.fileName}>{file.fileName}</h2>

        {/* File details card */}
        <div style={styles.card}>
          <Row label="File Type" value={file.fileType} />
          <Row label="Status" value={file.status} highlight />
          <Row
            label="Uploaded At"
            value={new Date(file.uploadedAt).toLocaleString()}
          />
          <Row
            label="Processed At"
            value={
              file.processedAt
                ? new Date(file.processedAt).toLocaleString()
                : "Not yet"
            }
          />
          <Row label="Record Count" value={file.recordCount ?? "Not yet"} />
          <Row label="Notes" value={file.notes ?? "None"} />
        </div>

        {/* Current Status Display - read only */}
        <div style={styles.actionsCard}>
          <h4 style={styles.actionsTitle}>Current Status</h4>
          <div style={styles.btnGroup}>
            {["UPLOADED", "PROCESSING", "PROCESSED", "FAILED"].map((status) => (
              <div
                key={status}
                style={{
                  ...styles.statusBtn,
                  backgroundColor: file.status === status ? "#1a1a2e" : "#f1f5f9",
                  color: file.status === status ? "white" : "#9ca3af",
                  border: file.status === status ? "2px solid #1a1a2e" : "2px solid #e2e8f0",
                  fontWeight: file.status === status ? "700" : "400",
                  transform: file.status === status ? "scale(1.05)" : "scale(1)",
                  cursor: "default",
                }}
              >
                {file.status === status ? "✓ " : ""}
                {status}
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons — centered */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1.5rem" }}>
          
          {/* Download — uses pre-signed URL from Spring Boot */}
          <button onClick={handleDownload} style={styles.downloadBtn}>
            ⬇️ Download File
          </button>

          <button onClick={handleDelete} style={styles.deleteBtn}>
            🗑️ Delete File
          </button>

        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <span style={{
        ...styles.rowValue,
        fontWeight: highlight ? "600" : "400",
        color: highlight ? "#1a1a2e" : "#4b5563",
      }}>
        {value}
      </span>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f0f4f8",
    backgroundImage: "radial-gradient(circle at 20% 20%, #e8f0fe 0%, transparent 50%), radial-gradient(circle at 80% 80%, #fce4ec 0%, transparent 50%)",
    padding: "2rem 0",
  },
  container: { maxWidth: "680px", margin: "0 auto", padding: "0 1.5rem" },
  backBtn: {
    padding: "0.5rem 1.2rem",
    marginBottom: "1.2rem",
    cursor: "pointer",
    border: "1.5px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#374151",
    fontWeight: "600",
    fontSize: "0.85rem",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },
  fileName: {
    fontSize: "1.6rem",
    fontWeight: "800",
    color: "#1a1a2e",
    margin: "0 0 1.2rem",
    letterSpacing: "-0.5px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    wordBreak: "break-all",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    padding: "0.5rem 1.5rem",
    marginBottom: "1.2rem",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.85rem 0",
    borderBottom: "1px solid #f1f5f9",
  },
  rowLabel: {
    fontWeight: "600",
    fontSize: "0.85rem",
    color: "#6b7280",
    minWidth: "130px",
    letterSpacing: "0.3px",
  },
  rowValue: { fontSize: "0.9rem", textAlign: "right" },
  actionsCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    padding: "1.5rem",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
  },
  actionsTitle: {
    margin: "0 0 1rem",
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#1a1a2e",
    letterSpacing: "0.3px",
  },
  btnGroup: { display: "flex", gap: "0.6rem", flexWrap: "wrap" },
  statusBtn: {
    padding: "0.5rem 1.1rem",
    borderRadius: "8px",
    fontSize: "0.82rem",
    letterSpacing: "0.5px",
    transition: "all 0.2s ease",
  },
  downloadBtn: {
    padding: "0.75rem 2rem",
    backgroundColor: "#1a1a2e",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.95rem",
    boxShadow: "0 4px 12px rgba(26,26,46,0.3)",
    transition: "all 0.2s ease",
  },
  deleteBtn: {
    padding: "0.75rem 2rem",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.95rem",
    boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
    transition: "all 0.2s ease",
  },
};

export default FileDetailPage;