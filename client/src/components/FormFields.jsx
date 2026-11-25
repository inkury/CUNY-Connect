/*
  Form fields for the CUNY-Connect client.
  This file has the labeled text input, dropdown, and text box from the Figma, including the red outline
  and message shown when a field has an error. The event form and the club form both use them.
  Owner: Person 4
  TODO: Nothing for now. Add a new field type here if a form needs one.
*/
import Icon from "./Icon.jsx";

// The border turns red when the field has an error, and navy while the user is typing in it.
function borderClass(error) {
  return error ? "border-red-600" : "border-border focus:border-primary";
}

/**
 * Renders the small red message under a field that has an error.
 *
 * @param {object} props The component props.
 * @param {string} props.id The id of the message, so screen readers read it together with the field.
 * @param {string} [props.error] The message to show. Nothing renders when it is empty.
 * @returns {JSX.Element|null} The error message.
 */
function FieldError({ id, error }) {
  if (!error) return null;
  return (
    <p id={id} className="flex items-center gap-1.5 text-[12px] leading-4 text-red-700">
      <Icon name="alert-circle" size={14} />
      {error}
    </p>
  );
}

/**
 * Renders a label with a one line text input under it.
 *
 * @param {object} props The component props.
 * @param {string} props.id The input's id, which also connects the label to it.
 * @param {string} props.label The label above the input.
 * @param {string} props.value The current text.
 * @param {function} props.onChange Called with the new text whenever the user types.
 * @param {string} [props.type] The input type, such as "text", "date", or "time".
 * @param {string} [props.placeholder] Gray hint text shown while the input is empty.
 * @param {string} [props.error] An error message, which also turns the border red.
 * @returns {JSX.Element} The labeled input.
 */
export function TextField({ id, label, value, onChange, type = "text", placeholder, error }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <label htmlFor={id} className="text-[14px] leading-5 font-bold text-slate-600">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-12 w-full rounded-[10px] border bg-white px-3.5 text-[16px] leading-6.5 text-ink outline-none placeholder:text-slate ${borderClass(error)}`}
      />
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}

/**
 * Renders a label with a multi line text box under it.
 *
 * @param {object} props The component props.
 * @param {string} props.id The text box's id.
 * @param {string} props.label The label above the text box.
 * @param {string} props.value The current text.
 * @param {function} props.onChange Called with the new text whenever the user types.
 * @param {string} [props.placeholder] Gray hint text shown while the text box is empty.
 * @param {string} [props.error] An error message, which also turns the border red.
 * @returns {JSX.Element} The labeled text box.
 */
export function TextAreaField({ id, label, value, onChange, placeholder, error }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[14px] leading-5 font-bold text-slate-600">
        {label}
      </label>
      <textarea
        id={id}
        rows={4}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full resize-y rounded-[10px] border bg-white px-3.5 py-3 text-[16px] leading-6.5 text-ink outline-none placeholder:text-slate ${borderClass(error)}`}
      />
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}

/**
 * Renders a label with a dropdown under it.
 *
 * @param {object} props The component props.
 * @param {string} props.id The dropdown's id.
 * @param {string} props.label The label above the dropdown.
 * @param {string} props.value The chosen option.
 * @param {function} props.onChange Called with the new option when the user picks one.
 * @param {string[]} props.options The choices, such as the campus list.
 * @param {string} [props.error] An error message, which also turns the border red.
 * @returns {JSX.Element} The labeled dropdown.
 */
export function SelectField({ id, label, value, onChange, options, error }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <label htmlFor={id} className="text-[14px] leading-5 font-bold text-slate-600">
        {label}
      </label>
      {/* The browser's own arrow is hidden so the Figma chevron can sit on top, matching the Feed filters. */}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          className={`h-12 w-full cursor-pointer appearance-none rounded-[10px] border bg-white pr-10 pl-3.5 text-[16px] leading-6.5 text-ink outline-none ${borderClass(error)}`}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <Icon
          name="chevron-right"
          size={18}
          strokeWidth={2.67}
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rotate-90 text-slate"
        />
      </div>
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}
