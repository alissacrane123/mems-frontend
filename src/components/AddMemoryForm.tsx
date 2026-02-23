'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/lib/api';
import Button from './Button';

interface AddMemoryFormProps {
  boardId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddMemoryForm({ boardId, onSuccess, onCancel }: AddMemoryFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const validFiles = files.filter(file => {
      const fileName = file.name.toLowerCase();
      const isHEIC = fileName.endsWith('.heic') || fileName.endsWith('.heif') ||
                     file.type === 'image/heic' || file.type === 'image/heif';

      if (isHEIC) return false;

      const isValidImage = file.type.startsWith('image/') &&
                          (file.type === 'image/jpeg' ||
                           file.type === 'image/jpg' ||
                           file.type === 'image/png' ||
                           file.type === 'image/gif' ||
                           file.type === 'image/webp');
      const isUnder10MB = file.size <= 10 * 1024 * 1024;
      return isValidImage && isUnder10MB;
    });

    const hasHEIC = files.some(file => {
      const fileName = file.name.toLowerCase();
      return fileName.endsWith('.heic') || fileName.endsWith('.heif') ||
             file.type === 'image/heic' || file.type === 'image/heif';
    });

    if (hasHEIC) {
      setError('HEIC/HEIF files are not supported. Please convert to JPG or PNG first, or take photos in a compatible format in your camera settings.');
    } else if (validFiles.length !== files.length) {
      setError('Some files were skipped (only JPG, PNG, GIF, WebP under 10MB are allowed)');
    } else {
      setError('');
    }

    const remainingSlots = 10 - selectedFiles.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    const newUrls = filesToAdd.map(file => URL.createObjectURL(file));

    setSelectedFiles(prev => [...prev, ...filesToAdd]);
    setPreviewUrls(prev => [...prev, ...newUrls]);

    e.target.value = '';
  };

  const removeFile = (index: number) => {
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }

    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setLoading(true);
    setError('');

    try {
      const entry = await api.createEntry(boardId, {
        content: content.trim(),
        location: location.trim() || undefined,
      });

      if (selectedFiles.length > 0) {
        setUploadingPhotos(true);

        const photoUploads = selectedFiles.map((file, index) =>
          api.uploadPhoto(entry.id, file, index)
        );

        await Promise.all(photoUploads);
      }

      previewUrls.forEach(url => URL.revokeObjectURL(url));

      setContent('');
      setLocation('');
      setSelectedFiles([]);
      setPreviewUrls([]);
      onSuccess();
    } catch (err) {
      console.error('Error creating entry:', err);
      setError('Failed to create memory. Please try again.');
    } finally {
      setLoading(false);
      setUploadingPhotos(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Add New Memory
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer active:scale-95 transition-all"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-4">
            <div className="text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What happened? *
            </label>
            <textarea
              id="content"
              required
              rows={8}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Tell us about this special moment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Line breaks and spacing will be preserved
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {content.length} characters
              </p>
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Where did this happen?
            </label>
            <input
              id="location"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Home, Park, Grandma's house..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Photos (up to 10, max 10MB each)
            </label>

            {/* File Input */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="photo-upload"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={selectedFiles.length >= 10}
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer"
              >
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {selectedFiles.length >= 10
                    ? 'Maximum 10 photos reached'
                    : 'Click to select photos or drag and drop'}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  JPG, PNG, GIF, WebP up to 10MB (HEIC not supported)
                </p>
              </label>
            </div>

            {/* Selected Photos Preview */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      {previewUrls[index] ? (
                        <img
                          src={previewUrls[index]}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded">
                      {(file.size / 1024 / 1024).toFixed(1)}MB
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Auto-captured info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Automatically captured:
            </h4>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V7a2 2 0 012-2h4a2 2 0 012 2v0M8 7v13a2 2 0 002 2h4a2 2 0 002-2V7M8 7H6a2 2 0 00-2 2v13a2 2 0 002 2h2m0 0h6" />
                </svg>
                <span>Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Time: {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={onCancel}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !content.trim()}
              variant="primary"
              className="flex-1"
            >
              {uploadingPhotos ? 'Uploading photos...' : loading ? 'Saving...' : 'Save Memory'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
