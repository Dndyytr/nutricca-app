export const SaveBar = ({ onSave, status, errorMsg, label = 'Save changes' }) => {
  const isLoading = status === 'saving';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl py-2.5 px-4 shadow-sm">
      <div className={`text-xs font-medium ${
        isError ? 'text-red-600' : isSuccess ? 'text-green-600' : isLoading ? 'text-slate-400' : 'text-slate-400'
      }`}>
        {isError ? `❌ ${errorMsg || 'Failed to save.'}` : isSuccess ? '✅ Saved!' : isLoading ? '⏳ Saving…' : ''}
      </div>
      <button
        onClick={onSave}
        disabled={isLoading}
        className={`py-2 px-5 rounded-lg text-sm font-semibold text-white transition-colors ${
          isLoading 
            ? 'bg-green-300 cursor-not-allowed' 
            : isSuccess 
            ? 'bg-green-600' 
            : 'bg-green-600 hover:bg-green-700 cursor-pointer'
        }`}
      >
        {isLoading ? 'Saving...' : isSuccess ? 'Saved!' : label}
      </button>
    </div>
  );
};