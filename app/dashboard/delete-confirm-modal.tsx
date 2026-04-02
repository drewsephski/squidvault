"use client";

interface DeleteConfirmModalProps {
  videoName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ videoName, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center bg-background/95 backdrop-blur-sm p-4 pt-[5vh]"
      onClick={onCancel}
    >
      <div 
        className="relative w-full max-w-md border border-border bg-background overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-stone/20">
          <span className="text-micro text-error">Delete Video</span>
          <button
            onClick={onCancel}
            className="p-1.5 hover:bg-stone transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-error/20 bg-error/8 text-error">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </div>

          <h3 className="text-subhead text-foreground mb-1.5">Delete this video?</h3>
          <p className="text-body text-muted mb-5">
            &ldquo;{videoName}&rdquo; will be permanently deleted. This cannot be undone.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onCancel}
              className="inline-flex h-10 items-center justify-center border border-border bg-stone px-5 text-xs font-medium text-foreground transition-colors hover:bg-stone/70"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="inline-flex h-10 items-center justify-center bg-error px-5 text-xs font-semibold text-white transition-colors hover:bg-error/80"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
