import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import { googleDriveService } from '../services/googleDriveService.js';
import prisma from '../prisma.js';

export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const { folderCategory = 'General', category = 'General', relatedId } = req.body;

    // RBAC validation on upload destination
    if (folderCategory === 'Finance' && req.user.role !== 'FINANCE_ASSISTANT' && req.user.role !== 'MANAGING_DIRECTOR') {
      res.status(403).json({ message: 'Only Finance staff and MD can upload to the Finance folder' });
      return;
    }

    const driveResult = await googleDriveService.uploadFile({
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      buffer: req.file.buffer,
      folderCategory: folderCategory as any,
      description: `Uploaded by ${req.user.name} (${req.user.role}) for ${category}`,
    });

    const fileRecord = await prisma.fileRecord.create({
      data: {
        fileName: driveResult.fileName,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: driveResult.sizeBytes,
        driveFileId: driveResult.driveFileId,
        driveWebView: driveResult.webViewLink,
        driveFolder: folderCategory,
        category: category,
        uploaderId: req.user.id,
        relatedId: relatedId || null,
      },
      include: {
        uploader: {
          select: { id: true, name: true, role: true, email: true },
        },
      },
    });

    res.status(201).json({
      message: 'File successfully uploaded to Google Drive',
      file: fileRecord,
    });
  } catch (error: any) {
    console.error('Error uploading file to Google Drive:', error);
    res.status(500).json({ message: 'Failed to upload document to Google Drive', error: error.message });
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No image file provided' });
      return;
    }

    const fileName = `avatar_${req.user.id}_${Date.now()}.png`;

    const driveResult = await googleDriveService.uploadFile({
      fileName,
      mimeType: req.file.mimetype || 'image/png',
      buffer: req.file.buffer,
      folderCategory: 'Profiles',
      description: `Avatar for ${req.user.name}`,
    });

    // Update user profile in database
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        avatarUrl: driveResult.webViewLink,
        driveAvatarId: driveResult.driveFileId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        avatarUrl: true,
        driveAvatarId: true,
        themePreference: true,
      },
    });

    // Also register in file records
    await prisma.fileRecord.create({
      data: {
        fileName,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: driveResult.sizeBytes,
        driveFileId: driveResult.driveFileId,
        driveWebView: driveResult.webViewLink,
        driveFolder: 'Profiles',
        category: 'Avatar',
        uploaderId: req.user.id,
      },
    });

    res.json({
      message: 'Avatar uploaded to Google Drive successfully',
      user: updatedUser,
      avatarUrl: driveResult.webViewLink,
      driveFileId: driveResult.driveFileId,
    });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Failed to upload profile picture to Google Drive', error: error.message });
  }
};

export const listFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { folder, category, search } = req.query;

    const whereClause: any = { isArchived: false };

    // Role filtering: MD can see all folders.
    // If not MD, restrict based on department or allow General
    if (req.user.role === 'FINANCE_ASSISTANT') {
      whereClause.driveFolder = { in: ['Finance', 'General', 'Profiles'] };
    } else if (req.user.role === 'OPERATIONAL_MANAGER') {
      whereClause.driveFolder = { in: ['Operations', 'General', 'Profiles'] };
    } else if (req.user.role === 'TECH_SALES_MANAGER') {
      whereClause.driveFolder = { in: ['Sales', 'General', 'Profiles'] };
    }

    if (folder && typeof folder === 'string' && folder !== 'All') {
      whereClause.driveFolder = folder;
    }

    if (category && typeof category === 'string' && category !== 'All') {
      whereClause.category = category;
    }

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { fileName: { contains: search } },
        { originalName: { contains: search } },
      ];
    }

    const files = await prisma.fileRecord.findMany({
      where: whereClause,
      include: {
        uploader: {
          select: { id: true, name: true, role: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ files });
  } catch (error: any) {
    console.error('List files error:', error);
    res.status(500).json({ message: 'Error retrieving files' });
  }
};

export const downloadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;

    const fileRecord = await prisma.fileRecord.findFirst({
      where: {
        OR: [{ id: fileId }, { driveFileId: fileId }],
      },
    });

    if (!fileRecord) {
      res.status(404).json({ message: 'File record not found' });
      return;
    }

    const { stream, mimeType, fileName } = await googleDriveService.getFileStream(fileRecord.driveFileId);

    res.setHeader('Content-Type', mimeType || fileRecord.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileName || fileRecord.originalName)}"`
    );

    stream.pipe(res);
  } catch (error: any) {
    console.error('Download file error:', error);
    res.status(500).json({ message: 'Failed to download file from Google Drive', error: error.message });
  }
};

export const deleteFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { fileId } = req.params;

    const fileRecord = await prisma.fileRecord.findUnique({
      where: { id: fileId },
    });

    if (!fileRecord) {
      res.status(404).json({ message: 'File not found' });
      return;
    }

    // Only MD or the uploader can delete
    if (req.user.role !== 'MANAGING_DIRECTOR' && fileRecord.uploaderId !== req.user.id) {
      res.status(403).json({ message: 'Permission denied to delete this file' });
      return;
    }

    await googleDriveService.deleteFile(fileRecord.driveFileId);
    await prisma.fileRecord.delete({ where: { id: fileId } });

    res.json({ message: 'File deleted from Google Drive and system records' });
  } catch (error: any) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
};

export const getDriveStatus = async (_req: AuthRequest, res: Response): Promise<void> => {
  const status = googleDriveService.getStatus();
  res.json({ status });
};
