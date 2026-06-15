import { gql } from '@apollo/client/core';

//create file mutation
export const CREATE_FILE = gql`
    mutation CreateFile($fileName: String!, $fileType: String!) {
        createFile(fileName: $fileName, fileType: $fileType) {
            id
            fileName
            fileType
            status
            uploadedAt
        }
    }
`;

//update file status mutation
export const UPDATE_FILE_STATUS = gql`
    mutation UpdateFileStatus($id: ID!, $status: FileStatus!) {
        updateFileStatus(id: $id, status: $status) {
            id
            fileName 
            status
        }
    }
`;

// delete file mutation
export const DELETE_FILE = gql`
    mutation DeleteFile($id: ID!) {
        deleteFile(id: $id)
    }
`;

export const REQUEST_UPLOAD = gql`
  mutation RequestUpload($fileName: String!, $fileType: String!) {
    requestUpload(fileName: $fileName, fileType: $fileType) {
      fileId
      uploadUrl
      s3Key
    }
  }
`;

//download url mutation
export const GENERATE_DOWNLOAD_URL = gql`
  mutation GenerateDownloadUrl($s3Key: String!) {
    generateDownloadUrl(s3Key: $s3Key)
  }
`;