'use client';

import { useState } from 'react';
import Button from './Button';

interface CreateBoardModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (name: string) => Promise<void>;
}

export default function CreateBoardModal({ open, onClose, onCreated }: CreateBoardModalProps) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onCreated(name.trim());
      setName('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Create New Board
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter board name..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />
          <div className="flex space-x-3 pt-2">
            <Button
              type="submit"
              disabled={!name.trim() || submitting}
              variant="primary"
              className="flex-1"
            >
              {submitting ? 'Creating...' : 'Create Board'}
            </Button>
            <Button
              type="button"
              onClick={handleClose}
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
