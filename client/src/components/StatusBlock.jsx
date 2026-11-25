/*
  Status message for the CUNY-Connect client.
  This file shows a centered message card for empty results, not found, and errors: a light navy icon circle,
  a short heading, one line of text, and optional buttons. Feed and EventDetail both use it, so they look the same.
  Owner: Person 3
*/
import Icon from './Icon.jsx';

/**
 * Renders a centered message card: an icon, a heading, one line of text, and buttons.
 *
 * @param {object} props The component props.
 * @param {string} props.icon The Icon name shown in the light navy circle.
 * @param {string} props.title The short heading.
 * @param {string} props.message The line of text under the heading.
 * @param {React.ReactNode} [props.children] The buttons, if any.
 * @returns {JSX.Element} The message card.
 */
export default function StatusBlock({ icon, title, message, children }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface px-6 py-12 text-center md:py-16">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-50 dark:bg-dark-primary-50 text-primary dark:text-dark-link">
        <Icon name={icon} size={24} />
      </span>
      <h2 className="mt-4 text-[22px] leading-7 tracking-[-0.44px]">{title}</h2>
      <p className="mt-2 max-w-md text-[16px] leading-6.5 text-slate dark:text-dark-slate">{message}</p>
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
