import * as FileSystem from 'expo-file-system';
import { persistReceiptPhoto, deleteReceiptPhoto } from '../services/photoStorage';

beforeEach(() => {
  jest.clearAllMocks();
  FileSystem.getInfoAsync.mockResolvedValue({ exists: false });
});

describe('photoStorage', () => {
  describe('persistReceiptPhoto', () => {
    it('creates the receipts directory when it does not exist yet', async () => {
      await persistReceiptPhoto('file:///tmp/cache-photo.jpg');
      expect(FileSystem.makeDirectoryAsync).toHaveBeenCalledWith(
        'file:///mock-documents/receipts/',
        { intermediates: true }
      );
    });

    it('skips creating the directory when it already exists', async () => {
      FileSystem.getInfoAsync.mockResolvedValue({ exists: true });
      await persistReceiptPhoto('file:///tmp/cache-photo.jpg');
      expect(FileSystem.makeDirectoryAsync).not.toHaveBeenCalled();
    });

    it('copies the temp file into the receipts directory and returns the new durable URI', async () => {
      const result = await persistReceiptPhoto('file:///tmp/cache-photo.jpg');
      expect(FileSystem.copyAsync).toHaveBeenCalledTimes(1);
      const { from, to } = FileSystem.copyAsync.mock.calls[0][0];
      expect(from).toBe('file:///tmp/cache-photo.jpg');
      expect(to).toMatch(/^file:\/\/\/mock-documents\/receipts\/receipt_\d+_[a-z0-9]+\.jpg$/);
      expect(result).toBe(to);
    });

    it('generates distinct filenames across calls', async () => {
      const first = await persistReceiptPhoto('file:///tmp/a.jpg');
      const second = await persistReceiptPhoto('file:///tmp/b.jpg');
      expect(first).not.toBe(second);
    });
  });

  describe('deleteReceiptPhoto', () => {
    it('does nothing when passed a falsy uri', async () => {
      await deleteReceiptPhoto(null);
      expect(FileSystem.getInfoAsync).not.toHaveBeenCalled();
      expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
    });

    it('deletes the file when it exists', async () => {
      FileSystem.getInfoAsync.mockResolvedValue({ exists: true });
      await deleteReceiptPhoto('file:///mock-documents/receipts/receipt_1.jpg');
      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
        'file:///mock-documents/receipts/receipt_1.jpg',
        { idempotent: true }
      );
    });

    it('does not attempt to delete when the file no longer exists', async () => {
      FileSystem.getInfoAsync.mockResolvedValue({ exists: false });
      await deleteReceiptPhoto('file:///mock-documents/receipts/receipt_1.jpg');
      expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
    });

    it('swallows errors so a failed delete never throws (delete UX must never block)', async () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      FileSystem.getInfoAsync.mockRejectedValue(new Error('boom'));
      await expect(deleteReceiptPhoto('file:///x.jpg')).resolves.toBeUndefined();
    });
  });
});
