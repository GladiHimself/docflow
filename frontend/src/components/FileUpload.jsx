import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { REQUEST_UPLOAD } from "../graphql/mutations";
import { GET_ALL_FILES } from "../graphql/queries";

function FileUpload() {
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("CSV");
  const [actualFile, setActualFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [requestUpload] = useMutation(REQUEST_UPLOAD, {
    refetchQueries: [{ query: GET_ALL_FILES }],
  });

  // When user picks a file → automatically fill fileName and fileType
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setActualFile(file);
      setFileName(file.name);

      // Auto-detect file type from extension
      const extension = file.name.split(".").pop().toLowerCase();
      if (extension === "csv") {
        setFileType("CSV");
      } else if (extension === "pdf") {
        setFileType("PDF");
      } else if (["png", "jpg", "jpeg", "gif", "webp"].includes(extension)) {
        setFileType("IMAGE");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!actualFile) {
      alert("Please select a file");
      return;
    }

    setUploading(true);
    try {
      // Step 1: Get pre-signed URL from Spring Boot
      const { data } = await requestUpload({
        variables: { fileName, fileType },
      });

      const { uploadUrl } = data.requestUpload;

      // Step 2: Upload directly to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: actualFile,
        headers: {
          "Content-Type": actualFile.type || "application/octet-stream",
        },
      });

      if (uploadResponse.ok) {
        alert("File uploaded to DocFlow successfully!");
        setFileName("");
        setActualFile(null);
        setFileType("CSV");
      } else {
        alert("Upload failed");
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Upload File to DocFlow</h3>
      <form onSubmit={handleSubmit} style={styles.form}>

        {/* File picker */}
        <div style={styles.field}>
          <label style={styles.label}>Select File</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".csv,.pdf,.png,.jpg,.jpeg"
            style={styles.input}
          />
        </div>

        {/* File name — auto filled */}
        <div style={styles.field}>
          <label style={styles.label}>File Name</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Select a file above"
            style={styles.input}
          />
        </div>

        {/* File type badge — only shown after file selected */}
        {actualFile && (
          <div style={styles.field}>
            <label style={styles.label}>Detected File Type</label>
            <div style={styles.badge}>
              {fileType === "CSV" ? "📊" : fileType === "PDF" ? "📄" : "🖼️"}{" "}
              {fileType}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          style={{
            ...styles.button,
            opacity: uploading ? 0.7 : 1,
            cursor: uploading ? "not-allowed" : "pointer",
          }}
        >
          {uploading ? "⏳ Uploading..." : "☁️ Upload to DocFlow"}
        </button>

      </form>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#ffffff",
    padding: "1.5rem",
    borderRadius: "16px",
    marginBottom: "1.5rem",
    border: "1px solid #e2e8f0",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
  },
  title: {
    margin: "0 0 1.2rem 0",
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#1a1a2e",
  },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { color: "#374151", fontWeight: "600", fontSize: "0.85rem" },
  input: {
    padding: "0.5rem",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1.5px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    color: "#1a1a2e",
  },
  badge: {
    padding: "0.5rem 0.9rem",
    backgroundColor: "#f0fdf4",
    border: "1.5px solid #86efac",
    borderRadius: "8px",
    color: "#15803d",
    fontWeight: "600",
    fontSize: "0.9rem",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    width: "fit-content",
  },
  button: {
    padding: "0.75rem",
    backgroundColor: "#1a1a2e",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.95rem",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(26,26,46,0.3)",
    marginTop: "0.3rem",
  },
};

export default FileUpload;