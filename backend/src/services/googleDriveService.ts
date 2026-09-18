import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

export interface DriveUploadOptions {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  folderCategory: 'Finance' | 'Operations' | 'Sales' | 'Profiles' | 'General';
  description?: string;
}

export interface DriveFileResult {
  driveFileId: string;
  webViewLink: string;
  webContentLink?: string;
  fileName: string;
  sizeBytes: number;
}

class GoogleDriveService {
  private drive: any = null;
  private isLiveConnected = false;
  private rootFolderId: string | null = null;
  private folderIds: Record<string, string> = {};
  private localMockStorageDir: string;
  private targetEmail: string;

  constructor() {
    this.targetEmail = process.env.GOOGLE_DRIVE_TARGET_EMAIL || 'umeshmabatuwana@gmail.com';
    this.localMockStorageDir = path.resolve(process.cwd(), 'mock_drive_storage');
    if (!fs.existsSync(this.localMockStorageDir)) {
      fs.mkdirSync(this.localMockStorageDir, { recursive: true });
    }
    this.initDriveClient();
  }

  private initDriveClient() {
    const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || './service-account.json';
    const absoluteKeyPath = path.resolve(process.cwd(), keyFilePath);

    try {
      if (fs.existsSync(absoluteKeyPath)) {
        const auth = new google.auth.GoogleAuth({
          keyFile: absoluteKeyPath,
          scopes: ['https://www.googleapis.com/auth/drive'],
        });
        this.drive = google.drive({ version: 'v3', auth });
        this.isLiveConnected = true;
        console.log('[GoogleDriveService] Successfully initialized with Google Service Account.');
        this.ensureSystemFolders().catch((err) => {
          console.warn('[GoogleDriveService] Warning creating remote folders:', err.message);
        });
      } else {
        console.warn(
          `[GoogleDriveService] Service account file not found at ${absoluteKeyPath}. Operating in high-fidelity mock/simulation mode.`
        );
      }
    } catch (error: any) {
      console.warn('[GoogleDriveService] Failed to initialize live Google Drive:', error.message);
      this.isLiveConnected = false;
    }
  }

  private async ensureSystemFolders() {
    if (!this.isLiveConnected || !this.drive) return;

    try {
      // 1. Check or create JADE_System root folder
      const rootQuery = await this.drive.files.list({
        q: "name = 'JADE_System' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
        fields: 'files(id, name)',
      });

      if (rootQuery.data.files && rootQuery.data.files.length > 0) {
        this.rootFolderId = rootQuery.data.files[0].id;
      } else {
        const createRoot = await this.drive.files.create({
          requestBody: {
            name: 'JADE_System',
            mimeType: 'application/vnd.google-apps.folder',
          },
          fields: 'id',
        });
        this.rootFolderId = createRoot.data.id;
      }

      // 2. Ensure subfolders: Finance, Operations, Sales, Profiles
      const subfolders = ['Finance', 'Operations', 'Sales', 'Profiles', 'General'];
      for (const folder of subfolders) {
        const subQuery = await this.drive.files.list({
          q: `name = '${folder}' and '${this.rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
          fields: 'files(id, name)',
        });

        if (subQuery.data.files && subQuery.data.files.length > 0) {
          this.folderIds[folder] = subQuery.data.files[0].id;
        } else {
          const createSub = await this.drive.files.create({
            requestBody: {
              name: folder,
              mimeType: 'application/vnd.google-apps.folder',
              parents: [this.rootFolderId],
            },
            fields: 'id',
          });
          this.folderIds[folder] = createSub.data.id;
        }
      }
      // 3. Share root JADE_System folder with designated Google account (umeshmabatuwana@gmail.com)
      if (this.targetEmail && this.rootFolderId) {
        try {
          await this.drive.permissions.create({
            fileId: this.rootFolderId,
            requestBody: {
              role: 'writer',
              type: 'user',
              emailAddress: this.targetEmail,
            },
            sendNotificationEmail: true,
          });
          console.log(`[GoogleDriveService] Successfully granted write permissions to ${this.targetEmail}`);
        } catch (shareErr: any) {
          console.log(`[GoogleDriveService] Target share status for ${this.targetEmail}:`, shareErr.message);
        }
      }

      console.log('[GoogleDriveService] JADE Drive folder hierarchy established successfully.');
    } catch (err: any) {
      console.error('[GoogleDriveService] Error initializing folder structure:', err.message);
    }
  }

  /**
   * Upload buffer directly to Google Drive
   */
  async uploadFile(options: DriveUploadOptions): Promise<DriveFileResult> {
    const { fileName, mimeType, buffer, folderCategory, description } = options;

    if (this.isLiveConnected && this.drive) {
      const parentFolderId = this.folderIds[folderCategory] || this.rootFolderId;
      const mediaStream = new Readable();
      mediaStream.push(buffer);
      mediaStream.push(null);

      const fileMetadata: any = {
        name: fileName,
        description: description || `Uploaded via JADE System to ${folderCategory}. Designated for ${this.targetEmail}`,
      };

      if (parentFolderId) {
        fileMetadata.parents = [parentFolderId];
      }

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: {
          mimeType,
          body: mediaStream,
        },
        fields: 'id, name, webViewLink, webContentLink, size',
      });

      // Grant permissions to umeshmabatuwana@gmail.com and anyone with link
      try {
        if (this.targetEmail) {
          await this.drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
              role: 'writer',
              type: 'user',
              emailAddress: this.targetEmail,
            },
          });
        }
        await this.drive.permissions.create({
          fileId: response.data.id,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        });
      } catch (permErr: any) {
        console.warn('[GoogleDriveService] Permission grant note:', permErr.message);
      }

      return {
        driveFileId: response.data.id,
        webViewLink:
          response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`,
        webContentLink: response.data.webContentLink,
        fileName: response.data.name || fileName,
        sizeBytes: parseInt(response.data.size || `${buffer.length}`, 10),
      };
    }

    // High-fidelity fallback / mock when credentials file is pending
    const simulatedFileId = `gdrive_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const folderPath = path.join(this.localMockStorageDir, folderCategory);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    const diskPath = path.join(folderPath, `${simulatedFileId}-${fileName}`);
    fs.writeFileSync(diskPath, buffer);

    return {
      driveFileId: simulatedFileId,
      webViewLink: `https://drive.google.com/file/d/${simulatedFileId}/view?usp=sharing`,
      webContentLink: `/api/drive/download/${simulatedFileId}`,
      fileName,
      sizeBytes: buffer.length,
    };
  }

  /**
   * Download or stream file from Google Drive
   */
  async getFileStream(driveFileId: string): Promise<{ stream: Readable; mimeType?: string; fileName?: string }> {
    if (this.isLiveConnected && this.drive) {
      const meta = await this.drive.files.get({
        fileId: driveFileId,
        fields: 'id, name, mimeType',
      });

      const response = await this.drive.files.get(
        { fileId: driveFileId, alt: 'media' },
        { responseType: 'stream' }
      );

      return {
        stream: response.data,
        mimeType: meta.data.mimeType,
        fileName: meta.data.name,
      };
    }

    // Local Mock lookup
    const categories = ['Finance', 'Operations', 'Sales', 'Profiles', 'General'];
    for (const cat of categories) {
      const folderPath = path.join(this.localMockStorageDir, cat);
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        const match = files.find((f) => f.startsWith(driveFileId));
        if (match) {
          const filePath = path.join(folderPath, match);
          return {
            stream: fs.createReadStream(filePath),
            fileName: match.replace(`${driveFileId}-`, ''),
          };
        }
      }
    }

    throw new Error(`File ${driveFileId} not found in Google Drive repository.`);
  }

  /**
   * Delete file from Google Drive
   */
  async deleteFile(driveFileId: string): Promise<boolean> {
    if (this.isLiveConnected && this.drive) {
      await this.drive.files.delete({ fileId: driveFileId });
      return true;
    }

    // Mock deletion
    const categories = ['Finance', 'Operations', 'Sales', 'Profiles', 'General'];
    for (const cat of categories) {
      const folderPath = path.join(this.localMockStorageDir, cat);
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        const match = files.find((f) => f.startsWith(driveFileId));
        if (match) {
          fs.unlinkSync(path.join(folderPath, match));
          return true;
        }
      }
    }
    return false;
  }

  getStatus() {
    return {
      connected: this.isLiveConnected,
      mode: this.isLiveConnected ? 'Live Google Cloud API v3' : 'Simulated / Safe Local Storage',
      targetEmail: this.targetEmail,
      rootFolderId: this.rootFolderId,
      folders: this.folderIds,
    };
  }
}

export const googleDriveService = new GoogleDriveService();
