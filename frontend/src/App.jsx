import { useQuery } from '@apollo/client/react';
import { GET_ALL_FILES } from './graphql/queries';

function App() {
  const { loading, error, data } = useQuery(GET_ALL_FILES);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>DocFlow</h1>
      <h2>Files:</h2>
      {data.getAllFiles.length === 0 ? (
        <p>No files yet!</p>
      ) : (
        data.getAllFiles.map(file => (
          <div key={file.id}>
            <p>{file.fileName} — {file.status}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default App;