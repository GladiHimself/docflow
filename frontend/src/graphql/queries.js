import { gql } from '@apollo/client/core';

// get all files query
export const GET_ALL_FILES = gql`
    query GetAllFiles {
        getAllFiles {
            id
            fileName
            fileType
            status
            uploadedAt
            recordCount
        }
    }
`;

// get single file by id query
export const GET_FILE = gql`
    query GetFile($id: ID!) {
        getFile(id: $id) {
            id
            fileName
            fileType
            status
            uploadedAt
            processedAt
            recordCount
            notes
        }
    }
`;

// get file by status query
export const GET_FILES_BY_STATUS = gql`
    query GetFilesByStatus($status: FileStatus!) {
        getFilesByStatus(status: $status) {
            id
            fileName
            fileType
            status
            uploadedAt
        }
    }
`;