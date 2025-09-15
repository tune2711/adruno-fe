import React from 'react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm, productName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirmDeleteModalTitle">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm">
        <div className="flex items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <div className="ml-4 text-left">
                <h2 id="confirmDeleteModalTitle" className="text-xl font-bold text-gray-800">Xóa món ăn</h2>
                <div className="mt-2">
                    <p className="text-sm text-gray-600">
                    Bạn có chắc chắn muốn xóa món <span className="font-semibold text-gray-900">"{productName}"</span> không? Hành động này không thể hoàn tác.
                    </p>
                </div>
            </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
          >
            Xóa
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;