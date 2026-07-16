const INPUT_CLASS =
  'w-full px-4 py-3.5 border-2 border-transparent rounded-xl text-sm text-slate-900 bg-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200';

const LABEL_CLASS = 'block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide';

/** Generic labeled input / select / textarea */
export const FormField = ({ label, required, children, className = '' }) => (
  <div className={className}>
    <label className={LABEL_CLASS}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

/** Styled text / number / password / email input */
export const Input = ({ className = '', ...props }) => (
  <input className={`${INPUT_CLASS} ${className}`} {...props} />
);

/** Styled select with custom arrow */
export const Select = ({ className = '', children, ...props }) => (
  <div className="relative">
    <select className={`${INPUT_CLASS} appearance-none pr-10 ${className}`} {...props}>
      {children}
    </select>
    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 text-xs">
      ▼
    </div>
  </div>
);

/** Styled textarea */
export const Textarea = ({ className = '', ...props }) => (
  <textarea className={`${INPUT_CLASS} resize-none ${className}`} {...props} />
);

/**
 * Toggle chip button (for multi-select options)
 * @param {{ label: string, selected: boolean, onClick: () => void, withCheckbox?: boolean }} props
 */
export const ToggleChip = ({ label, selected, onClick, withCheckbox = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all duration-150 w-full ${
      selected
        ? 'border-green-500 bg-green-50 text-green-800'
        : 'border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200'
    }`}
  >
    {withCheckbox && (
      <span
        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
          selected ? 'bg-green-600 border-green-600' : 'border-slate-300'
        }`}
      >
        {selected && (
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    )}
    {label}
  </button>
);

/** Error alert box */
export const ErrorAlert = ({ message }) =>
  message ? (
    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
      <span className="text-red-500 mt-0.5 flex-shrink-0">⚠️</span>
      <p className="text-sm text-red-700 font-medium">{message}</p>
    </div>
  ) : null;

/** Back / Submit button row */
export const FormActions = ({ onBack, submitLabel = 'Continue', loading = false }) => (
  <>
    <div className="h-px bg-slate-100" />
    <div className="flex justify-between items-center gap-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          ← Back
        </button>
      ) : (
        <span />
      )}
      <button
        type="submit"
        disabled={loading}
        className={`px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 ${
          loading
            ? 'bg-green-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
        }`}
      >
        {loading ? 'Saving...' : submitLabel}
      </button>
    </div>
  </>
);
