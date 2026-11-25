/*
  Button styles for the CUNY-Connect client.
  This file holds the Tailwind classes for the three button looks in the Figma, so every officer page
  and the Dashboard use the exact same buttons.
  Owner: Person 4
  TODO: The Feed and Event Detail pages each keep their own copy of the primary style. They could import it from here.
*/

// The main action on a page, like Create event or Publish event. It is navy with a soft navy shadow.
export const primaryButtonClass =
  "flex cursor-pointer items-center justify-center gap-2 rounded-[11px] bg-primary px-5.5 py-3 text-[16px] leading-6 font-bold text-white shadow-[0_8px_18px_var(--color-primary)] shadow-primary/25 transition-colors hover:bg-primary-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-60";

// A second choice next to a primary button, like Cancel. It is white with a navy label.
export const secondaryButtonClass =
  "flex cursor-pointer items-center justify-center gap-2 rounded-[11px] border border-border bg-white px-5.5 py-3 text-[16px] leading-6 font-bold text-primary transition-colors hover:bg-page disabled:cursor-not-allowed disabled:opacity-60";

// Only for actions that cannot be undone, like Delete event, so the red color warns the user first.
export const dangerButtonClass =
  "flex cursor-pointer items-center justify-center gap-2 rounded-[11px] bg-red-700 px-5.5 py-3 text-[16px] leading-6 font-bold text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60";
